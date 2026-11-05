"use strict";
var __webpack_modules__ = {
    "./cookie" (module) {
        module.exports = require("./cookie.js");
    },
    "./error-tracking" (module) {
        module.exports = require("./error-tracking/index.js");
    },
    "./featureFlagLocalEvaluation" (module) {
        module.exports = require("./featureFlagLocalEvaluation.js");
    },
    "./featureFlagUtils" (module) {
        module.exports = require("./featureFlagUtils.js");
    },
    "./gzip" (module) {
        module.exports = require("./gzip.js");
    },
    "./logs" (module) {
        module.exports = require("./logs/index.js");
    },
    "./logs/logs-utils" (module) {
        module.exports = require("./logs/logs-utils.js");
    },
    "./metrics" (module) {
        module.exports = require("./metrics/index.js");
    },
    "./posthog-core-stateless" (module) {
        module.exports = require("./posthog-core-stateless.js");
    },
    "./posthog-core" (module) {
        module.exports = require("./posthog-core.js");
    },
    "./privacy" (module) {
        module.exports = require("./privacy.js");
    },
    "./surveys/validation" (module) {
        module.exports = require("./surveys/validation.js");
    },
    "./traces/config" (module) {
        module.exports = require("./traces/config.js");
    },
    "./traces/context" (module) {
        module.exports = require("./traces/context.js");
    },
    "./traces" (module) {
        module.exports = require("./traces/index.js");
    },
    "./traces/span" (module) {
        module.exports = require("./traces/span.js");
    },
    "./tracing-headers" (module) {
        module.exports = require("./tracing-headers.js");
    },
    "./types" (module) {
        module.exports = require("./types.js");
    },
    "./utils?637c" (module) {
        module.exports = require("./utils/index.js");
    },
    "./utils/otlp-any-value" (module) {
        module.exports = require("./utils/otlp-any-value.js");
    },
    "./utils/otlp-resource" (module) {
        module.exports = require("./utils/otlp-resource.js");
    },
    "./vendor/uuidv7" (module) {
        module.exports = require("./vendor/uuidv7.js");
    }
};
var __webpack_module_cache__ = {};
function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (void 0 !== cachedModule) return cachedModule.exports;
    var module = __webpack_module_cache__[moduleId] = {
        exports: {}
    };
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
}
(()=>{
    __webpack_require__.n = (module)=>{
        var getter = module && module.__esModule ? ()=>module['default'] : ()=>module;
        __webpack_require__.d(getter, {
            a: getter
        });
        return getter;
    };
})();
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
(()=>{
    __webpack_require__.r(__webpack_exports__);
    var _featureFlagUtils__rspack_import_0 = __webpack_require__("./featureFlagUtils");
    var _featureFlagLocalEvaluation__rspack_import_1 = __webpack_require__("./featureFlagLocalEvaluation");
    var _gzip__rspack_import_2 = __webpack_require__("./gzip");
    var _utils__rspack_import_3 = __webpack_require__("./utils?637c");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _utils__rspack_import_3)if ([
        "resolveFeatureFlagPayload",
        "PostHogTraces",
        "getRequirementsHint",
        "getFeatureFlagValue",
        "isGzipData",
        "hashSHA1",
        "getFeatureFlagVariant",
        "DEFAULT_HISTOGRAM_BOUNDS",
        "getVariantFromValue",
        "getOtlpSeverityNumber",
        "toOtlpKeyValueList",
        "matchFeatureFlagProperty",
        "assertFeatureFlagFilterSupported",
        "parseFeatureFlagSemver",
        "InconclusiveMatchError",
        "PostHogMetrics",
        "inertSpan",
        "uuidv7",
        "getLengthFromRules",
        "default",
        "isGzipRequest",
        "getFeatureFlagVariantLookupTable",
        "getEnabledFromValue",
        "parsePayload",
        "isNativeAsyncGzipError",
        "getHoldoutVariant",
        "buildResourceAttributes",
        "MINIMAL_FLAG_CALLED_EVENT_CAMPAIGN_PROPERTIES",
        "resolveMetricsConfig",
        "runWithActiveSpan",
        "toOtlpAnyValue",
        "PostHogLogs",
        "buildMetricsResourceAttributes",
        "buildOtlpLogRecord",
        "getOtlpSeverityText",
        "gzipCompress",
        "buildOtlpMetricsPayload",
        "SyncSpanContextManager",
        "osResourceAttributes",
        "buildOtlpLogsPayload",
        "minimizeFlagCalledEventProperties",
        "flagDetailsToResults",
        "resolveTracesConfig",
        "getFeatureFlagHash",
        "getValidationError",
        "ErrorTracking",
        "isNativeAsyncGzipReadError",
        "relativeDateParseForFeatureFlagMatching",
        "isGzipSupported"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_utils__rspack_import_3[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _error_tracking__rspack_import_4 = __webpack_require__("./error-tracking");
    var _logs_logs_utils__rspack_import_5 = __webpack_require__("./logs/logs-utils");
    var _utils_otlp_any_value__rspack_import_6 = __webpack_require__("./utils/otlp-any-value");
    var _utils_otlp_resource__rspack_import_7 = __webpack_require__("./utils/otlp-resource");
    var _logs__rspack_import_8 = __webpack_require__("./logs");
    var _metrics__rspack_import_9 = __webpack_require__("./metrics");
    var _traces__rspack_import_10 = __webpack_require__("./traces");
    var _traces_context__rspack_import_11 = __webpack_require__("./traces/context");
    var _traces_span__rspack_import_12 = __webpack_require__("./traces/span");
    var _traces_config__rspack_import_13 = __webpack_require__("./traces/config");
    var _vendor_uuidv7__rspack_import_14 = __webpack_require__("./vendor/uuidv7");
    var _cookie__rspack_import_15 = __webpack_require__("./cookie");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _cookie__rspack_import_15)if ([
        "resolveFeatureFlagPayload",
        "PostHogTraces",
        "getRequirementsHint",
        "getFeatureFlagValue",
        "isGzipData",
        "hashSHA1",
        "getFeatureFlagVariant",
        "DEFAULT_HISTOGRAM_BOUNDS",
        "getVariantFromValue",
        "getOtlpSeverityNumber",
        "toOtlpKeyValueList",
        "matchFeatureFlagProperty",
        "assertFeatureFlagFilterSupported",
        "parseFeatureFlagSemver",
        "InconclusiveMatchError",
        "PostHogMetrics",
        "inertSpan",
        "uuidv7",
        "getLengthFromRules",
        "default",
        "isGzipRequest",
        "getFeatureFlagVariantLookupTable",
        "getEnabledFromValue",
        "parsePayload",
        "isNativeAsyncGzipError",
        "getHoldoutVariant",
        "buildResourceAttributes",
        "MINIMAL_FLAG_CALLED_EVENT_CAMPAIGN_PROPERTIES",
        "resolveMetricsConfig",
        "runWithActiveSpan",
        "toOtlpAnyValue",
        "PostHogLogs",
        "buildMetricsResourceAttributes",
        "buildOtlpLogRecord",
        "getOtlpSeverityText",
        "gzipCompress",
        "buildOtlpMetricsPayload",
        "SyncSpanContextManager",
        "osResourceAttributes",
        "buildOtlpLogsPayload",
        "minimizeFlagCalledEventProperties",
        "flagDetailsToResults",
        "resolveTracesConfig",
        "getFeatureFlagHash",
        "getValidationError",
        "ErrorTracking",
        "isNativeAsyncGzipReadError",
        "relativeDateParseForFeatureFlagMatching",
        "isGzipSupported"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_cookie__rspack_import_15[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _posthog_core__rspack_import_16 = __webpack_require__("./posthog-core");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _posthog_core__rspack_import_16)if ([
        "resolveFeatureFlagPayload",
        "PostHogTraces",
        "getRequirementsHint",
        "getFeatureFlagValue",
        "isGzipData",
        "hashSHA1",
        "getFeatureFlagVariant",
        "DEFAULT_HISTOGRAM_BOUNDS",
        "getVariantFromValue",
        "getOtlpSeverityNumber",
        "toOtlpKeyValueList",
        "matchFeatureFlagProperty",
        "assertFeatureFlagFilterSupported",
        "parseFeatureFlagSemver",
        "InconclusiveMatchError",
        "PostHogMetrics",
        "inertSpan",
        "uuidv7",
        "getLengthFromRules",
        "default",
        "isGzipRequest",
        "getFeatureFlagVariantLookupTable",
        "getEnabledFromValue",
        "parsePayload",
        "isNativeAsyncGzipError",
        "getHoldoutVariant",
        "buildResourceAttributes",
        "MINIMAL_FLAG_CALLED_EVENT_CAMPAIGN_PROPERTIES",
        "resolveMetricsConfig",
        "runWithActiveSpan",
        "toOtlpAnyValue",
        "PostHogLogs",
        "buildMetricsResourceAttributes",
        "buildOtlpLogRecord",
        "getOtlpSeverityText",
        "gzipCompress",
        "buildOtlpMetricsPayload",
        "SyncSpanContextManager",
        "osResourceAttributes",
        "buildOtlpLogsPayload",
        "minimizeFlagCalledEventProperties",
        "flagDetailsToResults",
        "resolveTracesConfig",
        "getFeatureFlagHash",
        "getValidationError",
        "ErrorTracking",
        "isNativeAsyncGzipReadError",
        "relativeDateParseForFeatureFlagMatching",
        "isGzipSupported"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_posthog_core__rspack_import_16[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _posthog_core_stateless__rspack_import_17 = __webpack_require__("./posthog-core-stateless");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _posthog_core_stateless__rspack_import_17)if ([
        "resolveFeatureFlagPayload",
        "PostHogTraces",
        "getRequirementsHint",
        "getFeatureFlagValue",
        "isGzipData",
        "hashSHA1",
        "getFeatureFlagVariant",
        "DEFAULT_HISTOGRAM_BOUNDS",
        "getVariantFromValue",
        "getOtlpSeverityNumber",
        "toOtlpKeyValueList",
        "matchFeatureFlagProperty",
        "assertFeatureFlagFilterSupported",
        "parseFeatureFlagSemver",
        "InconclusiveMatchError",
        "PostHogMetrics",
        "inertSpan",
        "uuidv7",
        "getLengthFromRules",
        "default",
        "isGzipRequest",
        "getFeatureFlagVariantLookupTable",
        "getEnabledFromValue",
        "parsePayload",
        "isNativeAsyncGzipError",
        "getHoldoutVariant",
        "buildResourceAttributes",
        "MINIMAL_FLAG_CALLED_EVENT_CAMPAIGN_PROPERTIES",
        "resolveMetricsConfig",
        "runWithActiveSpan",
        "toOtlpAnyValue",
        "PostHogLogs",
        "buildMetricsResourceAttributes",
        "buildOtlpLogRecord",
        "getOtlpSeverityText",
        "gzipCompress",
        "buildOtlpMetricsPayload",
        "SyncSpanContextManager",
        "osResourceAttributes",
        "buildOtlpLogsPayload",
        "minimizeFlagCalledEventProperties",
        "flagDetailsToResults",
        "resolveTracesConfig",
        "getFeatureFlagHash",
        "getValidationError",
        "ErrorTracking",
        "isNativeAsyncGzipReadError",
        "relativeDateParseForFeatureFlagMatching",
        "isGzipSupported"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_posthog_core_stateless__rspack_import_17[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _privacy__rspack_import_18 = __webpack_require__("./privacy");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _privacy__rspack_import_18)if ([
        "resolveFeatureFlagPayload",
        "PostHogTraces",
        "getRequirementsHint",
        "getFeatureFlagValue",
        "isGzipData",
        "hashSHA1",
        "getFeatureFlagVariant",
        "DEFAULT_HISTOGRAM_BOUNDS",
        "getVariantFromValue",
        "getOtlpSeverityNumber",
        "toOtlpKeyValueList",
        "matchFeatureFlagProperty",
        "assertFeatureFlagFilterSupported",
        "parseFeatureFlagSemver",
        "InconclusiveMatchError",
        "PostHogMetrics",
        "inertSpan",
        "uuidv7",
        "getLengthFromRules",
        "default",
        "isGzipRequest",
        "getFeatureFlagVariantLookupTable",
        "getEnabledFromValue",
        "parsePayload",
        "isNativeAsyncGzipError",
        "getHoldoutVariant",
        "buildResourceAttributes",
        "MINIMAL_FLAG_CALLED_EVENT_CAMPAIGN_PROPERTIES",
        "resolveMetricsConfig",
        "runWithActiveSpan",
        "toOtlpAnyValue",
        "PostHogLogs",
        "buildMetricsResourceAttributes",
        "buildOtlpLogRecord",
        "getOtlpSeverityText",
        "gzipCompress",
        "buildOtlpMetricsPayload",
        "SyncSpanContextManager",
        "osResourceAttributes",
        "buildOtlpLogsPayload",
        "minimizeFlagCalledEventProperties",
        "flagDetailsToResults",
        "resolveTracesConfig",
        "getFeatureFlagHash",
        "getValidationError",
        "ErrorTracking",
        "isNativeAsyncGzipReadError",
        "relativeDateParseForFeatureFlagMatching",
        "isGzipSupported"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_privacy__rspack_import_18[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _tracing_headers__rspack_import_19 = __webpack_require__("./tracing-headers");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _tracing_headers__rspack_import_19)if ([
        "resolveFeatureFlagPayload",
        "PostHogTraces",
        "getRequirementsHint",
        "getFeatureFlagValue",
        "isGzipData",
        "hashSHA1",
        "getFeatureFlagVariant",
        "DEFAULT_HISTOGRAM_BOUNDS",
        "getVariantFromValue",
        "getOtlpSeverityNumber",
        "toOtlpKeyValueList",
        "matchFeatureFlagProperty",
        "assertFeatureFlagFilterSupported",
        "parseFeatureFlagSemver",
        "InconclusiveMatchError",
        "PostHogMetrics",
        "inertSpan",
        "uuidv7",
        "getLengthFromRules",
        "default",
        "isGzipRequest",
        "getFeatureFlagVariantLookupTable",
        "getEnabledFromValue",
        "parsePayload",
        "isNativeAsyncGzipError",
        "getHoldoutVariant",
        "buildResourceAttributes",
        "MINIMAL_FLAG_CALLED_EVENT_CAMPAIGN_PROPERTIES",
        "resolveMetricsConfig",
        "runWithActiveSpan",
        "toOtlpAnyValue",
        "PostHogLogs",
        "buildMetricsResourceAttributes",
        "buildOtlpLogRecord",
        "getOtlpSeverityText",
        "gzipCompress",
        "buildOtlpMetricsPayload",
        "SyncSpanContextManager",
        "osResourceAttributes",
        "buildOtlpLogsPayload",
        "minimizeFlagCalledEventProperties",
        "flagDetailsToResults",
        "resolveTracesConfig",
        "getFeatureFlagHash",
        "getValidationError",
        "ErrorTracking",
        "isNativeAsyncGzipReadError",
        "relativeDateParseForFeatureFlagMatching",
        "isGzipSupported"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_tracing_headers__rspack_import_19[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _types__rspack_import_20 = __webpack_require__("./types");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _types__rspack_import_20)if ([
        "resolveFeatureFlagPayload",
        "PostHogTraces",
        "getRequirementsHint",
        "getFeatureFlagValue",
        "isGzipData",
        "hashSHA1",
        "getFeatureFlagVariant",
        "DEFAULT_HISTOGRAM_BOUNDS",
        "getVariantFromValue",
        "getOtlpSeverityNumber",
        "toOtlpKeyValueList",
        "matchFeatureFlagProperty",
        "assertFeatureFlagFilterSupported",
        "parseFeatureFlagSemver",
        "InconclusiveMatchError",
        "PostHogMetrics",
        "inertSpan",
        "uuidv7",
        "getLengthFromRules",
        "default",
        "isGzipRequest",
        "getFeatureFlagVariantLookupTable",
        "getEnabledFromValue",
        "parsePayload",
        "isNativeAsyncGzipError",
        "getHoldoutVariant",
        "buildResourceAttributes",
        "MINIMAL_FLAG_CALLED_EVENT_CAMPAIGN_PROPERTIES",
        "resolveMetricsConfig",
        "runWithActiveSpan",
        "toOtlpAnyValue",
        "PostHogLogs",
        "buildMetricsResourceAttributes",
        "buildOtlpLogRecord",
        "getOtlpSeverityText",
        "gzipCompress",
        "buildOtlpMetricsPayload",
        "SyncSpanContextManager",
        "osResourceAttributes",
        "buildOtlpLogsPayload",
        "minimizeFlagCalledEventProperties",
        "flagDetailsToResults",
        "resolveTracesConfig",
        "getFeatureFlagHash",
        "getValidationError",
        "ErrorTracking",
        "isNativeAsyncGzipReadError",
        "relativeDateParseForFeatureFlagMatching",
        "isGzipSupported"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_types__rspack_import_20[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _surveys_validation__rspack_import_21 = __webpack_require__("./surveys/validation");
    __webpack_require__.d(__webpack_exports__, {
        DEFAULT_HISTOGRAM_BOUNDS: ()=>_metrics__rspack_import_9.DEFAULT_HISTOGRAM_BOUNDS,
        ErrorTracking: ()=>_error_tracking__rspack_import_4,
        InconclusiveMatchError: ()=>_featureFlagLocalEvaluation__rspack_import_1.InconclusiveMatchError,
        MINIMAL_FLAG_CALLED_EVENT_CAMPAIGN_PROPERTIES: ()=>_featureFlagUtils__rspack_import_0.MINIMAL_FLAG_CALLED_EVENT_CAMPAIGN_PROPERTIES,
        PostHogLogs: ()=>_logs__rspack_import_8.PostHogLogs,
        PostHogMetrics: ()=>_metrics__rspack_import_9.PostHogMetrics,
        PostHogTraces: ()=>_traces__rspack_import_10.PostHogTraces,
        SyncSpanContextManager: ()=>_traces_context__rspack_import_11.SyncSpanContextManager,
        assertFeatureFlagFilterSupported: ()=>_featureFlagLocalEvaluation__rspack_import_1.assertFeatureFlagFilterSupported,
        buildMetricsResourceAttributes: ()=>_metrics__rspack_import_9.buildMetricsResourceAttributes,
        buildOtlpLogRecord: ()=>_logs_logs_utils__rspack_import_5.buildOtlpLogRecord,
        buildOtlpLogsPayload: ()=>_logs_logs_utils__rspack_import_5.buildOtlpLogsPayload,
        buildOtlpMetricsPayload: ()=>_metrics__rspack_import_9.buildOtlpMetricsPayload,
        buildResourceAttributes: ()=>_logs_logs_utils__rspack_import_5.buildResourceAttributes,
        flagDetailsToResults: ()=>_featureFlagUtils__rspack_import_0.flagDetailsToResults,
        getEnabledFromValue: ()=>_featureFlagUtils__rspack_import_0.getEnabledFromValue,
        getFeatureFlagHash: ()=>_featureFlagLocalEvaluation__rspack_import_1.getFeatureFlagHash,
        getFeatureFlagValue: ()=>_featureFlagUtils__rspack_import_0.getFeatureFlagValue,
        getFeatureFlagVariant: ()=>_featureFlagLocalEvaluation__rspack_import_1.getFeatureFlagVariant,
        getFeatureFlagVariantLookupTable: ()=>_featureFlagLocalEvaluation__rspack_import_1.getFeatureFlagVariantLookupTable,
        getHoldoutVariant: ()=>_featureFlagLocalEvaluation__rspack_import_1.getHoldoutVariant,
        getLengthFromRules: ()=>_surveys_validation__rspack_import_21.getLengthFromRules,
        getOtlpSeverityNumber: ()=>_logs_logs_utils__rspack_import_5.getOtlpSeverityNumber,
        getOtlpSeverityText: ()=>_logs_logs_utils__rspack_import_5.getOtlpSeverityText,
        getRequirementsHint: ()=>_surveys_validation__rspack_import_21.getRequirementsHint,
        getValidationError: ()=>_surveys_validation__rspack_import_21.getValidationError,
        getVariantFromValue: ()=>_featureFlagUtils__rspack_import_0.getVariantFromValue,
        gzipCompress: ()=>_gzip__rspack_import_2.gzipCompress,
        hashSHA1: ()=>_featureFlagLocalEvaluation__rspack_import_1.hashSHA1,
        inertSpan: ()=>_traces_span__rspack_import_12.inertSpan,
        isGzipData: ()=>_gzip__rspack_import_2.isGzipData,
        isGzipRequest: ()=>_gzip__rspack_import_2.isGzipRequest,
        isGzipSupported: ()=>_gzip__rspack_import_2.isGzipSupported,
        isNativeAsyncGzipError: ()=>_gzip__rspack_import_2.isNativeAsyncGzipError,
        isNativeAsyncGzipReadError: ()=>_gzip__rspack_import_2.isNativeAsyncGzipReadError,
        matchFeatureFlagProperty: ()=>_featureFlagLocalEvaluation__rspack_import_1.matchFeatureFlagProperty,
        minimizeFlagCalledEventProperties: ()=>_featureFlagUtils__rspack_import_0.minimizeFlagCalledEventProperties,
        osResourceAttributes: ()=>_utils_otlp_resource__rspack_import_7.osResourceAttributes,
        parseFeatureFlagSemver: ()=>_featureFlagLocalEvaluation__rspack_import_1.parseFeatureFlagSemver,
        parsePayload: ()=>_featureFlagUtils__rspack_import_0.parsePayload,
        relativeDateParseForFeatureFlagMatching: ()=>_featureFlagLocalEvaluation__rspack_import_1.relativeDateParseForFeatureFlagMatching,
        resolveFeatureFlagPayload: ()=>_featureFlagLocalEvaluation__rspack_import_1.resolveFeatureFlagPayload,
        resolveMetricsConfig: ()=>_metrics__rspack_import_9.resolveMetricsConfig,
        resolveTracesConfig: ()=>_traces_config__rspack_import_13.resolveTracesConfig,
        runWithActiveSpan: ()=>_traces_span__rspack_import_12.runWithActiveSpan,
        toOtlpAnyValue: ()=>_utils_otlp_any_value__rspack_import_6.toOtlpAnyValue,
        toOtlpKeyValueList: ()=>_utils_otlp_any_value__rspack_import_6.toOtlpKeyValueList,
        uuidv7: ()=>_vendor_uuidv7__rspack_import_14.uuidv7
    });
})();
exports.DEFAULT_HISTOGRAM_BOUNDS = __webpack_exports__.DEFAULT_HISTOGRAM_BOUNDS;
exports.ErrorTracking = __webpack_exports__.ErrorTracking;
exports.InconclusiveMatchError = __webpack_exports__.InconclusiveMatchError;
exports.MINIMAL_FLAG_CALLED_EVENT_CAMPAIGN_PROPERTIES = __webpack_exports__.MINIMAL_FLAG_CALLED_EVENT_CAMPAIGN_PROPERTIES;
exports.PostHogLogs = __webpack_exports__.PostHogLogs;
exports.PostHogMetrics = __webpack_exports__.PostHogMetrics;
exports.PostHogTraces = __webpack_exports__.PostHogTraces;
exports.SyncSpanContextManager = __webpack_exports__.SyncSpanContextManager;
exports.assertFeatureFlagFilterSupported = __webpack_exports__.assertFeatureFlagFilterSupported;
exports.buildMetricsResourceAttributes = __webpack_exports__.buildMetricsResourceAttributes;
exports.buildOtlpLogRecord = __webpack_exports__.buildOtlpLogRecord;
exports.buildOtlpLogsPayload = __webpack_exports__.buildOtlpLogsPayload;
exports.buildOtlpMetricsPayload = __webpack_exports__.buildOtlpMetricsPayload;
exports.buildResourceAttributes = __webpack_exports__.buildResourceAttributes;
exports.flagDetailsToResults = __webpack_exports__.flagDetailsToResults;
exports.getEnabledFromValue = __webpack_exports__.getEnabledFromValue;
exports.getFeatureFlagHash = __webpack_exports__.getFeatureFlagHash;
exports.getFeatureFlagValue = __webpack_exports__.getFeatureFlagValue;
exports.getFeatureFlagVariant = __webpack_exports__.getFeatureFlagVariant;
exports.getFeatureFlagVariantLookupTable = __webpack_exports__.getFeatureFlagVariantLookupTable;
exports.getHoldoutVariant = __webpack_exports__.getHoldoutVariant;
exports.getLengthFromRules = __webpack_exports__.getLengthFromRules;
exports.getOtlpSeverityNumber = __webpack_exports__.getOtlpSeverityNumber;
exports.getOtlpSeverityText = __webpack_exports__.getOtlpSeverityText;
exports.getRequirementsHint = __webpack_exports__.getRequirementsHint;
exports.getValidationError = __webpack_exports__.getValidationError;
exports.getVariantFromValue = __webpack_exports__.getVariantFromValue;
exports.gzipCompress = __webpack_exports__.gzipCompress;
exports.hashSHA1 = __webpack_exports__.hashSHA1;
exports.inertSpan = __webpack_exports__.inertSpan;
exports.isGzipData = __webpack_exports__.isGzipData;
exports.isGzipRequest = __webpack_exports__.isGzipRequest;
exports.isGzipSupported = __webpack_exports__.isGzipSupported;
exports.isNativeAsyncGzipError = __webpack_exports__.isNativeAsyncGzipError;
exports.isNativeAsyncGzipReadError = __webpack_exports__.isNativeAsyncGzipReadError;
exports.matchFeatureFlagProperty = __webpack_exports__.matchFeatureFlagProperty;
exports.minimizeFlagCalledEventProperties = __webpack_exports__.minimizeFlagCalledEventProperties;
exports.osResourceAttributes = __webpack_exports__.osResourceAttributes;
exports.parseFeatureFlagSemver = __webpack_exports__.parseFeatureFlagSemver;
exports.parsePayload = __webpack_exports__.parsePayload;
exports.relativeDateParseForFeatureFlagMatching = __webpack_exports__.relativeDateParseForFeatureFlagMatching;
exports.resolveFeatureFlagPayload = __webpack_exports__.resolveFeatureFlagPayload;
exports.resolveMetricsConfig = __webpack_exports__.resolveMetricsConfig;
exports.resolveTracesConfig = __webpack_exports__.resolveTracesConfig;
exports.runWithActiveSpan = __webpack_exports__.runWithActiveSpan;
exports.toOtlpAnyValue = __webpack_exports__.toOtlpAnyValue;
exports.toOtlpKeyValueList = __webpack_exports__.toOtlpKeyValueList;
exports.uuidv7 = __webpack_exports__.uuidv7;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "DEFAULT_HISTOGRAM_BOUNDS",
    "ErrorTracking",
    "InconclusiveMatchError",
    "MINIMAL_FLAG_CALLED_EVENT_CAMPAIGN_PROPERTIES",
    "PostHogLogs",
    "PostHogMetrics",
    "PostHogTraces",
    "SyncSpanContextManager",
    "assertFeatureFlagFilterSupported",
    "buildMetricsResourceAttributes",
    "buildOtlpLogRecord",
    "buildOtlpLogsPayload",
    "buildOtlpMetricsPayload",
    "buildResourceAttributes",
    "flagDetailsToResults",
    "getEnabledFromValue",
    "getFeatureFlagHash",
    "getFeatureFlagValue",
    "getFeatureFlagVariant",
    "getFeatureFlagVariantLookupTable",
    "getHoldoutVariant",
    "getLengthFromRules",
    "getOtlpSeverityNumber",
    "getOtlpSeverityText",
    "getRequirementsHint",
    "getValidationError",
    "getVariantFromValue",
    "gzipCompress",
    "hashSHA1",
    "inertSpan",
    "isGzipData",
    "isGzipRequest",
    "isGzipSupported",
    "isNativeAsyncGzipError",
    "isNativeAsyncGzipReadError",
    "matchFeatureFlagProperty",
    "minimizeFlagCalledEventProperties",
    "osResourceAttributes",
    "parseFeatureFlagSemver",
    "parsePayload",
    "relativeDateParseForFeatureFlagMatching",
    "resolveFeatureFlagPayload",
    "resolveMetricsConfig",
    "resolveTracesConfig",
    "runWithActiveSpan",
    "toOtlpAnyValue",
    "toOtlpKeyValueList",
    "uuidv7"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
