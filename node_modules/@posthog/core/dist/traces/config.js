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
    resolveTracesConfig: ()=>resolveTracesConfig
});
const json_utils_js_namespaceObject = require("../utils/json-utils.js");
const DEFAULT_FLUSH_INTERVAL_MS = 5000;
const DEFAULT_MAX_EXPORT_BATCH_SIZE = 512;
const DEFAULT_MAX_QUEUE_SIZE = 2048;
const DEFAULT_MAX_ATTRIBUTES_PER_SPAN = 128;
const DEFAULT_MAX_EVENTS_PER_SPAN = 128;
const DEFAULT_MAX_ATTRIBUTES_PER_EVENT = 128;
const DEFAULT_MAX_ATTRIBUTE_VALUE_LENGTH = 8192;
const DEFAULT_MAX_LIVE_SPANS = 10000;
const DEFAULT_MAX_SPAN_AGE_MS = 3600000;
function positiveInteger(value, fallback) {
    return 'number' == typeof value && Number.isInteger(value) && value >= 1 ? value : fallback;
}
const IDENTITY_KEYS = [
    'service.name',
    'service.version',
    'deployment.environment'
];
function withUsableIdentityKeys(attributes) {
    if (!attributes || 'object' != typeof attributes || Array.isArray(attributes)) return;
    try {
        if (IDENTITY_KEYS.every((key)=>!(key in attributes) || 'string' == typeof attributes[key])) return attributes;
        const usable = {
            ...attributes
        };
        for (const key of IDENTITY_KEYS)if (key in usable && 'string' != typeof usable[key]) delete usable[key];
        return usable;
    } catch  {
        return;
    }
}
function resolveBeforeSpanSend(beforeSpanSend, logger) {
    if (!beforeSpanSend) return [];
    const supplied = [
        beforeSpanSend
    ].flat().filter((hook)=>Boolean(hook));
    const hooks = supplied.filter((hook)=>'function' == typeof hook);
    if (hooks.length !== supplied.length) logger?.critical(`beforeSpanSend: ignoring ${supplied.length - hooks.length} of ${supplied.length} entries that are not functions. Spans export without them, so whatever they were redacting is not redacted.`);
    return hooks;
}
function resolveTracesConfig(config, hostResourceAttributes, logger) {
    const resourceAttributes = (0, json_utils_js_namespaceObject.assignUserAttributes)({
        ...hostResourceAttributes
    }, withUsableIdentityKeys(config?.resourceAttributes));
    const maxExportBatchSize = positiveInteger(config?.maxExportBatchSize, DEFAULT_MAX_EXPORT_BATCH_SIZE);
    return {
        serviceName: resourceAttributes?.['service.name'] ?? config?.serviceName,
        serviceVersion: resourceAttributes?.['service.version'] ?? config?.serviceVersion,
        environment: resourceAttributes?.['deployment.environment'] ?? config?.environment,
        resourceAttributes,
        beforeSpanSend: resolveBeforeSpanSend(config?.beforeSpanSend, logger),
        maxAttributesPerSpan: positiveInteger(config?.maxAttributesPerSpan, DEFAULT_MAX_ATTRIBUTES_PER_SPAN),
        maxEventsPerSpan: positiveInteger(config?.maxEventsPerSpan, DEFAULT_MAX_EVENTS_PER_SPAN),
        maxAttributesPerEvent: DEFAULT_MAX_ATTRIBUTES_PER_EVENT,
        maxAttributeValueLength: positiveInteger(config?.maxAttributeValueLength, DEFAULT_MAX_ATTRIBUTE_VALUE_LENGTH),
        flushIntervalMs: positiveInteger(config?.flushIntervalMs, DEFAULT_FLUSH_INTERVAL_MS),
        maxExportBatchSize,
        maxQueueSize: Math.max(positiveInteger(config?.maxQueueSize, DEFAULT_MAX_QUEUE_SIZE), maxExportBatchSize),
        maxLiveSpans: positiveInteger(config?.maxLiveSpans, DEFAULT_MAX_LIVE_SPANS),
        maxSpanAgeMs: positiveInteger(config?.maxSpanAgeMs, DEFAULT_MAX_SPAN_AGE_MS)
    };
}
exports.resolveTracesConfig = __webpack_exports__.resolveTracesConfig;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "resolveTracesConfig"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
