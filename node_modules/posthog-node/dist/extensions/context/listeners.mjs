const REGISTRY_KEY = Symbol.for('posthog-node.context-listeners');
const registryHolder = globalThis;
const listeners = registryHolder[REGISTRY_KEY] ??= new WeakMap();
function addContextListener(client, listener) {
    const callbacks = listeners.get(client) ?? new Set();
    listeners.set(client, callbacks);
    callbacks.add(listener);
    return ()=>{
        callbacks.delete(listener);
        if (!callbacks.size) listeners.delete(client);
    };
}
function notifyContextListeners(client, requestEntry = false) {
    for (const listener of listeners.get(client) ?? [])try {
        listener(requestEntry);
    } catch  {}
}
function enrichCurrentSpan(client) {
    notifyContextListeners(client, true);
}
export { addContextListener, enrichCurrentSpan, notifyContextListeners };
