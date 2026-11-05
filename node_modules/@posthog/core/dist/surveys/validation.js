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
    getLengthFromRules: ()=>getLengthFromRules,
    getRequirementsHint: ()=>getRequirementsHint,
    getValidationError: ()=>getValidationError
});
const external_types_js_namespaceObject = require("../types.js");
function getValidationError(value, rules, optional) {
    const trimmed = value.trim();
    if (!optional && '' === trimmed) return 'This field is required';
    if ('' === trimmed) return false;
    if (rules && rules.length > 0) for (const rule of rules)switch(rule.type){
        case external_types_js_namespaceObject.SurveyValidationType.MinLength:
            if (void 0 !== rule.value && trimmed.length < rule.value) return rule.errorMessage ?? `Please enter at least ${rule.value} characters`;
            break;
        case external_types_js_namespaceObject.SurveyValidationType.MaxLength:
            if (void 0 !== rule.value && trimmed.length > rule.value) return rule.errorMessage ?? `Please enter no more than ${rule.value} characters`;
            break;
    }
    return false;
}
function getLengthFromRules(rules, type) {
    if (!rules) return;
    const rule = rules.find((r)=>r.type === type);
    return rule?.value;
}
function getRequirementsHint(minLength, maxLength) {
    const effectiveMin = 1 === minLength ? void 0 : minLength;
    if (effectiveMin && maxLength) return `Enter ${effectiveMin}-${maxLength} characters`;
    if (effectiveMin) {
        const plural = 1 === effectiveMin ? 'character' : 'characters';
        return `Enter at least ${effectiveMin} ${plural}`;
    }
    if (maxLength) {
        const plural = 1 === maxLength ? 'character' : 'characters';
        return `Maximum ${maxLength} ${plural}`;
    }
}
exports.getLengthFromRules = __webpack_exports__.getLengthFromRules;
exports.getRequirementsHint = __webpack_exports__.getRequirementsHint;
exports.getValidationError = __webpack_exports__.getValidationError;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "getLengthFromRules",
    "getRequirementsHint",
    "getValidationError"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
