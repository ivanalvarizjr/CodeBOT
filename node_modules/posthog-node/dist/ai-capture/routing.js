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
const AI_CAPTURE_ROUTE = 'ai-capture';
const AI_CAPTURE_ENDPOINT_PATH = '/i/v0/ai/batch/';
const AI_MAX_EVENT_BYTES = 8388608;
const AI_BATCH_TARGET_BYTES = 5242880;
__webpack_require__.d(__webpack_exports__, {}, {
    AI_BATCH_TARGET_BYTES: AI_BATCH_TARGET_BYTES,
    AI_CAPTURE_ENDPOINT_PATH: AI_CAPTURE_ENDPOINT_PATH,
    AI_CAPTURE_ROUTE: AI_CAPTURE_ROUTE,
    AI_MAX_EVENT_BYTES: AI_MAX_EVENT_BYTES
});
exports.AI_BATCH_TARGET_BYTES = __webpack_exports__.AI_BATCH_TARGET_BYTES;
exports.AI_CAPTURE_ENDPOINT_PATH = __webpack_exports__.AI_CAPTURE_ENDPOINT_PATH;
exports.AI_CAPTURE_ROUTE = __webpack_exports__.AI_CAPTURE_ROUTE;
exports.AI_MAX_EVENT_BYTES = __webpack_exports__.AI_MAX_EVENT_BYTES;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "AI_BATCH_TARGET_BYTES",
    "AI_CAPTURE_ENDPOINT_PATH",
    "AI_CAPTURE_ROUTE",
    "AI_MAX_EVENT_BYTES"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
