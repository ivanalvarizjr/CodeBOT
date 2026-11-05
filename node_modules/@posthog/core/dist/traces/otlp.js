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
    buildOtlpSpan: ()=>buildOtlpSpan,
    buildOtlpTracesPayload: ()=>buildOtlpTracesPayload,
    buildTracesResourceAttributes: ()=>buildTracesResourceAttributes,
    msToUnixNanoString: ()=>msToUnixNanoString,
    spanKindToOtlp: ()=>spanKindToOtlp
});
const external_span_js_namespaceObject = require("./span.js");
const otlp_any_value_js_namespaceObject = require("../utils/otlp-any-value.js");
const json_utils_js_namespaceObject = require("../utils/json-utils.js");
const otlp_resource_js_namespaceObject = require("../utils/otlp-resource.js");
const SPAN_KIND_TO_OTLP = {
    internal: 1,
    server: 2,
    client: 3,
    producer: 4,
    consumer: 5
};
const SPAN_STATUS_TO_OTLP = {
    ok: 1,
    error: 2
};
const TRACE_FLAGS_SAMPLED = 0x01;
const SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE = 0x100;
const SPAN_FLAGS_CONTEXT_IS_REMOTE = 0x200;
function spanFlags(record) {
    const traceFlags = parseInt(record.traceFlags, 16);
    const w3c = Number.isFinite(traceFlags) ? 0xff & traceFlags : TRACE_FLAGS_SAMPLED;
    return w3c | SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE | (record.parentIsRemote ? SPAN_FLAGS_CONTEXT_IS_REMOTE : 0);
}
function wireString(value) {
    if ('string' == typeof value) return (0, json_utils_js_namespaceObject.sanitizeString)(value);
    try {
        return (0, json_utils_js_namespaceObject.sanitizeString)(String(value));
    } catch  {
        return json_utils_js_namespaceObject.UNSERIALIZABLE_VALUE;
    }
}
function spanKindToOtlp(kind) {
    if (kind && Object.prototype.hasOwnProperty.call(SPAN_KIND_TO_OTLP, kind)) return SPAN_KIND_TO_OTLP[kind];
    return SPAN_KIND_TO_OTLP.internal;
}
function msToUnixNanoString(ms) {
    let whole = Math.floor(ms);
    let fractionalNanos = Math.round((ms - whole) * 1e6);
    if (fractionalNanos >= 1e6) {
        whole += 1;
        fractionalNanos = 0;
    }
    return String(whole) + String(fractionalNanos).padStart(6, '0');
}
function toOtlpEvent(event, logger) {
    const encoded = {
        name: wireString(event.name),
        timeUnixNano: msToUnixNanoString(event.timestamp)
    };
    if (event.attributes) {
        const attributes = (0, otlp_any_value_js_namespaceObject.toOtlpKeyValueList)(event.attributes, logger);
        if (attributes.length) encoded.attributes = attributes;
    }
    const dropped = (0, external_span_js_namespaceObject.nonNegativeCount)(event.droppedAttributesCount);
    if (dropped) encoded.droppedAttributesCount = dropped;
    return encoded;
}
function buildOtlpSpan(record, logger) {
    const span = {
        traceId: record.traceId,
        spanId: record.spanId,
        name: wireString(record.name),
        kind: spanKindToOtlp(record.kind),
        startTimeUnixNano: msToUnixNanoString(record.startTime),
        endTimeUnixNano: msToUnixNanoString(record.endTime),
        flags: spanFlags(record)
    };
    if (record.parentSpanId) span.parentSpanId = record.parentSpanId;
    if (record.traceState) span.traceState = wireString(record.traceState);
    const attributes = (0, otlp_any_value_js_namespaceObject.toOtlpKeyValueList)(record.attributes, logger);
    if (attributes.length) span.attributes = attributes;
    if (record.events.length) span.events = record.events.map((event)=>toOtlpEvent(event, logger));
    const droppedAttributes = (0, external_span_js_namespaceObject.nonNegativeCount)(record.droppedAttributesCount);
    if (droppedAttributes) span.droppedAttributesCount = droppedAttributes;
    const droppedEvents = (0, external_span_js_namespaceObject.nonNegativeCount)(record.droppedEventsCount);
    if (droppedEvents) span.droppedEventsCount = droppedEvents;
    if (record.status) span.status = {
        code: SPAN_STATUS_TO_OTLP[record.status.code],
        ...record.status.message && {
            message: wireString(record.status.message)
        }
    };
    return span;
}
function buildTracesResourceAttributes(config, sdkName, sdkVersion) {
    return (0, otlp_resource_js_namespaceObject.buildOtlpResourceAttributes)(config, sdkName, sdkVersion);
}
function buildOtlpTracesPayload(spans, resourceAttributes, scopeName, scopeVersion, logger) {
    return {
        resourceSpans: [
            {
                resource: {
                    attributes: (0, otlp_resource_js_namespaceObject.toOtlpResourceKeyValueList)(resourceAttributes, logger)
                },
                scopeSpans: [
                    {
                        scope: {
                            name: scopeName,
                            version: scopeVersion
                        },
                        spans
                    }
                ]
            }
        ]
    };
}
exports.buildOtlpSpan = __webpack_exports__.buildOtlpSpan;
exports.buildOtlpTracesPayload = __webpack_exports__.buildOtlpTracesPayload;
exports.buildTracesResourceAttributes = __webpack_exports__.buildTracesResourceAttributes;
exports.msToUnixNanoString = __webpack_exports__.msToUnixNanoString;
exports.spanKindToOtlp = __webpack_exports__.spanKindToOtlp;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "buildOtlpSpan",
    "buildOtlpTracesPayload",
    "buildTracesResourceAttributes",
    "msToUnixNanoString",
    "spanKindToOtlp"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
