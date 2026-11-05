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
    buildOtlpResourceAttributes: ()=>buildOtlpResourceAttributes,
    normalizeOsName: ()=>normalizeOsName,
    osResourceAttributes: ()=>osResourceAttributes,
    toOtlpResourceKeyValueList: ()=>toOtlpResourceKeyValueList
});
const external_json_utils_js_namespaceObject = require("./json-utils.js");
const external_otlp_any_value_js_namespaceObject = require("./otlp-any-value.js");
function buildOtlpResourceAttributes(config, sdkName, sdkVersion) {
    return {
        ...(0, external_json_utils_js_namespaceObject.assignUserAttributes)({}, config.resourceAttributes),
        'service.name': config.serviceName || 'unknown_service',
        ...config.environment && {
            'deployment.environment': config.environment
        },
        ...config.serviceVersion && {
            'service.version': config.serviceVersion
        },
        'telemetry.sdk.name': sdkName,
        'telemetry.sdk.version': sdkVersion
    };
}
const SDK_RESOURCE_KEYS = [
    'service.name',
    'deployment.environment',
    'service.version',
    'telemetry.sdk.name',
    'telemetry.sdk.version'
];
function toOtlpResourceKeyValueList(attributes, logger) {
    const user = (0, external_json_utils_js_namespaceObject.assignUserAttributes)({}, attributes);
    const sdk = {};
    for (const key of SDK_RESOURCE_KEYS)if (Object.prototype.hasOwnProperty.call(user, key)) {
        sdk[key] = user[key];
        delete user[key];
    }
    return [
        ...(0, external_otlp_any_value_js_namespaceObject.toOtlpKeyValueList)(user, logger),
        ...(0, external_otlp_any_value_js_namespaceObject.toOtlpKeyValueList)(sdk, logger)
    ];
}
const OS_NAMES = {
    darwin: 'macOS',
    win32: 'Windows',
    cygwin: 'Windows',
    linux: 'Linux',
    android: 'Android',
    freebsd: 'FreeBSD',
    openbsd: 'OpenBSD',
    netbsd: 'NetBSD',
    sunos: 'SunOS',
    aix: 'AIX',
    haiku: 'Haiku',
    'Mac OS X': 'macOS'
};
function normalizeOsName(name) {
    if (!name) return;
    return Object.prototype.hasOwnProperty.call(OS_NAMES, name) ? OS_NAMES[name] : name;
}
function osResourceAttributes(name, version) {
    const osName = normalizeOsName(name);
    return {
        ...osName ? {
            'os.name': osName
        } : {},
        ...version ? {
            'os.version': version
        } : {}
    };
}
exports.buildOtlpResourceAttributes = __webpack_exports__.buildOtlpResourceAttributes;
exports.normalizeOsName = __webpack_exports__.normalizeOsName;
exports.osResourceAttributes = __webpack_exports__.osResourceAttributes;
exports.toOtlpResourceKeyValueList = __webpack_exports__.toOtlpResourceKeyValueList;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "buildOtlpResourceAttributes",
    "normalizeOsName",
    "osResourceAttributes",
    "toOtlpResourceKeyValueList"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
