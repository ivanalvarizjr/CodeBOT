"use strict";
var __webpack_modules__ = {
    "./bot-detection" (module) {
        module.exports = require("./bot-detection.js");
    },
    "./browser-utils" (module) {
        module.exports = require("./browser-utils.js");
    },
    "./bucketed-rate-limiter" (module) {
        module.exports = require("./bucketed-rate-limiter.js");
    },
    "./json-utils" (module) {
        module.exports = require("./json-utils.js");
    },
    "./logger" (module) {
        module.exports = require("./logger.js");
    },
    "./number-utils" (module) {
        module.exports = require("./number-utils.js");
    },
    "./promise-queue" (module) {
        module.exports = require("./promise-queue.js");
    },
    "./retry-after" (module) {
        module.exports = require("./retry-after.js");
    },
    "./string-utils" (module) {
        module.exports = require("./string-utils.js");
    },
    "./type-utils" (module) {
        module.exports = require("./type-utils.js");
    },
    "./user-agent-utils" (module) {
        module.exports = require("./user-agent-utils.js");
    },
    "./webview-app-utils" (module) {
        module.exports = require("./webview-app-utils.js");
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
    var _type_utils__rspack_import_0 = __webpack_require__("./type-utils");
    var _bot_detection__rspack_import_1 = __webpack_require__("./bot-detection");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _bot_detection__rspack_import_1)if ([
        "UUID_REGEX",
        "trySafe",
        "parseRetryAfterMs",
        "currentTimestamp",
        "getEventUuid",
        "createNamedError",
        "currentISOTime",
        "assert",
        "isValidUUID",
        "removeTrailingSlash",
        "default",
        "allSettled",
        "STRING_FORMAT",
        "stripUrlHash",
        "safeSetTimeout",
        "raceWithTimeout",
        "retriable",
        "isPromise",
        "getFetch",
        "isUrl",
        "toJsonSafeValue"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_bot_detection__rspack_import_1[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _browser_utils__rspack_import_2 = __webpack_require__("./browser-utils");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _browser_utils__rspack_import_2)if ([
        "UUID_REGEX",
        "trySafe",
        "parseRetryAfterMs",
        "currentTimestamp",
        "getEventUuid",
        "createNamedError",
        "currentISOTime",
        "assert",
        "isValidUUID",
        "removeTrailingSlash",
        "default",
        "allSettled",
        "STRING_FORMAT",
        "stripUrlHash",
        "safeSetTimeout",
        "raceWithTimeout",
        "retriable",
        "isPromise",
        "getFetch",
        "isUrl",
        "toJsonSafeValue"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_browser_utils__rspack_import_2[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _bucketed_rate_limiter__rspack_import_3 = __webpack_require__("./bucketed-rate-limiter");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _bucketed_rate_limiter__rspack_import_3)if ([
        "UUID_REGEX",
        "trySafe",
        "parseRetryAfterMs",
        "currentTimestamp",
        "getEventUuid",
        "createNamedError",
        "currentISOTime",
        "assert",
        "isValidUUID",
        "removeTrailingSlash",
        "default",
        "allSettled",
        "STRING_FORMAT",
        "stripUrlHash",
        "safeSetTimeout",
        "raceWithTimeout",
        "retriable",
        "isPromise",
        "getFetch",
        "isUrl",
        "toJsonSafeValue"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_bucketed_rate_limiter__rspack_import_3[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _json_utils__rspack_import_4 = __webpack_require__("./json-utils");
    var _retry_after__rspack_import_5 = __webpack_require__("./retry-after");
    var _number_utils__rspack_import_6 = __webpack_require__("./number-utils");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _number_utils__rspack_import_6)if ([
        "UUID_REGEX",
        "trySafe",
        "parseRetryAfterMs",
        "currentTimestamp",
        "getEventUuid",
        "createNamedError",
        "currentISOTime",
        "assert",
        "isValidUUID",
        "removeTrailingSlash",
        "default",
        "allSettled",
        "STRING_FORMAT",
        "stripUrlHash",
        "safeSetTimeout",
        "raceWithTimeout",
        "retriable",
        "isPromise",
        "getFetch",
        "isUrl",
        "toJsonSafeValue"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_number_utils__rspack_import_6[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _string_utils__rspack_import_7 = __webpack_require__("./string-utils");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _string_utils__rspack_import_7)if ([
        "UUID_REGEX",
        "trySafe",
        "parseRetryAfterMs",
        "currentTimestamp",
        "getEventUuid",
        "createNamedError",
        "currentISOTime",
        "assert",
        "isValidUUID",
        "removeTrailingSlash",
        "default",
        "allSettled",
        "STRING_FORMAT",
        "stripUrlHash",
        "safeSetTimeout",
        "raceWithTimeout",
        "retriable",
        "isPromise",
        "getFetch",
        "isUrl",
        "toJsonSafeValue"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_string_utils__rspack_import_7[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var __rspack_reexport = {};
    for(const __rspack_import_key in _type_utils__rspack_import_0)if ([
        "UUID_REGEX",
        "trySafe",
        "parseRetryAfterMs",
        "currentTimestamp",
        "getEventUuid",
        "createNamedError",
        "currentISOTime",
        "assert",
        "isValidUUID",
        "removeTrailingSlash",
        "default",
        "allSettled",
        "STRING_FORMAT",
        "stripUrlHash",
        "safeSetTimeout",
        "raceWithTimeout",
        "retriable",
        "isPromise",
        "getFetch",
        "isUrl",
        "toJsonSafeValue"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_type_utils__rspack_import_0[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _promise_queue__rspack_import_8 = __webpack_require__("./promise-queue");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _promise_queue__rspack_import_8)if ([
        "UUID_REGEX",
        "trySafe",
        "parseRetryAfterMs",
        "currentTimestamp",
        "getEventUuid",
        "createNamedError",
        "currentISOTime",
        "assert",
        "isValidUUID",
        "removeTrailingSlash",
        "default",
        "allSettled",
        "STRING_FORMAT",
        "stripUrlHash",
        "safeSetTimeout",
        "raceWithTimeout",
        "retriable",
        "isPromise",
        "getFetch",
        "isUrl",
        "toJsonSafeValue"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_promise_queue__rspack_import_8[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _logger__rspack_import_9 = __webpack_require__("./logger");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _logger__rspack_import_9)if ([
        "UUID_REGEX",
        "trySafe",
        "parseRetryAfterMs",
        "currentTimestamp",
        "getEventUuid",
        "createNamedError",
        "currentISOTime",
        "assert",
        "isValidUUID",
        "removeTrailingSlash",
        "default",
        "allSettled",
        "STRING_FORMAT",
        "stripUrlHash",
        "safeSetTimeout",
        "raceWithTimeout",
        "retriable",
        "isPromise",
        "getFetch",
        "isUrl",
        "toJsonSafeValue"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_logger__rspack_import_9[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _user_agent_utils__rspack_import_10 = __webpack_require__("./user-agent-utils");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _user_agent_utils__rspack_import_10)if ([
        "UUID_REGEX",
        "trySafe",
        "parseRetryAfterMs",
        "currentTimestamp",
        "getEventUuid",
        "createNamedError",
        "currentISOTime",
        "assert",
        "isValidUUID",
        "removeTrailingSlash",
        "default",
        "allSettled",
        "STRING_FORMAT",
        "stripUrlHash",
        "safeSetTimeout",
        "raceWithTimeout",
        "retriable",
        "isPromise",
        "getFetch",
        "isUrl",
        "toJsonSafeValue"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_user_agent_utils__rspack_import_10[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _webview_app_utils__rspack_import_11 = __webpack_require__("./webview-app-utils");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _webview_app_utils__rspack_import_11)if ([
        "UUID_REGEX",
        "trySafe",
        "parseRetryAfterMs",
        "currentTimestamp",
        "getEventUuid",
        "createNamedError",
        "currentISOTime",
        "assert",
        "isValidUUID",
        "removeTrailingSlash",
        "default",
        "allSettled",
        "STRING_FORMAT",
        "stripUrlHash",
        "safeSetTimeout",
        "raceWithTimeout",
        "retriable",
        "isPromise",
        "getFetch",
        "isUrl",
        "toJsonSafeValue"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_webview_app_utils__rspack_import_11[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    const STRING_FORMAT = 'utf8';
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    function isValidUUID(value) {
        return 'string' == typeof value && UUID_REGEX.test(value);
    }
    function getEventUuid(uuid, generateUuid) {
        return isValidUUID(uuid) ? uuid : generateUuid();
    }
    function createNamedError(name, message) {
        const error = new Error(message);
        try {
            Object.defineProperty(error, 'name', {
                value: name,
                writable: true,
                enumerable: true,
                configurable: true
            });
        } catch  {}
        return error;
    }
    function assert(truthyValue, message) {
        if (!truthyValue || 'string' != typeof truthyValue || isEmpty(truthyValue)) throw new Error(message);
    }
    function isEmpty(truthyValue) {
        if (0 === truthyValue.trim().length) return true;
        return false;
    }
    function isUrl(value) {
        return (0, _type_utils__rspack_import_0.isString)(value) && /^(https?:\/\/|\/|\.\.?\/)/i.test(value.trim());
    }
    function removeTrailingSlash(url) {
        return url?.replace(/\/+$/, '');
    }
    function stripUrlHash(url) {
        if (!url) return url;
        return url.split('#')[0];
    }
    async function retriable(fn, props) {
        let lastError = null;
        for(let i = 0; i < props.retryCount + 1; i++){
            if (i > 0) await new Promise((r)=>setTimeout(r, props.retryDelay));
            try {
                const res = await fn();
                return res;
            } catch (e) {
                lastError = e;
                if (!props.retryCheck(e)) throw e;
            }
        }
        throw lastError;
    }
    function currentTimestamp() {
        return new Date().getTime();
    }
    function currentISOTime() {
        return new Date().toISOString();
    }
    function trySafe(fn) {
        try {
            return fn();
        } catch  {
            return;
        }
    }
    function safeSetTimeout(fn, timeout) {
        const t = setTimeout(fn, timeout);
        t?.unref && t?.unref();
        return t;
    }
    async function raceWithTimeout(promise, timeoutMs, onTimeout) {
        let timeoutHandle;
        try {
            return await Promise.race([
                promise,
                new Promise((resolve, reject)=>{
                    timeoutHandle = safeSetTimeout(()=>{
                        try {
                            onTimeout?.();
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    }, timeoutMs);
                })
            ]);
        } finally{
            clearTimeout(timeoutHandle);
        }
    }
    const isPromise = (obj)=>obj && 'function' == typeof obj.then;
    function getFetch() {
        return "u" > typeof fetch ? fetch : void 0 !== globalThis.fetch ? globalThis.fetch : void 0;
    }
    function allSettled(promises) {
        return Promise.all(promises.map((p)=>(p ?? Promise.resolve()).then((value)=>({
                    status: 'fulfilled',
                    value
                }), (reason)=>({
                    status: 'rejected',
                    reason
                }))));
    }
    __webpack_require__.d(__webpack_exports__, {
        allSettled: ()=>allSettled,
        assert: ()=>assert,
        createNamedError: ()=>createNamedError,
        currentISOTime: ()=>currentISOTime,
        currentTimestamp: ()=>currentTimestamp,
        getEventUuid: ()=>getEventUuid,
        getFetch: ()=>getFetch,
        isUrl: ()=>isUrl,
        isValidUUID: ()=>isValidUUID,
        parseRetryAfterMs: ()=>_retry_after__rspack_import_5.parseRetryAfterMs,
        raceWithTimeout: ()=>raceWithTimeout,
        removeTrailingSlash: ()=>removeTrailingSlash,
        retriable: ()=>retriable,
        safeSetTimeout: ()=>safeSetTimeout,
        stripUrlHash: ()=>stripUrlHash,
        toJsonSafeValue: ()=>_json_utils__rspack_import_4.toJsonSafeValue,
        trySafe: ()=>trySafe
    }, {
        STRING_FORMAT: STRING_FORMAT,
        UUID_REGEX: UUID_REGEX,
        isPromise: isPromise
    });
})();
exports.STRING_FORMAT = __webpack_exports__.STRING_FORMAT;
exports.UUID_REGEX = __webpack_exports__.UUID_REGEX;
exports.allSettled = __webpack_exports__.allSettled;
exports.assert = __webpack_exports__.assert;
exports.createNamedError = __webpack_exports__.createNamedError;
exports.currentISOTime = __webpack_exports__.currentISOTime;
exports.currentTimestamp = __webpack_exports__.currentTimestamp;
exports.getEventUuid = __webpack_exports__.getEventUuid;
exports.getFetch = __webpack_exports__.getFetch;
exports.isPromise = __webpack_exports__.isPromise;
exports.isUrl = __webpack_exports__.isUrl;
exports.isValidUUID = __webpack_exports__.isValidUUID;
exports.parseRetryAfterMs = __webpack_exports__.parseRetryAfterMs;
exports.raceWithTimeout = __webpack_exports__.raceWithTimeout;
exports.removeTrailingSlash = __webpack_exports__.removeTrailingSlash;
exports.retriable = __webpack_exports__.retriable;
exports.safeSetTimeout = __webpack_exports__.safeSetTimeout;
exports.stripUrlHash = __webpack_exports__.stripUrlHash;
exports.toJsonSafeValue = __webpack_exports__.toJsonSafeValue;
exports.trySafe = __webpack_exports__.trySafe;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "STRING_FORMAT",
    "UUID_REGEX",
    "allSettled",
    "assert",
    "createNamedError",
    "currentISOTime",
    "currentTimestamp",
    "getEventUuid",
    "getFetch",
    "isPromise",
    "isUrl",
    "isValidUUID",
    "parseRetryAfterMs",
    "raceWithTimeout",
    "removeTrailingSlash",
    "retriable",
    "safeSetTimeout",
    "stripUrlHash",
    "toJsonSafeValue",
    "trySafe"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
