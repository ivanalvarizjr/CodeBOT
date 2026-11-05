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
    PromiseRejectionEventCoercer: ()=>PromiseRejectionEventCoercer
});
const index_js_namespaceObject = require("../../utils/index.js");
class PromiseRejectionEventCoercer {
    match(err) {
        return (0, index_js_namespaceObject.isBuiltin)(err, 'PromiseRejectionEvent') || this.isCustomEventWrappingRejection(err);
    }
    isCustomEventWrappingRejection(err) {
        if (!(0, index_js_namespaceObject.isEvent)(err)) return false;
        try {
            const detail = err.detail;
            return null != detail && 'object' == typeof detail && 'reason' in detail;
        } catch  {
            return false;
        }
    }
    coerce(err, ctx) {
        const reason = this.getUnhandledRejectionReason(err);
        if ((0, index_js_namespaceObject.isPrimitive)(reason)) return {
            type: 'UnhandledRejection',
            value: `Non-Error promise rejection captured with value: ${String(reason)}`,
            stack: ctx.syntheticException?.stack,
            synthetic: true
        };
        return ctx.apply(reason);
    }
    getUnhandledRejectionReason(error) {
        try {
            if ('reason' in error) return error.reason;
            if ('detail' in error && null != error.detail && 'object' == typeof error.detail && 'reason' in error.detail) return error.detail.reason;
        } catch  {}
        return error;
    }
}
exports.PromiseRejectionEventCoercer = __webpack_exports__.PromiseRejectionEventCoercer;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "PromiseRejectionEventCoercer"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
