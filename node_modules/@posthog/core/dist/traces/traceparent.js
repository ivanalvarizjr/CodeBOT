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
    TRACE_FLAGS_SAMPLED: ()=>TRACE_FLAGS_SAMPLED,
    formatTraceparent: ()=>formatTraceparent,
    normalizeTraceparent: ()=>normalizeTraceparent,
    parseTraceparent: ()=>parseTraceparent,
    sanitizeTracestate: ()=>sanitizeTracestate,
    traceparentHeader: ()=>traceparentHeader
});
const external_ids_js_namespaceObject = require("./ids.js");
const TRACEPARENT_RE = /^([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})(-.*)?$/;
function parseTraceparent(value) {
    const fields = matchTraceparent(value);
    return fields && {
        traceId: fields.traceId,
        spanId: fields.spanId,
        flags: definedFlags(fields.flags)
    };
}
function definedFlags(flags) {
    return 0x01 & parseInt(flags, 16) ? TRACE_FLAGS_SAMPLED : TRACE_FLAGS_UNSAMPLED;
}
function matchTraceparent(value) {
    if ('string' != typeof value) return;
    const match = TRACEPARENT_RE.exec(value.trim());
    if (!match) return;
    const [, version, traceId, spanId, flags, trailing] = match;
    if ('ff' === version) return;
    if ('00' === version && trailing) return;
    if (!(0, external_ids_js_namespaceObject.isValidTraceId)(traceId) || !(0, external_ids_js_namespaceObject.isValidSpanId)(spanId)) return;
    return {
        version,
        traceId,
        spanId,
        flags
    };
}
function normalizeTraceparent(value) {
    return matchTraceparent(value) && value.trim();
}
function traceparentHeader(value) {
    return Array.isArray(value) && 1 === value.length ? value[0] : value;
}
const TRACE_FLAGS_SAMPLED = '01';
const TRACE_FLAGS_UNSAMPLED = '00';
function formatTraceparent(traceId, spanId, flags = TRACE_FLAGS_SAMPLED) {
    return `00-${traceId}-${spanId}-${flags}`;
}
const TRACESTATE_MAX_MEMBERS = 32;
const TRACESTATE_MAX_LENGTH = 512;
function sanitizeTracestate(value) {
    if ('string' != typeof value) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    if (/[^\x20-\x7e\t]/.test(trimmed)) return;
    const members = trimmed.split(',');
    if (members.length > TRACESTATE_MAX_MEMBERS) return;
    for (const member of members)if (member.trim() && !member.includes('=')) return;
    if (trimmed.length <= TRACESTATE_MAX_LENGTH) return trimmed;
    return trimToLength(members);
}
const TRACESTATE_LARGE_MEMBER_LENGTH = 128;
function trimToLength(members) {
    const kept = [
        ...members
    ];
    const joinedLength = ()=>kept.reduce((total, member)=>total + member.length, 0) + kept.length - 1;
    for(let index = kept.length - 1; index >= 0 && joinedLength() > TRACESTATE_MAX_LENGTH; index--)if (kept[index].length > TRACESTATE_LARGE_MEMBER_LENGTH) kept.splice(index, 1);
    while(kept.length && joinedLength() > TRACESTATE_MAX_LENGTH)kept.pop();
    return kept.length ? kept.join(',') : void 0;
}
exports.TRACE_FLAGS_SAMPLED = __webpack_exports__.TRACE_FLAGS_SAMPLED;
exports.formatTraceparent = __webpack_exports__.formatTraceparent;
exports.normalizeTraceparent = __webpack_exports__.normalizeTraceparent;
exports.parseTraceparent = __webpack_exports__.parseTraceparent;
exports.sanitizeTracestate = __webpack_exports__.sanitizeTracestate;
exports.traceparentHeader = __webpack_exports__.traceparentHeader;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "TRACE_FLAGS_SAMPLED",
    "formatTraceparent",
    "normalizeTraceparent",
    "parseTraceparent",
    "sanitizeTracestate",
    "traceparentHeader"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
