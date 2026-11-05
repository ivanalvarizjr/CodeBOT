import type { MultipleSurveyQuestion } from '../types';
/**
 * Fisher-Yates shuffle without mutating the input array.
 */
export declare const shuffle: <T>(array: readonly T[]) => T[];
export declare const getDisplayOrderChoices: (question: Pick<MultipleSurveyQuestion, 'choices' | 'hasOpenChoice' | 'shuffleOptions'>) => string[];
//# sourceMappingURL=shuffling.d.ts.map