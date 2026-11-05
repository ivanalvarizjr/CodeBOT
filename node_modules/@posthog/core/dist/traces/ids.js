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
const TRACE_ID_BYTES = 16;
const SPAN_ID_BYTES = 8;
const TRACE_ID_HEX = 2 * TRACE_ID_BYTES;
const SPAN_ID_HEX = 2 * SPAN_ID_BYTES;
const INVALID_SPAN_ID = '0000000000000000';
const INVALID_TRACE_ID = INVALID_SPAN_ID + INVALID_SPAN_ID;
const HEX_RE = /^[0-9a-f]+$/;
function getRandomBytes(byteLength) {
    const bytes = new Uint8Array(byteLength);
    const cryptoLike = globalThis.crypto;
    if (cryptoLike && 'function' == typeof cryptoLike.getRandomValues) try {
        cryptoLike.getRandomValues(bytes);
        return bytes;
    } catch  {}
    for(let i = 0; i < byteLength; i++)bytes[i] = Math.floor(256 * Math.random());
    return bytes;
}
function bytesToHex(bytes) {
    let hex = '';
    for(let i = 0; i < bytes.length; i++)hex += bytes[i].toString(16).padStart(2, '0');
    return hex;
}
function randomHexId(byteLength) {
    const hex = bytesToHex(getRandomBytes(byteLength));
    return /[^0]/.test(hex) ? hex : hex.slice(0, -1) + '1';
}
function newTraceId() {
    return randomHexId(TRACE_ID_BYTES);
}
function newSpanId() {
    return randomHexId(SPAN_ID_BYTES);
}
function isValidHexId(value, length, invalid) {
    return 'string' == typeof value && value.length === length && value !== invalid && HEX_RE.test(value);
}
function isValidTraceId(value) {
    return isValidHexId(value, TRACE_ID_HEX, INVALID_TRACE_ID);
}
function isValidSpanId(value) {
    return isValidHexId(value, SPAN_ID_HEX, INVALID_SPAN_ID);
}
__webpack_require__.d(__webpack_exports__, {
    getRandomBytes: ()=>getRandomBytes,
    isValidSpanId: ()=>isValidSpanId,
    isValidTraceId: ()=>isValidTraceId,
    newSpanId: ()=>newSpanId,
    newTraceId: ()=>newTraceId
});
exports.getRandomBytes = __webpack_exports__.getRandomBytes;
exports.isValidSpanId = __webpack_exports__.isValidSpanId;
exports.isValidTraceId = __webpack_exports__.isValidTraceId;
exports.newSpanId = __webpack_exports__.newSpanId;
exports.newTraceId = __webpack_exports__.newTraceId;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "getRandomBytes",
    "isValidSpanId",
    "isValidTraceId",
    "newSpanId",
    "newTraceId"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
