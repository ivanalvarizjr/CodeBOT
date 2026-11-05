import { type Context, type Span } from '@opentelemetry/api';
import type { PostHogBackendClient } from '../client';
export { enrichCurrentSpan } from '../extensions/context/listeners';
export declare class PostHogContextSpanProcessor {
    private readonly posthog;
    private active;
    private readonly snapshots;
    private readonly parents;
    private readonly unsubscribe;
    constructor(posthog: PostHogBackendClient);
    private enrich;
    private enrichNearestServerSpan;
    onStart(span: Span, parentContext?: Context): void;
    onEnd(): void;
    forceFlush(): Promise<void>;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=otel.d.ts.map