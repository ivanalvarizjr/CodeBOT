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
function createConsole(consoleLike = console) {
    const lockedMethods = {
        log: consoleLike.log.bind(consoleLike),
        warn: consoleLike.warn.bind(consoleLike),
        error: consoleLike.error.bind(consoleLike),
        debug: consoleLike.debug.bind(consoleLike)
    };
    return lockedMethods;
}
const _createLogger = (prefix, maybeCall, consoleLike)=>{
    function _log(level, ...args) {
        maybeCall(()=>{
            const consoleMethod = consoleLike[level];
            consoleMethod(prefix, ...args);
        });
    }
    const logger = {
        debug: (...args)=>{
            _log('debug', ...args);
        },
        info: (...args)=>{
            _log('log', ...args);
        },
        warn: (...args)=>{
            _log('warn', ...args);
        },
        error: (...args)=>{
            _log('error', ...args);
        },
        critical: (...args)=>{
            consoleLike['error'](prefix, ...args);
        },
        createLogger: (additionalPrefix)=>_createLogger(`${prefix} ${additionalPrefix}`, maybeCall, consoleLike)
    };
    return logger;
};
const passThrough = (fn)=>fn();
function createLogger(prefix, maybeCall = passThrough) {
    return _createLogger(prefix, maybeCall, createConsole());
}
__webpack_require__.d(__webpack_exports__, {
    createLogger: ()=>createLogger
}, {
    _createLogger: _createLogger
});
exports._createLogger = __webpack_exports__._createLogger;
exports.createLogger = __webpack_exports__.createLogger;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "_createLogger",
    "createLogger"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
