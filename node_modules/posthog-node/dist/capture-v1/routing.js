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
const AI_EVENT_PREFIX = '$ai_';
const ANALYTICS_ROUTE = 'analytics';
const AI_ROUTE = 'ai';
function isLegacyOnlyEvent(message) {
    return 'string' == typeof message.event && message.event.startsWith(AI_EVENT_PREFIX);
}
__webpack_require__.d(__webpack_exports__, {
    isLegacyOnlyEvent: ()=>isLegacyOnlyEvent
}, {
    AI_ROUTE: AI_ROUTE,
    ANALYTICS_ROUTE: ANALYTICS_ROUTE
});
exports.AI_ROUTE = __webpack_exports__.AI_ROUTE;
exports.ANALYTICS_ROUTE = __webpack_exports__.ANALYTICS_ROUTE;
exports.isLegacyOnlyEvent = __webpack_exports__.isLegacyOnlyEvent;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "AI_ROUTE",
    "ANALYTICS_ROUTE",
    "isLegacyOnlyEvent"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
