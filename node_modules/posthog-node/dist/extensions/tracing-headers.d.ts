import type { IncomingHttpHeaders } from 'node:http';
type HeaderValue = IncomingHttpHeaders[string];
export declare const POSTHOG_TRACING_HEADERS: {
    readonly sessionId: 'x-posthog-session-id';
    readonly distinctId: 'x-posthog-distinct-id';
};
export interface PostHogCookieReadOptions {
    apiKey: string;
    sessionIdleTimeoutSeconds?: number;
    optOutCapturingByDefault?: boolean;
}
/**
 * The cookie read settings from the client's `readPostHogCookie` option, or null when the option is off.
 */
export declare function getPostHogCookieReadOptions(posthog: {
    apiKey: string;
    options: {
        readPostHogCookie?: boolean | {
            sessionIdleTimeoutSeconds?: number;
            optOutCapturingByDefault?: boolean;
        };
    };
}): PostHogCookieReadOptions | null;
export interface PostHogTracingHeaderValues {
    sessionId?: string;
    distinctId?: string;
}
export declare function addProperty(properties: Record<string, any>, key: string, value: unknown): void;
export declare function getFirstHeaderValue(value: HeaderValue): string | undefined;
export declare function sanitizeTracingHeaderValue(value: HeaderValue): string | undefined;
/**
 * Reads the live session ID, and the distinct ID of an identified user, from the cookie that posthog-js writes with its
 * default persistence. The browser sends it on every same-site request, so backend events link to the browser session
 * without `tracing_headers`. A session past the posthog-js idle timeout or length cap is not returned, because the
 * browser starts a new session on its next activity. An anonymous distinct ID is not returned, so backend events for
 * anonymous visitors stay personless. Nothing is returned when the visitor's consent cookie opts out.
 */
export declare function getPostHogCookieValues(cookieHeader: HeaderValue, apiKey: string, now?: number, sessionIdleTimeoutMs?: number, optOutCapturingByDefault?: boolean): PostHogTracingHeaderValues;
/**
 * Reads the PostHog tracing headers. With cookie read options, a request with neither header falls back to the posthog-js
 * cookie. A request with either header uses headers only, so one request never mixes two identities.
 */
export declare function getPostHogTracingHeaderValues(headers?: IncomingHttpHeaders, cookie?: PostHogCookieReadOptions | null): PostHogTracingHeaderValues;
export {};
//# sourceMappingURL=tracing-headers.d.ts.map