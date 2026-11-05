import type { Span, StartSpanOptions } from '@posthog/types';
import type { Logger } from '../types';
import type { ResolvedTracesConfig, SpanContextManager, TraceSdkContext, TracesHost } from './types';
type SpanCallback<T> = (span: Span) => T;
/**
 * The traces pipeline: span creation, active-span parenting, and OTLP export.
 * Separate from the analytics-events pipeline — own queue, endpoint and flush
 * cycle — mirroring logs and metrics.
 *
 * @internal Exposed for cross-package use within this SDK; not part of the stable public API.
 */
export declare class PostHogTraces {
    private readonly _instance;
    private readonly _config;
    private readonly _logger;
    private readonly _getContext;
    private readonly _contextManager;
    /** Told when a span joins the queue, so a serverless host can keep the invocation alive. */
    private readonly _onSpanQueued?;
    private _queue;
    private readonly _flushTimer;
    private _flushPromise;
    private _backgroundFlush?;
    private _maxExportBatchSize;
    private _droppedSinceWarning;
    private _lastDropWarningAt;
    private _dropReasons;
    private _consecutiveFlushFailures;
    private _flushJitter;
    private _retryAfter;
    private _headBatchFailures;
    private _headBatchSize;
    private _headBatchChargeableAt;
    private _generation;
    private _liveSpans;
    constructor(_instance: TracesHost, _config: ResolvedTracesConfig, _logger: Logger, _getContext: () => TraceSdkContext, _contextManager: SpanContextManager, 
    /** Told when a span joins the queue, so a serverless host can keep the invocation alive. */
    _onSpanQueued?: (() => void) | undefined);
    /**
     * Starts a span without making it active. Always returns a handle — an inert
     * one when tracing cannot run — so calling code never branches.
     */
    startSpan(name: string, options?: StartSpanOptions): Span;
    /**
     * Runs a callback with a span active for its duration and guarantees the span
     * ends — at return for a sync callback, at settle for an async one.
     *
     * A throw or rejection is recorded on the span and rethrown unmodified: the
     * SDK never swallows application control flow.
     */
    withSpan<T>(name: string, fn: SpanCallback<T>): T;
    withSpan<T>(name: string, options: StartSpanOptions, fn: SpanCallback<T>): T;
    /** The active span, or `null` outside any `withSpan` callback. */
    getActiveSpan(): Span | null;
    /**
     * Drains the span queue in repeated passes: joining a single in-flight pass
     * would leave spans enqueued after its watermark behind.
     *
     * A pass reports spans removed — queue length can't stand in, since a send
     * concurrent with an arrival leaves it unchanged.
     *
     * An open `Retry-After` window does not stop this: an explicit flush, or one a
     * host runs to keep a request alive, sends whatever is queued — a serverless
     * isolate may not be around for the armed timer to fire. The window is honoured
     * by not charging such an attempt against the head batch's retry budget, so the
     * wait costs a request rather than the spans. The periodic flush does wait it
     * out.
     */
    /**
     * Whether the endpoint has asked this queue to wait. An automatic flush skips
     * it; the traces flush timer already drains once the window closes.
     */
    get throttled(): boolean;
    flush(): Promise<void>;
    private _startFlush;
    /** Clears the queue and timer. Used on shutdown and between tests. */
    reset(): void;
    /** Called wherever the head batch leaves or changes shape, so its budget goes with it. */
    private _resetHeadBatchBudget;
    /**
     * Resolves a span's parent: an explicit `parent`, then the active span, then a
     * fresh root. A no-op explicit parent is rejected earlier, in `startSpan`.
     */
    private _resolveParent;
    /**
     * PostHog context snapshotted at span start. These are the product's join
     * keys — they're what makes a span reachable from a person or a session.
     */
    private _autoContextAttributes;
    /**
     * Records a callback failure on the span: an `exception` event always, plus
     * status `error` unless the callback explicitly marked the span `ok`.
     */
    private _recordCallbackError;
    /**
     * Drops live accounting for spans older than `maxSpanAgeMs`. An evicted span
     * is never exported — its `end()` finds no entry — so one leak returns its
     * slot instead of disabling tracing for the rest of the process.
     */
    private _evictAgedSpans;
    private _onSpanEnd;
    /**
     * One diagnostic per span when its limits discarded anything, which is what
     * OTel asks for. Counted after the post-hook pass, so drops a `beforeSpanSend`
     * hook caused are included.
     */
    private _reportLimitDrops;
    /**
     * Runs the `beforeSpanSend` chain, returning the span to enqueue or `null` to
     * drop it.
     *
     * A throwing hook drops the span: the hook is the documented scrubbing point,
     * so a broken scrubber must not let the unscrubbed record through. Identity
     * fields are restored afterwards, since rewriting them orphans shipped children.
     */
    private _runBeforeSpanSend;
    /**
     * Restores the fields a hook must not change. Runs per hook so a later hook in
     * the chain cannot sample on an id an earlier one forged.
     */
    private _keepSpanIdentity;
    private _recordDrop;
    /** At most one warning per flush pass, naming the total and every reason behind it. */
    private _warnAboutDrops;
    /**
     * Encodes a batch, dropping any span whose attributes can't be encoded.
     * An unguarded throw here would leave the queue unspliced, so every later
     * flush would die on the same span.
     */
    private _encodeBatch;
    /**
     * Discards the queue when consent has been withdrawn, returning how many spans
     * it dropped. Spans carry `posthogDistinctId` and `sessionId`, so anything still
     * queued when the user opts out must not be exported.
     */
    private _discardQueueIfConsentWithdrawn;
    /** Returns how many spans it removed from the queue, sent or dropped. */
    private _flushInner;
    /**
     * One background drain at a time. `flush()` is a multi-pass loop that keeps
     * going while the queue stays above the batch size, so a trigger per span end
     * would stack a loop per span on a busy service — each retaining its frames.
     */
    private _flushInBackground;
    private _armFlushTimerIfQueued;
    private _armFlushTimerIfQueuedNoEarlierThan;
    private _nextFlushDelay;
}
export {};
//# sourceMappingURL=index.d.ts.map