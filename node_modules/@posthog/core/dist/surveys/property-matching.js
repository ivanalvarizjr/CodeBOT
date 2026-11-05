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
const isValidRegex = (pattern)=>{
    try {
        new RegExp(pattern);
    } catch  {
        return false;
    }
    return true;
};
const isMatchingRegex = (value, pattern)=>{
    if (!isValidRegex(pattern)) return false;
    try {
        return new RegExp(pattern).test(value);
    } catch  {
        return false;
    }
};
const toLowerCase = (value)=>value.toLowerCase();
const propertyComparisons = {
    exact: (targets, values)=>values.some((value)=>targets.some((target)=>value === target)),
    is_not: (targets, values)=>values.every((value)=>targets.every((target)=>value !== target)),
    regex: (targets, values)=>values.some((value)=>targets.some((target)=>isMatchingRegex(value, target))),
    not_regex: (targets, values)=>values.every((value)=>targets.every((target)=>!isMatchingRegex(value, target))),
    icontains: (targets, values)=>values.map(toLowerCase).some((value)=>targets.map(toLowerCase).some((target)=>value.includes(target))),
    not_icontains: (targets, values)=>values.map(toLowerCase).every((value)=>targets.map(toLowerCase).every((target)=>!value.includes(target))),
    gt: (targets, values)=>values.some((value)=>{
            const numValue = parseFloat(value);
            return !isNaN(numValue) && targets.some((target)=>numValue > parseFloat(target));
        }),
    lt: (targets, values)=>values.some((value)=>{
            const numValue = parseFloat(value);
            return !isNaN(numValue) && targets.some((target)=>numValue < parseFloat(target));
        })
};
function matchPropertyFilters(propertyFilters, eventProperties) {
    if (!propertyFilters) return true;
    return Object.entries(propertyFilters).every(([propertyName, filter])=>{
        const eventPropertyValue = eventProperties?.[propertyName];
        if (null == eventPropertyValue) return false;
        const comparisonFunction = propertyComparisons[filter.operator];
        if (!comparisonFunction) return false;
        return comparisonFunction(filter.values.map(String), [
            String(eventPropertyValue)
        ]);
    });
}
__webpack_require__.d(__webpack_exports__, {
    matchPropertyFilters: ()=>matchPropertyFilters
}, {
    isMatchingRegex: isMatchingRegex,
    isValidRegex: isValidRegex,
    propertyComparisons: propertyComparisons
});
exports.isMatchingRegex = __webpack_exports__.isMatchingRegex;
exports.isValidRegex = __webpack_exports__.isValidRegex;
exports.matchPropertyFilters = __webpack_exports__.matchPropertyFilters;
exports.propertyComparisons = __webpack_exports__.propertyComparisons;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "isMatchingRegex",
    "isValidRegex",
    "matchPropertyFilters",
    "propertyComparisons"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
