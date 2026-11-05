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
function includes(str, needle) {
    return -1 !== str.indexOf(needle);
}
const trim = function(str) {
    return str.trim();
};
const stripLeadingDollar = function(s) {
    return s.replace(/^\$/, '');
};
function isDistinctIdStringLike(value) {
    return [
        'distinct_id',
        'distinctid'
    ].includes(value.toLowerCase());
}
function safeJsonStringify(value) {
    const ancestors = [];
    return JSON.stringify(value, function(_key, replacementValue) {
        if ('bigint' == typeof replacementValue) return replacementValue.toString();
        if ('function' == typeof replacementValue || 'symbol' == typeof replacementValue) return;
        if (replacementValue instanceof Error) return {
            name: replacementValue.name,
            message: replacementValue.message,
            stack: replacementValue.stack
        };
        if (replacementValue && 'object' == typeof replacementValue) {
            while(ancestors.length > 0 && ancestors[ancestors.length - 1] !== this)ancestors.pop();
            if (ancestors.includes(replacementValue)) return '[Circular]';
            ancestors.push(replacementValue);
        }
        return replacementValue;
    }) ?? 'null';
}
function deepSortKeys(value) {
    if (null === value || 'object' != typeof value) return value;
    if (Array.isArray(value)) return value.map(deepSortKeys);
    return Object.keys(value).sort().reduce((acc, key)=>{
        acc[key] = deepSortKeys(value[key]);
        return acc;
    }, {});
}
function getPersonPropertiesHash(distinct_id, userPropertiesToSet, userPropertiesToSetOnce) {
    return JSON.stringify({
        distinct_id,
        userPropertiesToSet: userPropertiesToSet ? deepSortKeys(userPropertiesToSet) : void 0,
        userPropertiesToSetOnce: userPropertiesToSetOnce ? deepSortKeys(userPropertiesToSetOnce) : void 0
    });
}
__webpack_require__.d(__webpack_exports__, {
    getPersonPropertiesHash: ()=>getPersonPropertiesHash,
    includes: ()=>includes,
    isDistinctIdStringLike: ()=>isDistinctIdStringLike,
    safeJsonStringify: ()=>safeJsonStringify
}, {
    stripLeadingDollar: stripLeadingDollar,
    trim: trim
});
exports.getPersonPropertiesHash = __webpack_exports__.getPersonPropertiesHash;
exports.includes = __webpack_exports__.includes;
exports.isDistinctIdStringLike = __webpack_exports__.isDistinctIdStringLike;
exports.safeJsonStringify = __webpack_exports__.safeJsonStringify;
exports.stripLeadingDollar = __webpack_exports__.stripLeadingDollar;
exports.trim = __webpack_exports__.trim;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "getPersonPropertiesHash",
    "includes",
    "isDistinctIdStringLike",
    "safeJsonStringify",
    "stripLeadingDollar",
    "trim"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
