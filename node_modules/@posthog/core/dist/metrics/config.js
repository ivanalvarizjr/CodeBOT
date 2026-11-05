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
const DEFAULT_FLUSH_INTERVAL_MS = 10000;
const DEFAULT_MAX_SERIES_PER_FLUSH = 1000;
function resolveMetricsConfig(config) {
    const resourceAttributes = config?.resourceAttributes;
    return {
        serviceName: resourceAttributes?.['service.name'] ?? config?.serviceName,
        serviceVersion: resourceAttributes?.['service.version'] ?? config?.serviceVersion,
        environment: resourceAttributes?.['deployment.environment'] ?? config?.environment,
        resourceAttributes,
        beforeSend: config?.beforeSend,
        flushIntervalMs: config?.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS,
        maxSeriesPerFlush: config?.maxSeriesPerFlush ?? DEFAULT_MAX_SERIES_PER_FLUSH
    };
}
__webpack_require__.d(__webpack_exports__, {
    resolveMetricsConfig: ()=>resolveMetricsConfig
});
exports.resolveMetricsConfig = __webpack_exports__.resolveMetricsConfig;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "resolveMetricsConfig"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
