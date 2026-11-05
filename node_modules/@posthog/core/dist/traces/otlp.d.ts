import type { OtlpSpan, OtlpTracesPayload, SpanAttributes, SpanKind } from '@posthog/types';
import type { Logger } from '../types';
import type { ResolvedTracesConfig, SpanRecord } from './types';
export declare function spanKindToOtlp(kind: SpanKind | undefined): number;
/**
 * Converts a millisecond epoch to the unix-nanosecond string OTLP expects.
 * Concatenation rather than multiplication: `Date.now() * 1e6` exceeds
 * `Number.MAX_SAFE_INTEGER`.
 */
export declare function msToUnixNanoString(ms: number): string;
export declare function buildOtlpSpan(record: SpanRecord, logger?: Logger): OtlpSpan;
/**
 * OTLP resource attributes for every batch. User `resourceAttributes` are spread
 * first, then SDK-controlled identity keys on top so a stray key can't clobber
 * them. `service.name` is always emitted: the server reads `service_name` only
 * from that attribute, and spans are unattributable without it.
 */
export declare function buildTracesResourceAttributes(config: ResolvedTracesConfig, sdkName: string, sdkVersion: string): SpanAttributes;
/**
 * Wraps spans in the OTLP `resourceSpans` envelope: one resource, one scope, N
 * spans per batch. The server flattens the scope to `{name}@{version}`.
 */
export declare function buildOtlpTracesPayload(spans: OtlpSpan[], resourceAttributes: SpanAttributes, scopeName: string, scopeVersion: string, logger?: Logger): OtlpTracesPayload;
//# sourceMappingURL=otlp.d.ts.map