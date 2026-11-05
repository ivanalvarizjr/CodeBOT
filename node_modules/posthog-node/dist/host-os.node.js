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
    hostOsResourceAttributes: ()=>hostOsResourceAttributes
});
const external_node_os_namespaceObject = require("node:os");
const core_namespaceObject = require("@posthog/core");
function hostOsResourceAttributes() {
    let osName;
    let osVersion;
    try {
        osName = (0, external_node_os_namespaceObject.platform)();
        osVersion = (0, external_node_os_namespaceObject.release)();
    } catch  {}
    return (0, core_namespaceObject.osResourceAttributes)(osName, osVersion);
}
exports.hostOsResourceAttributes = __webpack_exports__.hostOsResourceAttributes;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "hostOsResourceAttributes"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
