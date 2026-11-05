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
let parsedStackResults;
let lastPostHogChunkIds;
let lastNativeDebugIds;
let cachedFilenameChunkIds;
function getFilenameToChunkIdMap(stackParser) {
    const posthogChunkIds = globalThis._posthogChunkIds;
    const nativeDebugIds = globalThis._debugIds;
    if (!posthogChunkIds && !nativeDebugIds) return;
    const posthogKeys = posthogChunkIds ? Object.keys(posthogChunkIds) : [];
    const nativeKeys = nativeDebugIds ? Object.keys(nativeDebugIds) : [];
    if (cachedFilenameChunkIds && matchesSnapshot(posthogChunkIds, posthogKeys, lastPostHogChunkIds) && matchesSnapshot(nativeDebugIds, nativeKeys, lastNativeDebugIds)) return cachedFilenameChunkIds;
    lastPostHogChunkIds = posthogChunkIds ? {
        ...posthogChunkIds
    } : void 0;
    lastNativeDebugIds = nativeDebugIds ? {
        ...nativeDebugIds
    } : void 0;
    cachedFilenameChunkIds = {};
    parsedStackResults ??= {};
    const addChunkIds = (keys, chunkIds)=>{
        for (const stackKey of keys){
            const chunkId = chunkIds[stackKey];
            if (!chunkId) continue;
            const cachedFilename = parsedStackResults?.[stackKey];
            if (cachedFilename) {
                cachedFilenameChunkIds[cachedFilename] = chunkId;
                continue;
            }
            const parsedStack = stackParser(stackKey);
            for(let i = parsedStack.length - 1; i >= 0; i--){
                const filename = parsedStack[i]?.filename;
                if (filename) {
                    cachedFilenameChunkIds[filename] = chunkId;
                    parsedStackResults[stackKey] = filename;
                    break;
                }
            }
        }
    };
    if (nativeDebugIds) addChunkIds(nativeKeys, nativeDebugIds);
    if (posthogChunkIds) addChunkIds(posthogKeys, posthogChunkIds);
    return cachedFilenameChunkIds;
}
function matchesSnapshot(chunkIds, keys, snapshot) {
    if (!chunkIds || !snapshot) return chunkIds === snapshot;
    return keys.length === Object.keys(snapshot).length && keys.every((key)=>chunkIds[key] === snapshot[key]);
}
__webpack_require__.d(__webpack_exports__, {
    getFilenameToChunkIdMap: ()=>getFilenameToChunkIdMap
});
exports.getFilenameToChunkIdMap = __webpack_exports__.getFilenameToChunkIdMap;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "getFilenameToChunkIdMap"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
