import type { Logger } from '../types';
import type { SpanTimeInput } from '@posthog/types';
/**
 * Span and event names must be non-empty. An empty or non-string name is
 * replaced rather than dropped, so a mis-instrumented call site loses its name,
 * not its span. `label` names what is being sanitized in the warning.
 */
export declare function sanitizeName(name: unknown, label: string, maxLength: number, logger?: Logger): string;
/**
 * Normalizes a caller-supplied time to a millisecond epoch.
 *
 * Returns `undefined` for anything unusable — the wrong type, `NaN`, or outside
 * the representable range — leaving the caller to fall back to a derived time.
 */
export declare function toEpochMs(value: SpanTimeInput | undefined): number | undefined;
/**
 * Resolves a caller-supplied start time, warning when it is deep enough in the
 * past that the server will clamp it.
 */
export declare function resolveStartTime(value: SpanTimeInput | undefined, now: number, logger?: Logger): number;
/**
 * Corrects an end time that precedes its start, producing a zero-duration span
 * rather than a negative one the server would reject.
 */
export declare function clampEndTime(endTime: number, startTime: number): number;
/**
 * Keeps a caller-supplied end or event time inside the representable range,
 * falling back to the span's own clock basis when it is unusable. `label` names
 * what is being sanitized in the warning.
 */
export declare function resolveSuppliedTime(value: SpanTimeInput | undefined, derived: number, label: string, logger?: Logger): number;
//# sourceMappingURL=sanitize.d.ts.map