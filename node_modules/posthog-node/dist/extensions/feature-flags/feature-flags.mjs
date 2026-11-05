import { InconclusiveMatchError, assertFeatureFlagFilterSupported, getFeatureFlagHash, getFeatureFlagVariant, getFeatureFlagVariantLookupTable, getHoldoutVariant, matchFeatureFlagProperty, parseFeatureFlagSemver, raceWithTimeout, relativeDateParseForFeatureFlagMatching, resolveFeatureFlagPayload, safeSetTimeout } from "@posthog/core";
const SIXTY_SECONDS = 60000;
function normalizeEvaluationRuntime(value) {
    return 'client' === value || 'server' === value ? value : 'all';
}
function evaluationRuntimesMatch(a, b) {
    return a === b || 'all' === a || 'all' === b;
}
class ClientError extends Error {
    constructor(message){
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = 'ClientError';
        this.message = message;
        Object.setPrototypeOf(this, ClientError.prototype);
    }
}
function setCustomErrorPrototype(error, constructor) {
    error.name = constructor.name;
    Error.captureStackTrace(error, constructor);
    Object.setPrototypeOf(error, constructor.prototype);
}
class RequiresServerEvaluation extends Error {
    constructor(message, reason = 'unsupported_definition'){
        super(message), this.reason = reason;
        setCustomErrorPrototype(this, RequiresServerEvaluation);
    }
}
const UNRESOLVED_REASON_PRECEDENCE = [
    'experience_continuity',
    'unsupported_definition',
    'unresolved_dependency',
    'missing_context'
];
function pickUnresolvedReason(current, next) {
    if (void 0 === current) return next;
    return UNRESOLVED_REASON_PRECEDENCE.indexOf(next) < UNRESOLVED_REASON_PRECEDENCE.indexOf(current) ? next : current;
}
function preserveRegexUncertainty(error, original) {
    if (original instanceof InconclusiveMatchError && Symbol.for('posthog.requiresServerRegexEvaluation') in original) Object.defineProperty(error, Symbol.for('posthog.requiresServerRegexEvaluation'), {
        value: true
    });
    return error;
}
class FeatureFlagsPoller {
    constructor({ pollingInterval, personalApiKey, projectApiKey, timeout, host, customHeaders, ...options }){
        this.debugMode = false;
        this.shouldBeginExponentialBackoff = false;
        this.backOffCount = 0;
        this.pollerStopped = false;
        this.filteredOutFlagKeys = new Set();
        this.warnedUnresolvableFlags = new Map();
        this.pollingInterval = pollingInterval;
        this.personalApiKey = personalApiKey;
        this.featureFlags = [];
        this.featureFlagsByKey = {};
        this.groupTypeMapping = {};
        this.cohorts = {};
        this.loadedSuccessfullyOnce = false;
        this.timeout = timeout;
        this.projectApiKey = projectApiKey;
        this.host = host;
        this.poller = void 0;
        this.fetch = options.fetch || fetch;
        this.onError = options.onError;
        this.customHeaders = customHeaders;
        this.onLoad = options.onLoad;
        this.onMinimalFlagCalledEvents = options.onMinimalFlagCalledEvents;
        this.cacheProvider = options.cacheProvider;
        this.strictLocalEvaluation = options.strictLocalEvaluation ?? false;
        this.evaluationContexts = options.evaluationContexts;
        this.loadFeatureFlags();
    }
    debug(enabled = true) {
        this.debugMode = enabled;
    }
    logMsgIfDebug(fn) {
        if (this.debugMode) fn();
    }
    currentDefinitions() {
        return {
            featureFlagsByKey: this.featureFlagsByKey,
            groupTypeMapping: this.groupTypeMapping,
            cohorts: this.cohorts,
            filteredOutFlagKeys: this.filteredOutFlagKeys,
            propertyMatchingVersion: this.propertyMatchingVersion
        };
    }
    withEvaluationSnapshot(context) {
        if (context.definitions) return context;
        return {
            ...context,
            evaluationCache: {},
            definitions: this.currentDefinitions()
        };
    }
    createEvaluationContext(distinctId, groups = {}, personProperties = {}, groupProperties = {}, evaluationCache = {}) {
        return {
            distinctId,
            groups,
            personProperties,
            groupProperties,
            evaluationCache
        };
    }
    async getFeatureFlag(key, distinctId, groups = {}, personProperties = {}, groupProperties = {}) {
        await this.loadFeatureFlags();
        let response;
        let featureFlag;
        if (!this.loadedSuccessfullyOnce) return response;
        featureFlag = this.featureFlagsByKey[key];
        if (void 0 !== featureFlag) {
            const evaluationContext = this.createEvaluationContext(distinctId, groups, personProperties, groupProperties);
            try {
                const result = await this.computeFlagAndPayloadLocally(featureFlag, evaluationContext);
                response = result.value;
                this.logMsgIfDebug(()=>console.debug(`Successfully computed flag locally: ${key} -> ${response}`));
            } catch (e) {
                if (e instanceof RequiresServerEvaluation || e instanceof InconclusiveMatchError) this.logMsgIfDebug(()=>console.debug(`${e.name} when computing flag locally: ${key}: ${e.message}`));
                else if (e instanceof Error) this.onError?.(new Error(`Error computing flag locally: ${key}: ${e}`));
            }
        }
        return response;
    }
    async getAllFlagsAndPayloads(evaluationContext, flagKeysToExplicitlyEvaluate) {
        await this.loadFeatureFlags();
        const response = {};
        const payloads = {};
        const unresolved = {};
        let fallbackToFlags = 0 == this.featureFlags.length;
        const flagsToEvaluate = flagKeysToExplicitlyEvaluate ? flagKeysToExplicitlyEvaluate.map((key)=>this.featureFlagsByKey[key]).filter(Boolean) : this.featureFlags;
        const sharedEvaluationContext = this.withEvaluationSnapshot({
            ...evaluationContext,
            definitions: void 0
        });
        await Promise.all(flagsToEvaluate.map(async (flag)=>{
            try {
                const { value: matchValue, payload: matchPayload } = await this.computeFlagAndPayloadLocally(flag, sharedEvaluationContext, {
                    skipLoadCheck: true
                });
                response[flag.key] = matchValue;
                if (matchPayload) payloads[flag.key] = matchPayload;
            } catch (e) {
                if (e instanceof RequiresServerEvaluation || e instanceof InconclusiveMatchError) {
                    this.logMsgIfDebug(()=>console.debug(`${e.name} when computing flag locally: ${flag.key}: ${e.message}`));
                    unresolved[flag.key] = e.reason;
                } else if (e instanceof Error) this.onError?.(new Error(`Error computing flag locally: ${flag.key}: ${e}`));
                if (evaluationRuntimesMatch(normalizeEvaluationRuntime(flag.evaluation_runtime), 'server')) fallbackToFlags = true;
            }
        }));
        return {
            response,
            payloads,
            unresolved,
            fallbackToFlags
        };
    }
    async computeFlagAndPayloadLocally(flag, evaluationContext, options = {}) {
        const { matchValue, skipLoadCheck = false } = options;
        if (this.loadedSuccessfullyOnce) evaluationContext = this.withEvaluationSnapshot(evaluationContext);
        if (!skipLoadCheck) await this.loadFeatureFlags();
        if (!this.loadedSuccessfullyOnce) return {
            value: false,
            payload: null
        };
        evaluationContext = this.withEvaluationSnapshot(evaluationContext);
        flag = evaluationContext.definitions.featureFlagsByKey[flag.key] ?? flag;
        let flagValue;
        flagValue = void 0 !== matchValue ? matchValue : await this.computeFlagValueLocally(flag, evaluationContext);
        const payload = resolveFeatureFlagPayload(flag.filters?.payloads, flagValue);
        return {
            value: flagValue,
            payload
        };
    }
    async computeFlagValueLocally(flag, evaluationContext) {
        const { distinctId, groups, personProperties, groupProperties } = evaluationContext;
        if (!flag.active) return false;
        if (flag.ensure_experience_continuity) throw new InconclusiveMatchError('Flag has experience continuity enabled', 'experience_continuity');
        const flagFilters = flag.filters || {};
        const aggregation_group_type_index = flagFilters.aggregation_group_type_index;
        if (void 0 != aggregation_group_type_index) {
            const groupName = evaluationContext.definitions.groupTypeMapping[String(aggregation_group_type_index)];
            if (!groupName) {
                this.logMsgIfDebug(()=>console.warn(`[FEATURE FLAGS] Unknown group type index ${aggregation_group_type_index} for feature flag ${flag.key}`));
                throw new InconclusiveMatchError('Flag has unknown group type index');
            }
            if (!(groupName in groups)) {
                this.logMsgIfDebug(()=>console.warn(`[FEATURE FLAGS] Can't compute group feature flag: ${flag.key} without group names passed in`));
                return false;
            }
            if ('device_id' === flag.bucketing_identifier && (personProperties?.$device_id === void 0 || personProperties?.$device_id === null || personProperties?.$device_id === '')) this.logMsgIfDebug(()=>console.warn(`[FEATURE FLAGS] Ignoring bucketing_identifier for group flag: ${flag.key}`));
            const focusedGroupProperties = groupProperties[groupName];
            return await this.matchFeatureFlagProperties(flag, groups[groupName], focusedGroupProperties, evaluationContext);
        }
        {
            const bucketingValue = this.getBucketingValueForFlag(flag, distinctId, personProperties);
            if (void 0 === bucketingValue) {
                this.logMsgIfDebug(()=>console.warn(`[FEATURE FLAGS] Can't compute feature flag: ${flag.key} without $device_id, falling back to server evaluation`));
                throw new InconclusiveMatchError(`Can't compute feature flag: ${flag.key} without $device_id`, getDefinitionUnresolvedReason(flag, evaluationContext.definitions) ?? 'missing_context');
            }
            return await this.matchFeatureFlagProperties(flag, bucketingValue, personProperties, evaluationContext);
        }
    }
    getBucketingValueForFlag(flag, distinctId, properties) {
        if (flag.filters?.aggregation_group_type_index != void 0) return distinctId;
        if ('device_id' === flag.bucketing_identifier) {
            const deviceId = properties?.$device_id;
            if (null == deviceId || '' === deviceId) return;
            return deviceId;
        }
        return distinctId;
    }
    async evaluateFlagDependency(property, properties, evaluationContext) {
        const { evaluationCache } = evaluationContext;
        const targetFlagKey = property.key;
        if (!evaluationContext.definitions.featureFlagsByKey) throw new InconclusiveMatchError('Feature flags not available for dependency evaluation');
        if (!('dependency_chain' in property)) throw new InconclusiveMatchError(`Flag dependency property for '${targetFlagKey}' is missing required 'dependency_chain' field`);
        const dependencyChain = property.dependency_chain;
        if (!Array.isArray(dependencyChain)) throw new InconclusiveMatchError(`Flag dependency property for '${targetFlagKey}' has an invalid 'dependency_chain' (expected array, got ${typeof dependencyChain})`);
        if (0 === dependencyChain.length) throw new InconclusiveMatchError(`Circular dependency detected for flag '${targetFlagKey}' (empty dependency chain)`);
        const missingDependency = dependencyChain.find((depFlagKey)=>!(depFlagKey in evaluationCache) && !evaluationContext.definitions.featureFlagsByKey[depFlagKey] && !evaluationContext.definitions.filteredOutFlagKeys.has(depFlagKey));
        if (void 0 !== missingDependency) throw new InconclusiveMatchError(`Missing flag dependency '${missingDependency}' for flag '${targetFlagKey}'`);
        for (const depFlagKey of dependencyChain){
            if (!(depFlagKey in evaluationCache)) {
                const depFlag = evaluationContext.definitions.featureFlagsByKey[depFlagKey];
                if (depFlag) if (depFlag.active) try {
                    const depResult = await this.computeFlagValueLocally(depFlag, evaluationContext);
                    evaluationCache[depFlagKey] = depResult;
                } catch (error) {
                    if (error instanceof RequiresServerEvaluation) throw new RequiresServerEvaluation(`Flag dependency '${depFlagKey}' for flag '${targetFlagKey}' requires server evaluation: ${error.message}`, 'unresolved_dependency');
                    throw preserveRegexUncertainty(new InconclusiveMatchError(`Error evaluating flag dependency '${depFlagKey}' for flag '${targetFlagKey}': ${error}`, 'unresolved_dependency'), error);
                }
                else evaluationCache[depFlagKey] = false;
                else evaluationCache[depFlagKey] = false;
            }
            const cachedResult = evaluationCache[depFlagKey];
            if (null == cachedResult) throw new InconclusiveMatchError(`Dependency '${depFlagKey}' could not be evaluated`, 'unresolved_dependency');
        }
        const targetFlagValue = evaluationCache[targetFlagKey];
        return this.flagEvaluatesToExpectedValue(property.value, targetFlagValue);
    }
    flagEvaluatesToExpectedValue(expectedValue, flagValue) {
        if ('boolean' == typeof expectedValue) return expectedValue === flagValue || 'string' == typeof flagValue && '' !== flagValue && true === expectedValue;
        if ('string' == typeof expectedValue) return flagValue === expectedValue;
        return false;
    }
    async matchFeatureFlagProperties(flag, bucketingValue, properties, evaluationContext) {
        evaluationContext = this.withEvaluationSnapshot(evaluationContext);
        const flagFilters = flag.filters || {};
        const holdoutVariant = await getHoldoutVariant(flagFilters.holdout, bucketingValue);
        if (void 0 !== holdoutVariant) return holdoutVariant;
        const flagConditions = flagFilters.groups || [];
        const flagAggregation = flagFilters.aggregation_group_type_index;
        const earlyExitEnabled = flagFilters.early_exit ?? false;
        const { groups, groupProperties } = evaluationContext;
        let inconclusiveReason;
        let regexError;
        const deferredRegexValues = new Set();
        let result;
        for (const condition of flagConditions){
            let effectiveBucketingValue = bucketingValue;
            try {
                const conditionAggregation = void 0 !== condition.aggregation_group_type_index ? condition.aggregation_group_type_index : flagAggregation;
                let effectiveProperties = properties;
                if (conditionAggregation !== flagAggregation) {
                    if (null != conditionAggregation) {
                        const groupName = evaluationContext.definitions.groupTypeMapping[String(conditionAggregation)];
                        if (!groupName || !(groupName in groups)) {
                            this.logMsgIfDebug(()=>console.debug(`[FEATURE FLAGS] Skipping group condition for flag '${flag.key}': group type index ${conditionAggregation} not available`));
                            continue;
                        }
                        if (!(groupName in groupProperties)) {
                            inconclusiveReason = pickUnresolvedReason(inconclusiveReason, 'missing_context');
                            continue;
                        }
                        effectiveProperties = groupProperties[groupName];
                        effectiveBucketingValue = groups[groupName];
                    }
                }
                const matchResult = await this.isConditionMatch(flag, effectiveBucketingValue, condition, effectiveProperties, evaluationContext);
                if ('match' === matchResult) {
                    const variantOverride = condition.variant;
                    const flagVariants = flagFilters.multivariate?.variants || [];
                    result = variantOverride && flagVariants.some((variant)=>variant.key === variantOverride) ? variantOverride : await this.getMatchingVariant(flag, effectiveBucketingValue) || true;
                    break;
                }
                if (earlyExitEnabled && 'out_of_rollout_bound' === matchResult) {
                    if (inconclusiveReason) break;
                    return false;
                }
            } catch (e) {
                if (e instanceof RequiresServerEvaluation) {
                    let definitionReason;
                    try {
                        definitionReason = getDefinitionUnresolvedReason(flag, evaluationContext.definitions);
                    } catch  {}
                    const reason = pickUnresolvedReason(pickUnresolvedReason(inconclusiveReason, e.reason), definitionReason ?? e.reason);
                    throw reason === e.reason ? e : new RequiresServerEvaluation(e.message, reason);
                }
                if (e instanceof InconclusiveMatchError) {
                    inconclusiveReason = pickUnresolvedReason(inconclusiveReason, e.reason);
                    if (Symbol.for('posthog.requiresServerRegexEvaluation') in e) {
                        regexError = e;
                        if (earlyExitEnabled && void 0 != condition.rollout_percentage && await getFeatureFlagHash(flag.key, effectiveBucketingValue) > condition.rollout_percentage / 100.0) deferredRegexValues.add(false);
                        else {
                            const variants = flagFilters.multivariate?.variants || [];
                            const override = condition.variant;
                            deferredRegexValues.add(override && variants.some((variant)=>variant.key === override) ? override : await this.getMatchingVariant(flag, effectiveBucketingValue) || true);
                        }
                    }
                } else throw e;
            }
        }
        if (void 0 !== result && !(regexError && [
            ...deferredRegexValues
        ].some((value)=>value !== result))) return result;
        if (inconclusiveReason) throw preserveRegexUncertainty(new InconclusiveMatchError("Can't determine if feature flag is enabled or not with given properties", inconclusiveReason), regexError);
        return false;
    }
    async isConditionMatch(flag, bucketingValue, condition, properties, evaluationContext) {
        evaluationContext = this.withEvaluationSnapshot(evaluationContext);
        const definitions = evaluationContext.definitions;
        const rolloutPercentage = condition.rollout_percentage;
        const warnFunction = (msg)=>{
            this.logMsgIfDebug(()=>console.warn(msg));
        };
        if ((condition.properties || []).length > 0) {
            let inconclusiveReason;
            let regexError;
            let serverEvaluationError;
            for (const prop of condition.properties){
                const propertyType = prop.type;
                let matches = false;
                try {
                    if ('cohort' === propertyType) {
                        const inCohort = await matchCohort(prop, properties, definitions.cohorts, this.debugMode, (depProp)=>this.evaluateFlagDependency(depProp, properties, evaluationContext), definitions.propertyMatchingVersion);
                        matches = 'not_in' === prop.operator ? !inCohort : inCohort;
                    } else if ('flag' === propertyType) matches = await this.evaluateFlagDependency(prop, properties, evaluationContext);
                    else if (Object.prototype.hasOwnProperty.call(properties, prop.key)) matches = matchProperty(prop, properties, warnFunction, definitions.propertyMatchingVersion);
                    else {
                        assertFeatureFlagFilterSupported(prop);
                        inconclusiveReason = pickUnresolvedReason(inconclusiveReason, 'missing_context');
                        continue;
                    }
                } catch (e) {
                    if (e instanceof RequiresServerEvaluation) {
                        if (void 0 === inconclusiveReason) serverEvaluationError ??= e;
                        inconclusiveReason = pickUnresolvedReason(inconclusiveReason, e.reason);
                        continue;
                    }
                    if (e instanceof InconclusiveMatchError) {
                        if (Symbol.for('posthog.requiresServerRegexEvaluation') in e) regexError = e;
                        inconclusiveReason = pickUnresolvedReason(inconclusiveReason, e.reason);
                        continue;
                    }
                    if (void 0 !== inconclusiveReason) break;
                    throw e;
                }
                if (!matches) return 'no_match';
            }
            if (serverEvaluationError) throw serverEvaluationError;
            if (inconclusiveReason) throw preserveRegexUncertainty(new InconclusiveMatchError(`Can't determine if a condition of flag ${flag.key} matches`, inconclusiveReason), regexError);
            if (void 0 == rolloutPercentage) return 'match';
        }
        if (void 0 != rolloutPercentage && await getFeatureFlagHash(flag.key, bucketingValue) > rolloutPercentage / 100.0) return 'out_of_rollout_bound';
        return 'match';
    }
    async getMatchingVariant(flag, bucketingValue) {
        return getFeatureFlagVariant(flag.key, bucketingValue, flag.filters?.multivariate?.variants || []);
    }
    variantLookupTable(flag) {
        return getFeatureFlagVariantLookupTable(flag.filters?.multivariate?.variants || []);
    }
    filterFlagsByEvaluationContexts(flags) {
        if (!this.evaluationContexts || 0 === this.evaluationContexts.length) return flags;
        const contexts = new Set(this.evaluationContexts);
        return flags.filter((flag)=>{
            const tags = flag.evaluation_contexts ?? flag.evaluation_tags;
            if (!tags || 0 === tags.length) return true;
            return tags.some((tag)=>contexts.has(tag));
        });
    }
    getEvaluationRuntimeForFlag(key) {
        const flag = this.featureFlagsByKey[key];
        return flag ? normalizeEvaluationRuntime(flag.evaluation_runtime) : void 0;
    }
    getFlagKeysByEvaluationRuntime(runtime) {
        return this.featureFlags.filter((flag)=>evaluationRuntimesMatch(normalizeEvaluationRuntime(flag.evaluation_runtime), runtime)).map((flag)=>flag.key);
    }
    updateFlagState(flagData) {
        const flags = this.filterFlagsByEvaluationContexts(flagData.flags);
        const featureFlagsByKey = flags.reduce((acc, curr)=>(acc[curr.key] = curr, acc), {});
        const keptKeys = new Set(flags.map((flag)=>flag.key));
        const filteredOutFlagKeys = new Set(flagData.flags.filter((flag)=>!keptKeys.has(flag.key)).map((flag)=>flag.key));
        this.featureFlags = flags;
        this.featureFlagsByKey = featureFlagsByKey;
        this.filteredOutFlagKeys = filteredOutFlagKeys;
        this.groupTypeMapping = flagData.group_type_mapping ?? flagData.groupTypeMapping ?? {};
        this.cohorts = flagData.cohorts;
        this.propertyMatchingVersion = flagData.property_matching_version ?? flagData.propertyMatchingVersion;
        this.loadedSuccessfullyOnce = true;
        this.onMinimalFlagCalledEvents?.((flagData.minimal_flag_called_events ?? flagData.minimalFlagCalledEvents) === true);
    }
    warnAboutUnresolvableFlags(flags) {
        const experienceContinuityFlags = [];
        const unsupportedDefinitionFlags = [];
        const warnedFlags = new Map();
        const definitions = this.currentDefinitions();
        for (const flag of flags){
            if (!evaluationRuntimesMatch(normalizeEvaluationRuntime(flag.evaluation_runtime), 'server')) continue;
            const reason = getDefinitionUnresolvedReason(flag, definitions);
            if (!reason) continue;
            const fingerprint = JSON.stringify(flag);
            warnedFlags.set(flag.key, fingerprint);
            if (this.warnedUnresolvableFlags.get(flag.key) !== fingerprint) if ('experience_continuity' === reason) experienceContinuityFlags.push(flag.key);
            else unsupportedDefinitionFlags.push(flag.key);
        }
        this.warnedUnresolvableFlags = warnedFlags;
        if (experienceContinuityFlags.length > 0) {
            const consequence = this.strictLocalEvaluation ? "With strictLocalEvaluation enabled these flags are left unresolved. To evaluate them locally, disable experience continuity on these flags in PostHog." : "Experience continuity is incompatible with local evaluation and will cause a server request on every flag evaluation, negating local evaluation cost savings. To avoid server requests and unexpected costs, either disable experience continuity on these flags in PostHog, use strictLocalEvaluation: true in client init, or pass onlyEvaluateLocally: true per flag call (flags that cannot be evaluated locally will return undefined).";
            console.warn(`[PostHog] You are using local evaluation but ${experienceContinuityFlags.length} flag(s) have experience continuity enabled and cannot be resolved locally (reason: experience_continuity): ${experienceContinuityFlags.join(', ')}. ` + consequence);
        }
        if (unsupportedDefinitionFlags.length > 0) {
            const consequence = this.strictLocalEvaluation ? "With strictLocalEvaluation enabled these flags are left unresolved when evaluation reaches that part." : "Evaluating these flags falls back to a server request when evaluation reaches that part.";
            console.warn(`[PostHog] You are using local evaluation but ${unsupportedDefinitionFlags.length} flag(s) use something local evaluation does not support, such as a static cohort, an unknown operator, or a missing or circular flag dependency (reason: unsupported_definition): ${unsupportedDefinitionFlags.join(', ')}. ${consequence} To evaluate them locally, change these flags in PostHog or upgrade posthog-node.`);
        }
    }
    async loadFromCache(debugMessage) {
        if (!this.cacheProvider) return false;
        try {
            const cached = await this.cacheProvider.getFlagDefinitions();
            if (cached) {
                this.updateFlagState(cached);
                this.logMsgIfDebug(()=>console.debug(`[FEATURE FLAGS] ${debugMessage} (${cached.flags.length} flags)`));
                this.onLoad?.(this.featureFlags.length);
                this.warnAboutUnresolvableFlags(this.featureFlags);
                return true;
            }
            return false;
        } catch (err) {
            this.onError?.(new Error(`Failed to load from cache: ${err}`));
            return false;
        }
    }
    async loadFeatureFlags(forceReload = false) {
        if (this.loadedSuccessfullyOnce && !forceReload) return;
        if (!forceReload && this.nextFetchAllowedAt && Date.now() < this.nextFetchAllowedAt) return void this.logMsgIfDebug(()=>console.debug('[FEATURE FLAGS] Skipping fetch, in backoff period'));
        if (!this.loadingPromise) this.loadingPromise = this._loadFeatureFlags().catch((err)=>this.logMsgIfDebug(()=>console.debug(`[FEATURE FLAGS] Failed to load feature flags: ${err}`))).finally(()=>{
            this.loadingPromise = void 0;
        });
        return this.loadingPromise;
    }
    isLocalEvaluationReady() {
        return (this.loadedSuccessfullyOnce ?? false) && (this.featureFlags?.length ?? 0) > 0;
    }
    getFlagDefinitionsLoadedAt() {
        return this.flagDefinitionsLoadedAt;
    }
    getPollingInterval() {
        const interval = this.pollingInterval ?? 30000;
        if (!this.shouldBeginExponentialBackoff) return interval;
        return Math.min(SIXTY_SECONDS, interval * 2 ** this.backOffCount);
    }
    beginBackoff() {
        this.shouldBeginExponentialBackoff = true;
        this.backOffCount += 1;
        this.nextFetchAllowedAt = Date.now() + this.getPollingInterval();
    }
    clearBackoff() {
        this.shouldBeginExponentialBackoff = false;
        this.backOffCount = 0;
        this.nextFetchAllowedAt = void 0;
    }
    async _loadFeatureFlags() {
        if (this.poller) {
            clearTimeout(this.poller);
            this.poller = void 0;
        }
        try {
            if (this.cacheProvider && !this.personalApiKey) return void await this.loadFromCache('Loaded flags from cache (cache-only reader)');
            let shouldFetch = true;
            if (this.cacheProvider) try {
                shouldFetch = await this.cacheProvider.shouldFetchFlagDefinitions();
            } catch (err) {
                this.onError?.(new Error(`Error in shouldFetchFlagDefinitions: ${err}`));
            }
            if (!shouldFetch) {
                const loaded = await this.loadFromCache('Loaded flags from cache (skipped fetch)');
                if (loaded) return;
                if (this.loadedSuccessfullyOnce) return;
            }
            const res = await this._requestFeatureFlagDefinitions();
            if (!res) return;
            switch(res.status){
                case 304:
                    this.logMsgIfDebug(()=>console.debug('[FEATURE FLAGS] Flags not modified (304), using cached data'));
                    this.flagsEtag = res.headers?.get('ETag') ?? this.flagsEtag;
                    this.loadedSuccessfullyOnce = true;
                    this.clearBackoff();
                    return;
                case 401:
                    this.beginBackoff();
                    throw new ClientError(`Your project key or secret key is invalid. Setting next polling interval to ${this.getPollingInterval()}ms. More information: https://posthog.com/docs/api#rate-limiting`);
                case 402:
                    console.warn('[FEATURE FLAGS] Feature flags quota limit exceeded - unsetting all local flags. Learn more about billing limits at https://posthog.com/docs/billing/limits-alerts');
                    this.featureFlags = [];
                    this.featureFlagsByKey = {};
                    this.filteredOutFlagKeys = new Set();
                    this.groupTypeMapping = {};
                    this.cohorts = {};
                    this.propertyMatchingVersion = void 0;
                    this.onMinimalFlagCalledEvents?.(false);
                    return;
                case 403:
                    this.beginBackoff();
                    throw new ClientError(`Your secret key does not have permission to fetch feature flag definitions for local evaluation. Setting next polling interval to ${this.getPollingInterval()}ms. Are you sure you're using the correct secret and Project API key pair? More information: https://posthog.com/docs/api/overview`);
                case 429:
                    this.beginBackoff();
                    throw new ClientError(`You are being rate limited. Setting next polling interval to ${this.getPollingInterval()}ms. More information: https://posthog.com/docs/api#rate-limiting`);
                case 200:
                    {
                        const responseJson = await res.json() ?? {};
                        if (!('flags' in responseJson)) return void this.onError?.(new Error(`Invalid response when getting feature flags: ${JSON.stringify(responseJson)}`));
                        this.flagsEtag = res.headers?.get('ETag') ?? void 0;
                        const groupTypeMapping = responseJson.group_type_mapping || {};
                        const minimalFlagCalledEvents = true === responseJson.minimal_flag_called_events;
                        const flagData = {
                            flags: responseJson.flags ?? [],
                            group_type_mapping: groupTypeMapping,
                            cohorts: responseJson.cohorts || {},
                            minimal_flag_called_events: minimalFlagCalledEvents,
                            property_matching_version: responseJson.property_matching_version,
                            propertyMatchingVersion: responseJson.property_matching_version,
                            groupTypeMapping,
                            minimalFlagCalledEvents
                        };
                        this.updateFlagState(flagData);
                        this.flagDefinitionsLoadedAt = Date.now();
                        this.clearBackoff();
                        if (this.cacheProvider && shouldFetch) try {
                            await this.cacheProvider.onFlagDefinitionsReceived(flagData);
                        } catch (err) {
                            this.onError?.(new Error(`Failed to store in cache: ${err}`));
                        }
                        this.onLoad?.(this.featureFlags.length);
                        this.warnAboutUnresolvableFlags(this.featureFlags);
                        break;
                    }
                default:
                    return;
            }
        } catch (err) {
            if (err instanceof ClientError) this.onError?.(err);
        } finally{
            if (!this.pollerStopped && null !== this.pollingInterval) this.poller = setTimeout(()=>this.loadFeatureFlags(true), this.getPollingInterval());
        }
    }
    getPersonalApiKeyRequestOptions(method = 'GET', etag) {
        const headers = {
            ...this.customHeaders,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.personalApiKey}`
        };
        if (etag) headers['If-None-Match'] = etag;
        return {
            method,
            headers
        };
    }
    async _requestFeatureFlagDefinitions() {
        if (!this.personalApiKey) throw new ClientError('A secretKey or personalApiKey is required to fetch feature flag definitions from PostHog.');
        const url = `${this.host}/flags/definitions?token=${this.projectApiKey}&send_cohorts`;
        const options = this.getPersonalApiKeyRequestOptions('GET', this.flagsEtag);
        let abortTimeout = null;
        if (this.timeout && 'number' == typeof this.timeout) {
            const controller = new AbortController();
            abortTimeout = safeSetTimeout(()=>{
                controller.abort();
            }, this.timeout);
            options.signal = controller.signal;
        }
        const clearAbortTimeout = ()=>clearTimeout(abortTimeout);
        try {
            const fetch1 = this.fetch;
            const res = await fetch1(url, options);
            if (200 !== res.status) {
                clearAbortTimeout();
                return res;
            }
            return {
                status: res.status,
                headers: res.headers,
                body: res.body,
                text: async ()=>{
                    try {
                        return await res.text();
                    } finally{
                        clearAbortTimeout();
                    }
                },
                json: async ()=>{
                    try {
                        return await res.json();
                    } finally{
                        clearAbortTimeout();
                    }
                }
            };
        } catch (err) {
            clearAbortTimeout();
            throw err;
        }
    }
    async stopPoller(timeoutMs = 30000) {
        this.pollerStopped = true;
        clearTimeout(this.poller);
        this.poller = void 0;
        if (this.cacheProvider) try {
            const shutdownResult = this.cacheProvider.shutdown();
            if (shutdownResult instanceof Promise) await raceWithTimeout(shutdownResult, timeoutMs, ()=>{
                throw new Error(`Cache shutdown timeout after ${timeoutMs}ms`);
            });
        } catch (err) {
            this.onError?.(new Error(`Error during cache shutdown: ${err}`));
        }
    }
}
function getDefinitionUnresolvedReason(flag, definitions) {
    if (!flag.active) return;
    if (flag.ensure_experience_continuity) return 'experience_continuity';
    const flagFilters = flag.filters || {};
    const aggregation = flagFilters.aggregation_group_type_index;
    if (void 0 != aggregation && !definitions.groupTypeMapping[String(aggregation)]) return 'unsupported_definition';
    const usesUnsupportedProperty = (flagFilters.groups || []).some((condition)=>(condition.properties || []).some((property)=>isUnsupportedProperty(property, definitions, new Set())));
    return usesUnsupportedProperty ? 'unsupported_definition' : void 0;
}
function isUnsupportedProperty(property, definitions, visitedCohortIds) {
    if ('flag' === property.type) {
        const dependencyChain = property.dependency_chain;
        if (!Array.isArray(dependencyChain) || 0 === dependencyChain.length) return true;
        return dependencyChain.some((key)=>!definitions.featureFlagsByKey[key] && !definitions.filteredOutFlagKeys.has(key));
    }
    if ('cohort' !== property.type) try {
        assertFeatureFlagFilterSupported(property);
        return false;
    } catch (e) {
        if (e instanceof InconclusiveMatchError) return true;
        throw e;
    }
    const cohortId = String(property.value);
    if (!(cohortId in definitions.cohorts)) return true;
    if (visitedCohortIds.has(cohortId)) return false;
    visitedCohortIds.add(cohortId);
    return isUnsupportedPropertyGroup(definitions.cohorts[cohortId], definitions, visitedCohortIds);
}
function isUnsupportedPropertyGroup(group, definitions, visitedCohortIds) {
    return (group?.values ?? []).some((value)=>'values' in value ? isUnsupportedPropertyGroup(value, definitions, visitedCohortIds) : isUnsupportedProperty(value, definitions, visitedCohortIds));
}
function matchProperty(property, propertyValues, warnFunction, propertyMatchingVersion) {
    return matchFeatureFlagProperty(property, propertyValues, {
        warnFunction,
        propertyMatchingVersion
    });
}
function parseSemver(value) {
    return parseFeatureFlagSemver(value, 'strict');
}
function checkCohortExists(cohortId, cohortProperties) {
    if (!(cohortId in cohortProperties)) throw new RequiresServerEvaluation(`cohort ${cohortId} not found in local cohorts - likely a static cohort that requires server evaluation`);
}
async function matchCohort(property, propertyValues, cohortProperties, debugMode = false, flagDependencyEvaluator, propertyMatchingVersion) {
    const cohortId = String(property.value);
    checkCohortExists(cohortId, cohortProperties);
    const propertyGroup = cohortProperties[cohortId];
    return matchPropertyGroup(propertyGroup, propertyValues, cohortProperties, debugMode, flagDependencyEvaluator, propertyMatchingVersion);
}
async function matchPropertyGroup(propertyGroup, propertyValues, cohortProperties, debugMode = false, flagDependencyEvaluator, propertyMatchingVersion) {
    if (!propertyGroup) return true;
    const propertyGroupType = propertyGroup.type;
    const properties = propertyGroup.values;
    if (!properties || 0 === properties.length) return true;
    let inconclusiveReason;
    let regexError;
    if ('values' in properties[0]) {
        for (const prop of properties)try {
            const matches = await matchPropertyGroup(prop, propertyValues, cohortProperties, debugMode, flagDependencyEvaluator, propertyMatchingVersion);
            if ('AND' === propertyGroupType) {
                if (!matches) return false;
            } else if (matches) return true;
        } catch (err) {
            if (err instanceof RequiresServerEvaluation) throw err;
            if (err instanceof InconclusiveMatchError) {
                if (debugMode) console.debug(`Failed to compute property ${prop} locally: ${err}`);
                inconclusiveReason = pickUnresolvedReason(inconclusiveReason, err.reason);
                if (Symbol.for('posthog.requiresServerRegexEvaluation') in err) regexError = err;
            } else throw err;
        }
        if (inconclusiveReason) throw preserveRegexUncertainty(new InconclusiveMatchError("Can't match cohort without a given cohort property value", inconclusiveReason), regexError);
        return 'AND' === propertyGroupType;
    }
    for (const prop of properties)try {
        let matches;
        if ('cohort' === prop.type) matches = await matchCohort(prop, propertyValues, cohortProperties, debugMode, flagDependencyEvaluator, propertyMatchingVersion);
        else if ('flag' === prop.type) {
            if (!flagDependencyEvaluator) throw new InconclusiveMatchError(`Flag dependency '${prop.key || 'unknown'}' cannot be evaluated without a flag dependency evaluator`);
            matches = await flagDependencyEvaluator(prop);
        } else matches = matchProperty(prop, propertyValues, void 0, propertyMatchingVersion);
        const negation = prop.negation || false;
        if ('AND' === propertyGroupType) {
            if (!matches && !negation) return false;
            if (matches && negation) return false;
        } else {
            if (matches && !negation) return true;
            if (!matches && negation) return true;
        }
    } catch (err) {
        if (err instanceof RequiresServerEvaluation) throw err;
        if (err instanceof InconclusiveMatchError) {
            if (debugMode) console.debug(`Failed to compute property ${prop} locally: ${err}`);
            inconclusiveReason = pickUnresolvedReason(inconclusiveReason, err.reason);
            if (Symbol.for('posthog.requiresServerRegexEvaluation') in err) regexError = err;
        } else throw err;
    }
    if (inconclusiveReason) throw preserveRegexUncertainty(new InconclusiveMatchError("can't match cohort without a given cohort property value", inconclusiveReason), regexError);
    return 'AND' === propertyGroupType;
}
export { ClientError, FeatureFlagsPoller, InconclusiveMatchError, RequiresServerEvaluation, matchProperty, parseSemver, relativeDateParseForFeatureFlagMatching };
