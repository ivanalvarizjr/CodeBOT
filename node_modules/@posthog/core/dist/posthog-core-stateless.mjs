import { SimpleEventEmitter } from "./eventemitter.mjs";
import { getFeatureFlagValue, minimizeFlagCalledEventProperties, normalizeFlagsResponse } from "./featureFlagUtils.mjs";
import { gzipCompress, isGzipSupported } from "./gzip.mjs";
import { PostHogPersistedProperty } from "./types.mjs";
import { PromiseQueue, STRING_FORMAT, allSettled, createLogger, createNamedError, currentISOTime, getEventUuid, raceWithTimeout, removeTrailingSlash, retriable, safeJsonStringify, safeSetTimeout } from "./utils/index.mjs";
import { parseRetryAfterMs } from "./utils/retry-after.mjs";
import { uuidv7 } from "./vendor/uuidv7.mjs";
import { ErrorCoercer, ErrorPropertiesBuilder, ObjectCoercer, PrimitiveCoercer, StringCoercer, createDefaultStackParser } from "./error-tracking/index.mjs";
class PostHogFetchHttpError extends Error {
    constructor(response, reqByteLength, responseBodyDeadline, abortController){
        super('HTTP error while fetching PostHog: status=' + response.status + ', reqByteLength=' + reqByteLength), this.response = response, this.reqByteLength = reqByteLength, this.responseBodyDeadline = responseBodyDeadline, this.abortController = abortController, this.name = 'PostHogFetchHttpError', this._bodyReadTimedOut = false;
    }
    get status() {
        return this.response.status;
    }
    get retryAfterMs() {
        try {
            return parseRetryAfterMs(this.response.headers?.get('retry-after'));
        } catch  {
            return;
        }
    }
    get bodyReadTimedOut() {
        return this._bodyReadTimedOut;
    }
    get text() {
        if (!this.responseBodyTextPromise) if (Date.now() >= this.responseBodyDeadline) {
            this._bodyReadTimedOut = true;
            const timeoutError = createNamedError('AbortError', 'Response body read timed out');
            this.cancelResponseBody(timeoutError);
            this.responseBodyTextPromise = Promise.reject(timeoutError);
        } else {
            const responseBodyTimeout = new Promise((_resolve, reject)=>{
                this.responseBodyTimer = safeSetTimeout(()=>{
                    this._bodyReadTimedOut = true;
                    const timeoutError = createNamedError('AbortError', 'Response body read timed out');
                    reject(timeoutError);
                    this.cancelResponseBody(timeoutError);
                }, this.responseBodyDeadline - Date.now());
            });
            let responseBodyText;
            try {
                responseBodyText = Promise.resolve(this.response.text());
            } catch (error) {
                responseBodyText = Promise.reject(error);
            }
            this.responseBodyTextPromise = Promise.race([
                responseBodyText,
                responseBodyTimeout
            ]).finally(()=>clearTimeout(this.responseBodyTimer));
        }
        return this.responseBodyTextPromise;
    }
    get json() {
        return this.text.then((text)=>JSON.parse(text));
    }
    cancelResponseBody(reason) {
        clearTimeout(this.responseBodyTimer);
        if (!this.abortController.signal.aborted) this.abortController.abort(reason);
        (async ()=>{
            try {
                await this.response.body?.cancel();
            } catch  {}
        })();
    }
}
class PostHogFetchNetworkError extends Error {
    constructor(error){
        super('Network error while fetching PostHog', error instanceof Error ? {
            cause: error
        } : {}), this.error = error, this.name = 'PostHogFetchNetworkError';
    }
}
const maybeAdd = (key, value)=>void 0 !== value ? {
        [key]: value
    } : {};
const applyCallerFeatureFlagOverrides = (target, callerProperties)=>{
    for (const key of Object.keys(callerProperties))if (key.startsWith('$feature/') || '$active_feature_flags' === key) target[key] = callerProperties[key];
};
async function logFlushError(err) {
    if (err instanceof PostHogFetchHttpError) {
        let text = '';
        try {
            text = await err.text;
        } catch  {
            if (err.bodyReadTimedOut) text = '<response body read timed out>';
        }
        console.error(`Error while flushing PostHog: message=${err.message}, response body=${text}`, err);
    } else console.error('Error while flushing PostHog', err);
    return Promise.resolve();
}
function isPostHogFetchError(err) {
    return 'object' == typeof err && (err instanceof PostHogFetchHttpError || isPostHogFetchNetworkError(err));
}
function isPostHogFetchNetworkError(err) {
    return err instanceof PostHogFetchNetworkError;
}
function isRetryableFlagsFetchError(err) {
    if (err instanceof PostHogFetchHttpError) return 502 === err.status || 504 === err.status;
    if (!(err instanceof PostHogFetchNetworkError)) return false;
    const cause = err.error;
    const code = cause?.code ?? cause?.cause?.code;
    return 'ECONNREFUSED' !== code;
}
const OTLP_MAX_BODY_BYTES = 10485760;
function byteLengthOf(body) {
    try {
        if ('string' != typeof body) return body instanceof Uint8Array ? body.byteLength : body.size;
        if ("u" > typeof Buffer) return Buffer.byteLength(body, STRING_FORMAT);
        return new TextEncoder().encode(body).length;
    } catch  {
        return 0;
    }
}
function isPostHogFetchContentTooLargeError(err) {
    return 'object' == typeof err && err instanceof PostHogFetchHttpError && 413 === err.status;
}
function isPostHogFetchRetryableError(err) {
    if (err instanceof PostHogFetchHttpError) return 408 === err.status || 429 === err.status || err.status >= 500;
    return isPostHogFetchNetworkError(err);
}
function isPostHogEventProperties(value) {
    return null !== value && 'object' == typeof value && !Array.isArray(value);
}
var posthog_core_stateless_QuotaLimitedFeature = /*#__PURE__*/ function(QuotaLimitedFeature) {
    QuotaLimitedFeature["FeatureFlags"] = "feature_flags";
    QuotaLimitedFeature["Recordings"] = "recordings";
    return QuotaLimitedFeature;
}({});
const DEFAULT_QUEUE_ROUTE = 'default';
class PostHogCoreStateless {
    getErrorPropertiesBuilder() {
        if (!this._errorPropertiesBuilder) this._errorPropertiesBuilder = this.createErrorPropertiesBuilder();
        return this._errorPropertiesBuilder;
    }
    createErrorPropertiesBuilder() {
        return new ErrorPropertiesBuilder([
            new ErrorCoercer(),
            new ObjectCoercer(),
            new StringCoercer(),
            new PrimitiveCoercer()
        ], createDefaultStackParser());
    }
    getEvaluationRuntime() {}
    get apiKey() {
        return this.projectToken;
    }
    constructor(projectToken, options = {}){
        this.flushPromise = null;
        this.pendingFlushPromise = null;
        this.flushPromises = new Set();
        this._dequeuedMessagesCount = 0;
        this.shutdownPromise = null;
        this.promiseQueue = new PromiseQueue();
        this._events = new SimpleEventEmitter();
        this._isInitialized = false;
        const normalizedProjectToken = 'string' == typeof projectToken ? projectToken.trim() : '';
        const normalizedHost = 'string' == typeof options.host ? options.host.trim() : '';
        const missingProjectToken = !normalizedProjectToken;
        this._logger = createLogger('[PostHog]', this.logMsgIfDebug.bind(this));
        if (missingProjectToken) this._logger.error('You must pass your PostHog project token. The client will be disabled.');
        this.projectToken = normalizedProjectToken;
        this.host = removeTrailingSlash(normalizedHost || 'https://us.i.posthog.com');
        this.flushAt = options.flushAt ? Math.max(options.flushAt, 1) : 20;
        this.maxBatchSize = Math.max(this.flushAt, options.maxBatchSize ?? 100);
        this.maxQueueSize = Math.max(this.flushAt, options.maxQueueSize ?? 1000);
        this.flushInterval = options.flushInterval ?? 10000;
        this.preloadFeatureFlags = options.preloadFeatureFlags ?? true;
        this.defaultOptIn = options.defaultOptIn ?? true;
        this.disableSurveys = options.disableSurveys ?? false;
        this._retryOptions = {
            retryCount: options.fetchRetryCount ?? 3,
            retryDelay: options.fetchRetryDelay ?? 3000,
            retryCheck: isPostHogFetchRetryableError
        };
        this.requestTimeout = options.requestTimeout ?? 10000;
        this.featureFlagsRequestTimeoutMs = options.featureFlagsRequestTimeoutMs ?? 3000;
        this.featureFlagsRequestMaxRetries = options.featureFlagsRequestMaxRetries ?? 1;
        this.remoteConfigRequestTimeoutMs = options.remoteConfigRequestTimeoutMs ?? 3000;
        this.disableGeoip = options.disableGeoip ?? true;
        this.disabled = (options.disabled ?? false) || missingProjectToken;
        this.historicalMigration = options?.historicalMigration ?? false;
        this._initPromise = Promise.resolve();
        this._isInitialized = true;
        this.evaluationContexts = options?.evaluationContexts ?? options?.evaluationEnvironments;
        if (options?.evaluationEnvironments && !options?.evaluationContexts) this._logger.warn('evaluationEnvironments is deprecated. Use evaluationContexts instead. This property will be removed in a future version.');
        this.disableCompression = !isGzipSupported() || (options?.disableCompression ?? false);
    }
    logMsgIfDebug(fn) {
        if (this.isDebug) fn();
    }
    wrap(fn) {
        if (this.disabled) return void this._logger.warn('The client is disabled');
        if (this._isInitialized) return fn();
        this._initPromise.then(()=>fn());
    }
    getCommonEventProperties() {
        return {
            $lib: this.getLibraryId(),
            $lib_version: this.getLibraryVersion()
        };
    }
    get optedOut() {
        return this.getPersistedProperty(PostHogPersistedProperty.OptedOut) ?? !this.defaultOptIn;
    }
    async optIn() {
        this.wrap(()=>{
            this.setPersistedProperty(PostHogPersistedProperty.OptedOut, false);
        });
    }
    async optOut() {
        this.wrap(()=>{
            this.setPersistedProperty(PostHogPersistedProperty.OptedOut, true);
        });
    }
    on(event, cb) {
        return this._events.on(event, cb);
    }
    debug(enabled = true) {
        this.removeDebugCallback?.();
        if (enabled) {
            const removeDebugCallback = this.on('*', (event, payload)=>this._logger.info(event, payload));
            this.removeDebugCallback = ()=>{
                removeDebugCallback();
                this.removeDebugCallback = void 0;
            };
        }
    }
    get isDebug() {
        return !!this.removeDebugCallback;
    }
    get isDisabled() {
        return this.disabled;
    }
    buildPayload(payload) {
        const userProperties = payload.properties || {};
        let properties = this.mergeCommonEventProperties(userProperties);
        applyCallerFeatureFlagOverrides(properties, userProperties);
        if ('$feature_flag_called' === payload.event && false === properties.$feature_flag_has_experiment && this.isMinimalFlagCalledEventsEnabled()) properties = minimizeFlagCalledEventProperties(properties);
        return {
            distinct_id: payload.distinct_id,
            event: payload.event,
            properties
        };
    }
    mergeCommonEventProperties(properties) {
        return {
            ...properties,
            ...this.getCommonEventProperties()
        };
    }
    isMinimalFlagCalledEventsEnabled() {
        return false;
    }
    addPendingPromise(promise) {
        return this.promiseQueue.add(promise);
    }
    identifyStateless(distinctId, properties, options) {
        this.wrap(()=>{
            const payload = {
                ...this.buildPayload({
                    distinct_id: distinctId,
                    event: '$identify',
                    properties
                })
            };
            this.enqueue('identify', payload, options);
        });
    }
    async identifyStatelessImmediate(distinctId, properties, options) {
        const payload = {
            ...this.buildPayload({
                distinct_id: distinctId,
                event: '$identify',
                properties
            })
        };
        await this.sendImmediate('identify', payload, options);
    }
    captureStateless(distinctId, event, properties, options) {
        this.wrap(()=>{
            const payload = this.buildPayload({
                distinct_id: distinctId,
                event,
                properties
            });
            this.enqueue('capture', payload, options);
        });
    }
    async captureStatelessImmediate(distinctId, event, properties, options) {
        const payload = this.buildPayload({
            distinct_id: distinctId,
            event,
            properties
        });
        await this.sendImmediate('capture', payload, options);
    }
    aliasStateless(alias, distinctId, properties, options) {
        this.wrap(()=>{
            const payload = this.buildPayload({
                event: '$create_alias',
                distinct_id: distinctId,
                properties: {
                    ...properties || {},
                    distinct_id: distinctId,
                    alias
                }
            });
            this.enqueue('alias', payload, options);
        });
    }
    async aliasStatelessImmediate(alias, distinctId, properties, options) {
        const payload = this.buildPayload({
            event: '$create_alias',
            distinct_id: distinctId,
            properties: {
                ...properties || {},
                distinct_id: distinctId,
                alias
            }
        });
        await this.sendImmediate('alias', payload, options);
    }
    groupIdentifyStateless(groupType, groupKey, groupProperties, options, distinctId, eventProperties) {
        this.wrap(()=>{
            const payload = this.buildPayload({
                distinct_id: distinctId || `$${groupType}_${groupKey}`,
                event: '$groupidentify',
                properties: {
                    $group_type: groupType,
                    $group_key: groupKey,
                    $group_set: groupProperties || {},
                    ...eventProperties || {}
                }
            });
            this.enqueue('capture', payload, options);
        });
    }
    async groupIdentifyStatelessImmediate(groupType, groupKey, groupProperties, options, distinctId, eventProperties) {
        const payload = this.buildPayload({
            distinct_id: distinctId || `$${groupType}_${groupKey}`,
            event: '$groupidentify',
            properties: {
                $group_type: groupType,
                $group_key: groupKey,
                $group_set: groupProperties || {},
                ...eventProperties || {}
            }
        });
        await this.sendImmediate('capture', payload, options);
    }
    async getRemoteConfig() {
        await this._initPromise;
        let host = this.host;
        if ('https://us.i.posthog.com' === host) host = 'https://us-assets.i.posthog.com';
        else if ('https://eu.i.posthog.com' === host) host = 'https://eu-assets.i.posthog.com';
        const url = `${host}/array/${this.projectToken}/config`;
        const fetchOptions = {
            method: 'GET',
            headers: {
                ...this.getCustomHeaders(),
                'Content-Type': 'application/json'
            }
        };
        return this.fetchWithRetry(url, fetchOptions, {
            type: 'required',
            consume: (response)=>response.json()
        }, {
            retryCount: 0
        }, this.remoteConfigRequestTimeoutMs).catch((error)=>{
            this._logger.error('Remote config could not be loaded', error);
            this._events.emit('error', error);
        });
    }
    async getFlags(distinctId, groups = {}, personProperties = {}, groupProperties = {}, extraPayload = {}, fetchConfig = false) {
        await this._initPromise;
        const configParam = fetchConfig ? '&config=true' : '';
        const url = `${this.host}/flags/?v=2${configParam}`;
        const requestData = {
            token: this.projectToken,
            distinct_id: distinctId,
            groups,
            person_properties: personProperties,
            group_properties: groupProperties,
            ...extraPayload
        };
        if (personProperties.$device_id) requestData.$device_id = personProperties.$device_id;
        if (this.evaluationContexts && this.evaluationContexts.length > 0) requestData.evaluation_contexts = this.evaluationContexts;
        const evaluationRuntime = this.getEvaluationRuntime();
        if (evaluationRuntime) requestData.evaluation_runtime = evaluationRuntime;
        const fetchOptions = {
            method: 'POST',
            headers: {
                ...this.getCustomHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        };
        this._logger.info('Flags URL', url);
        return this.fetchWithRetry(url, fetchOptions, {
            type: 'required',
            consume: (response)=>response.json()
        }, {
            retryCount: this.featureFlagsRequestMaxRetries,
            retryCheck: isRetryableFlagsFetchError
        }, this.featureFlagsRequestTimeoutMs).then((response)=>({
                success: true,
                response: normalizeFlagsResponse(response)
            })).catch((error)=>{
            this._events.emit('error', error);
            return {
                success: false,
                error: this.categorizeRequestError(error)
            };
        });
    }
    categorizeRequestError(error) {
        if (error instanceof PostHogFetchHttpError) return {
            type: 'api_error',
            statusCode: error.status
        };
        if (error instanceof PostHogFetchNetworkError) {
            const cause = error.error;
            if (cause instanceof Error && ('AbortError' === cause.name || 'TimeoutError' === cause.name)) return {
                type: 'timeout'
            };
            return {
                type: 'connection_error'
            };
        }
        return {
            type: 'unknown_error'
        };
    }
    async getFeatureFlagStateless(key, distinctId, groups = {}, personProperties = {}, groupProperties = {}, disableGeoip) {
        await this._initPromise;
        const flagDetailResponse = await this.getFeatureFlagDetailStateless(key, distinctId, groups, personProperties, groupProperties, disableGeoip);
        if (void 0 === flagDetailResponse) return {
            response: void 0,
            requestId: void 0
        };
        let response = getFeatureFlagValue(flagDetailResponse.response);
        if (void 0 === response) response = false;
        return {
            response,
            requestId: flagDetailResponse.requestId
        };
    }
    async getFeatureFlagDetailStateless(key, distinctId, groups = {}, personProperties = {}, groupProperties = {}, disableGeoip) {
        await this._initPromise;
        const flagsResponse = await this.getFeatureFlagDetailsStateless(distinctId, groups, personProperties, groupProperties, disableGeoip, [
            key
        ]);
        if (void 0 === flagsResponse) return;
        const featureFlags = flagsResponse.flags;
        const flagDetail = featureFlags[key];
        return {
            response: flagDetail,
            requestId: flagsResponse.requestId,
            evaluatedAt: flagsResponse.evaluatedAt
        };
    }
    async getFeatureFlagPayloadStateless(key, distinctId, groups = {}, personProperties = {}, groupProperties = {}, disableGeoip) {
        await this._initPromise;
        const payloads = await this.getFeatureFlagPayloadsStateless(distinctId, groups, personProperties, groupProperties, disableGeoip, [
            key
        ]);
        if (!payloads) return;
        const response = payloads[key];
        if (void 0 === response) return null;
        return response;
    }
    async getFeatureFlagPayloadsStateless(distinctId, groups = {}, personProperties = {}, groupProperties = {}, disableGeoip, flagKeysToEvaluate) {
        await this._initPromise;
        const payloads = (await this.getFeatureFlagsAndPayloadsStateless(distinctId, groups, personProperties, groupProperties, disableGeoip, flagKeysToEvaluate)).payloads;
        return payloads;
    }
    async getFeatureFlagsStateless(distinctId, groups = {}, personProperties = {}, groupProperties = {}, disableGeoip, flagKeysToEvaluate) {
        await this._initPromise;
        return await this.getFeatureFlagsAndPayloadsStateless(distinctId, groups, personProperties, groupProperties, disableGeoip, flagKeysToEvaluate);
    }
    async getFeatureFlagsAndPayloadsStateless(distinctId, groups = {}, personProperties = {}, groupProperties = {}, disableGeoip, flagKeysToEvaluate) {
        await this._initPromise;
        const featureFlagDetails = await this.getFeatureFlagDetailsStateless(distinctId, groups, personProperties, groupProperties, disableGeoip, flagKeysToEvaluate);
        if (!featureFlagDetails) return {
            flags: void 0,
            payloads: void 0,
            requestId: void 0
        };
        return {
            flags: featureFlagDetails.featureFlags,
            payloads: featureFlagDetails.featureFlagPayloads,
            requestId: featureFlagDetails.requestId
        };
    }
    async getFeatureFlagDetailsStateless(distinctId, groups = {}, personProperties = {}, groupProperties = {}, disableGeoip, flagKeysToEvaluate) {
        await this._initPromise;
        const extraPayload = {
            geoip_disable: disableGeoip ?? this.disableGeoip
        };
        if (flagKeysToEvaluate) extraPayload['flag_keys_to_evaluate'] = flagKeysToEvaluate;
        const result = await this.getFlags(distinctId, groups, personProperties, groupProperties, extraPayload);
        if (!result.success) return;
        const flagsResponse = result.response;
        if (flagsResponse.errorsWhileComputingFlags) console.error('[FEATURE FLAGS] Error while computing feature flags, some flags may be missing or incorrect. Learn more at https://posthog.com/docs/feature-flags/best-practices');
        if (flagsResponse.quotaLimited?.includes("feature_flags")) {
            console.warn('[FEATURE FLAGS] Feature flags quota limit exceeded - feature flags unavailable. Learn more about billing limits at https://posthog.com/docs/billing/limits-alerts');
            return {
                flags: {},
                featureFlags: {},
                featureFlagPayloads: {},
                requestId: flagsResponse?.requestId,
                quotaLimited: flagsResponse.quotaLimited
            };
        }
        return flagsResponse;
    }
    async getSurveysStateless() {
        await this._initPromise;
        if (this.disabled) return [];
        if (true === this.disableSurveys) {
            this._logger.info('Loading surveys is disabled.');
            return [];
        }
        const url = `${this.host}/api/surveys/?token=${this.projectToken}`;
        const fetchOptions = {
            method: 'GET',
            headers: {
                ...this.getCustomHeaders(),
                'Content-Type': 'application/json'
            }
        };
        const response = await this.fetchWithRetry(url, fetchOptions, {
            type: 'required',
            consume: (response)=>{
                if (200 !== response.status || !response.json) {
                    const msg = `Surveys API could not be loaded: ${response.status}`;
                    const error = new Error(msg);
                    this._logger.error(error);
                    this._events.emit('error', new Error(msg));
                    return Promise.resolve(void 0);
                }
                return response.json();
            }
        }).catch((error)=>{
            this._logger.error('Surveys API could not be loaded', error);
            this._events.emit('error', error);
        });
        const newSurveys = response?.surveys;
        if (newSurveys) this._logger.info('Surveys fetched from API: ', JSON.stringify(newSurveys));
        return newSurveys ?? [];
    }
    get props() {
        if (!this._props) this._props = this.getPersistedProperty(PostHogPersistedProperty.Props);
        return this._props || {};
    }
    set props(val) {
        this._props = val;
    }
    async register(properties) {
        this.wrap(()=>{
            this.props = {
                ...this.props,
                ...properties
            };
            this.setPersistedProperty(PostHogPersistedProperty.Props, this.props);
        });
    }
    async unregister(property) {
        this.wrap(()=>{
            delete this.props[property];
            this.setPersistedProperty(PostHogPersistedProperty.Props, this.props);
        });
    }
    processBeforeEnqueue(message) {
        return message;
    }
    async flushStorage() {}
    getQueueRouteKey(_message) {
        return DEFAULT_QUEUE_ROUTE;
    }
    persistedQueueKeyForRoute(_route) {
        return PostHogPersistedProperty.Queue;
    }
    getActiveQueueRoutes() {
        return [
            DEFAULT_QUEUE_ROUTE
        ];
    }
    getRouteQueue(route) {
        return this.getPersistedProperty(this.persistedQueueKeyForRoute(route)) || [];
    }
    enqueue(type, _message, options, explicitRoute) {
        this.wrap(()=>{
            if (this.optedOut) return void this._events.emit(type, "Library is disabled. Not sending event. To re-enable, call posthog.optIn()");
            let message = this.prepareMessage(_message, options);
            message = this.processBeforeEnqueue(message);
            if (null === message) return;
            message = this.normalizeMessage(message);
            const queueKey = this.persistedQueueKeyForRoute(explicitRoute ?? this.getQueueRouteKey(message));
            const queue = this.getPersistedProperty(queueKey) || [];
            if (queue.length >= this.maxQueueSize) {
                queue.shift();
                this._logger.warn('Queue is full, the oldest event is dropped.');
            }
            queue.push({
                message
            });
            this.setPersistedProperty(queueKey, queue);
            this._events.emit(type, message);
            if (queue.length >= this.flushAt) this.flushBackground();
            if (this.flushInterval && !this._flushTimer) this._flushTimer = safeSetTimeout(()=>this.flushBackground(), this.flushInterval);
        });
    }
    async sendImmediate(type, _message, options, explicitRoute) {
        if (this.disabled) return void this._logger.warn('The client is disabled');
        if (!this._isInitialized) await this._initPromise;
        if (this.optedOut) return void this._events.emit(type, "Library is disabled. Not sending event. To re-enable, call posthog.optIn()");
        let message = this.prepareMessage(_message, options);
        message = this.processBeforeEnqueue(message);
        if (null === message) return;
        message = this.normalizeMessage(message);
        try {
            await this.sendBatch([
                message
            ], void 0, explicitRoute ?? this.getQueueRouteKey(message));
        } catch (err) {
            this._events.emit('error', err);
        }
    }
    normalizeMessage(message) {
        const { type: _type, library, library_version, ...sanitizedMessage } = message;
        let properties = isPostHogEventProperties(sanitizedMessage.properties) ? sanitizedMessage.properties : void 0;
        if (void 0 !== library && properties?.$lib === void 0) properties = {
            ...properties || {},
            $lib: library
        };
        if (void 0 !== library_version && properties?.$lib_version === void 0) properties = {
            ...properties || {},
            $lib_version: library_version
        };
        if (properties) sanitizedMessage.properties = properties;
        sanitizedMessage.uuid = getEventUuid(sanitizedMessage.uuid, uuidv7);
        return sanitizedMessage;
    }
    normalizeTimestampForWire(timestamp) {
        const parsedTimestamp = timestamp instanceof Date ? timestamp : 'string' == typeof timestamp ? new Date(timestamp) : null;
        if (!parsedTimestamp || Number.isNaN(parsedTimestamp.getTime())) return timestamp;
        const normalized = parsedTimestamp.toISOString();
        const fractionalSeconds = 'string' == typeof timestamp ? timestamp.match(/\.(\d+)(?:Z|[+-]\d{2}:?\d{2})?$/i)?.[1] : void 0;
        return fractionalSeconds && fractionalSeconds.length > 3 ? normalized.replace(/\.\d{3}Z$/, `.${fractionalSeconds}Z`) : normalized;
    }
    prepareMessage(_message, options) {
        const message = {
            ..._message,
            timestamp: options?.timestamp ? options?.timestamp : currentISOTime(),
            uuid: getEventUuid(options?.uuid, uuidv7)
        };
        const addGeoipDisableProperty = options?.disableGeoip ?? this.disableGeoip;
        if (addGeoipDisableProperty) {
            if (!isPostHogEventProperties(message.properties)) message.properties = {};
            message.properties['$geoip_disable'] = true;
        }
        if (message.distinctId) {
            message.distinct_id = message.distinctId;
            delete message.distinctId;
        }
        return message;
    }
    clearFlushTimer() {
        if (this._flushTimer) {
            clearTimeout(this._flushTimer);
            this._flushTimer = void 0;
        }
    }
    flushBackground() {
        if (this.pendingFlushPromise) return;
        this.flushAutomatic().catch(async (err)=>{
            await logFlushError(err);
        });
    }
    flushAutomatic() {
        return this.flush();
    }
    async waitForPendingPromises(maxPromiseId, ignoredPromises = []) {
        const ignoredPendingPromises = ignoredPromises.filter((promise)=>!!promise);
        let iteration = 0;
        while(true){
            const promises = this.promiseQueue.getPromises([
                ...ignoredPendingPromises,
                ...this.flushPromises
            ], maxPromiseId);
            if (0 === promises.length) return;
            if (iteration > 0) this._logger.debug(`flush() re-checking ${promises.length} pending promise(s) before flushing`);
            await Promise.all(promises.map((promise)=>promise.catch(()=>{})));
            iteration++;
        }
    }
    flushWithPendingPromises() {
        return this.flushInternal(true);
    }
    flush() {
        return this.flushInternal(false);
    }
    flushInternal(waitForPendingPromises) {
        if (this.disabled) return Promise.resolve();
        if (!waitForPendingPromises && this.pendingFlushPromise) return this.pendingFlushPromise;
        const previousFlushPromise = this.flushPromise;
        const maxPromiseId = this.promiseQueue.maxId;
        const nextFlushPromise = Promise.resolve().then(()=>{
            if (waitForPendingPromises) return this.waitForPendingPromises(maxPromiseId, [
                previousFlushPromise,
                nextFlushPromise
            ]);
        }).then(()=>allSettled([
                previousFlushPromise
            ])).then(()=>{
            if (this.pendingFlushPromise === nextFlushPromise) this.pendingFlushPromise = null;
            return this._flush();
        });
        this.pendingFlushPromise = nextFlushPromise;
        this.flushPromise = nextFlushPromise;
        this.flushPromises.add(nextFlushPromise);
        this.addPendingPromise(nextFlushPromise);
        allSettled([
            nextFlushPromise
        ]).then(()=>{
            this.flushPromises.delete(nextFlushPromise);
            if (this.pendingFlushPromise === nextFlushPromise) this.pendingFlushPromise = null;
            if (this.flushPromise === nextFlushPromise) this.flushPromise = null;
        });
        return nextFlushPromise;
    }
    getCustomHeaders() {
        const customUserAgent = this.getCustomUserAgent();
        const headers = {};
        if (customUserAgent && '' !== customUserAgent) headers['User-Agent'] = customUserAgent;
        return headers;
    }
    compressPayload(payload) {
        return gzipCompress(payload, this.isDebug);
    }
    getBatchEndpointPath(_route) {
        return '/batch/';
    }
    async sendBatch(batchMessages, retryOptions, route = DEFAULT_QUEUE_ROUTE) {
        const data = {
            api_key: this.projectToken,
            batch: batchMessages.map((message)=>{
                if (!message) return message;
                const timestamp = this.normalizeTimestampForWire(message.timestamp);
                return timestamp === message.timestamp ? message : {
                    ...message,
                    timestamp
                };
            }),
            sent_at: currentISOTime()
        };
        if (this.historicalMigration) data.historical_migration = true;
        const payload = safeJsonStringify(data);
        const url = `${this.host}${this.getBatchEndpointPath(route)}`;
        const gzippedPayload = this.disableCompression ? null : await this.compressPayload(payload);
        const fetchOptions = {
            method: 'POST',
            headers: {
                ...this.getCustomHeaders(),
                'Content-Type': 'application/json',
                ...null !== gzippedPayload && {
                    'Content-Encoding': 'gzip'
                }
            },
            body: gzippedPayload || payload
        };
        await this.fetchWithRetry(url, fetchOptions, {
            type: 'successful-write'
        }, retryOptions);
    }
    async _flush() {
        this.clearFlushTimer();
        await this._initPromise;
        const routes = this.getActiveQueueRoutes();
        if (!routes.some((route)=>this.getRouteQueue(route).length > 0)) return;
        const sentMessages = [];
        let firstError;
        for (const route of routes)try {
            await this._flushRoute(route, sentMessages);
        } catch (err) {
            if (void 0 === firstError) firstError = err;
        }
        if (void 0 !== firstError) throw firstError;
        this._events.emit('flush', sentMessages);
    }
    async _flushRoute(route, sentMessages) {
        const queueKey = this.persistedQueueKeyForRoute(route);
        let queue = this.getPersistedProperty(queueKey) || [];
        if (!queue.length) return;
        const originalQueueLength = queue.length;
        let sentFromRoute = 0;
        while(queue.length > 0 && sentFromRoute < originalQueueLength){
            const batchItems = queue.slice(0, this.maxBatchSize);
            const batchMessages = batchItems.map((item)=>void 0 === item.message ? item.message : this.normalizeMessage(item.message));
            const persistQueueChange = async ()=>{
                const refreshedQueue = this.getPersistedProperty(queueKey) || [];
                const remainingBatchItems = [
                    ...batchItems
                ];
                const newQueue = refreshedQueue.filter((item)=>{
                    const itemUuid = item.message?.uuid;
                    const batchItemIndex = remainingBatchItems.findIndex((batchItem)=>batchItem === item || 'string' == typeof itemUuid && itemUuid.length > 0 && batchItem.message?.uuid === itemUuid);
                    if (-1 === batchItemIndex) return true;
                    remainingBatchItems.splice(batchItemIndex, 1);
                    return false;
                });
                this.setPersistedProperty(queueKey, newQueue);
                queue = newQueue;
                this._dequeuedMessagesCount += batchItems.length;
                await this.flushStorage();
            };
            const retryOptions = {
                retryCheck: (err)=>{
                    if (isPostHogFetchContentTooLargeError(err)) return false;
                    return isPostHogFetchRetryableError(err);
                }
            };
            try {
                await this.sendBatch(batchMessages, retryOptions, route);
            } catch (err) {
                if (isPostHogFetchContentTooLargeError(err) && batchMessages.length > 1) {
                    this.maxBatchSize = Math.max(1, Math.floor(batchMessages.length / 2));
                    this._logger.warn(`Received 413 when sending batch of size ${batchMessages.length}, reducing batch size to ${this.maxBatchSize}`);
                    continue;
                }
                if (!(err instanceof PostHogFetchNetworkError)) await persistQueueChange();
                this._events.emit('error', err);
                throw err;
            }
            await persistQueueChange();
            sentMessages.push(...batchMessages);
            sentFromRoute += batchMessages.length;
        }
    }
    async _sendOtlpBatch({ path, auth, payload }) {
        if (this.disabled) return {
            kind: 'fatal',
            error: new Error('The client is disabled')
        };
        let serialized;
        try {
            serialized = JSON.stringify(payload);
        } catch (error) {
            this.logMsgIfDebug(()=>console.warn(`[PostHog] Could not serialize a ${path} batch; reporting it as too large`, error));
            return {
                kind: 'too-large',
                measuredLocally: true
            };
        }
        const payloadBytes = byteLengthOf(serialized);
        if (payloadBytes > OTLP_MAX_BODY_BYTES) {
            this.logMsgIfDebug(()=>console.warn(`[PostHog] Not sending a ${path} batch of ${payloadBytes} bytes: the endpoint accepts at most ${OTLP_MAX_BODY_BYTES}`));
            return {
                kind: 'too-large',
                measuredLocally: true
            };
        }
        const url = 'bearer' === auth ? `${this.host}/i/v1/${path}` : `${this.host}/i/v1/${path}?token=${encodeURIComponent(this.projectToken)}`;
        const gzippedPayload = this.disableCompression ? null : await this.compressPayload(serialized);
        const body = gzippedPayload || serialized;
        const fetchOptions = {
            method: 'POST',
            headers: {
                ...this.getCustomHeaders(),
                'Content-Type': 'application/json',
                ...'bearer' === auth && {
                    Authorization: `Bearer ${this.projectToken}`
                },
                ...null !== gzippedPayload && {
                    'Content-Encoding': 'gzip'
                }
            },
            body
        };
        try {
            await this.fetchWithRetry(url, fetchOptions, {
                type: 'successful-write'
            }, {
                retryCheck: (err)=>{
                    if (isPostHogFetchContentTooLargeError(err)) return false;
                    if (err instanceof PostHogFetchHttpError && void 0 !== err.retryAfterMs) return false;
                    return isPostHogFetchRetryableError(err);
                }
            });
            return {
                kind: 'ok'
            };
        } catch (err) {
            if (isPostHogFetchContentTooLargeError(err)) return {
                kind: 'too-large'
            };
            if (isPostHogFetchRetryableError(err)) {
                const retryAfterMs = err instanceof PostHogFetchHttpError ? err.retryAfterMs : void 0;
                return {
                    kind: 'retry-later',
                    error: err,
                    ...void 0 !== retryAfterMs && {
                        retryAfterMs
                    }
                };
            }
            return {
                kind: 'fatal',
                error: err
            };
        }
    }
    async _sendLogsBatch(payload) {
        return this._sendOtlpBatch({
            path: 'logs',
            auth: 'query-token',
            payload
        });
    }
    async _sendMetricsBatch(payload) {
        return this._sendOtlpBatch({
            path: 'metrics',
            auth: 'query-token',
            payload
        });
    }
    async _sendTracesBatch(payload) {
        return this._sendOtlpBatch({
            path: 'traces',
            auth: 'bearer',
            payload
        });
    }
    async fetchWithRetry(url, options, responseHandling, retryOptions, requestTimeout) {
        const body = options.body ? options.body : '';
        const reqByteLength = byteLengthOf(body);
        const retriableOptions = {
            ...this._retryOptions,
            ...retryOptions
        };
        let attempt = 0;
        return await retriable(async ()=>{
            attempt++;
            const ctrl = new AbortController();
            const timeoutMs = requestTimeout ?? this.requestTimeout;
            const requestDeadline = Date.now() + timeoutMs;
            let timer;
            const deadline = new Promise((_resolve, reject)=>{
                timer = safeSetTimeout(()=>{
                    const timeoutError = createNamedError('AbortError', `Request timed out after ${timeoutMs}ms`);
                    reject(timeoutError);
                    ctrl.abort(timeoutError);
                }, timeoutMs);
            });
            let res;
            let responseAccepted = false;
            let cancellation;
            const cancelBody = ()=>cancellation ??= (async ()=>{
                    try {
                        await res?.body?.cancel();
                    } catch  {}
                })();
            try {
                let fetchPromise;
                try {
                    fetchPromise = this.fetch(url, {
                        signal: ctrl.signal,
                        ...options
                    });
                } catch (e) {
                    throw new PostHogFetchNetworkError(e);
                }
                fetchPromise.then((lateResponse)=>{
                    if (ctrl.signal.aborted && !responseAccepted) Promise.resolve(lateResponse.body?.cancel()).catch(()=>{});
                }).catch(()=>{});
                try {
                    res = await Promise.race([
                        fetchPromise,
                        deadline
                    ]);
                    responseAccepted = true;
                } catch (e) {
                    throw new PostHogFetchNetworkError(e);
                }
                const isNoCors = 'no-cors' === options.mode;
                const maxSuccessStatus = 'successful-write' === responseHandling.type ? 300 : 400;
                if (!isNoCors && (res.status < 200 || res.status >= maxSuccessStatus)) throw new PostHogFetchHttpError(res, reqByteLength, requestDeadline, ctrl);
                if ('successful-write' === responseHandling.type) {
                    try {
                        await Promise.race([
                            cancelBody(),
                            deadline
                        ]);
                    } catch  {}
                    return;
                }
                try {
                    return await Promise.race([
                        responseHandling.consume(res),
                        deadline
                    ]);
                } catch (e) {
                    if (ctrl.signal.aborted) throw new PostHogFetchNetworkError(e);
                    throw e;
                }
            } finally{
                clearTimeout(timer);
                if (ctrl.signal.aborted && res) cancelBody();
            }
        }, {
            ...retriableOptions,
            retryCheck: (error)=>{
                const shouldRetry = retriableOptions.retryCheck(error);
                if (shouldRetry && attempt <= retriableOptions.retryCount && error instanceof PostHogFetchHttpError) error.cancelResponseBody();
                return shouldRetry;
            }
        });
    }
    async _shutdown(shutdownTimeoutMs = 30000) {
        await this._initPromise;
        let hasTimedOut = false;
        this.clearFlushTimer();
        if (this.disabled) return;
        const doShutdown = async ()=>{
            try {
                await this.promiseQueue.join();
                while(true){
                    const hasQueuedEvents = this.getActiveQueueRoutes().some((route)=>this.getRouteQueue(route).length > 0);
                    if (!hasQueuedEvents) break;
                    const dequeuedBeforeFlush = this._dequeuedMessagesCount;
                    await this.flush();
                    if (hasTimedOut) break;
                    if (this._dequeuedMessagesCount === dequeuedBeforeFlush) {
                        this._logger.warn('Shutdown flush completed but did not send any queued events. Stopping drain to avoid a loop.');
                        break;
                    }
                }
            } catch (e) {
                if (!isPostHogFetchError(e)) throw e;
                await logFlushError(e);
            }
        };
        return raceWithTimeout(doShutdown(), shutdownTimeoutMs, ()=>{
            this._logger.critical('Timeout while shutting down PostHog. Some events may not have been sent.', {
                shutdownTimeoutMs
            });
            hasTimedOut = true;
        });
    }
    async shutdown(shutdownTimeoutMs = 30000) {
        if (this.shutdownPromise) this._logger.warn('shutdown() called while already shutting down. shutdown() is meant to be called once before process exit - use flush() for per-request cleanup');
        else this.shutdownPromise = this._shutdown(shutdownTimeoutMs).finally(()=>{
            this.shutdownPromise = null;
        });
        return this.shutdownPromise;
    }
}
export { PostHogCoreStateless, applyCallerFeatureFlagOverrides, isPostHogFetchContentTooLargeError, isPostHogFetchNetworkError, logFlushError, maybeAdd, posthog_core_stateless_QuotaLimitedFeature as QuotaLimitedFeature };
