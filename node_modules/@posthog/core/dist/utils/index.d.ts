import { FetchLike } from '../types';
export * from './bot-detection';
export * from './browser-utils';
export * from './bucketed-rate-limiter';
export { toJsonSafeValue } from './json-utils';
export { parseRetryAfterMs } from './retry-after';
export * from './number-utils';
export * from './string-utils';
export * from './type-utils';
export * from './promise-queue';
export * from './logger';
export * from './user-agent-utils';
export * from './webview-app-utils';
export declare const STRING_FORMAT = "utf8";
export declare const UUID_REGEX: RegExp;
export declare function isValidUUID(value: unknown): value is string;
export declare function getEventUuid(uuid: unknown, generateUuid: () => string): string;
/**
 * Creates an `Error` with the given `name`, in a way that also holds on pages where a browser
 * extension has made `Error.prototype.name` non-writable. A plain `error.name = ...` throws
 * there in strict mode, and swallowing that throw leaves the name as `Error`. Defining an own
 * property on the instance shadows the prototype property instead. The descriptor matches what
 * a plain assignment produces, so the resulting error is unchanged everywhere else.
 *
 * @param name the value for `error.name`, e.g. `'AbortError'`
 * @param message the error message
 * @internal Exposed for cross-package use within this SDK; not part of the stable public API.
 */
export declare function createNamedError(name: string, message?: string): Error;
export declare function assert(truthyValue: any, message: string): void;
/** Detects HTTP(S) URLs and explicit relative paths by prefix; does not validate URL syntax. */
export declare function isUrl(value: unknown): value is string;
export declare function removeTrailingSlash(url: string): string;
export declare function stripUrlHash<T extends string | undefined>(url: T): T extends string ? string : undefined;
export interface RetriableOptions {
    retryCount: number;
    retryDelay: number;
    retryCheck: (err: unknown) => boolean;
}
export declare function retriable<T>(fn: () => Promise<T>, props: RetriableOptions): Promise<T>;
export declare function currentTimestamp(): number;
export declare function currentISOTime(): string;
export declare function trySafe<T>(fn: () => T): T | undefined;
export declare function safeSetTimeout(fn: () => void, timeout: number): any;
export declare function raceWithTimeout<T>(promise: Promise<T>, timeoutMs: number, onTimeout?: () => void): Promise<T | void>;
export declare const isPromise: (obj: any) => obj is Promise<any>;
export declare function getFetch(): FetchLike | undefined;
export declare function allSettled<T>(promises: (Promise<T> | null | undefined)[]): Promise<({
    status: 'fulfilled';
    value: T;
} | {
    status: 'rejected';
    reason: any;
})[]>;
//# sourceMappingURL=index.d.ts.map