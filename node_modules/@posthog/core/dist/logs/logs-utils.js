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
    buildOtlpLogRecord: ()=>buildOtlpLogRecord,
    buildOtlpLogsPayload: ()=>buildOtlpLogsPayload,
    buildResourceAttributes: ()=>buildResourceAttributes,
    getOtlpSeverityNumber: ()=>getOtlpSeverityNumber,
    getOtlpSeverityText: ()=>getOtlpSeverityText
});
const index_js_namespaceObject = require("../utils/index.js");
const json_utils_js_namespaceObject = require("../utils/json-utils.js");
const otlp_any_value_js_namespaceObject = require("../utils/otlp-any-value.js");
const otlp_resource_js_namespaceObject = require("../utils/otlp-resource.js");
const DEFAULT_OTLP_SEVERITY = {
    text: 'INFO',
    number: 9
};
const OTLP_SEVERITY_MAP = {
    trace: {
        text: 'TRACE',
        number: 1
    },
    debug: {
        text: 'DEBUG',
        number: 5
    },
    info: DEFAULT_OTLP_SEVERITY,
    warn: {
        text: 'WARN',
        number: 13
    },
    error: {
        text: 'ERROR',
        number: 17
    },
    fatal: {
        text: 'FATAL',
        number: 21
    }
};
function getOtlpSeverityText(level) {
    return (OTLP_SEVERITY_MAP[level] || DEFAULT_OTLP_SEVERITY).text;
}
function getOtlpSeverityNumber(level) {
    return (OTLP_SEVERITY_MAP[level] || DEFAULT_OTLP_SEVERITY).number;
}
function timestampToUnixNano(timestampMs = Date.now()) {
    return String(timestampMs) + '000000';
}
function encodeBody(body) {
    try {
        return (0, json_utils_js_namespaceObject.sanitizeString)(String(body));
    } catch  {
        return json_utils_js_namespaceObject.UNSERIALIZABLE_VALUE;
    }
}
function buildOtlpLogRecord(options, sdkContext, logger, occurredAtMs) {
    const level = options.level || 'info';
    const { text: severityText, number: severityNumber } = OTLP_SEVERITY_MAP[level] || DEFAULT_OTLP_SEVERITY;
    const eventTimeNano = timestampToUnixNano((0, index_js_namespaceObject.isNumber)(occurredAtMs) ? occurredAtMs : void 0);
    const autoAttributes = {};
    if (sdkContext.distinctId) autoAttributes.posthogDistinctId = sdkContext.distinctId;
    if (sdkContext.sessionId) autoAttributes.sessionId = sdkContext.sessionId;
    if (sdkContext.windowId) autoAttributes['window.id'] = sdkContext.windowId;
    if (!(0, index_js_namespaceObject.isNullish)(sdkContext.sessionStartTimestamp)) autoAttributes.sessionStartTimestamp = String(sdkContext.sessionStartTimestamp);
    if (!(0, index_js_namespaceObject.isNullish)(sdkContext.lastActivityTimestamp)) autoAttributes.lastActivityTimestamp = String(sdkContext.lastActivityTimestamp);
    if (sdkContext.currentUrl) autoAttributes['url.full'] = sdkContext.currentUrl;
    if (sdkContext.screenName) autoAttributes['screen.name'] = sdkContext.screenName;
    if (sdkContext.appState) autoAttributes['app.state'] = sdkContext.appState;
    if (sdkContext.activeFeatureFlags && sdkContext.activeFeatureFlags.length > 0) autoAttributes.feature_flags = sdkContext.activeFeatureFlags;
    const mergedAttributes = {
        ...autoAttributes
    };
    const userAttributes = options.attributes;
    if (userAttributes) {
        let keys = [];
        try {
            keys = Object.keys(userAttributes);
        } catch  {
            keys = [];
        }
        for (const key of keys){
            let value;
            try {
                value = userAttributes[key];
            } catch  {
                value = json_utils_js_namespaceObject.UNSERIALIZABLE_VALUE;
            }
            Object.defineProperty(mergedAttributes, key, {
                value,
                enumerable: true,
                writable: true,
                configurable: true
            });
        }
    }
    const record = {
        timeUnixNano: eventTimeNano,
        observedTimeUnixNano: eventTimeNano,
        severityNumber,
        severityText,
        body: {
            stringValue: encodeBody(options.body)
        },
        attributes: (0, otlp_any_value_js_namespaceObject.toOtlpKeyValueList)(mergedAttributes, logger)
    };
    if (options.trace_id) record.traceId = options.trace_id;
    if (options.span_id) record.spanId = options.span_id;
    if (!(0, index_js_namespaceObject.isUndefined)(options.trace_flags)) record.flags = options.trace_flags;
    return record;
}
function buildResourceAttributes(config, sdkName, sdkVersion) {
    return (0, otlp_resource_js_namespaceObject.buildOtlpResourceAttributes)(config, sdkName, sdkVersion);
}
function buildOtlpLogsPayload(logRecords, resourceAttributes, scopeName, scopeVersion) {
    return {
        resourceLogs: [
            {
                resource: {
                    attributes: (0, otlp_resource_js_namespaceObject.toOtlpResourceKeyValueList)(resourceAttributes)
                },
                scopeLogs: [
                    {
                        scope: {
                            name: scopeName,
                            version: scopeVersion
                        },
                        logRecords
                    }
                ]
            }
        ]
    };
}
exports.buildOtlpLogRecord = __webpack_exports__.buildOtlpLogRecord;
exports.buildOtlpLogsPayload = __webpack_exports__.buildOtlpLogsPayload;
exports.buildResourceAttributes = __webpack_exports__.buildResourceAttributes;
exports.getOtlpSeverityNumber = __webpack_exports__.getOtlpSeverityNumber;
exports.getOtlpSeverityText = __webpack_exports__.getOtlpSeverityText;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "buildOtlpLogRecord",
    "buildOtlpLogsPayload",
    "buildResourceAttributes",
    "getOtlpSeverityNumber",
    "getOtlpSeverityText"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
