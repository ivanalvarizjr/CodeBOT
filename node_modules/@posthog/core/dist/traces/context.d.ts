import type { Span } from '@posthog/types';
import type { SpanContextManager } from './types';
/**
 * Synchronous active-span tracking: restores the previous active span when the
 * callback returns, which for an async callback means when it returns its
 * promise — so spans started after an `await` won't see it as active.
 *
 * The fallback for runtimes with no ambient async context; Node injects an
 * `AsyncLocalStorage`-backed manager instead. `parent` is the escape hatch.
 *
 * @internal Exposed for cross-package use within this SDK; not part of the stable public API.
 */
export declare class SyncSpanContextManager implements SpanContextManager {
    private _active;
    active(): Span | undefined;
    with<T>(span: Span, fn: () => T): T;
}
//# sourceMappingURL=context.d.ts.map