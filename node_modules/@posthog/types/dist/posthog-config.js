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
const CONFIG_DEFAULTS_DATES = Object.freeze([
    '2026-08-30',
    '2026-08-29',
    '2026-06-25',
    '2026-05-30',
    '2026-01-30',
    '2025-11-30',
    '2025-05-24'
]);
__webpack_require__.d(__webpack_exports__, {}, {
    CONFIG_DEFAULTS_DATES: CONFIG_DEFAULTS_DATES
});
exports.CONFIG_DEFAULTS_DATES = __webpack_exports__.CONFIG_DEFAULTS_DATES;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "CONFIG_DEFAULTS_DATES"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
