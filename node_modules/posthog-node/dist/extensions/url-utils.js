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
    normalizeRequestCurrentUrl: ()=>normalizeRequestCurrentUrl,
    normalizeRequestPath: ()=>normalizeRequestPath
});
const core_namespaceObject = require("@posthog/core");
function normalizeRequestCurrentUrl(currentUrl, disableCaptureUrlHashes) {
    return disableCaptureUrlHashes ? (0, core_namespaceObject.stripUrlHash)(currentUrl) : currentUrl;
}
function normalizeRequestPath(path, disableCaptureUrlHashes) {
    const pathWithoutSearch = stripUrlSearch(path);
    return disableCaptureUrlHashes ? (0, core_namespaceObject.stripUrlHash)(pathWithoutSearch) : pathWithoutSearch;
}
function stripUrlSearch(url) {
    if (!url) return url;
    const searchIndex = url.indexOf('?');
    const hashIndex = url.indexOf('#');
    if (-1 === searchIndex || -1 !== hashIndex && hashIndex < searchIndex) return url;
    return `${url.slice(0, searchIndex)}${-1 === hashIndex ? '' : url.slice(hashIndex)}`;
}
exports.normalizeRequestCurrentUrl = __webpack_exports__.normalizeRequestCurrentUrl;
exports.normalizeRequestPath = __webpack_exports__.normalizeRequestPath;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "normalizeRequestCurrentUrl",
    "normalizeRequestPath"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
