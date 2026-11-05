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
    DOMExceptionCoercer: ()=>DOMExceptionCoercer
});
const index_js_namespaceObject = require("../../utils/index.js");
class DOMExceptionCoercer {
    match(err) {
        return this.isDOMException(err) || this.isDOMError(err);
    }
    coerce(err, ctx) {
        const hasStack = (0, index_js_namespaceObject.isString)(err.stack);
        return {
            type: this.getType(err),
            value: this.getValue(err),
            stack: hasStack ? err.stack : void 0,
            cause: err.cause ? ctx.next(err.cause) : void 0,
            synthetic: false
        };
    }
    getType(candidate) {
        return this.isDOMError(candidate) ? 'DOMError' : 'DOMException';
    }
    getValue(err) {
        const name = err.name || (this.isDOMError(err) ? 'DOMError' : 'DOMException');
        const message = err.message ? `${name}: ${err.message}` : name;
        return message;
    }
    isDOMException(err) {
        return (0, index_js_namespaceObject.isBuiltin)(err, 'DOMException');
    }
    isDOMError(err) {
        return (0, index_js_namespaceObject.isBuiltin)(err, 'DOMError');
    }
}
exports.DOMExceptionCoercer = __webpack_exports__.DOMExceptionCoercer;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "DOMExceptionCoercer"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
