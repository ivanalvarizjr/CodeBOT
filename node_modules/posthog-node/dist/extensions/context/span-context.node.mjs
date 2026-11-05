import { AsyncLocalStorage } from "node:async_hooks";
class AsyncLocalStorageSpanContextManager {
    active() {
        return this._storage.getStore();
    }
    with(span, fn) {
        return this._storage.run(span, fn);
    }
    constructor(){
        this._storage = new AsyncLocalStorage();
    }
}
export { AsyncLocalStorageSpanContextManager };
