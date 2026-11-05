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
class SimpleEventEmitter {
    constructor(){
        this.events = {};
        this.events = {};
    }
    on(event, listener) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
        return ()=>{
            this.events[event] = this.events[event].filter((x)=>x !== listener);
        };
    }
    emit(event, payload) {
        for (const listener of this.events[event] || [])listener(payload);
        for (const listener of this.events['*'] || [])listener(event, payload);
    }
}
__webpack_require__.d(__webpack_exports__, {
    SimpleEventEmitter: ()=>SimpleEventEmitter
});
exports.SimpleEventEmitter = __webpack_exports__.SimpleEventEmitter;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "SimpleEventEmitter"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
