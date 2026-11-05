import { UNKNOWN_FUNCTION } from "./base.mjs";
import { chromeStackLineParser } from "./chrome.mjs";
import { geckoStackLineParser } from "./gecko.mjs";
const WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
const STACKTRACE_FRAME_LIMIT = 50;
const MAX_REPEATED_CYCLE_LENGTH = 10;
const STACKTRACE_LINE_LIMIT = 1000;
function isSameFrame(a, b) {
    return a.filename === b.filename && a.function === b.function && a.module === b.module && a.lineno === b.lineno && a.colno === b.colno;
}
function collapseRepeatedCycle(frames) {
    for(let length = 1; length <= MAX_REPEATED_CYCLE_LENGTH; length++){
        const start = frames.length - 2 * length;
        if (start < 0) break;
        let isCycle = true;
        for(let offset = 0; offset < length; offset++){
            const inner = frames[start + offset];
            if (!isSameFrame(inner, frames[start + length + offset])) {
                isCycle = false;
                break;
            }
        }
        if (isCycle) {
            for(let offset = 0; offset < length; offset++)frames[start + offset] = frames[start + length + offset];
            frames.length = start + length;
            return {
                start,
                length
            };
        }
    }
}
function trimPartialCycle(frames, cycle) {
    const copyEnd = cycle.start + cycle.length;
    const partialLength = partialCycleLength(frames, cycle);
    if (partialLength) frames.splice(copyEnd + partialLength === frames.length ? copyEnd : cycle.start, partialLength);
}
function innermostPartialCycleLength(frames, cycle) {
    let partialStart = cycle.start;
    while(partialStart > 0 && isSameFrame(frames[partialStart - 1], frames[partialStart - 1 + cycle.length]))partialStart--;
    return cycle.start - partialStart;
}
function partialCycleLength(frames, cycle) {
    const copyEnd = cycle.start + cycle.length;
    let partialEnd = copyEnd;
    while(partialEnd < frames.length && isSameFrame(frames[partialEnd], frames[partialEnd - cycle.length]))partialEnd++;
    return partialEnd - copyEnd;
}
function survivingFrameCount(frames, cycles) {
    const innermostCycle = cycles[0];
    let count = frames.length - (innermostCycle ? innermostPartialCycleLength(frames, innermostCycle) : 0);
    for (const cycle of cycles)count -= partialCycleLength(frames, cycle);
    return count;
}
function canonicalizeCycleRotation(frames) {
    const keys = frames.map((frame)=>`${frame.function}|${frame.filename}|${frame.lineno}|${frame.colno}|${frame.module}`);
    let first = 0;
    for(let i = 1; i < keys.length; i++)if (isSmallerRotation(keys, i, first)) first = i;
    frames.push(...frames.splice(0, first));
}
function isSmallerRotation(keys, candidate, best) {
    for(let offset = 0; offset < keys.length; offset++){
        const left = keys[(candidate + offset) % keys.length];
        const right = keys[(best + offset) % keys.length];
        if (left !== right) return left < right;
    }
    return false;
}
function reverseAndStripFrames(stack) {
    if (!stack.length) return [];
    const localStack = Array.from(stack);
    localStack.reverse();
    return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map((frame)=>({
            ...frame,
            filename: frame.filename || getLastStackFrame(localStack).filename,
            function: frame.function || UNKNOWN_FUNCTION
        }));
}
function getLastStackFrame(arr) {
    return arr[arr.length - 1] || {};
}
function createDefaultStackParser() {
    return createStackParser("web:javascript", chromeStackLineParser, geckoStackLineParser);
}
function createStackParser(platform, ...parsers) {
    return (stack, skipFirstLines = 0)=>{
        const frames = [];
        const lines = stack.split('\n');
        const endLine = Math.min(lines.length, skipFirstLines + STACKTRACE_LINE_LIMIT);
        const repeatedCycles = [];
        for(let i = skipFirstLines; i < endLine; i++){
            const line = lines[i];
            if (line.length > 1024) continue;
            const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, '$1') : line;
            if (!cleanedLine.match(/\S*Error: /)) {
                for (const parser of parsers){
                    const frame = parser(cleanedLine, platform);
                    if (frame) {
                        frames.push(frame);
                        const cycle = collapseRepeatedCycle(frames);
                        if (cycle) {
                            for(let i = repeatedCycles.length - 1; i >= 0; i--){
                                const previous = repeatedCycles[i];
                                if (previous.start + previous.length <= cycle.start) break;
                                repeatedCycles.pop();
                            }
                            repeatedCycles.push(cycle);
                        }
                        break;
                    }
                }
                if (survivingFrameCount(frames, repeatedCycles) >= STACKTRACE_FRAME_LIMIT) break;
            }
        }
        const sections = [
            ...repeatedCycles
        ].sort((a, b)=>b.start - a.start);
        const innermostSection = sections[sections.length - 1];
        if (innermostSection) {
            const trimmed = innermostPartialCycleLength(frames, innermostSection);
            frames.splice(innermostSection.start - trimmed, trimmed);
            for (const cycle of sections)cycle.start -= trimmed;
        }
        for (const cycle of sections)trimPartialCycle(frames, cycle);
        if (repeatedCycles.some((cycle)=>0 === cycle.start && frames.length === cycle.length)) canonicalizeCycleRotation(frames);
        return reverseAndStripFrames(frames);
    };
}
export { winjsStackLineParser } from "./winjs.mjs";
export { opera10StackLineParser, opera11StackLineParser } from "./opera.mjs";
export { nodeStackLineParser } from "./node.mjs";
export { chromeStackLineParser, createDefaultStackParser, createStackParser, geckoStackLineParser, reverseAndStripFrames };
