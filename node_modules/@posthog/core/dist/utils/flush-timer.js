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
    FlushTimer: ()=>FlushTimer
});
const external_index_js_namespaceObject = require("./index.js");
class FlushTimer {
    constructor(_onFire){
        this._onFire = _onFire;
        this._firesAt = 0;
    }
    get pending() {
        return !!this._timer;
    }
    arm(delayMs) {
        this.clear();
        this._firesAt = Date.now() + delayMs;
        this._timer = (0, external_index_js_namespaceObject.safeSetTimeout)(()=>{
            this._timer = void 0;
            this._onFire();
        }, delayMs);
    }
    armNoEarlierThan(delayMs) {
        if (this._timer && Date.now() + delayMs <= this._firesAt) return;
        this.arm(delayMs);
    }
    clear() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = void 0;
        }
    }
}
exports.FlushTimer = __webpack_exports__.FlushTimer;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "FlushTimer"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
