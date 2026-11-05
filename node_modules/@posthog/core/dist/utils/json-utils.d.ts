/** Traversal budgets and markers, shared with the OTLP attribute encoder. Not
 * public API — `utils/index.ts` re-exports `toJsonSafeValue` only. */
export declare const MAX_JSON_SAFE_VALUE_DEPTH = 20;
export declare const MAX_JSON_SAFE_VALUE_ITEMS = 1000;
export declare const MAX_JSON_SAFE_VALUE_NODES = 10000;
export declare const CIRCULAR_VALUE = "[Circular]";
export declare const TRUNCATED_VALUE = "[Truncated]";
export declare const UNSERIALIZABLE_VALUE = "[Unserializable]";
export declare const FUNCTION_VALUE = "[Function]";
/**
 * Replaces unpaired surrogates with U+FFFD. A lone surrogate survives
 * `JSON.stringify` as a `\uD800`-style escape, which strict JSON parsers
 * reject — for OTLP that means the whole request is refused.
 */
export declare function sanitizeString(value: string): string;
/**
 * Converts an arbitrary value, sanitizing `toJSON` results when available.
 * The limits keep pathological values from causing unbounded recursion or traversal.
 */
export declare function toJsonSafeValue(value: unknown): unknown;
/**
 * Copies caller-supplied attributes onto `target`, own enumerable keys only.
 *
 * Read key by key rather than spread: a getter over a disposed resource or a
 * revoked proxy throws on the read itself, before the encoder's guards see it.
 */
export declare function assignUserAttributes<T extends Record<string, any>>(target: T, source: Record<string, unknown> | undefined): T;
//# sourceMappingURL=json-utils.d.ts.map