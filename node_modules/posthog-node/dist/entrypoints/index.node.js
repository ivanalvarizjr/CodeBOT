"use strict";
var __webpack_modules__ = {
    "../client" (module) {
        module.exports = require("../client.js");
    },
    "../exports" (module) {
        module.exports = require("../exports.js");
    },
    "../extensions/context/context" (module) {
        module.exports = require("../extensions/context/context.js");
    },
    "../extensions/context/span-context.node" (module) {
        module.exports = require("../extensions/context/span-context.node.js");
    },
    "../extensions/error-tracking/modifiers/context-lines.node" (module) {
        module.exports = require("../extensions/error-tracking/modifiers/context-lines.node.js");
    },
    "../extensions/error-tracking/modifiers/module.node" (module) {
        module.exports = require("../extensions/error-tracking/modifiers/module.node.js");
    },
    "../extensions/error-tracking/modifiers/relative-path.node" (module) {
        module.exports = require("../extensions/error-tracking/modifiers/relative-path.node.js");
    },
    "../gzip.node" (module) {
        module.exports = require("../gzip.node.js");
    },
    "../host-os.node" (module) {
        module.exports = require("../host-os.node.js");
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
    var _extensions_error_tracking_modifiers_module_node__rspack_import_1 = __webpack_require__("../extensions/error-tracking/modifiers/module.node");
    var _extensions_error_tracking_modifiers_context_lines_node__rspack_import_2 = __webpack_require__("../extensions/error-tracking/modifiers/context-lines.node");
    var _extensions_error_tracking_modifiers_relative_path_node__rspack_import_3 = __webpack_require__("../extensions/error-tracking/modifiers/relative-path.node");
    var _client__rspack_import_4 = __webpack_require__("../client");
    var _posthog_core__rspack_import_5 = __webpack_require__("@posthog/core");
    var _extensions_context_context__rspack_import_6 = __webpack_require__("../extensions/context/context");
    var _extensions_context_span_context_node__rspack_import_7 = __webpack_require__("../extensions/context/span-context.node");
    var _gzip_node__rspack_import_8 = __webpack_require__("../gzip.node");
    var _host_os_node__rspack_import_9 = __webpack_require__("../host-os.node");
    class PostHog extends _client__rspack_import_4.PostHogBackendClient {
        getLibraryId() {
            return 'posthog-node';
        }
        compressPayload(payload) {
            return (0, _gzip_node__rspack_import_8.gzipCompress)(payload, this.isDebug);
        }
        initializeContext() {
            return new _extensions_context_context__rspack_import_6.PostHogContext();
        }
        initializeSpanContextManager() {
            return new _extensions_context_span_context_node__rspack_import_7.AsyncLocalStorageSpanContextManager();
        }
        hostResourceAttributes() {
            return (0, _host_os_node__rspack_import_9.hostOsResourceAttributes)();
        }
        createErrorPropertiesBuilder() {
            return new _posthog_core__rspack_import_5.ErrorTracking.ErrorPropertiesBuilder([
                new _posthog_core__rspack_import_5.ErrorTracking.EventCoercer(),
                new _posthog_core__rspack_import_5.ErrorTracking.ErrorCoercer(),
                new _posthog_core__rspack_import_5.ErrorTracking.ObjectCoercer(),
                new _posthog_core__rspack_import_5.ErrorTracking.StringCoercer(),
                new _posthog_core__rspack_import_5.ErrorTracking.PrimitiveCoercer()
            ], _posthog_core__rspack_import_5.ErrorTracking.createStackParser("node:javascript", _posthog_core__rspack_import_5.ErrorTracking.nodeStackLineParser), [
                (0, _extensions_error_tracking_modifiers_module_node__rspack_import_1.createModulerModifier)(),
                (frames)=>(0, _extensions_error_tracking_modifiers_context_lines_node__rspack_import_2.addSourceContext)(frames, void 0, this._logger),
                (0, _extensions_error_tracking_modifiers_relative_path_node__rspack_import_3.createRelativePathModifier)()
            ]);
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
