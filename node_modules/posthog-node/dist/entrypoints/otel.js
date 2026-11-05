"use strict";
var __webpack_require__ = {};
(()=>{
    __webpack_require__.d = (exports1, getters, values)=>{
        var define = (defs, kind)=>{
            for(var key in defs)if (__webpack_require__.o(defs, key) && !__webpack_require__.o(exports1, key)) Object.defineProperty(exports1, key, {
                enumerable: true,
                [kind]: defs[key]
            });
        };
        define(getters, "get");
        define(values, "value");
    };
})();
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
(()=>{
    __webpack_require__.r = (exports1)=>{
        if ("u" > typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports1, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports1, '__esModule', {
            value: true
        });
    };
})();
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
    PostHogContextSpanProcessor: ()=>PostHogContextSpanProcessor,
    enrichCurrentSpan: ()=>listeners_js_namespaceObject.enrichCurrentSpan
});
const api_namespaceObject = require("@opentelemetry/api");
const listeners_js_namespaceObject = require("../extensions/context/listeners.js");
function hasReadableAttributes(span) {
    return !!span && 'attributes' in span && 'object' == typeof span.attributes && null !== span.attributes;
}
class PostHogContextSpanProcessor {
    constructor(posthog){
        this.posthog = posthog;
        this.active = true;
        this.snapshots = new WeakSet();
        this.parents = new WeakMap();
        this.unsubscribe = (0, listeners_js_namespaceObject.addContextListener)(posthog, (requestEntry)=>{
            const span = api_namespaceObject.trace.getActiveSpan();
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
            if ('kind' in span && span.kind === api_namespaceObject.SpanKind.SERVER && span.isRecording()) {
                if (span !== current) this.enrich(span, true);
                return;
            }
            span = this.parents.get(span)?.deref();
        }
    }
    onStart(span, parentContext) {
        if (!this.active) return;
        const parent = parentContext && api_namespaceObject.trace.getSpan(parentContext);
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
exports.PostHogContextSpanProcessor = __webpack_exports__.PostHogContextSpanProcessor;
exports.enrichCurrentSpan = __webpack_exports__.enrichCurrentSpan;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "PostHogContextSpanProcessor",
    "enrichCurrentSpan"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
