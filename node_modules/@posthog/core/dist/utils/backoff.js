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
const MAX_FLUSH_BACKOFF_EXPONENT = 6;
const MAX_FLUSH_BACKOFF_MS = 30000;
const JITTER = 0.25;
function drawJitter() {
    return 1 - JITTER + Math.random() * JITTER * 2;
}
const NO_JITTER = 1;
function backoffDelayMs(baseMs, failures, jitter, maxMs) {
    const exponent = Math.min(Math.max(0, failures - 1), MAX_FLUSH_BACKOFF_EXPONENT);
    const delay = baseMs * 2 ** exponent;
    const capped = void 0 === maxMs ? delay : Math.min(delay, Math.max(maxMs, baseMs));
    return Math.round(capped * jitter);
}
__webpack_require__.d(__webpack_exports__, {
    backoffDelayMs: ()=>backoffDelayMs,
    drawJitter: ()=>drawJitter
}, {
    MAX_FLUSH_BACKOFF_EXPONENT: MAX_FLUSH_BACKOFF_EXPONENT,
    MAX_FLUSH_BACKOFF_MS: MAX_FLUSH_BACKOFF_MS,
    NO_JITTER: NO_JITTER
});
exports.MAX_FLUSH_BACKOFF_EXPONENT = __webpack_exports__.MAX_FLUSH_BACKOFF_EXPONENT;
exports.MAX_FLUSH_BACKOFF_MS = __webpack_exports__.MAX_FLUSH_BACKOFF_MS;
exports.NO_JITTER = __webpack_exports__.NO_JITTER;
exports.backoffDelayMs = __webpack_exports__.backoffDelayMs;
exports.drawJitter = __webpack_exports__.drawJitter;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "MAX_FLUSH_BACKOFF_EXPONENT",
    "MAX_FLUSH_BACKOFF_MS",
    "NO_JITTER",
    "backoffDelayMs",
    "drawJitter"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
