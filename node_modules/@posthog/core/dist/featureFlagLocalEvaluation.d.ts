import type { FeatureFlagValue, JsonType } from './types';
export type FeatureFlagPropertyValue = JsonType;
export type FeatureFlagProperty = {
    key: string;
    value: FeatureFlagPropertyValue;
    operator?: string;
};
export type FeatureFlagSemverParsingPolicy = 'strict' | 'legacy-permissive';
export type MatchFeatureFlagPropertyOptions = {
    warnFunction?: (message: string) => void;
    semverParsingPolicy?: FeatureFlagSemverParsingPolicy;
    /** Only version 2 enables explicit equality; absent/other versions use service legacy matching. */
    propertyMatchingVersion?: number;
};
export type FeatureFlagVariant = {
    key: string;
    rollout_percentage: number;
};
export type FeatureFlagVariantLookupEntry = {
    valueMin: number;
    valueMax: number;
    key: string;
};
/**
 * Why local evaluation could not resolve a flag. `experience_continuity` and
 * `unsupported_definition` come from the flag's definition, `missing_context` from the
 * evaluation call, and `unresolved_dependency` from a flag the definition depends on.
 */
export type UnresolvedFlagReason = 'experience_continuity' | 'unsupported_definition' | 'missing_context' | 'unresolved_dependency';
export declare class InconclusiveMatchError extends Error {
    readonly reason: UnresolvedFlagReason;
    constructor(message: string, reason?: UnresolvedFlagReason);
}
type SemverTuple = [number, number, number];
export declare function parseFeatureFlagSemver(value: string, parsingPolicy?: FeatureFlagSemverParsingPolicy): SemverTuple;
export declare function relativeDateParseForFeatureFlagMatching(value: string): Date | null;
/**
 * Throws an unsupported_definition error when local evaluation cannot use the filter, whatever
 * the context holds: an unknown operator, or a filter value that the operator cannot parse.
 */
export declare function assertFeatureFlagFilterSupported(property: FeatureFlagProperty, options?: Pick<MatchFeatureFlagPropertyOptions, 'semverParsingPolicy'>): void;
export declare function matchFeatureFlagProperty(property: FeatureFlagProperty, propertyValues: Record<string, any>, options?: MatchFeatureFlagPropertyOptions): boolean;
export declare function hashSHA1(text: string): Promise<string>;
export declare function getFeatureFlagHash(key: string, bucketingValue: string, salt?: string, separator?: string): Promise<number>;
/**
 * The `holdout-<id>` variant this bucketing value is held out into, or undefined.
 *
 * The separator is the whole point: the server hashes `holdout-<value>`, while flag rollout
 * hashing joins with a dot. Taking the default separator here would still look uniform and
 * deterministic while holding out a different set of people than the server does.
 */
export declare function getHoldoutVariant(holdout: {
    id: number;
    exclusion_percentage: number;
} | null | undefined, bucketingValue: string): Promise<string | undefined>;
export declare function getFeatureFlagVariantLookupTable(variants: readonly FeatureFlagVariant[]): FeatureFlagVariantLookupEntry[];
export declare function getFeatureFlagVariant(key: string, bucketingValue: string, variants: readonly FeatureFlagVariant[]): Promise<string | undefined>;
export declare function resolveFeatureFlagPayload(payloads: Readonly<Record<string, JsonType | undefined>> | null | undefined, flagValue: FeatureFlagValue | null | undefined): JsonType | null;
export {};
//# sourceMappingURL=featureFlagLocalEvaluation.d.ts.map