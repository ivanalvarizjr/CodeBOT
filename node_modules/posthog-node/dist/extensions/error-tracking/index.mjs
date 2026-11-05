import { capturePendingExceptions, claimExplicitCapture, startExceptionAutocapture } from "./autocapture.mjs";
import { snapshotEventContext } from "../context/event-context.mjs";
import { BucketedRateLimiter, ErrorTracking, isObject, resolveExceptionRateLimiterConfig } from "@posthog/core";
const SHUTDOWN_TIMEOUT = 2000;
class error_tracking_ErrorTracking {
    constructor(client, options, _logger){
        this.client = client;
        this._exceptionAutocaptureEnabled = options.enableExceptionAutocapture || false;
        this._logger = _logger;
        this._rateLimiter = new BucketedRateLimiter({
            ...resolveExceptionRateLimiterConfig(options),
            refillInterval: 10000,
            _logger: this._logger
        });
        this.startAutocaptureIfEnabled();
    }
    static isPreviouslyCapturedError(x) {
        return isObject(x) && '__posthog_previously_captured_error' in x && true === x.__posthog_previously_captured_error;
    }
    static async buildEventMessage(builder, error, hint, distinctId, additionalProperties, context) {
        const applyContextSnapshot = snapshotEventContext(context);
        const properties = {
            ...additionalProperties
        };
        const exceptionProperties = builder.buildFromUnknown(error, hint);
        exceptionProperties.$exception_list = await builder.modifyFrames(exceptionProperties.$exception_list);
        const injectedReleaseId = ErrorTracking.getInjectedReleaseId();
        if (injectedReleaseId) properties.$release_id = injectedReleaseId;
        return applyContextSnapshot({
            event: '$exception',
            distinctId: distinctId,
            properties: {
                ...exceptionProperties,
                ...properties
            },
            _originatedFromCaptureException: true
        });
    }
    get destinationKey() {
        return `${this.client.apiKey}@${this.client.host}`;
    }
    startAutocaptureIfEnabled() {
        if (this.isEnabled()) {
            this._autocaptureClient = {
                key: this.destinationKey,
                capture: (exception, hint)=>this.onException(exception, hint),
                getContext: ()=>this.client.getContext(),
                flush: ()=>this.client.flush(),
                shutdown: ()=>this.client.shutdown(SHUTDOWN_TIMEOUT)
            };
            this._stopAutocapture = startExceptionAutocapture(this._autocaptureClient);
        }
    }
    claimExplicitCapture(error) {
        return claimExplicitCapture(error, this.destinationKey);
    }
    capturePendingExceptions() {
        for (const owner of capturePendingExceptions())if (owner !== this._autocaptureClient) this.client.addPendingPromise(owner.flush().catch(()=>void 0));
    }
    onException(exception, hint) {
        this.client.addPendingPromise((async ()=>{
            if (!error_tracking_ErrorTracking.isPreviouslyCapturedError(exception)) {
                const eventMessage = await error_tracking_ErrorTracking.buildEventMessage(this.client.getErrorPropertiesBuilder(), exception, hint, void 0, void 0, this.client.getContext());
                const exceptionProperties = eventMessage.properties;
                const exceptionType = exceptionProperties?.$exception_list[0]?.type ?? 'Exception';
                const isRateLimited = this._rateLimiter.consumeRateLimit(exceptionType);
                if (isRateLimited) return void this._logger.info('Skipping exception capture because of client rate limiting.', {
                    exception: exceptionType
                });
                return this.client._capturePreparedEvent(eventMessage, false);
            }
        })().catch((error)=>{
            this._logger.error('Failed to capture an exception:', error);
        }));
    }
    isEnabled() {
        return !this.client.isDisabled && this._exceptionAutocaptureEnabled;
    }
    shutdown() {
        this._rateLimiter.stop();
        this.capturePendingExceptions();
        this._stopAutocapture?.();
        this._stopAutocapture = void 0;
    }
}
export default error_tracking_ErrorTracking;
