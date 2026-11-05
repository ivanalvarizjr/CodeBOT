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
    extractSafariExtensionDetails: ()=>extractSafariExtensionDetails
});
const external_base_js_namespaceObject = require("./base.js");
const extractSafariExtensionDetails = (func, filename)=>{
    const isSafariExtension = -1 !== func.indexOf('safari-extension');
    const isSafariWebExtension = -1 !== func.indexOf('safari-web-extension');
    return isSafariExtension || isSafariWebExtension ? [
        -1 !== func.indexOf('@') ? func.split('@')[0] : external_base_js_namespaceObject.UNKNOWN_FUNCTION,
        isSafariExtension ? `safari-extension:${filename}` : `safari-web-extension:${filename}`
    ] : [
        func,
        filename
    ];
};
exports.extractSafariExtensionDetails = __webpack_exports__.extractSafariExtensionDetails;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "extractSafariExtensionDetails"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
