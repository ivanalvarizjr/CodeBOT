import { SpanKind, trace } from "@opentelemetry/api";
import { addContextListener, enrichCurrentSpan } from "../extensions/context/listeners.mjs";
function hasReadableAttributes(span) {
    return !!span && 'attributes' in span && 'object' == typeof span.attributes && null !== span.attributes;
}
class PostHogContextSpanProcessor {
    constructor(posthog){
        this.posthog = posthog;
        this.active = true;
        this.snapshots = new WeakSet();
        this.parents = new WeakMap();
        this.unsubscribe = addContextListener(posthog, (requestEntry)=>{
            const span = trace.getActiveSpan();
            this.enrich(span, requestEntry);
            if (requestEntry) this.enrichNearestServerSpan(span);
        });
    }
    enrich(span, requestEntry = false) {
        if (!this.active) return;
        try {
            if (this.posthog.isDisabled || this.posthog.optedOut) return;
            if (!hasReadableAttributes(span) || !span.isRecording() || this.snapshots.has(span) && !requestEntry) return;
            const context = this.posthog.getContext();
            if (!context) return;
            this.snapshots.add(span);
            if (context.sessionId && void 0 === span.attributes.sessionId) span.setAttribute('sessionId', context.sessionId);
            if (context.distinctId && void 0 === span.attributes.posthogDistinctId) span.setAttribute('posthogDistinctId', context.distinctId);
        } catch  {}
    }
    enrichNearestServerSpan(current) {
        let span = current;
        while(span){
            if ('kind' in span && span.kind === SpanKind.SERVER && span.isRecording()) {
                if (span !== current) this.enrich(span, true);
                return;
            }
            span = this.parents.get(span)?.deref();
        }
    }
    onStart(span, parentContext) {
        if (!this.active) return;
        const parent = parentContext && trace.getSpan(parentContext);
        if (parent && parent !== span) this.parents.set(span, new WeakRef(parent));
        this.enrich(span);
    }
    onEnd() {}
    forceFlush() {
        return Promise.resolve();
    }
    shutdown() {
        if (this.active) {
            this.active = false;
            this.unsubscribe();
        }
        return Promise.resolve();
    }
}
export { PostHogContextSpanProcessor, enrichCurrentSpan };
