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
    patchFetchForTracingHeaders: ()=>patchFetchForTracingHeaders
});
const type_utils_js_namespaceObject = require("./utils/type-utils.js");
const DISTINCT_ID_HEADER = 'X-POSTHOG-DISTINCT-ID';
const SESSION_ID_HEADER = 'X-POSTHOG-SESSION-ID';
const PATCH_MARKER = '__posthog_tracing_headers_patched__';
const parseHostname = (url)=>{
    try {
        return new URL(url).hostname;
    } catch  {
        return;
    }
};
const shouldAddHeaders = (url, hostnames)=>{
    const hostname = parseHostname(url);
    if (!hostname) return false;
    return hostnames.includes(hostname);
};
const patchFetchForTracingHeaders = (client, hostnames)=>{
    const globalAny = globalThis;
    const currentFetch = globalAny.fetch;
    if (!(0, type_utils_js_namespaceObject.isFunction)(currentFetch)) return ()=>{};
    const originalFetch = currentFetch[PATCH_MARKER]?.original ?? currentFetch;
    const wrappedFetch = async function(input, init) {
        try {
            const urlString = 'string' == typeof input ? input : input instanceof URL ? input.toString() : input instanceof Request ? input.url : void 0;
            if (urlString && shouldAddHeaders(urlString, hostnames)) {
                const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : void 0));
                const distinctId = client.getDistinctId();
                const sessionId = client.getSessionId();
                if (distinctId) headers.set(DISTINCT_ID_HEADER, distinctId);
                if (sessionId) headers.set(SESSION_ID_HEADER, sessionId);
                const initWithHeaders = {
                    ...init ?? {},
                    headers
                };
                return originalFetch.call(globalAny, input, initWithHeaders);
            }
        } catch  {}
        return originalFetch.call(globalAny, input, init);
    };
    Object.defineProperty(wrappedFetch, PATCH_MARKER, {
        value: {
            original: originalFetch
        },
        enumerable: false
    });
    globalAny.fetch = wrappedFetch;
    return ()=>{
        if (globalAny.fetch === wrappedFetch) globalAny.fetch = originalFetch;
    };
};
exports.patchFetchForTracingHeaders = __webpack_exports__.patchFetchForTracingHeaders;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "patchFetchForTracingHeaders"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
