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
__webpack_require__.d(__webpack_exports__, {
    addContextListener: ()=>addContextListener,
    enrichCurrentSpan: ()=>enrichCurrentSpan,
    notifyContextListeners: ()=>notifyContextListeners
});
exports.addContextListener = __webpack_exports__.addContextListener;
exports.enrichCurrentSpan = __webpack_exports__.enrichCurrentSpan;
exports.notifyContextListeners = __webpack_exports__.notifyContextListeners;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "addContextListener",
    "enrichCurrentSpan",
    "notifyContextListeners"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
