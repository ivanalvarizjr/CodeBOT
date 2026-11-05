class SyncSpanContextManager {
    active() {
        return this._active;
    }
    with(span, fn) {
        const previous = this._active;
        this._active = span;
        try {
            return fn();
        } finally{
            this._active = previous;
        }
    }
}
export { SyncSpanContextManager };
