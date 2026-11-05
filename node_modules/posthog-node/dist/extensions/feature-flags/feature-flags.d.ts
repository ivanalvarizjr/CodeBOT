import { FeatureFlagCondition, FeatureFlagEvaluationRuntime, PostHogFeatureFlag, PropertyGroup } from '../../types';
import type { FeatureFlagValue, JsonType, PostHogFetchOptions, PostHogFetchResponse, UnresolvedFlagReason } from '@posthog/core';
import { InconclusiveMatchError, relativeDateParseForFeatureFlagMatching } from '@posthog/core';
import { FlagDefinitionCacheProvider, FlagDefinitionCacheInput } from './cache';
type ConditionMatchResult = 'match' | 'no_match' | 'out_of_rollout_bound';
declare class ClientError extends Error {
    constructor(message: string);
}
declare class RequiresServerEvaluation extends Error {
    readonly reason: UnresolvedFlagReason;
    constructor(message: string, reason?: UnresolvedFlagReason);
}
type FeatureFlagsPollerOptions = {
    personalApiKey?: string;
    projectApiKey: string;
    host: string;
    pollingInterval: number | null;
    timeout?: number;
    fetch?: (url: string, options: PostHogFetchOptions) => Promise<PostHogFetchResponse>;
    onError?: (error: Error) => void;
    onLoad?: (count: number) => void;
    /**
     * Called whenever flag definitions are (re)loaded — from the API, the cache provider, or a
     * quota reset — with the server gate for minimal `$feature_flag_called` events carried by
     * that payload. Lets the client keep a single last-writer-wins gate across the local-eval
     * and remote `/flags` signal sources.
     */
    onMinimalFlagCalledEvents?: (enabled: boolean) => void;
    customHeaders?: {
        [key: string]: string;
    };
    cacheProvider?: FlagDefinitionCacheProvider<FlagDefinitionCacheInput>;
    strictLocalEvaluation?: boolean;
    /**
     * When set, the poller keeps only flags whose evaluation contexts are empty or share at
     * least one entry with this list. Flags with no evaluation contexts are always kept.
     */
    evaluationContexts?: readonly string[];
};
type FlagEvaluationSnapshot = {
    featureFlagsByKey: Record<string, PostHogFeatureFlag>;
    groupTypeMapping: Record<string, string>;
    cohorts: Record<string, PropertyGroup>;
    filteredOutFlagKeys: Set<string>;
    propertyMatchingVersion?: number;
};
export type FeatureFlagEvaluationContext = {
    distinctId: string;
    groups: Record<string, string>;
    personProperties: Record<string, any>;
    groupProperties: Record<string, Record<string, any>>;
    evaluationCache: Record<string, FeatureFlagValue>;
    definitions?: FlagEvaluationSnapshot;
};
type ComputeFlagAndPayloadOptions = {
    matchValue?: FeatureFlagValue;
    skipLoadCheck?: boolean;
};
declare class FeatureFlagsPoller {
    pollingInterval: number | null;
    personalApiKey?: string;
    projectApiKey: string;
    featureFlags: Array<PostHogFeatureFlag>;
    featureFlagsByKey: Record<string, PostHogFeatureFlag>;
    groupTypeMapping: Record<string, string>;
    cohorts: Record<string, PropertyGroup>;
    loadedSuccessfullyOnce: boolean;
    propertyMatchingVersion?: number;
    timeout?: number;
    host: FeatureFlagsPollerOptions['host'];
    poller?: NodeJS.Timeout;
    fetch: (url: string, options: PostHogFetchOptions) => Promise<PostHogFetchResponse>;
    debugMode: boolean;
    onError?: (error: Error) => void;
    customHeaders?: {
        [key: string]: string;
    };
    shouldBeginExponentialBackoff: boolean;
    backOffCount: number;
    onLoad?: (count: number) => void;
    private cacheProvider?;
    private loadingPromise?;
    private pollerStopped;
    private flagsEtag?;
    private nextFetchAllowedAt?;
    private strictLocalEvaluation;
    private flagDefinitionsLoadedAt?;
    private onMinimalFlagCalledEvents?;
    private evaluationContexts?;
    private filteredOutFlagKeys;
    private warnedUnresolvableFlags;
    constructor({ pollingInterval, personalApiKey, projectApiKey, timeout, host, customHeaders, ...options }: FeatureFlagsPollerOptions);
    debug(enabled?: boolean): void;
    private logMsgIfDebug;
    private currentDefinitions;
    private withEvaluationSnapshot;
    private createEvaluationContext;
    getFeatureFlag(key: string, distinctId: string, groups?: Record<string, string>, personProperties?: Record<string, any>, groupProperties?: Record<string, Record<string, any>>): Promise<FeatureFlagValue | undefined>;
    getAllFlagsAndPayloads(evaluationContext: FeatureFlagEvaluationContext, flagKeysToExplicitlyEvaluate?: string[]): Promise<{
        response: Record<string, FeatureFlagValue>;
        payloads: Record<string, JsonType>;
        unresolved: Record<string, UnresolvedFlagReason>;
        fallbackToFlags: boolean;
    }>;
    computeFlagAndPayloadLocally(flag: PostHogFeatureFlag, evaluationContext: FeatureFlagEvaluationContext, options?: ComputeFlagAndPayloadOptions): Promise<{
        value: FeatureFlagValue;
        payload: JsonType | null;
    }>;
    private computeFlagValueLocally;
    private getBucketingValueForFlag;
    private evaluateFlagDependency;
    private flagEvaluatesToExpectedValue;
    matchFeatureFlagProperties(flag: PostHogFeatureFlag, bucketingValue: string, properties: Record<string, any>, evaluationContext: FeatureFlagEvaluationContext): Promise<FeatureFlagValue>;
    isConditionMatch(flag: PostHogFeatureFlag, bucketingValue: string, condition: FeatureFlagCondition, properties: Record<string, any>, evaluationContext: FeatureFlagEvaluationContext): Promise<ConditionMatchResult>;
    getMatchingVariant(flag: PostHogFeatureFlag, bucketingValue: string): Promise<FeatureFlagValue | undefined>;
    variantLookupTable(flag: PostHogFeatureFlag): {
        valueMin: number;
        valueMax: number;
        key: string;
    }[];
    /**
     * Updates the internal flag state with the provided flag data.
     */
    /**
     * Keeps only the flags this SDK instance should evaluate for its configured evaluation
     * contexts. A flag with no evaluation contexts is always kept. A flag with contexts is
     * kept only when it shares at least one with the configured list. Matching is exact, to
     * mirror the remote `/flags` evaluation path. Returns all flags when no contexts are set.
     * Older servers report the flag's contexts under the legacy `evaluation_tags` key, which is
     * read as a fallback.
     */
    private filterFlagsByEvaluationContexts;
    getEvaluationRuntimeForFlag(key: string): FeatureFlagEvaluationRuntime | undefined;
    getFlagKeysByEvaluationRuntime(runtime: FeatureFlagEvaluationRuntime): string[];
    private updateFlagState;
    /**
     * Warn about server-applicable flags whose definition local evaluation cannot resolve.
     * Called after loading flag definitions when local evaluation is enabled. Each flag is
     * warned about once until its definition changes.
     */
    private warnAboutUnresolvableFlags;
    /**
     * Attempts to load flags from cache and update internal state.
     * Returns true if flags were successfully loaded from cache, false otherwise.
     */
    private loadFromCache;
    loadFeatureFlags(forceReload?: boolean): Promise<void>;
    /**
     * Returns true if the feature flags poller has loaded successfully at least once and has more than 0 feature flags.
     * This is useful to check if local evaluation is ready before calling getFeatureFlag.
     */
    isLocalEvaluationReady(): boolean;
    /**
     * Returns the timestamp (in milliseconds) when flag definitions were last loaded.
     * Returns undefined if flags have not been loaded yet.
     */
    getFlagDefinitionsLoadedAt(): number | undefined;
    /**
     * If a client is misconfigured with an invalid or improper API key, the polling interval is doubled each time
     * until a successful request is made, up to a maximum of 60 seconds.
     *
     * @returns The polling interval to use for the next request.
     */
    private getPollingInterval;
    /**
     * Enter backoff state after receiving an error response (401, 403, 429).
     * This enables exponential backoff for the poller and blocks on-demand fetches.
     */
    private beginBackoff;
    /**
     * Clear backoff state after a successful response (200, 304).
     * This resets the polling interval and allows on-demand fetches immediately.
     */
    private clearBackoff;
    _loadFeatureFlags(): Promise<void>;
    private getPersonalApiKeyRequestOptions;
    _requestFeatureFlagDefinitions(): Promise<PostHogFetchResponse>;
    stopPoller(timeoutMs?: number): Promise<void>;
}
declare function matchProperty(property: FeatureFlagCondition['properties'][number], propertyValues: Record<string, any>, warnFunction?: (msg: string) => void, propertyMatchingVersion?: number): boolean;
declare function parseSemver(value: string): [number, number, number];
export { FeatureFlagsPoller, matchProperty, relativeDateParseForFeatureFlagMatching, parseSemver, InconclusiveMatchError, RequiresServerEvaluation, ClientError, };
//# sourceMappingURL=feature-flags.d.ts.map