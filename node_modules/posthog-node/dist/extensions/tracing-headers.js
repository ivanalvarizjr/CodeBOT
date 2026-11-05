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
    POSTHOG_TRACING_HEADERS: ()=>POSTHOG_TRACING_HEADERS,
    addProperty: ()=>addProperty,
    getFirstHeaderValue: ()=>getFirstHeaderValue,
    getPostHogCookieReadOptions: ()=>getPostHogCookieReadOptions,
    getPostHogCookieValues: ()=>getPostHogCookieValues,
    getPostHogTracingHeaderValues: ()=>getPostHogTracingHeaderValues,
    sanitizeTracingHeaderValue: ()=>sanitizeTracingHeaderValue
});
const core_namespaceObject = require("@posthog/core");
const TRACING_HEADER_MAX_LENGTH = 1000;
const COOKIE_SESSION_IDLE_TIMEOUT_MS = 1800000;
const COOKIE_SESSION_MAX_LENGTH_MS = 86400000;
const MIN_SESSION_IDLE_TIMEOUT_SECONDS = 60;
const MAX_SESSION_IDLE_TIMEOUT_SECONDS = 36000;
const TRACING_HEADER_CONTROL_CHARS_REGEX = /[\x00-\x1f\x7f-\x9f]/g;
const POSTHOG_TRACING_HEADERS = {
    sessionId: 'x-posthog-session-id',
    distinctId: 'x-posthog-distinct-id'
};
function getPostHogCookieReadOptions(posthog) {
    const option = posthog.options.readPostHogCookie;
    if (true === option) return {
        apiKey: posthog.apiKey
    };
    if (option && 'object' == typeof option) return {
        apiKey: posthog.apiKey,
        sessionIdleTimeoutSeconds: option.sessionIdleTimeoutSeconds,
        optOutCapturingByDefault: option.optOutCapturingByDefault
    };
    return null;
}
function addProperty(properties, key, value) {
    if (null != value && '' !== value) properties[key] = value;
}
function getFirstHeaderValue(value) {
    return Array.isArray(value) ? value[0] : value;
}
function sanitizeTracingHeaderValue(value) {
    if (Array.isArray(value)) {
        for (const item of value){
            const sanitized = sanitizeTracingHeaderValue(item);
            if (void 0 !== sanitized) return sanitized;
        }
        return;
    }
    if ('string' != typeof value) return;
    const sanitized = value.replace(TRACING_HEADER_CONTROL_CHARS_REGEX, '').trim();
    if (!sanitized) return;
    return sanitized.length > TRACING_HEADER_MAX_LENGTH ? sanitized.slice(0, TRACING_HEADER_MAX_LENGTH) : sanitized;
}
function isRecent(timestamp, now, maxAgeMs) {
    return 'number' == typeof timestamp && Number.isFinite(timestamp) && Math.abs(now - timestamp) <= maxAgeMs;
}
function getPostHogCookieValues(cookieHeader, apiKey, now = Date.now(), sessionIdleTimeoutMs = COOKIE_SESSION_IDLE_TIMEOUT_MS, optOutCapturingByDefault = false) {
    try {
        if ('string' != typeof cookieHeader) return {};
        const cookies = (0, core_namespaceObject.cookieStoreFromHeader)(cookieHeader.split(';').reverse().join(';'));
        const raw = cookies.get((0, core_namespaceObject.getPostHogCookieName)(apiKey))?.value;
        const consent = cookies.get((0, core_namespaceObject.getConsentCookieName)(apiKey))?.value ?? '';
        if (!raw || (0, core_namespaceObject.isNoLike)(consent) || optOutCapturingByDefault && !(0, core_namespaceObject.isYesLike)(consent)) return {};
        const data = JSON.parse(raw);
        if (!data || 'object' != typeof data) return {};
        const distinctId = 'identified' === data.$user_state ? sanitizeTracingHeaderValue(data.distinct_id) : void 0;
        let sessionId;
        const session = data.$sesid;
        if (Array.isArray(session) && (2 === session.length || 3 === session.length)) {
            const [lastActivity, candidate, sessionStart = lastActivity] = session;
            if (isRecent(lastActivity, now, sessionIdleTimeoutMs) && isRecent(sessionStart, now, COOKIE_SESSION_MAX_LENGTH_MS)) sessionId = sanitizeTracingHeaderValue(candidate);
        }
        return {
            ...void 0 !== sessionId ? {
                sessionId
            } : {},
            ...void 0 !== distinctId ? {
                distinctId
            } : {}
        };
    } catch  {
        return {};
    }
}
function getSessionIdleTimeoutMs(cookie) {
    const seconds = cookie.sessionIdleTimeoutSeconds;
    if ('number' != typeof seconds || !Number.isFinite(seconds) || 0 === seconds) return COOKIE_SESSION_IDLE_TIMEOUT_MS;
    return 1000 * Math.min(Math.max(seconds, MIN_SESSION_IDLE_TIMEOUT_SECONDS), MAX_SESSION_IDLE_TIMEOUT_SECONDS);
}
function getPostHogTracingHeaderValues(headers, cookie) {
    if (!headers) return {};
    const headerSessionId = sanitizeTracingHeaderValue(headers[POSTHOG_TRACING_HEADERS.sessionId]);
    const headerDistinctId = sanitizeTracingHeaderValue(headers[POSTHOG_TRACING_HEADERS.distinctId]);
    const { sessionId, distinctId } = void 0 === headerSessionId && void 0 === headerDistinctId && cookie ? getPostHogCookieValues(headers.cookie, cookie.apiKey, Date.now(), getSessionIdleTimeoutMs(cookie), true === cookie.optOutCapturingByDefault) : {
        sessionId: headerSessionId,
        distinctId: headerDistinctId
    };
    return {
        ...void 0 !== sessionId ? {
            sessionId
        } : {},
        ...void 0 !== distinctId ? {
            distinctId
        } : {}
    };
}
exports.POSTHOG_TRACING_HEADERS = __webpack_exports__.POSTHOG_TRACING_HEADERS;
exports.addProperty = __webpack_exports__.addProperty;
exports.getFirstHeaderValue = __webpack_exports__.getFirstHeaderValue;
exports.getPostHogCookieReadOptions = __webpack_exports__.getPostHogCookieReadOptions;
exports.getPostHogCookieValues = __webpack_exports__.getPostHogCookieValues;
exports.getPostHogTracingHeaderValues = __webpack_exports__.getPostHogTracingHeaderValues;
exports.sanitizeTracingHeaderValue = __webpack_exports__.sanitizeTracingHeaderValue;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "POSTHOG_TRACING_HEADERS",
    "addProperty",
    "getFirstHeaderValue",
    "getPostHogCookieReadOptions",
    "getPostHogCookieValues",
    "getPostHogTracingHeaderValues",
    "sanitizeTracingHeaderValue"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
