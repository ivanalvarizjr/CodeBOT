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
    DEFAULT_HISTOGRAM_BOUNDS: ()=>DEFAULT_HISTOGRAM_BOUNDS,
    bucketIndexFor: ()=>bucketIndexFor,
    buildMetricsResourceAttributes: ()=>buildMetricsResourceAttributes,
    buildOtlpMetricsPayload: ()=>buildOtlpMetricsPayload,
    msToUnixNano: ()=>msToUnixNano,
    seriesKey: ()=>seriesKey
});
const otlp_resource_js_namespaceObject = require("../utils/otlp-resource.js");
const DEFAULT_HISTOGRAM_BOUNDS = [
    0,
    5,
    10,
    25,
    50,
    75,
    100,
    250,
    500,
    750,
    1000,
    2500,
    5000,
    7500,
    10000
];
function msToUnixNano(ms) {
    return String(ms) + '000000';
}
function seriesKey(type, name, unit, attributes) {
    let attrsKey = '';
    if (attributes) {
        const keys = Object.keys(attributes).sort();
        attrsKey = keys.map((k)=>`${JSON.stringify(k)}:${JSON.stringify(attributes[k])}`).join(',');
    }
    return `${type}\u0000${name}\u0000${unit ?? ''}\u0000${attrsKey}`;
}
function bucketIndexFor(value, bounds) {
    for(let i = 0; i < bounds.length; i++)if (value <= bounds[i]) return i;
    return bounds.length;
}
function buildMetricsResourceAttributes(config, scopeName, scopeVersion) {
    return (0, otlp_resource_js_namespaceObject.buildOtlpResourceAttributes)(config, scopeName, scopeVersion);
}
function buildOtlpMetricsPayload(metrics, resourceAttributes, scopeName, scopeVersion) {
    return {
        resourceMetrics: [
            {
                resource: {
                    attributes: (0, otlp_resource_js_namespaceObject.toOtlpResourceKeyValueList)(resourceAttributes)
                },
                scopeMetrics: [
                    {
                        scope: {
                            name: scopeName,
                            version: scopeVersion
                        },
                        metrics
                    }
                ]
            }
        ]
    };
}
exports.DEFAULT_HISTOGRAM_BOUNDS = __webpack_exports__.DEFAULT_HISTOGRAM_BOUNDS;
exports.bucketIndexFor = __webpack_exports__.bucketIndexFor;
exports.buildMetricsResourceAttributes = __webpack_exports__.buildMetricsResourceAttributes;
exports.buildOtlpMetricsPayload = __webpack_exports__.buildOtlpMetricsPayload;
exports.msToUnixNano = __webpack_exports__.msToUnixNano;
exports.seriesKey = __webpack_exports__.seriesKey;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "DEFAULT_HISTOGRAM_BOUNDS",
    "bucketIndexFor",
    "buildMetricsResourceAttributes",
    "buildOtlpMetricsPayload",
    "msToUnixNano",
    "seriesKey"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
