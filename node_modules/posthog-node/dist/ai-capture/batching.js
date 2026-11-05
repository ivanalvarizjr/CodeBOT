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
    eventByteSize: ()=>eventByteSize,
    partitionAiBatch: ()=>partitionAiBatch
});
const core_namespaceObject = require("@posthog/core");
const external_routing_js_namespaceObject = require("./routing.js");
const encoder = new TextEncoder();
function eventByteSize(message) {
    return encoder.encode((0, core_namespaceObject.safeJsonStringify)(message)).length;
}
function partitionAiBatch(messages, maxEventBytes = external_routing_js_namespaceObject.AI_MAX_EVENT_BYTES, targetBatchBytes = external_routing_js_namespaceObject.AI_BATCH_TARGET_BYTES) {
    const batches = [];
    const dropped = [];
    let current = [];
    let currentBytes = 0;
    for (const message of messages){
        if (void 0 === message) continue;
        const bytes = eventByteSize(message);
        if (bytes > maxEventBytes) {
            dropped.push({
                event: 'string' == typeof message.event ? message.event : 'unknown',
                bytes
            });
            continue;
        }
        if (current.length > 0 && currentBytes + bytes > targetBatchBytes) {
            batches.push(current);
            current = [];
            currentBytes = 0;
        }
        current.push(message);
        currentBytes += bytes;
    }
    if (current.length > 0) batches.push(current);
    return {
        batches,
        dropped
    };
}
exports.eventByteSize = __webpack_exports__.eventByteSize;
exports.partitionAiBatch = __webpack_exports__.partitionAiBatch;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "eventByteSize",
    "partitionAiBatch"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
