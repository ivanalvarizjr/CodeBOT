import type { Properties } from '@posthog/types';
import type { PropertyFilters, PropertyOperator } from '../types';
export declare const isValidRegex: (pattern: string) => boolean;
export declare const isMatchingRegex: (value: string, pattern: string) => boolean;
export declare const propertyComparisons: Record<PropertyOperator, (targets: string[], values: string[]) => boolean>;
/**
 * Matches every configured filter against event properties. Missing and null
 * properties never match, including for negative operators.
 */
export declare function matchPropertyFilters(propertyFilters: PropertyFilters | undefined, eventProperties: Properties | undefined): boolean;
//# sourceMappingURL=property-matching.d.ts.map