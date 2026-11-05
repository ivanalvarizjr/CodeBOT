"use strict";
var __webpack_modules__ = {
    "../client" (module) {
        module.exports = require("../client.js");
    },
    "../exports" (module) {
        module.exports = require("../exports.js");
    },
    "@posthog/core" (module) {
        module.exports = require("@posthog/core");
    }
};
var __webpack_module_cache__ = {};
function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (void 0 !== cachedModule) return cachedModule.exports;
    var module = __webpack_module_cache__[moduleId] = {
        exports: {}
    };
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
}
(()=>{
    __webpack_require__.n = (module)=>{
        var getter = module && module.__esModule ? ()=>module['default'] : ()=>module;
        __webpack_require__.d(getter, {
            a: getter
        });
        return getter;
    };
})();
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
(()=>{
    __webpack_require__.r(__webpack_exports__);
    var _exports__rspack_import_0 = __webpack_require__("../exports");
    var __rspack_reexport = {};
    for(const __rspack_import_key in _exports__rspack_import_0)if ([
        "PostHog",
        "default"
    ].indexOf(__rspack_import_key) < 0) __rspack_reexport[__rspack_import_key] = ()=>_exports__rspack_import_0[__rspack_import_key];
    __webpack_require__.d(__webpack_exports__, __rspack_reexport);
    var _client__rspack_import_1 = __webpack_require__("../client");
    var _posthog_core__rspack_import_2 = __webpack_require__("@posthog/core");
    class PostHog extends _client__rspack_import_1.PostHogBackendClient {
        getLibraryId() {
            return 'posthog-edge';
        }
        initializeContext() {}
        createErrorPropertiesBuilder() {
            return new _posthog_core__rspack_import_2.ErrorTracking.ErrorPropertiesBuilder([
                new _posthog_core__rspack_import_2.ErrorTracking.EventCoercer(),
                new _posthog_core__rspack_import_2.ErrorTracking.ErrorCoercer(),
                new _posthog_core__rspack_import_2.ErrorTracking.ObjectCoercer(),
                new _posthog_core__rspack_import_2.ErrorTracking.StringCoercer(),
                new _posthog_core__rspack_import_2.ErrorTracking.PrimitiveCoercer()
            ], _posthog_core__rspack_import_2.ErrorTracking.createStackParser("node:javascript", _posthog_core__rspack_import_2.ErrorTracking.nodeStackLineParser));
        }
    }
    __webpack_require__.d(__webpack_exports__, {
        PostHog: ()=>PostHog
    });
})();
exports.PostHog = __webpack_exports__.PostHog;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "PostHog"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
