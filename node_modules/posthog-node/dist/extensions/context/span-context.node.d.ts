import type { Span, SpanContextManager } from '@posthog/core';
/**
 * Active-span tracking backed by `AsyncLocalStorage`, so a span stays active
 * across `await` boundaries and through any async work its callback starts.
 *
 * Lives here rather than in core because core ships to browsers, edge runtimes
 * and React Native and must not import `node:async_hooks`; the edge entrypoint
 * falls back to core's synchronous manager.
 */
export declare class AsyncLocalStorageSpanContextManager implements SpanContextManager {
    private readonly _storage;
    active(): Span | undefined;
    with<T>(span: Span, fn: () => T): T;
}
//# sourceMappingURL=span-context.node.d.ts.map