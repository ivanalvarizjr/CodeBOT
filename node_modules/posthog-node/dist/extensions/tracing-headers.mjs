import { cookieStoreFromHeader, getConsentCookieName, getPostHogCookieName, isNoLike, isYesLike } from "@posthog/core";
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
        const cookies = cookieStoreFromHeader(cookieHeader.split(';').reverse().join(';'));
        const raw = cookies.get(getPostHogCookieName(apiKey))?.value;
        const consent = cookies.get(getConsentCookieName(apiKey))?.value ?? '';
        if (!raw || isNoLike(consent) || optOutCapturingByDefault && !isYesLike(consent)) return {};
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
export { POSTHOG_TRACING_HEADERS, addProperty, getFirstHeaderValue, getPostHogCookieReadOptions, getPostHogCookieValues, getPostHogTracingHeaderValues, sanitizeTracingHeaderValue };
