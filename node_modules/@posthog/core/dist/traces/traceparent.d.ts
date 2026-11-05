export interface RemoteSpanContext {
    traceId: string;
    spanId: string;
    /** The inbound trace-flags byte, e.g. `01` sampled, `00` sampled out. */
    flags: string;
}
/**
 * Parses an incoming `traceparent` header value, returning `undefined` for
 * anything malformed so a bad header starts a fresh root rather than throwing.
 *
 * A trace the caller sampled out (`00`) is still continued — PostHog records
 * every captured span — but the inbound flag rides along, so what this SDK
 * propagates onward says what the caller decided rather than overriding it.
 */
export declare function parseTraceparent(value: unknown): RemoteSpanContext | undefined;
/**
 * The inbound `traceparent` as received, or `undefined` when it is malformed.
 *
 * Returned whole rather than rebuilt: a version above `00` may append fields
 * this SDK does not read, and rebuilding would forward a header still labelled
 * with that version but missing what the version defines.
 */
export declare function normalizeTraceparent(value: unknown): string | undefined;
/**
 * A `traceparent` as the string it is, unwrapping the one-element array Node's
 * `headersDistinct` hands over. A longer array is two different inbound values,
 * and picking either would be a guess.
 */
export declare function traceparentHeader(value: unknown): unknown;
/** The W3C sampled bit, set on a trace this SDK started. */
export declare const TRACE_FLAGS_SAMPLED = "01";
/**
 * Builds the `traceparent` header value for a span. A span continuing a remote
 * trace propagates the flags byte it was handed: a downstream parent-based
 * sampler must see the decision the head sampler actually made, not one this
 * SDK invented. A trace started here is sampled, because it is recorded.
 */
export declare function formatTraceparent(traceId: string, spanId: string, flags?: string): string;
/**
 * Validates an incoming `tracestate` far enough to know it is safe to echo back.
 * A malformed one is discarded without invalidating its traceparent, so a bad
 * vendor entry never costs us the trace continuation. More than 32 members is
 * malformed: W3C's list grammar admits no more.
 *
 * A valid header over the length W3C asks us to propagate is trimmed instead,
 * by whole members. Members over 128 characters go first — W3C names those as
 * the ones to drop — and the rest from the right, so the entries nearest the
 * caller survive.
 */
export declare function sanitizeTracestate(value: unknown): string | undefined;
//# sourceMappingURL=traceparent.d.ts.map