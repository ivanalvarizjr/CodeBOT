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
const TRACE_ID_PATTERN = /^[0-9a-f]{32}$/i;
const SPAN_ID_PATTERN = /^[0-9a-f]{16}$/i;
const OTEL_API_GLOBAL_KEY = Symbol.for('opentelemetry.js.api.1');
const SPAN_CONTEXT_KEY = Symbol.for('OpenTelemetry Context Key SPAN');
async function getActiveTraceProperties() {
    try {
        const otelApi = globalThis[OTEL_API_GLOBAL_KEY];
        const span = otelApi?.context?.active().getValue(SPAN_CONTEXT_KEY);
        const spanContext = span?.spanContext();
        const traceId = spanContext?.traceId;
        const spanId = spanContext?.spanId;
        if ('string' == typeof traceId && 'string' == typeof spanId && TRACE_ID_PATTERN.test(traceId) && SPAN_ID_PATTERN.test(spanId) && !/^0+$/.test(traceId) && !/^0+$/.test(spanId)) return {
            $trace_id: traceId.toLowerCase(),
            $span_id: spanId.toLowerCase()
        };
    } catch  {}
    return {};
}
__webpack_require__.d(__webpack_exports__, {
    getActiveTraceProperties: ()=>getActiveTraceProperties
});
exports.getActiveTraceProperties = __webpack_exports__.getActiveTraceProperties;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "getActiveTraceProperties"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
