/** Doublings the retry delay may grow by before it stops growing. */
export declare const MAX_FLUSH_BACKOFF_EXPONENT = 6;
/**
 * Ceiling on the SDK's own retry delay, which the logs and traces contracts
 * both state as "exponential backoff capped at ~30s". A host that configured a
 * longer flush interval keeps it: the cap is there to stop the doubling running
 * away, not to flush more often than asked.
 */
export declare const MAX_FLUSH_BACKOFF_MS = 30000;
/** A multiplier in `[1 - JITTER, 1 + JITTER]`, drawn once per failure by the caller. */
export declare function drawJitter(): number;
/** No jitter, for the delay a queue uses when nothing has failed. */
export declare const NO_JITTER = 1;
/**
 * The delay before retrying an export, `baseMs` doubled once per failure past
 * the first and capped at `maxMs`.
 *
 * `jitter` is applied to the SDK's own delay only. A `Retry-After` the endpoint
 * sent is a floor underneath it, applied by the caller: spreading a fleet must
 * never move a retry earlier than the endpoint asked for.
 */
export declare function backoffDelayMs(baseMs: number, failures: number, jitter: number, maxMs?: number): number;
//# sourceMappingURL=backoff.d.ts.map