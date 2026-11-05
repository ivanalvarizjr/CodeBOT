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
    createImperativePromise: ()=>createImperativePromise,
    createMockLogger: ()=>createMockLogger,
    delay: ()=>delay,
    parseBody: ()=>parseBody,
    wait: ()=>wait,
    waitForPromises: ()=>waitForPromises
});
const promises_namespaceObject = require("node:timers/promises");
const wait = async (t)=>{
    await new Promise((r)=>setTimeout(r, t));
};
const waitForPromises = async ()=>{
    await (0, promises_namespaceObject.setTimeout)(10);
};
const parseBody = (mockCall)=>{
    const options = mockCall[1];
    expect(options.method).toBe('POST');
    return JSON.parse(options.body || '');
};
const createImperativePromise = ()=>{
    let resolve;
    const promise = new Promise((r)=>{
        resolve = r;
    });
    return [
        promise,
        (val)=>resolve?.(val)
    ];
};
const delay = (ms)=>new Promise((resolve)=>{
        setTimeout(resolve, ms);
    });
const createMockLogger = ()=>({
        debug: vi.fn((...args)=>console.debug(...args)),
        info: vi.fn((...args)=>console.log(...args)),
        warn: vi.fn((...args)=>console.warn(...args)),
        error: vi.fn((...args)=>console.error(...args)),
        critical: vi.fn((...args)=>console.error(...args)),
        createLogger: createMockLogger
    });
exports.createImperativePromise = __webpack_exports__.createImperativePromise;
exports.createMockLogger = __webpack_exports__.createMockLogger;
exports.delay = __webpack_exports__.delay;
exports.parseBody = __webpack_exports__.parseBody;
exports.wait = __webpack_exports__.wait;
exports.waitForPromises = __webpack_exports__.waitForPromises;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "createImperativePromise",
    "createMockLogger",
    "delay",
    "parseBody",
    "wait",
    "waitForPromises"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
