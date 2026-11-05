/**
 * Random bytes from the platform's CSPRNG, falling back to `Math.random`.
 *
 * The fallback exists for React Native, which has no global `crypto` without a
 * polyfill. Trace ids need collision resistance, not unpredictability.
 */
export declare function getRandomBytes(byteLength: number): Uint8Array;
export declare function newTraceId(): string;
export declare function newSpanId(): string;
export declare function isValidTraceId(value: unknown): value is string;
export declare function isValidSpanId(value: unknown): value is string;
//# sourceMappingURL=ids.d.ts.map