import { SurveyWithIteration } from './keys';
import { SurveyResponses, SurveyResponseValue } from '../types';
export declare const SURVEY_LANGUAGE_PROPERTY = "$survey_language";
export declare function getSurveyResponseKey(questionId: string): string;
export declare function getSurveyOldResponseKey(originalQuestionIndex: number): string;
export declare function getSurveyResponseValue(responses: SurveyResponses, questionId?: string): SurveyResponseValue | undefined;
export declare function buildSurveyResponseProperties(responses: SurveyResponses | undefined, survey: SurveyForResponses, questionSnapshots?: Record<string, string>): Record<string, unknown>;
export declare function recordSurveyAnswer({ responses, questionSnapshots }: {
    responses: SurveyResponses;
    questionSnapshots?: Record<string, string>;
}, questionId: string, response: SurveyResponseValue, question?: SurveyQuestionForResponses): {
    responses: SurveyResponses;
    questionSnapshots: Record<string, string>;
};
export declare function buildSurveyResponseEventProperties({ event, survey, responses, submissionId, completed, surveyLanguage, questionSnapshots, }: {
    event: 'sent' | 'dismissed' | 'abandoned';
    survey: SurveyForResponses;
    responses?: SurveyResponses;
    submissionId?: string;
    completed?: boolean;
    surveyLanguage?: string | null;
    questionSnapshots?: Record<string, string>;
}): Record<string, unknown>;
export declare function surveyHasResponses(responses?: SurveyResponses): boolean;
export declare function getSurveyInteractionProperty(survey: SurveyWithIteration, action: string): string;
type SurveyQuestionForResponses = {
    id?: string;
    question: string;
    originalQuestionIndex?: number;
};
type SurveyForResponses = {
    questions: SurveyQuestionForResponses[];
};
export {};
//# sourceMappingURL=events.d.ts.map