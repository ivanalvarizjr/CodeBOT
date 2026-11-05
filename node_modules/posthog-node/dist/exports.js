"use strict";
var __webpack_modules__ = {
    "./emails/errors" (module) {
        module.exports = require("./emails/errors.js");
    },
    "./extensions/context/listeners" (module) {
        module.exports = require("./extensions/context/listeners.js");
    },
    "./extensions/express" (module) {
        module.exports = require("./extensions/express.js");
    },
    "./extensions/sentry-integration" (module) {
        module.exports = require("./extensions/sentry-integration.js");
    },
    "./feature-flag-evaluations" (module) {
        module.exports = require("./feature-flag-evaluations.js");
    },
    "./types" (module) {
        module.exports = require("./types.js");
    },
    "@posthog/core" (module) {
        module.exports = require("@posthog/core");
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
    var _extensions_sentry_integration__rspack_import_0 = __webpack_require__("./extensions/sentry-integration");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _extensions_sentry_integration__rspack_import_0)if ([
        "enrichCurrentSpan",
        "parsePostHogCookie",
        "readPostHogCookie",
        "cookieStoreFromHeader",
        "getPostHogCookieName",
        "default",
        "cookieStateToProperties",
        "serializePostHogCookie",
        "FeatureFlagEvaluations",
        "EmailError",
        "uuidv7",
        "FeatureFlagError"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_extensions_sentry_integration__rspack_import_0[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _extensions_express__rspack_import_1 = __webpack_require__("./extensions/express");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _extensions_express__rspack_import_1)if ([
        "enrichCurrentSpan",
        "parsePostHogCookie",
        "readPostHogCookie",
        "cookieStoreFromHeader",
        "getPostHogCookieName",
        "default",
        "cookieStateToProperties",
        "serializePostHogCookie",
        "FeatureFlagEvaluations",
        "EmailError",
        "uuidv7",
        "FeatureFlagError"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_extensions_express__rspack_import_1[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _types__rspack_import_2 = __webpack_require__("./types");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _types__rspack_import_2)if ([
        "enrichCurrentSpan",
        "parsePostHogCookie",
        "readPostHogCookie",
        "cookieStoreFromHeader",
        "getPostHogCookieName",
        "default",
        "cookieStateToProperties",
        "serializePostHogCookie",
        "FeatureFlagEvaluations",
        "EmailError",
        "uuidv7",
        "FeatureFlagError"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_types__rspack_import_2[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _extensions_context_listeners__rspack_import_3 = __webpack_require__("./extensions/context/listeners");
    var _feature_flag_evaluations__rspack_import_4 = __webpack_require__("./feature-flag-evaluations");
    var _emails_errors__rspack_import_5 = __webpack_require__("./emails/errors");
    var _posthog_core__rspack_import_6 = __webpack_require__("@posthog/core");
    __webpack_require__.d(__webpack_exports__, {
        EmailError: ()=>_emails_errors__rspack_import_5.EmailError,
        FeatureFlagError: ()=>_posthog_core__rspack_import_6.FeatureFlagError,
        FeatureFlagEvaluations: ()=>_feature_flag_evaluations__rspack_import_4.FeatureFlagEvaluations,
        cookieStateToProperties: ()=>_posthog_core__rspack_import_6.cookieStateToProperties,
        cookieStoreFromHeader: ()=>_posthog_core__rspack_import_6.cookieStoreFromHeader,
        enrichCurrentSpan: ()=>_extensions_context_listeners__rspack_import_3.enrichCurrentSpan,
        getPostHogCookieName: ()=>_posthog_core__rspack_import_6.getPostHogCookieName,
        parsePostHogCookie: ()=>_posthog_core__rspack_import_6.parsePostHogCookie,
        readPostHogCookie: ()=>_posthog_core__rspack_import_6.readPostHogCookie,
        serializePostHogCookie: ()=>_posthog_core__rspack_import_6.serializePostHogCookie,
        uuidv7: ()=>_posthog_core__rspack_import_6.uuidv7
    });
})();
exports.EmailError = __webpack_exports__.EmailError;
exports.FeatureFlagError = __webpack_exports__.FeatureFlagError;
exports.FeatureFlagEvaluations = __webpack_exports__.FeatureFlagEvaluations;
exports.cookieStateToProperties = __webpack_exports__.cookieStateToProperties;
exports.cookieStoreFromHeader = __webpack_exports__.cookieStoreFromHeader;
exports.enrichCurrentSpan = __webpack_exports__.enrichCurrentSpan;
exports.getPostHogCookieName = __webpack_exports__.getPostHogCookieName;
exports.parsePostHogCookie = __webpack_exports__.parsePostHogCookie;
exports.readPostHogCookie = __webpack_exports__.readPostHogCookie;
exports.serializePostHogCookie = __webpack_exports__.serializePostHogCookie;
exports.uuidv7 = __webpack_exports__.uuidv7;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "EmailError",
    "FeatureFlagError",
    "FeatureFlagEvaluations",
    "cookieStateToProperties",
    "cookieStoreFromHeader",
    "enrichCurrentSpan",
    "getPostHogCookieName",
    "parsePostHogCookie",
    "readPostHogCookie",
    "serializePostHogCookie",
    "uuidv7"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
