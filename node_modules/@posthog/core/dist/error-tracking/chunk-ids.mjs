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
export { getFilenameToChunkIdMap };
