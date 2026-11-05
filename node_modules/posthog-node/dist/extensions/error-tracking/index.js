"use strict";
var __webpack_require__ = {};
(()=>{
    __webpack_require__.d = (exports1, getters, values)=>{
        var define = (defs, kind)=>{
            for(var key in defs)if (__webpack_require__.o(defs, key) && !__webpack_require__.o(exports1, key)) Object.defineProperty(exports1, key, {
                enumerable: true,
                [kind]: defs[key]
            });
        };
        define(getters, "get");
        define(values, "value");
    };
})();
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
(()=>{
    __webpack_require__.r = (exports1)=>{
        if ("u" > typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports1, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports1, '__esModule', {
            value: true
        });
    };
})();
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
    default: ()=>ErrorTracking
});
const external_autocapture_js_namespaceObject = require("./autocapture.js");
const event_context_js_namespaceObject = require("../context/event-context.js");
const core_namespaceObject = require("@posthog/core");
const SHUTDOWN_TIMEOUT = 2000;
class ErrorTracking {
    constructor(client, options, _logger){
        this.client = client;
        this._exceptionAutocaptureEnabled = options.enableExceptionAutocapture || false;
        this._logger = _logger;
        this._rateLimiter = new core_namespaceObject.BucketedRateLimiter({
            ...(0, core_namespaceObject.resolveExceptionRateLimiterConfig)(options),
            refillInterval: 10000,
            _logger: this._logger
        });
        this.startAutocaptureIfEnabled();
    }
    static isPreviouslyCapturedError(x) {
        return (0, core_namespaceObject.isObject)(x) && '__posthog_previously_captured_error' in x && true === x.__posthog_previously_captured_error;
    }
    static async buildEventMessage(builder, error, hint, distinctId, additionalProperties, context) {
        const applyContextSnapshot = (0, event_context_js_namespaceObject.snapshotEventContext)(context);
        const properties = {
            ...additionalProperties
        };
        const exceptionProperties = builder.buildFromUnknown(error, hint);
        exceptionProperties.$exception_list = await builder.modifyFrames(exceptionProperties.$exception_list);
        const injectedReleaseId = core_namespaceObject.ErrorTracking.getInjectedReleaseId();
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
            this._stopAutocapture = (0, external_autocapture_js_namespaceObject.startExceptionAutocapture)(this._autocaptureClient);
        }
    }
    claimExplicitCapture(error) {
        return (0, external_autocapture_js_namespaceObject.claimExplicitCapture)(error, this.destinationKey);
    }
    capturePendingExceptions() {
        for (const owner of (0, external_autocapture_js_namespaceObject.capturePendingExceptions)())if (owner !== this._autocaptureClient) this.client.addPendingPromise(owner.flush().catch(()=>void 0));
    }
    onException(exception, hint) {
        this.client.addPendingPromise((async ()=>{
            if (!ErrorTracking.isPreviouslyCapturedError(exception)) {
                const eventMessage = await ErrorTracking.buildEventMessage(this.client.getErrorPropertiesBuilder(), exception, hint, void 0, void 0, this.client.getContext());
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
exports["default"] = __webpack_exports__["default"];
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "default"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
