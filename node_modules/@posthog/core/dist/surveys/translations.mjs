import { isArray, isUndefined } from "../utils/index.mjs";
function getTrimmedLanguage(value) {
    return 'string' == typeof value && value.trim() ? value.trim() : null;
}
function getLanguageFromStoredPersonProperties(storedPersonProperties) {
    if (!storedPersonProperties || 'object' != typeof storedPersonProperties || !('language' in storedPersonProperties)) return null;
    return getTrimmedLanguage(storedPersonProperties.language);
}
function detectSurveyLanguage({ overrideLanguage, storedPersonProperties, locale }, logger) {
    const explicitLanguage = getTrimmedLanguage(overrideLanguage);
    if (explicitLanguage) {
        logger?.info(`Using override display language: ${explicitLanguage}`);
        return explicitLanguage;
    }
    const personLanguage = getLanguageFromStoredPersonProperties(storedPersonProperties);
    if (personLanguage) {
        logger?.info(`Using person property language: ${personLanguage}`);
        return personLanguage;
    }
    const detectedLocale = getTrimmedLanguage(locale);
    if (detectedLocale) {
        logger?.info(`Using detected locale: ${detectedLocale}`);
        return detectedLocale;
    }
    logger?.info('No user language detected');
    return null;
}
function normalizeLanguageCode(languageCode) {
    return languageCode.toLowerCase();
}
function getBaseLanguage(languageCode) {
    return languageCode.split('-')[0];
}
function findBestTranslationMatch(translations, targetLanguage, logger) {
    if (!translations || !targetLanguage) return null;
    const normalizedTarget = normalizeLanguageCode(targetLanguage);
    const exactMatch = Object.keys(translations).find((key)=>normalizeLanguageCode(key) === normalizedTarget);
    if (exactMatch) {
        logger?.debug(`Found exact translation match: ${exactMatch}`);
        return exactMatch;
    }
    if (normalizedTarget.includes('-')) {
        const baseLanguage = getBaseLanguage(normalizedTarget);
        const baseMatch = Object.keys(translations).find((key)=>normalizeLanguageCode(key) === baseLanguage);
        if (baseMatch) {
            logger?.debug(`Found base language translation match: ${baseMatch} (from ${targetLanguage})`);
            return baseMatch;
        }
    }
    return null;
}
function isTranslatedChoices(questionTranslation) {
    return isArray(questionTranslation.choices);
}
const TRANSLATABLE_APPEARANCE_FIELDS = [
    'thankYouMessageHeader',
    "thankYouMessageDescription",
    'thankYouMessageCloseButtonText',
    'introScreenHeader',
    "introScreenDescription",
    'introScreenButtonText',
    'submitButtonText',
    'backButtonText'
];
function hasAppearanceTranslation(translation) {
    return TRANSLATABLE_APPEARANCE_FIELDS.some((field)=>!isUndefined(translation[field]));
}
function mergeQuestionTranslation(question, targetLanguage, logger) {
    const translationKey = findBestTranslationMatch(question.translations, targetLanguage, logger);
    if (!translationKey) return {
        question,
        matchedKey: null,
        hasChanges: false
    };
    const questionTranslation = question.translations?.[translationKey];
    if (!questionTranslation) return {
        question,
        matchedKey: null,
        hasChanges: false
    };
    const translated = {
        ...question
    };
    let hasChanges = false;
    if (!isUndefined(questionTranslation.question)) {
        translated.question = questionTranslation.question;
        hasChanges = true;
    }
    if (!isUndefined(questionTranslation.description)) {
        translated.description = questionTranslation.description;
        hasChanges = true;
    }
    if (!isUndefined(questionTranslation.buttonText)) {
        translated.buttonText = questionTranslation.buttonText;
        hasChanges = true;
    }
    if ('link' in translated && !isUndefined(questionTranslation.link)) {
        translated.link = questionTranslation.link;
        hasChanges = true;
    }
    if ('lowerBoundLabel' in translated && !isUndefined(questionTranslation.lowerBoundLabel)) {
        translated.lowerBoundLabel = questionTranslation.lowerBoundLabel;
        hasChanges = true;
    }
    if ('upperBoundLabel' in translated && !isUndefined(questionTranslation.upperBoundLabel)) {
        translated.upperBoundLabel = questionTranslation.upperBoundLabel;
        hasChanges = true;
    }
    if ('choices' in translated && isTranslatedChoices(questionTranslation)) {
        translated.choices = questionTranslation.choices;
        hasChanges = true;
    }
    return {
        question: hasChanges ? translated : question,
        matchedKey: hasChanges ? translationKey : null,
        hasChanges
    };
}
function applySurveyTranslation(survey, targetLanguage, logger) {
    const translationKey = findBestTranslationMatch(survey.translations, targetLanguage, logger);
    const translated = {
        ...survey
    };
    let hasTranslation = false;
    if (translationKey) {
        const translation = survey.translations?.[translationKey];
        if (translation) {
            logger?.info(`Applying survey-level translation for language: ${translationKey}`);
            if (!isUndefined(translation.name)) {
                translated.name = translation.name;
                hasTranslation = true;
            }
            if (translated.appearance) {
                const appearance = {
                    ...translated.appearance
                };
                for (const field of TRANSLATABLE_APPEARANCE_FIELDS){
                    const value = translation[field];
                    if (!isUndefined(value)) {
                        appearance[field] = value;
                        hasTranslation = true;
                    }
                }
                translated.appearance = appearance;
            } else if (hasAppearanceTranslation(translation)) hasTranslation = true;
        }
    }
    const translatedResults = survey.questions.map((question)=>mergeQuestionTranslation(question, targetLanguage, logger));
    const translatedQuestions = translatedResults.map((result)=>result.question);
    const anyQuestionTranslated = translatedResults.some((result)=>result.hasChanges);
    let questionMatchedKey = null;
    if (!translationKey) questionMatchedKey = translatedResults.find((result)=>result.matchedKey)?.matchedKey || null;
    if (anyQuestionTranslated) {
        translated.questions = translatedQuestions;
        hasTranslation = true;
        logger?.info(`Applied question-level translations for language: ${targetLanguage}`);
    }
    return {
        survey: translated,
        matchedKey: hasTranslation ? translationKey || questionMatchedKey : null
    };
}
export { applySurveyTranslation, detectSurveyLanguage, findBestTranslationMatch, getBaseLanguage, getLanguageFromStoredPersonProperties, normalizeLanguageCode };
