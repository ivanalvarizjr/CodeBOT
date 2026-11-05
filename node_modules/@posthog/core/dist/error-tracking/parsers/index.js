"use strict";
var __webpack_require__ = {};
(()=>{
    __webpack_require__.d = (exports1, getters, values)=>{
        var define = (defs, kind)=>{
            for(var key in defs)if (__webpack_require__.o(defs, key) && !__webpack_require__.o(exports1, key)) Object.defineProperty(exports1, key, {
                enumerable: true,
                [kind]: defs[key]
            });
        };
        define(getters, "get");
        define(values, "value");
    };
})();
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
(()=>{
    __webpack_require__.r = (exports1)=>{
        if ("u" > typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports1, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports1, '__esModule', {
            value: true
        });
    };
})();
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
    chromeStackLineParser: ()=>external_chrome_js_namespaceObject.chromeStackLineParser,
    createDefaultStackParser: ()=>createDefaultStackParser,
    createStackParser: ()=>createStackParser,
    geckoStackLineParser: ()=>external_gecko_js_namespaceObject.geckoStackLineParser,
    nodeStackLineParser: ()=>external_node_js_namespaceObject.nodeStackLineParser,
    opera10StackLineParser: ()=>external_opera_js_namespaceObject.opera10StackLineParser,
    opera11StackLineParser: ()=>external_opera_js_namespaceObject.opera11StackLineParser,
    reverseAndStripFrames: ()=>reverseAndStripFrames,
    winjsStackLineParser: ()=>external_winjs_js_namespaceObject.winjsStackLineParser
});
const external_base_js_namespaceObject = require("./base.js");
const external_chrome_js_namespaceObject = require("./chrome.js");
const external_gecko_js_namespaceObject = require("./gecko.js");
const external_winjs_js_namespaceObject = require("./winjs.js");
const external_opera_js_namespaceObject = require("./opera.js");
const external_node_js_namespaceObject = require("./node.js");
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
            function: frame.function || external_base_js_namespaceObject.UNKNOWN_FUNCTION
        }));
}
function getLastStackFrame(arr) {
    return arr[arr.length - 1] || {};
}
function createDefaultStackParser() {
    return createStackParser("web:javascript", external_chrome_js_namespaceObject.chromeStackLineParser, external_gecko_js_namespaceObject.geckoStackLineParser);
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
exports.chromeStackLineParser = __webpack_exports__.chromeStackLineParser;
exports.createDefaultStackParser = __webpack_exports__.createDefaultStackParser;
exports.createStackParser = __webpack_exports__.createStackParser;
exports.geckoStackLineParser = __webpack_exports__.geckoStackLineParser;
exports.nodeStackLineParser = __webpack_exports__.nodeStackLineParser;
exports.opera10StackLineParser = __webpack_exports__.opera10StackLineParser;
exports.opera11StackLineParser = __webpack_exports__.opera11StackLineParser;
exports.reverseAndStripFrames = __webpack_exports__.reverseAndStripFrames;
exports.winjsStackLineParser = __webpack_exports__.winjsStackLineParser;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "chromeStackLineParser",
    "createDefaultStackParser",
    "createStackParser",
    "geckoStackLineParser",
    "nodeStackLineParser",
    "opera10StackLineParser",
    "opera11StackLineParser",
    "reverseAndStripFrames",
    "winjsStackLineParser"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
