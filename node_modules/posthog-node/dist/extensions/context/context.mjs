import { AsyncLocalStorage } from "node:async_hooks";
import { inheritContextLifetime, isContextActive } from "./lifetime.mjs";
class PostHogContext {
    constructor(){
        this.storage = new AsyncLocalStorage();
    }
    get() {
        const context = this.storage.getStore();
        return context && isContextActive(context) ? context : void 0;
    }
    run(context, fn, options) {
        return this.storage.run(this.resolve(context, options), fn);
    }
    enter(context, options) {
        this.storage.enterWith(this.resolve(context, options));
    }
    resolve(context, options) {
        const current = this.get();
        if (options?.fresh === true) return inheritContextLifetime(void 0, {
            ...context
        }, options.signal);
        return inheritContextLifetime(current, {
            distinctId: context.distinctId ?? current?.distinctId,
            sessionId: context.sessionId ?? current?.sessionId,
            properties: {
                ...current?.properties || {},
                ...context.properties || {}
            }
        }, options?.signal);
    }
}
export { PostHogContext };
