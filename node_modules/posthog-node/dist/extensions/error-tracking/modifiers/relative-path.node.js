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
    createRelativePathModifier: ()=>createRelativePathModifier
});
const external_path_namespaceObject = require("path");
function createRelativePathModifier(basePath = process.cwd()) {
    const isWindows = '\\' === external_path_namespaceObject.sep;
    const toUnix = (p)=>isWindows ? p.replace(/\\/g, '/') : p;
    const normalizedBase = toUnix(basePath);
    return async (frames)=>{
        for (const frame of frames)if (!(!frame.filename || frame.filename.startsWith('node:') || frame.filename.startsWith('data:'))) {
            if ((0, external_path_namespaceObject.isAbsolute)(frame.filename)) frame.filename = toUnix((0, external_path_namespaceObject.relative)(normalizedBase, toUnix(frame.filename)));
        }
        return frames;
    };
}
exports.createRelativePathModifier = __webpack_exports__.createRelativePathModifier;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "createRelativePathModifier"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
