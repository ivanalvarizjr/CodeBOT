import type { OtlpAnyValue, OtlpKeyValue } from '@posthog/types';
import type { Logger } from '../types';
export declare function toOtlpAnyValue(value: unknown, logger?: Logger): OtlpAnyValue;
export declare function toOtlpKeyValueList(attrs: Record<string, unknown>, logger?: Logger): OtlpKeyValue[];
//# sourceMappingURL=otlp-any-value.d.ts.map