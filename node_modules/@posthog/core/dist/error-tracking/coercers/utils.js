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
function truncate(str, max = 0) {
    if ('string' != typeof str || 0 === max) return str;
    return str.length <= max ? str : `${str.slice(0, max)}...`;
}
function extractExceptionKeysForMessage(err, maxLength = 40) {
    const keys = Object.keys(err);
    keys.sort();
    if (!keys.length) return '[object has no keys]';
    for(let i = keys.length; i > 0; i--){
        const serialized = keys.slice(0, i).join(', ');
        if (!(serialized.length > maxLength)) {
            if (i === keys.length) return serialized;
            return serialized.length <= maxLength ? serialized : `${serialized.slice(0, maxLength)}...`;
        }
    }
    return '';
}
__webpack_require__.d(__webpack_exports__, {
    extractExceptionKeysForMessage: ()=>extractExceptionKeysForMessage,
    truncate: ()=>truncate
});
exports.extractExceptionKeysForMessage = __webpack_exports__.extractExceptionKeysForMessage;
exports.truncate = __webpack_exports__.truncate;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "extractExceptionKeysForMessage",
    "truncate"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
