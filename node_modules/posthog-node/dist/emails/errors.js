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
class EmailError extends Error {
    constructor(params){
        super(params.message, void 0 === params.cause ? void 0 : {
            cause: params.cause
        });
        this.name = emailErrorName(params.statusCode, params.code);
        this.code = params.code;
        this.statusCode = params.statusCode;
        this.why = params.why;
        this.fix = params.fix;
        this.docsUrl = params.docsUrl;
        this.field = params.field;
        this.retryAfterMs = params.retryAfterMs;
    }
}
function emailErrorName(status, code) {
    if ('missing_secret_key' === code || 401 === status) return 'missing_api_key';
    if (void 0 === status) {
        if ('network_error' === code) return 'service_unavailable';
        return code.startsWith('invalid_') ? 'validation_error' : 'application_error';
    }
    switch(status){
        case 400:
            return 'validation_error';
        case 403:
            return 'invalid_permission';
        case 404:
            return 'not_found';
        case 409:
            return 'template_outdated' === code ? 'validation_error' : 'concurrent_idempotent_requests';
        case 422:
            return 'idempotency_key_reused' === code ? 'invalid_idempotent_request' : 'validation_error';
        case 429:
            return 'quota_limited' === code ? 'monthly_quota_exceeded' : 'rate_limit_exceeded';
        case 503:
            return 'service_unavailable';
        default:
            return 'application_error';
    }
}
__webpack_require__.d(__webpack_exports__, {
    EmailError: ()=>EmailError
});
exports.EmailError = __webpack_exports__.EmailError;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "EmailError"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
