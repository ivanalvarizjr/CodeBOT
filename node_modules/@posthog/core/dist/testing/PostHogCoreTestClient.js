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
    PostHogCoreTestClient: ()=>PostHogCoreTestClient,
    createTestClient: ()=>createTestClient
});
const external_posthog_core_js_namespaceObject = require("../posthog-core.js");
const version = '2.0.0-alpha';
class PostHogCoreTestClient extends external_posthog_core_js_namespaceObject.PostHogCore {
    constructor(mocks, projectToken, options){
        super(projectToken, options), this.mocks = mocks;
        this.setupBootstrap(options);
    }
    getFlags(distinctId, groups = {}, personProperties = {}, groupProperties = {}, extraPayload = {}) {
        return super.getFlags(distinctId, groups, personProperties, groupProperties, extraPayload);
    }
    flushWithPendingPromises() {
        return super.flushWithPendingPromises();
    }
    getPersistedProperty(key) {
        return this.mocks.storage.getItem(key);
    }
    setPersistedProperty(key, value) {
        return this.mocks.storage.setItem(key, value);
    }
    fetch(url, options) {
        return this.mocks.fetch(url, options);
    }
    getLibraryId() {
        return 'posthog-core-tests';
    }
    getLibraryVersion() {
        return version;
    }
    getCustomUserAgent() {
        return 'posthog-core-tests';
    }
}
const createTestClient = (projectToken, options, setupMocks, storageCache = {})=>{
    const mocks = {
        fetch: vi.fn(),
        storage: {
            getItem: vi.fn((key)=>storageCache[key]),
            setItem: vi.fn((key, val)=>{
                storageCache[key] = null == val ? void 0 : val;
            })
        }
    };
    mocks.fetch.mockImplementation(()=>Promise.resolve({
            status: 200,
            text: ()=>Promise.resolve('ok'),
            json: ()=>Promise.resolve({
                    status: 'ok'
                })
        }));
    setupMocks?.(mocks);
    return [
        new PostHogCoreTestClient(mocks, projectToken, {
            disableCompression: true,
            ...options
        }),
        mocks
    ];
};
exports.PostHogCoreTestClient = __webpack_exports__.PostHogCoreTestClient;
exports.createTestClient = __webpack_exports__.createTestClient;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "PostHogCoreTestClient",
    "createTestClient"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
