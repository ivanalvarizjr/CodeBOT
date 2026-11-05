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
class CaptureV1Error extends Error {
    constructor({ requestId, drops, retryExhausted, cause }){
        super(CaptureV1Error.buildMessage(requestId, drops, retryExhausted, cause)), this.name = 'CaptureV1Error';
        this.requestId = requestId;
        this.drops = drops;
        this.retryExhausted = retryExhausted;
        this.cause = cause;
    }
    static buildMessage(requestId, drops, retryExhausted, cause) {
        let message = `Capture V1 batch ${requestId} did not fully deliver: ${drops.length} dropped, ${retryExhausted.length} undelivered`;
        if (cause instanceof Error) message += ` (${cause.message})`;
        return message;
    }
}
__webpack_require__.d(__webpack_exports__, {
    CaptureV1Error: ()=>CaptureV1Error
});
exports.CaptureV1Error = __webpack_exports__.CaptureV1Error;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "CaptureV1Error"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
