import type { OtlpLogsPayload, OtlpMetricsPayload, OtlpTracesPayload } from '@posthog/types';
import type { SendMetricsBatchOutcome } from './metrics/types';
import type { SendTracesBatchOutcome } from './traces/types';
import { SimpleEventEmitter } from './eventemitter';
import { PostHogFlagsResponse, PostHogCoreOptions, PostHogEventProperties, PostHogCaptureOptions, JsonType, PostHogRemoteConfig, FeatureFlagValue, PostHogFeatureFlagDetails, FeatureFlagDetail, SurveyResponse, PostHogFetchResponse, PostHogFetchBodyBytes, PostHogFetchOptions, PostHogPersistedProperty, Logger, GetFlagsResult } from './types';
import { RetriableOptions } from './utils';
import { ErrorPropertiesBuilder } from './error-tracking';
declare class PostHogFetchHttpError extends Error {
    response: PostHogFetchResponse;
    reqByteLength: number;
    private responseBodyDeadline;
    private abortController;
    name: string;
    private responseBodyTextPromise?;
    private responseBodyTimer?;
    private _bodyReadTimedOut;
    constructor(response: PostHogFetchResponse, reqByteLength: number, responseBodyDeadline: number, abortController: AbortController);
    get status(): number;
    /**
     * The response's `Retry-After` as milliseconds from now, when it sent a usable
     * one, clamped to `MAX_RETRY_AFTER_MS`.
     */
    get retryAfterMs(): number | undefined;
    get bodyReadTimedOut(): boolean;
    get text(): Promise<string>;
    get json(): Promise<any>;
    cancelResponseBody(reason?: unknown): void;
}
declare class PostHogFetchNetworkError extends Error {
    error: unknown;
    name: string;
    constructor(error: unknown);
}
export declare const maybeAdd: (key: string, value: JsonType | undefined) => Record<string, JsonType>;
export declare const applyCallerFeatureFlagOverrides: (target: PostHogEventProperties, callerProperties: PostHogEventProperties) => void;
export declare function logFlushError(err: any): Promise<void>;
/**
 * True for the network error PostHog throws when a request fails to reach the server
 * (e.g. the device is offline or the request times out). Exposed so SDKs that autocapture
 * errors can skip these expected connectivity failures instead of reporting them as
 * application exceptions.
 *
 * @public
 */
export declare function isPostHogFetchNetworkError(err: unknown): err is PostHogFetchNetworkError;
export declare function isPostHogFetchContentTooLargeError(err: unknown): err is PostHogFetchHttpError & {
    status: 413;
};
/**
 * Outcome of a logs batch send. Keeps HTTP error classification inside core so
 * PostHogLogs doesn't need to know about specific error types.
 *
 *   - ok            → records are accepted; drop them from the queue
 *   - too-large     → 413; caller should halve batch size and retry same records
 *   - retry-later   → retryable network or HTTP error; caller keeps records and retries next cycle
 *   - fatal         → anything else (auth, malformed, etc.); caller drops the
 *                     batch and surfaces the error
 */
export type SendLogsBatchOutcome = {
    kind: 'ok';
} | {
    kind: 'too-large';
    /**
     * True when the SDK measured the body itself rather than the endpoint
     * refusing it, so the caller can split this drain without lowering the
     * batch size it keeps between them.
     */
    measuredLocally?: boolean;
} | {
    kind: 'retry-later';
    error: unknown;
    retryAfterMs?: number;
} | {
    kind: 'fatal';
    error: unknown;
};
export declare enum QuotaLimitedFeature {
    FeatureFlags = "feature_flags",
    Recordings = "recordings"
}
export declare abstract class PostHogCoreStateless {
    readonly projectToken: string;
    readonly host: string;
    readonly flushAt: number;
    readonly preloadFeatureFlags: boolean;
    readonly disableSurveys: boolean;
    private maxBatchSize;
    private maxQueueSize;
    private flushInterval;
    private flushPromise;
    private pendingFlushPromise;
    private flushPromises;
    private _dequeuedMessagesCount;
    private shutdownPromise;
    protected requestTimeout: number;
    private featureFlagsRequestTimeoutMs;
    private featureFlagsRequestMaxRetries;
    private remoteConfigRequestTimeoutMs;
    private removeDebugCallback?;
    private disableGeoip;
    protected historicalMigration: boolean;
    private evaluationContexts?;
    protected disabled: boolean;
    protected disableCompression: boolean;
    private defaultOptIn;
    private promiseQueue;
    protected _events: SimpleEventEmitter;
    protected _flushTimer?: any;
    protected _retryOptions: RetriableOptions;
    protected _initPromise: Promise<void>;
    protected _isInitialized: boolean;
    protected _remoteConfigResponsePromise?: Promise<PostHogRemoteConfig | undefined>;
    protected _logger: Logger;
    private _errorPropertiesBuilder?;
    /**
     * Returns the builder used by `captureException` to coerce arbitrary inputs into a
     * structured `$exception_list` (with parsed stack frames).
     *
     * @internal Exposed for cross-package use within this SDK; not part of the stable public API.
     */
    getErrorPropertiesBuilder(): ErrorPropertiesBuilder;
    /**
     * Override in subclasses to plug in platform-specific stack parsers (e.g. node, hermes),
     * additional coercers (DOMException, ErrorEvent, PromiseRejectionEvent), or async frame
     * modifiers (source maps, context lines).
     *
     * The default is intentionally JS-runtime-agnostic — no DOM-typed coercers — so any SDK
     * that just extends core gets parsed stack frames out of the box.
     */
    protected createErrorPropertiesBuilder(): ErrorPropertiesBuilder;
    abstract fetch(url: string, options: PostHogFetchOptions): Promise<PostHogFetchResponse>;
    abstract getLibraryId(): string;
    abstract getLibraryVersion(): string;
    abstract getCustomUserAgent(): string | void;
    /**
     * The runtime this client evaluates flags in, sent as `evaluation_runtime` on `/flags`
     * requests so the server filters by a declared runtime instead of inferring one from
     * request headers. Undefined leaves the server's inference in place.
     */
    protected getEvaluationRuntime(): 'all' | 'client' | 'server' | undefined;
    abstract getPersistedProperty<T>(key: PostHogPersistedProperty): T | undefined;
    abstract setPersistedProperty<T>(key: PostHogPersistedProperty, value: T | null): void;
    /** The project token the client was created with. Same value as `projectToken`. */
    get apiKey(): string;
    constructor(projectToken: string, options?: PostHogCoreOptions);
    protected logMsgIfDebug(fn: () => void): void;
    protected wrap(fn: () => void): void;
    protected getCommonEventProperties(): PostHogEventProperties;
    get optedOut(): boolean;
    optIn(): Promise<void>;
    optOut(): Promise<void>;
    on(event: string, cb: (...args: any[]) => void): () => void;
    /**
     * Enables or disables debug mode for detailed logging.
     *
     * @remarks
     * Debug mode logs all PostHog calls to the console for troubleshooting.
     * This is useful during development to understand what data is being sent.
     *
     * {@label Initialization}
     *
     * @example
     * ```js
     * // enable debug mode
     * posthog.debug(true)
     * ```
     *
     * @example
     * ```js
     * // disable debug mode
     * posthog.debug(false)
     * ```
     *
     * @public
     *
     * @param {boolean} [debug] If true, will enable debug mode.
     */
    debug(enabled?: boolean): void;
    get isDebug(): boolean;
    get isDisabled(): boolean;
    private buildPayload;
    /**
     * Merges the common PostHog properties into an event's properties. Stateless clients stamp them
     * last, so callers can't override them.
     */
    protected mergeCommonEventProperties(properties: PostHogEventProperties): PostHogEventProperties;
    /**
     * Whether the server has gated this project into minimal `$feature_flag_called` events.
     * Overridden by clients that persist the gate from the v2 `/flags` response
     * (`minimalFlagCalledEvents`). The base implementation fails safe to full events.
     */
    protected isMinimalFlagCalledEventsEnabled(): boolean;
    /**
     * @internal
     */
    addPendingPromise<T>(promise: Promise<T>): Promise<T>;
    /***
     *** TRACKING
     ***/
    protected identifyStateless(distinctId: string, properties?: PostHogEventProperties, options?: PostHogCaptureOptions): void;
    protected identifyStatelessImmediate(distinctId: string, properties?: PostHogEventProperties, options?: PostHogCaptureOptions): Promise<void>;
    protected captureStateless(distinctId: string, event: string, properties?: PostHogEventProperties, options?: PostHogCaptureOptions): void;
    protected captureStatelessImmediate(distinctId: string, event: string, properties?: PostHogEventProperties, options?: PostHogCaptureOptions): Promise<void>;
    protected aliasStateless(alias: string, distinctId: string, properties?: PostHogEventProperties, options?: PostHogCaptureOptions): void;
    protected aliasStatelessImmediate(alias: string, distinctId: string, properties?: PostHogEventProperties, options?: PostHogCaptureOptions): Promise<void>;
    /***
     *** GROUPS
     ***/
    protected groupIdentifyStateless(groupType: string, groupKey: string | number, groupProperties?: PostHogEventProperties, options?: PostHogCaptureOptions, distinctId?: string, eventProperties?: PostHogEventProperties): void;
    protected groupIdentifyStatelessImmediate(groupType: string, groupKey: string | number, groupProperties?: PostHogEventProperties, options?: PostHogCaptureOptions, distinctId?: string, eventProperties?: PostHogEventProperties): Promise<void>;
    protected getRemoteConfig(): Promise<PostHogRemoteConfig | undefined>;
    /***
     *** FEATURE FLAGS
     ***/
    protected getFlags(distinctId: string, groups?: Record<string, string | number>, personProperties?: Record<string, string>, groupProperties?: Record<string, Record<string, string>>, extraPayload?: Record<string, any>, fetchConfig?: boolean): Promise<GetFlagsResult>;
    private categorizeRequestError;
    protected getFeatureFlagStateless(key: string, distinctId: string, groups?: Record<string, string>, personProperties?: Record<string, string>, groupProperties?: Record<string, Record<string, string>>, disableGeoip?: boolean): Promise<{
        response: FeatureFlagValue | undefined;
        requestId: string | undefined;
    }>;
    protected getFeatureFlagDetailStateless(key: string, distinctId: string, groups?: Record<string, string>, personProperties?: Record<string, string>, groupProperties?: Record<string, Record<string, string>>, disableGeoip?: boolean): Promise<{
        response: FeatureFlagDetail | undefined;
        requestId: string | undefined;
        evaluatedAt: number | undefined;
    } | undefined>;
    protected getFeatureFlagPayloadStateless(key: string, distinctId: string, groups?: Record<string, string>, personProperties?: Record<string, string>, groupProperties?: Record<string, Record<string, string>>, disableGeoip?: boolean): Promise<JsonType | undefined>;
    protected getFeatureFlagPayloadsStateless(distinctId: string, groups?: Record<string, string>, personProperties?: Record<string, string>, groupProperties?: Record<string, Record<string, string>>, disableGeoip?: boolean, flagKeysToEvaluate?: string[]): Promise<PostHogFlagsResponse['featureFlagPayloads'] | undefined>;
    protected getFeatureFlagsStateless(distinctId: string, groups?: Record<string, string | number>, personProperties?: Record<string, string>, groupProperties?: Record<string, Record<string, string>>, disableGeoip?: boolean, flagKeysToEvaluate?: string[]): Promise<{
        flags: PostHogFlagsResponse['featureFlags'] | undefined;
        payloads: PostHogFlagsResponse['featureFlagPayloads'] | undefined;
        requestId: PostHogFlagsResponse['requestId'] | undefined;
    }>;
    protected getFeatureFlagsAndPayloadsStateless(distinctId: string, groups?: Record<string, string | number>, personProperties?: Record<string, string>, groupProperties?: Record<string, Record<string, string>>, disableGeoip?: boolean, flagKeysToEvaluate?: string[]): Promise<{
        flags: PostHogFlagsResponse['featureFlags'] | undefined;
        payloads: PostHogFlagsResponse['featureFlagPayloads'] | undefined;
        requestId: PostHogFlagsResponse['requestId'] | undefined;
    }>;
    protected getFeatureFlagDetailsStateless(distinctId: string, groups?: Record<string, string | number>, personProperties?: Record<string, string>, groupProperties?: Record<string, Record<string, string>>, disableGeoip?: boolean, flagKeysToEvaluate?: string[]): Promise<PostHogFeatureFlagDetails | undefined>;
    /***
     *** SURVEYS
     ***/
    getSurveysStateless(): Promise<SurveyResponse['surveys']>;
    /***
     *** SUPER PROPERTIES
     ***/
    private _props;
    protected get props(): PostHogEventProperties;
    protected set props(val: PostHogEventProperties | undefined);
    register(properties: PostHogEventProperties): Promise<void>;
    unregister(property: string): Promise<void>;
    /***
     *** QUEUEING AND FLUSHING
     ***/
    /**
     * Hook that allows subclasses to transform or filter a message before it's queued.
     * Return null to drop the message.
     * @param message The prepared message
     * @returns The transformed message, or null to drop it
     */
    protected processBeforeEnqueue(message: PostHogEventProperties): PostHogEventProperties | null;
    /**
     * Hook that allows subclasses to wait for storage operations to complete.
     * This is called after queue changes are persisted during flush to ensure
     * data is safely written to storage before considering events as sent.
     *
     * Override this in implementations with async storage (e.g., React Native)
     * to prevent duplicate events on app crash/restart scenarios.
     */
    protected flushStorage(): Promise<void>;
    /**
     * Route a message to a named queue. Events sharing a route are batched, flushed, retried,
     * and persisted together, independently of other routes. The default keeps every event on a
     * single route (byte-identical to the pre-partitioning behavior); override to segregate a
     * subset of events onto their own queue and transport (see posthog-node's `$ai_*` routing).
     */
    protected getQueueRouteKey(_message: PostHogEventProperties): string;
    /**
     * Maps a route key to the persisted-storage key its queue lives under. The default route uses
     * the historical {@link PostHogPersistedProperty.Queue}; override to point other routes at their
     * own storage keys (e.g. {@link PostHogPersistedProperty.AiQueue}).
     */
    protected persistedQueueKeyForRoute(_route: string): PostHogPersistedProperty;
    /**
     * The set of routes that {@link _flush} and shutdown drain, in order. Must include every route
     * {@link getQueueRouteKey} can return. Defaults to the single default route.
     */
    protected getActiveQueueRoutes(): string[];
    private getRouteQueue;
    protected enqueue(type: string, _message: any, options?: PostHogCaptureOptions, explicitRoute?: string): void;
    protected sendImmediate(type: string, _message: any, options?: PostHogCaptureOptions, explicitRoute?: string): Promise<void>;
    private normalizeMessage;
    private normalizeTimestampForWire;
    protected prepareMessage(_message: any, options?: PostHogCaptureOptions): PostHogEventProperties;
    private clearFlushTimer;
    /**
     * Helper for flushing the queue in the background
     * Avoids unnecessary promise errors
     */
    private flushBackground;
    /**
     * The flush the SDK runs on its own, from the interval timer or the `flushAt`
     * threshold. Separate from `flush()` so a host can hold back work that an
     * endpoint has asked it to wait on, which an explicit flush overrides.
     */
    protected flushAutomatic(): Promise<void>;
    private waitForPendingPromises;
    /**
     * Flushes the queue of pending events.
     *
     * This function will return a promise that will resolve when the flush is complete,
     * or reject if there was an error (for example if the server or network is down).
     *
     * If there is already a flush in progress, this function will wait for that flush to complete.
     *
     * It's recommended to do error handling in the callback of the promise.
     *
     * {@label Initialization}
     *
     * @example
     * ```js
     * // flush with error handling
     * posthog.flush().then(() => {
     *   console.log('Flush complete')
     * }).catch((err) => {
     *   console.error('Flush failed', err)
     * })
     * ```
     *
     * @public
     *
     * @throws PostHogFetchHttpError
     * @throws PostHogFetchNetworkError
     * @throws Error
     */
    protected flushWithPendingPromises(): Promise<void>;
    flush(): Promise<void>;
    private flushInternal;
    protected getCustomHeaders(): {
        [key: string]: string;
    };
    /**
     * Compresses an outgoing payload. Runtime-specific clients can override this
     * to avoid using the Web Streams compression implementation.
     */
    protected compressPayload(payload: string): Promise<Blob | PostHogFetchBodyBytes | null>;
    protected getBatchEndpointPath(_route: string): string;
    /**
     * Builds and sends one `/batch/` request for the given already-normalized
     * messages, throwing on transport/HTTP error. Batch-size (413) shrinking,
     * queue persistence, and error recovery stay with the callers (`_flush` and
     * `sendImmediate`). This is the overridable seam that lets a subclass swap the
     * capture submission transport (e.g. Capture V1) for both the batched and the
     * immediate send paths at once.
     *
     * `route` identifies which queue route the batch came from (see
     * {@link getQueueRouteKey}); a subclass can dispatch to a different transport per
     * route. The default `/batch/` transport ignores it — every event is homogeneous.
     */
    protected sendBatch(batchMessages: (PostHogEventProperties | undefined)[], retryOptions?: Partial<RetriableOptions>, route?: string): Promise<void>;
    private _flush;
    private _flushRoute;
    /**
     * Shared implementation behind the three OTLP senders, which differ only in
     * path and auth style. Returns a tagged outcome instead of throwing so the
     * queue owners don't have to know the core's error class hierarchy.
     *
     * Exhausted 408/429/5xx stay `retry-later`, unlike the events `_flush()`
     * which drops anything that isn't a network error: every OTLP queue is
     * bounded and retried with backoff, so holding a batch through an outage can
     * neither grow without limit nor spin.
     */
    private _sendOtlpBatch;
    _sendLogsBatch(payload: OtlpLogsPayload): Promise<SendLogsBatchOutcome>;
    _sendMetricsBatch(payload: OtlpMetricsPayload): Promise<SendMetricsBatchOutcome>;
    /**
     * The `TracesHost._sendTracesBatch` implementation, so `PostHogTraces` can
     * use any core-based SDK as its host.
     *
     * Authenticates with `Authorization: Bearer` rather than the `?token=` query
     * parameter the logs and metrics senders use: it's the service's primary auth
     * path, and server runtimes have no CORS preflight to avoid.
     */
    _sendTracesBatch(payload: OtlpTracesPayload): Promise<SendTracesBatchOutcome>;
    private fetchWithRetry;
    _shutdown(shutdownTimeoutMs?: number): Promise<void>;
    /**
     * Shuts down the PostHog instance and ensures all events are sent.
     *
     * Call shutdown() once before the process exits to ensure that all events have been sent and all promises
     * have resolved. Do not use this function if you intend to keep using this PostHog instance after calling it.
     * Use flush() for per-request cleanup instead.
     *
     * {@label Initialization}
     *
     * @example
     * ```js
     * // shutdown before process exit
     * process.on('SIGINT', async () => {
     *   await posthog.shutdown()
     *   process.exit(0)
     * })
     * ```
     *
     * @public
     *
     * @param {number} [shutdownTimeoutMs=30000] Maximum time to wait for shutdown in milliseconds
     * @returns {Promise<void>} A promise that resolves when shutdown is complete
     */
    shutdown(shutdownTimeoutMs?: number): Promise<void>;
}
export {};
//# sourceMappingURL=posthog-core-stateless.d.ts.map