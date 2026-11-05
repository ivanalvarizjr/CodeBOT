import type { Span, SpanAttributes, SpanAttributeValue, SpanKind, SpanStatusCode, SpanTimeInput } from '@posthog/types';
import type { Logger } from '../types';
import type { SpanContextManager, SpanRecord } from './types';
/**
 * A monotonic millisecond reading where the platform has one, so an NTP
 * correction mid-span can't produce a negative duration.
 */
export declare function monotonicNow(): number | undefined;
/** A root span's start read on both clocks: the basis its local descendants are placed on. */
export interface ClockAnchor {
    wall: number;
    mono: number;
}
export interface SpanInit {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    traceState?: string;
    /** The trace-flags byte to propagate; the inbound one when continuing a remote trace. */
    traceFlags?: string;
    /** True when the parent came from a `traceparent` header rather than a local handle. */
    parentIsRemote?: boolean;
    name: string;
    kind: SpanKind;
    attributes: SpanAttributes;
    /** ms epoch. */
    startTime: number;
    /** True when the caller supplied an explicit `startTime`. */
    backdated: boolean;
    /** Inherited from a local parent; replaces `startTime` unless the span is backdated. */
    clockAnchor?: ClockAnchor;
    /** Keys the SDK attached itself. Exempt from the attribute cap and never evicted. */
    autoAttributeKeys: string[];
    maxAttributes: number;
    maxEvents: number;
    maxAttributesPerEvent: number;
    maxAttributeValueLength: number;
}
export declare class PostHogSpan implements Span {
    private readonly _onEnd;
    private readonly _logger?;
    private readonly _traceId;
    private readonly _spanId;
    private readonly _parentSpanId?;
    private readonly _traceState?;
    private readonly _traceFlags;
    private readonly _parentIsRemote;
    private readonly _startTime;
    private readonly _startMono?;
    private readonly _clockAnchor?;
    private _name;
    private _kind;
    private _attributes;
    private _events;
    private _status?;
    private _ended;
    private readonly _autoKeys;
    private readonly _maxAttributes;
    private readonly _maxEvents;
    private readonly _maxAttributesPerEvent;
    private readonly _maxAttributeValueLength;
    private _userAttributeCount;
    private _userEventCount;
    private _droppedAttributes;
    private _droppedEvents;
    constructor(init: SpanInit, _onEnd: (record: SpanRecord, autoKeys: ReadonlySet<string>) => void, _logger?: Logger | undefined);
    /**
     * "Now" on this span's clock basis: start plus monotonic elapsed where we
     * have it, wall clock otherwise.
     */
    private _now;
    /** Guards every mutator: operations after `end()` no-op with a debug warning. */
    private _mutable;
    /**
     * Writes an attribute unless the span is already at its user-attribute cap.
     *
     * Overwriting a key already on the span always succeeds — the cap counts
     * distinct user keys, not writes — and SDK-attached keys never count toward
     * it, so a span at the cap still carries its person and session ids.
     */
    private _writeAttribute;
    setAttribute(key: string, value: SpanAttributeValue): this;
    setAttributes(attributes: SpanAttributes): this;
    addEvent(name: string, attributes?: SpanAttributes, timestamp?: SpanTimeInput): this;
    setStatus(status: SpanStatusCode, message?: string): this;
    /** True when the caller explicitly marked the span `ok`; `withSpan` treats that as final. */
    get statusIsExplicitlyOk(): boolean;
    recordException(error: unknown): this;
    updateName(name: string): this;
    traceparent(): string | null;
    tracestate(): string | null;
    /** Context a child span inherits when this handle is its parent. */
    childContext(): {
        traceId: string;
        parentSpanId: string;
        traceState?: string;
        traceFlags: string;
        clockAnchor?: ClockAnchor;
    };
    end(endTime?: SpanTimeInput): void;
}
/**
 * A caller-visible counter read back as a number, or 0 for anything else.
 * Clamped to the `uint32` the OTLP field is declared as: a `beforeSpanSend` hook
 * can write a larger number onto an event, and one that overflows the field is
 * refused for the whole request.
 */
export declare function nonNegativeCount(value: unknown): number;
/**
 * Re-applies the per-span caps to a record a `beforeSpanSend` hook has already
 * seen. The hook writes to the plain record, not through the span's own guarded
 * writer, so an enriching hook would otherwise push a span past the cap it was
 * trimmed to and back into the 413 path the cap exists to avoid.
 *
 * Earliest-set entries win, matching the span-side rule; SDK-attached keys are
 * exempt. Counts add to whatever the span already dropped.
 */
export declare function applySpanLimits(record: SpanRecord, autoKeys: ReadonlySet<string>, maxAttributes: number, maxEvents: number, maxAttributesPerEvent: number, maxAttributeValueLength: number, keysBeforeHook?: readonly string[]): void;
/**
 * An inert handle returned whenever tracing cannot run — traces unconfigured,
 * SDK disabled, user opted out. Supports the full surface so caller code never
 * branches, and returns `null` from `traceparent()` so an id this SDK never
 * recorded cannot propagate.
 */
export declare class NoopSpan implements Span {
    setAttribute(): this;
    setAttributes(): this;
    addEvent(): this;
    setStatus(): this;
    recordException(): this;
    updateName(): this;
    traceparent(): string | null;
    tracestate(): string | null;
    end(): void;
}
export declare const NOOP_SPAN: Span;
/**
 * An inert handle that carries an inbound trace context. Records nothing, and
 * echoes the `traceparent` it was handed — including the caller's version and
 * sampled flag — so a service with tracing off still forwards the trace it
 * received rather than severing it. The ids it propagates are the upstream
 * caller's own; this SDK invents none.
 */
export declare class PassThroughSpan extends NoopSpan {
    private readonly _traceparent;
    private readonly _tracestate?;
    constructor(_traceparent: string, _tracestate?: string | undefined);
    traceparent(): string;
    tracestate(): string | null;
}
/**
 * The handle to return when a span cannot be recorded: a pass-through when a
 * context is available, the shared no-op otherwise. With no explicit `parent`
 * the active handle supplies it, so an inbound trace survives nesting.
 *
 * @internal Exposed for cross-package use within this SDK; not part of the stable public API.
 */
export declare function inertSpan(options?: {
    parent?: unknown;
    tracestate?: unknown;
}, active?: Span): Span;
/**
 * Bounds every string reachable from an attribute value to `maxLength`
 * characters, including the strings nested inside arrays and objects. Numbers
 * and booleans are bounded already.
 *
 * An unbounded value is the one thing the per-span caps do not stop: a single
 * multi-MB attribute makes the whole span too large for the ingestion endpoint,
 * and the 413 path then drops that span whole. `setAttribute('payload', { body })`
 * is the usual way one arrives, so the bound has to reach inside the value.
 *
 * Returns the value it was given when nothing needed shortening, so the common
 * case allocates nothing.
 */
export declare function truncateAttributeValue(value: SpanAttributeValue, maxLength: number): SpanAttributeValue;
/** `truncateAttributeValue` across an attribute bag, in place. */
export declare function truncateAttributes(attributes: SpanAttributes, maxLength: number): SpanAttributes;
/**
 * Runs `fn` with `span` active, which every scoped helper does the same way.
 *
 * The shared no-op is never activated, so `getActiveSpan()` inside the callback
 * reads null — callbacks should use the handle they're given. A pass-through
 * handle is activated, so `getActiveSpan()?.traceparent()` still propagates an
 * inbound trace through a service with tracing off.
 *
 * @internal Exposed for cross-package use within this SDK; not part of the stable public API.
 */
export declare function runWithActiveSpan<T>(contextManager: SpanContextManager, span: Span, fn: (span: Span) => T): T;
/**
 * Extracts the OTel `exception.type` / `exception.message` pair from whatever was
 * thrown. Anything can be thrown in JS, so non-Errors are described by type.
 */
export declare function describeError(error: unknown): {
    type: string;
    message: string;
    stack?: string;
};
//# sourceMappingURL=span.d.ts.map