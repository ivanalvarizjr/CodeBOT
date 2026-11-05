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
    canSurveyActivateRepeatedly: ()=>canSurveyActivateRepeatedly,
    doesSurveyActivateByEvent: ()=>doesSurveyActivateByEvent,
    isSurveyIterationBased: ()=>isSurveyIterationBased
});
const external_types_js_namespaceObject = require("../types.js");
function doesSurveyActivateByEvent(survey) {
    return !!survey.conditions?.events?.values?.length;
}
function canSurveyActivateRepeatedly(survey) {
    return doesSurveyActivateByEvent(survey) && !!survey.conditions?.events?.repeatedActivation || survey.schedule === external_types_js_namespaceObject.SurveySchedule.Always;
}
function isSurveyIterationBased(survey) {
    return survey.schedule === external_types_js_namespaceObject.SurveySchedule.Recurring || (survey.current_iteration ?? 0) > 0;
}
exports.canSurveyActivateRepeatedly = __webpack_exports__.canSurveyActivateRepeatedly;
exports.doesSurveyActivateByEvent = __webpack_exports__.doesSurveyActivateByEvent;
exports.isSurveyIterationBased = __webpack_exports__.isSurveyIterationBased;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "canSurveyActivateRepeatedly",
    "doesSurveyActivateByEvent",
    "isSurveyIterationBased"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
