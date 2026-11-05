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
const FeatureFlagError = {
    ERRORS_WHILE_COMPUTING: 'errors_while_computing_flags',
    FLAG_MISSING: 'flag_missing',
    LOCAL_EVALUATION_INCONCLUSIVE: 'local_evaluation_inconclusive',
    QUOTA_LIMITED: 'quota_limited',
    UNKNOWN_ERROR: 'unknown_error'
};
__webpack_require__.d(__webpack_exports__, {}, {
    FeatureFlagError: FeatureFlagError
});
exports.FeatureFlagError = __webpack_exports__.FeatureFlagError;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "FeatureFlagError"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
