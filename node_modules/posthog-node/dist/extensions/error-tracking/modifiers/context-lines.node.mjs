import { ErrorTracking } from "@posthog/core";
import { constants } from "node:fs";
import { open as promises_open } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { createInterface } from "node:readline";
const LRU_FILE_CONTENTS_CACHE = new ErrorTracking.ReduceableCache(25);
const LRU_FILE_CONTENTS_FS_READ_FAILED = new ErrorTracking.ReduceableCache(20);
const DEFAULT_LINES_OF_CONTEXT = 7;
const MAX_CONTEXTLINES_COLNO = 1000;
const MAX_CONTEXTLINES_LINENO = 10000;
const MAX_CONTEXTLINES_FILE_SIZE = 10485760;
async function addSourceContext(frames, openSourceFile = promises_open, logger) {
    const filesToLines = {};
    let basePath;
    try {
        basePath = process.cwd();
    } catch  {}
    for(let i = frames.length - 1; i >= 0; i--){
        const frame = frames[i];
        const filename = frame?.filename;
        if (!frame || 'string' != typeof filename || 'number' != typeof frame.lineno || shouldSkipContextLinesForFile(filename) || shouldSkipContextLinesForFrame(frame)) continue;
        if (!isAbsolute(filename) && void 0 === basePath) continue;
        const filesToLinesOutput = filesToLines[filename];
        if (!filesToLinesOutput) filesToLines[filename] = [];
        filesToLines[filename].push(frame.lineno);
    }
    const files = Object.keys(filesToLines);
    if (0 == files.length) return frames;
    const readlinePromises = [];
    for (const file of files){
        const cacheKey = makeSourceCacheKey(file, basePath);
        if (void 0 === cacheKey) continue;
        if (LRU_FILE_CONTENTS_FS_READ_FAILED.get(cacheKey)) continue;
        const filesToLineRanges = filesToLines[file];
        if (!filesToLineRanges) continue;
        filesToLineRanges.sort((a, b)=>a - b);
        const ranges = makeLineReaderRanges(filesToLineRanges);
        if (ranges.every((r)=>rangeExistsInContentCache(cacheKey, r))) continue;
        const cache = emplace(LRU_FILE_CONTENTS_CACHE, cacheKey, {});
        readlinePromises.push(getContextLinesFromFile(file, ranges, cache, cacheKey, openSourceFile, logger));
    }
    await Promise.all(readlinePromises).catch(()=>{});
    if (frames && frames.length > 0) addSourceContextToFrames(frames, LRU_FILE_CONTENTS_CACHE, basePath);
    LRU_FILE_CONTENTS_CACHE.reduce();
    return frames;
}
async function openRegularSourceFile(path, openSourceFile, logger) {
    let fileHandle;
    let isValid = false;
    try {
        fileHandle = await openSourceFile(path, constants.O_RDONLY | constants.O_NONBLOCK);
        const fileStat = await fileHandle.stat();
        if (!fileStat.isFile()) return;
        if (fileStat.size > MAX_CONTEXTLINES_FILE_SIZE) return void logger?.debug(`Skipping source context for oversized file ${path}: ${fileStat.size} bytes exceeds ${MAX_CONTEXTLINES_FILE_SIZE}`);
        isValid = true;
        return fileHandle;
    } catch  {
        return;
    } finally{
        if (fileHandle && !isValid) await fileHandle.close().catch(()=>{});
    }
}
async function getContextLinesFromFile(path, ranges, output, cacheKey, openSourceFile, logger) {
    const fileHandle = await openRegularSourceFile(path, openSourceFile, logger);
    if (void 0 === fileHandle) return void LRU_FILE_CONTENTS_FS_READ_FAILED.set(cacheKey, 1);
    const openedFileHandle = fileHandle;
    return new Promise((resolve)=>{
        let finished = false;
        function destroyStreamAndResolve(stream) {
            if (finished) return;
            finished = true;
            stream?.destroy();
            openedFileHandle.close().then(resolve, resolve);
        }
        let stream;
        try {
            stream = openedFileHandle.createReadStream({
                autoClose: false,
                start: 0,
                end: MAX_CONTEXTLINES_FILE_SIZE - 1
            });
        } catch  {
            LRU_FILE_CONTENTS_FS_READ_FAILED.set(cacheKey, 1);
            destroyStreamAndResolve();
            return;
        }
        let lineReaded;
        try {
            lineReaded = createInterface({
                input: stream
            });
        } catch  {
            LRU_FILE_CONTENTS_FS_READ_FAILED.set(cacheKey, 1);
            destroyStreamAndResolve(stream);
            return;
        }
        let lineNumber = 0;
        let currentRangeIndex = 0;
        const range = ranges[currentRangeIndex];
        if (void 0 === range) return void destroyStreamAndResolve(stream);
        let rangeStart = range[0];
        let rangeEnd = range[1];
        function onStreamError() {
            LRU_FILE_CONTENTS_FS_READ_FAILED.set(cacheKey, 1);
            lineReaded.close();
            lineReaded.removeAllListeners();
            destroyStreamAndResolve(stream);
        }
        stream.on('error', onStreamError);
        lineReaded.on('error', onStreamError);
        lineReaded.on('close', ()=>destroyStreamAndResolve(stream));
        lineReaded.on('line', (line)=>{
            lineNumber++;
            if (lineNumber < rangeStart) return;
            output[lineNumber] = snipLine(line, 0);
            if (lineNumber >= rangeEnd) {
                if (currentRangeIndex === ranges.length - 1) {
                    lineReaded.close();
                    lineReaded.removeAllListeners();
                    return;
                }
                currentRangeIndex++;
                const range = ranges[currentRangeIndex];
                if (void 0 === range) {
                    lineReaded.close();
                    lineReaded.removeAllListeners();
                    return;
                }
                rangeStart = range[0];
                rangeEnd = range[1];
            }
        });
    });
}
function addSourceContextToFrames(frames, cache, basePath) {
    for (const frame of frames)if (frame.filename && void 0 === frame.context_line && 'number' == typeof frame.lineno) {
        const cacheKey = makeSourceCacheKey(frame.filename, basePath);
        const contents = void 0 === cacheKey ? void 0 : cache.get(cacheKey);
        if (void 0 === contents) continue;
        addContextToFrame(frame.lineno, frame, contents);
    }
}
function addContextToFrame(lineno, frame, contents) {
    if (void 0 === frame.lineno || void 0 === contents) return;
    frame.pre_context = [];
    for(let i = makeRangeStart(lineno); i < lineno; i++){
        const line = contents[i];
        if (void 0 === line) return void clearLineContext(frame);
        frame.pre_context.push(line);
    }
    if (void 0 === contents[lineno]) return void clearLineContext(frame);
    frame.context_line = contents[lineno];
    const end = makeRangeEnd(lineno);
    frame.post_context = [];
    for(let i = lineno + 1; i <= end; i++){
        const line = contents[i];
        if (void 0 === line) break;
        frame.post_context.push(line);
    }
}
function clearLineContext(frame) {
    delete frame.pre_context;
    delete frame.context_line;
    delete frame.post_context;
}
function shouldSkipContextLinesForFile(path) {
    return path.startsWith('node:') || path.endsWith('.min.js') || path.endsWith('.min.cjs') || path.endsWith('.min.mjs') || path.startsWith('data:');
}
function shouldSkipContextLinesForFrame(frame) {
    if (void 0 !== frame.lineno && frame.lineno > MAX_CONTEXTLINES_LINENO) return true;
    if (void 0 !== frame.colno && frame.colno > MAX_CONTEXTLINES_COLNO) return true;
    return false;
}
function makeSourceCacheKey(path, basePath) {
    if (isAbsolute(path)) return JSON.stringify([
        null,
        path
    ]);
    return void 0 === basePath ? void 0 : JSON.stringify([
        basePath,
        path
    ]);
}
function rangeExistsInContentCache(cacheKey, range) {
    const contents = LRU_FILE_CONTENTS_CACHE.get(cacheKey);
    if (void 0 === contents) return false;
    for(let i = range[0]; i <= range[1]; i++)if (void 0 === contents[i]) return false;
    return true;
}
function makeLineReaderRanges(lines) {
    if (!lines.length) return [];
    let i = 0;
    const line = lines[0];
    if ('number' != typeof line) return [];
    let current = makeContextRange(line);
    const out = [];
    while(true){
        if (i === lines.length - 1) {
            out.push(current);
            break;
        }
        const next = lines[i + 1];
        if ('number' != typeof next) break;
        if (next <= current[1]) current[1] = next + DEFAULT_LINES_OF_CONTEXT;
        else {
            out.push(current);
            current = makeContextRange(next);
        }
        i++;
    }
    return out;
}
function makeContextRange(line) {
    return [
        makeRangeStart(line),
        makeRangeEnd(line)
    ];
}
function makeRangeStart(line) {
    return Math.max(1, line - DEFAULT_LINES_OF_CONTEXT);
}
function makeRangeEnd(line) {
    return line + DEFAULT_LINES_OF_CONTEXT;
}
function emplace(map, key, contents) {
    const value = map.get(key);
    if (void 0 === value) {
        map.set(key, contents);
        return contents;
    }
    return value;
}
function snipLine(line, colno) {
    let newLine = line;
    const lineLength = newLine.length;
    if (lineLength <= 150) return newLine;
    if (colno > lineLength) colno = lineLength;
    let start = Math.max(colno - 60, 0);
    if (start < 5) start = 0;
    let end = Math.min(start + 140, lineLength);
    if (end > lineLength - 5) end = lineLength;
    if (end === lineLength) start = Math.max(end - 140, 0);
    newLine = newLine.slice(start, end);
    if (start > 0) newLine = `...${newLine}`;
    if (end < lineLength) newLine += '...';
    return newLine;
}
export { MAX_CONTEXTLINES_COLNO, MAX_CONTEXTLINES_FILE_SIZE, MAX_CONTEXTLINES_LINENO, addSourceContext };
