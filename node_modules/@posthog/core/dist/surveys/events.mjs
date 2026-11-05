import { isArray, isNullish, isUndefined } from "../utils/index.mjs";
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
    if (isArray(response)) return [
        ...response
    ];
    return response;
}
function buildSurveyResponseProperties(responses = {}, survey, questionSnapshots) {
    const oldFormatResponses = {};
    survey.questions.forEach((question)=>{
        if (isUndefined(question.originalQuestionIndex)) return;
        const oldResponseKey = getSurveyOldResponseKey(question.originalQuestionIndex);
        const response = getSurveyResponseValue(responses, question.id);
        if (!isUndefined(response)) oldFormatResponses[oldResponseKey] = response;
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
        ...!isUndefined(submissionId) && {
            $survey_submission_id: submissionId
        },
        ...'sent' === event ? !isUndefined(completed) && {
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
    return Object.values(responses).some((response)=>!isNullish(response));
}
function getSurveyInteractionProperty(survey, action) {
    let surveyProperty = `$survey_${action}/${survey.id}`;
    if (survey.current_iteration && survey.current_iteration > 0) surveyProperty = `$survey_${action}/${survey.id}/${survey.current_iteration}`;
    return surveyProperty;
}
export { SURVEY_LANGUAGE_PROPERTY, buildSurveyResponseEventProperties, buildSurveyResponseProperties, getSurveyInteractionProperty, getSurveyOldResponseKey, getSurveyResponseKey, getSurveyResponseValue, recordSurveyAnswer, surveyHasResponses };
