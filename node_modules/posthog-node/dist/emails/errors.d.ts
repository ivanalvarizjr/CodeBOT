/**
 * A coarse category of the failure, for code that branches on the kind of failure rather than the exact `code`.
 */
export type EmailErrorName = 'validation_error' | 'missing_api_key' | 'invalid_permission' | 'not_found' | 'concurrent_idempotent_requests' | 'invalid_idempotent_request' | 'rate_limit_exceeded' | 'monthly_quota_exceeded' | 'service_unavailable' | 'application_error';
export interface EmailErrorParams {
    code: string;
    message: string;
    statusCode?: number;
    why?: string;
    fix?: string;
    docsUrl?: string;
    field?: string;
    retryAfterMs?: number;
    cause?: unknown;
}
/**
 * PostHog did not queue the email, or the client could not tell whether it did.
 *
 * Branch on `code`, PostHog's stable error code, or on `name`, a coarse category of the
 * failure. The message never contains the secret key or the request body.
 */
export declare class EmailError extends Error {
    name: EmailErrorName;
    /** PostHog's error code, such as `quota_limited`, or an SDK code such as `network_error`. */
    readonly code: string;
    /** The HTTP status, when PostHog answered. */
    readonly statusCode?: number;
    readonly why?: string;
    readonly fix?: string;
    readonly docsUrl?: string;
    /** The request field the error is about, when PostHog named one. */
    readonly field?: string;
    /** How long PostHog asked the client to wait before it sends again, in milliseconds. */
    readonly retryAfterMs?: number;
    constructor(params: EmailErrorParams);
}
//# sourceMappingURL=errors.d.ts.map