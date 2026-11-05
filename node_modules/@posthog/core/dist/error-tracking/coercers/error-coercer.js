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
    ErrorCoercer: ()=>ErrorCoercer
});
const type_utils_js_namespaceObject = require("../../utils/type-utils.js");
class ErrorCoercer {
    match(err) {
        return (0, type_utils_js_namespaceObject.isError)(err);
    }
    coerce(err, ctx) {
        const stack = this.getStack(err);
        const replacementStack = void 0 === stack ? ctx.syntheticException?.stack : void 0;
        const synthetic = !!replacementStack;
        return {
            type: this.getType(err),
            value: this.getMessage(err, ctx),
            stack: stack ?? replacementStack,
            cause: err.cause ? ctx.next(err.cause) : void 0,
            synthetic
        };
    }
    getType(err) {
        return err.name || err.constructor.name;
    }
    getMessage(err, _ctx) {
        const message = err.message;
        if (message.error && 'string' == typeof message.error.message) return String(message.error.message);
        return String(message);
    }
    getStack(err) {
        try {
            const stacktrace = err.stacktrace;
            if ('string' == typeof stacktrace && stacktrace.length > 0) return stacktrace;
            const stack = err.stack;
            return 'string' == typeof stack && stack.length > 0 ? stack : void 0;
        } catch  {
            return;
        }
    }
}
exports.ErrorCoercer = __webpack_exports__.ErrorCoercer;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "ErrorCoercer"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
