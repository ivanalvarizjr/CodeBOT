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
    ErrorEventCoercer: ()=>ErrorEventCoercer
});
const index_js_namespaceObject = require("../../utils/index.js");
class ErrorEventCoercer {
    match(err) {
        if (!(0, index_js_namespaceObject.isErrorEvent)(err)) return false;
        const errorEvent = err;
        return void 0 != errorEvent.error || this._hasUsableMessage(errorEvent);
    }
    coerce(err, ctx) {
        if (void 0 != err.error) return ctx.apply(err.error);
        const exceptionLike = ctx.apply(err.message);
        return {
            ...exceptionLike,
            stack: this._buildLocationStack(err) ?? exceptionLike.stack,
            synthetic: true
        };
    }
    _hasUsableMessage(err) {
        return (0, index_js_namespaceObject.isString)(err.message) && err.message.length > 0;
    }
    _buildLocationStack(err) {
        const location = err;
        const lineno = location.lineno ?? 0;
        const colno = location.colno ?? 0;
        if (!(0, index_js_namespaceObject.isString)(location.filename) || 0 === location.filename.length) return;
        if (0 === lineno) return;
        return `Error\n    at ${location.filename}:${lineno}:${colno}`;
    }
}
exports.ErrorEventCoercer = __webpack_exports__.ErrorEventCoercer;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "ErrorEventCoercer"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
