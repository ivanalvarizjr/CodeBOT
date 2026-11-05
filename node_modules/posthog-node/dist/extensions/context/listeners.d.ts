import type { PostHogBackendClient } from '../../client';
type ContextListener = (requestEntry: boolean) => void;
export declare function addContextListener(client: PostHogBackendClient, listener: ContextListener): () => void;
export declare function notifyContextListeners(client: PostHogBackendClient, requestEntry?: boolean): void;
/**
 * Notify installed span processors after request IDs become available.
 * This entry point does not load OpenTelemetry; without a processor it does nothing.
 */
export declare function enrichCurrentSpan(client: PostHogBackendClient): void;
export {};
//# sourceMappingURL=listeners.d.ts.map