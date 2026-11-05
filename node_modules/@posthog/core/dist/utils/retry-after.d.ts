/**
 * Longest `Retry-After` the SDK will wait. A rate-limit window can legitimately
 * be long, but nothing upstream of the SDK bounds this header — it is as likely
 * to come from a proxy or CDN as from PostHog — and an unbounded value would
 * strand a queue for hours, so the wait is capped and the retry happens early.
 */
export declare const MAX_RETRY_AFTER_MS: number;
/**
 * `Retry-After` as milliseconds from now. The header is either delta-seconds or
 * an HTTP-date; anything else, a date already in the past, or a non-positive
 * delta yields `undefined` so the caller keeps its own backoff. The result is
 * capped at `maxMs`, which defaults to `MAX_RETRY_AFTER_MS`.
 */
export declare function parseRetryAfterMs(value: unknown, now?: number, maxMs?: number): number | undefined;
/** The part of an export outcome the window reads. */
export type RetryAfterOutcome = {
    kind: 'ok' | 'retry-later' | 'too-large' | 'fatal';
    retryAfterMs?: number;
};
/**
 * The wait an ingestion endpoint asked for, shared by the logs, metrics and
 * traces export queues.
 *
 * Held as an absolute deadline rather than a duration, so a timer armed while
 * the wait is already part-served counts down the remainder instead of
 * restarting it.
 */
export declare class RetryAfterWindow {
    private _until;
    private _installedAt;
    /**
     * Folds one export outcome into the window.
     *
     * A refusal naming a longer wait than the one being served pushes the
     * deadline out, but never past `MAX_RETRY_AFTER_MS` from where the window was
     * first installed. That ceiling is the SDK's own policy rather than OTLP's,
     * which asks for the header to be honoured and names no cap: a host flushing
     * faster than the window is long would otherwise refresh the deadline forever
     * and never recover, since logs gates its size trigger and `onReconnect` on
     * the window and metrics re-arms its timer from it. The cost is that a wait
     * longer than the ceiling is served short.
     *
     * The deadline is never pulled in, so a shorter header cannot cut a wait the
     * endpoint already asked for.
     */
    record(outcome: RetryAfterOutcome): void;
    /**
     * Milliseconds left of the wait, `0` when none is open. Closes a window it
     * finds spent, so a later backward clock step cannot bring it back.
     */
    remainingMs(): number;
    isOpen(): boolean;
    reset(): void;
}
//# sourceMappingURL=retry-after.d.ts.map