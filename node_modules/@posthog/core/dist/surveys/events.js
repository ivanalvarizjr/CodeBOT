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
    SURVEY_LANGUAGE_PROPERTY: ()=>SURVEY_LANGUAGE_PROPERTY,
    buildSurveyResponseEventProperties: ()=>buildSurveyResponseEventProperties,
    buildSurveyResponseProperties: ()=>buildSurveyResponseProperties,
    getSurveyInteractionProperty: ()=>getSurveyInteractionProperty,
    getSurveyOldResponseKey: ()=>getSurveyOldResponseKey,
    getSurveyResponseKey: ()=>getSurveyResponseKey,
    getSurveyResponseValue: ()=>getSurveyResponseValue,
    recordSurveyAnswer: ()=>recordSurveyAnswer,
    surveyHasResponses: ()=>surveyHasResponses
});
const index_js_namespaceObject = require("../utils/index.js");
const SURVEY_LANGUAGE_PROPERTY = '$survey_language';
function getSurveyResponseKey(questionId) {
    return `$survey_response_${questionId}`;
}
function getSurveyOldResponseKey(originalQuestionIndex) {
    return 0 === originalQuestionIndex ? '$survey_response' : `$survey_response_${originalQuestionIndex}`;
}
function getSurveyResponseValue(responses, questionId) {
    if (!questionId) return null;
    const response = responses[getSurveyResponseKey(questionId)];
    if ((0, index_js_namespaceObject.isArray)(response)) return [
        ...response
    ];
    return response;
}
function buildSurveyResponseProperties(responses = {}, survey, questionSnapshots) {
    const oldFormatResponses = {};
    survey.questions.forEach((question)=>{
        if ((0, index_js_namespaceObject.isUndefined)(question.originalQuestionIndex)) return;
        const oldResponseKey = getSurveyOldResponseKey(question.originalQuestionIndex);
        const response = getSurveyResponseValue(responses, question.id);
        if (!(0, index_js_namespaceObject.isUndefined)(response)) oldFormatResponses[oldResponseKey] = response;
    });
    return {
        $survey_questions: survey.questions.map((question)=>({
                id: question.id,
                question: questionSnapshots?.[question.id ?? ''] ?? question.question,
                response: getSurveyResponseValue(responses, question.id)
            })),
        ...responses,
        ...oldFormatResponses
    };
}
function recordSurveyAnswer({ responses, questionSnapshots = {} }, questionId, response, question) {
    return {
        responses: {
            ...responses,
            [getSurveyResponseKey(questionId)]: response
        },
        questionSnapshots: question?.id ? {
            ...questionSnapshots,
            [question.id]: question.question
        } : questionSnapshots
    };
}
function buildSurveyResponseEventProperties({ event, survey, responses = {}, submissionId, completed, surveyLanguage, questionSnapshots }) {
    return {
        ...!(0, index_js_namespaceObject.isUndefined)(submissionId) && {
            $survey_submission_id: submissionId
        },
        ...'sent' === event ? !(0, index_js_namespaceObject.isUndefined)(completed) && {
            $survey_completed: completed
        } : {
            $survey_partially_completed: surveyHasResponses(responses)
        },
        ...surveyLanguage && {
            [SURVEY_LANGUAGE_PROPERTY]: surveyLanguage
        },
        ...buildSurveyResponseProperties(responses, survey, questionSnapshots)
    };
}
function surveyHasResponses(responses = {}) {
    return Object.values(responses).some((response)=>!(0, index_js_namespaceObject.isNullish)(response));
}
function getSurveyInteractionProperty(survey, action) {
    let surveyProperty = `$survey_${action}/${survey.id}`;
    if (survey.current_iteration && survey.current_iteration > 0) surveyProperty = `$survey_${action}/${survey.id}/${survey.current_iteration}`;
    return surveyProperty;
}
exports.SURVEY_LANGUAGE_PROPERTY = __webpack_exports__.SURVEY_LANGUAGE_PROPERTY;
exports.buildSurveyResponseEventProperties = __webpack_exports__.buildSurveyResponseEventProperties;
exports.buildSurveyResponseProperties = __webpack_exports__.buildSurveyResponseProperties;
exports.getSurveyInteractionProperty = __webpack_exports__.getSurveyInteractionProperty;
exports.getSurveyOldResponseKey = __webpack_exports__.getSurveyOldResponseKey;
exports.getSurveyResponseKey = __webpack_exports__.getSurveyResponseKey;
exports.getSurveyResponseValue = __webpack_exports__.getSurveyResponseValue;
exports.recordSurveyAnswer = __webpack_exports__.recordSurveyAnswer;
exports.surveyHasResponses = __webpack_exports__.surveyHasResponses;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "SURVEY_LANGUAGE_PROPERTY",
    "buildSurveyResponseEventProperties",
    "buildSurveyResponseProperties",
    "getSurveyInteractionProperty",
    "getSurveyOldResponseKey",
    "getSurveyResponseKey",
    "getSurveyResponseValue",
    "recordSurveyAnswer",
    "surveyHasResponses"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
