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
function getInjectedReleaseId() {
    if ("u" > typeof process) {
        const fromEnvironment = process.env.POSTHOG_RELEASE_ID?.trim();
        if (fromEnvironment) return fromEnvironment;
    }
    const injected = globalThis._posthogReleaseId;
    return 'string' == typeof injected && injected.length > 0 ? injected : void 0;
}
__webpack_require__.d(__webpack_exports__, {
    getInjectedReleaseId: ()=>getInjectedReleaseId
});
exports.getInjectedReleaseId = __webpack_exports__.getInjectedReleaseId;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "getInjectedReleaseId"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
