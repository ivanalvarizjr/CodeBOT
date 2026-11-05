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
    PostHogTraces: ()=>PostHogTraces
});
const external_span_js_namespaceObject = require("./span.js");
const external_ids_js_namespaceObject = require("./ids.js");
const external_traceparent_js_namespaceObject = require("./traceparent.js");
const external_sanitize_js_namespaceObject = require("./sanitize.js");
const json_utils_js_namespaceObject = require("../utils/json-utils.js");
const external_otlp_js_namespaceObject = require("./otlp.js");
const index_js_namespaceObject = require("../utils/index.js");
const flush_timer_js_namespaceObject = require("../utils/flush-timer.js");
const retry_after_js_namespaceObject = require("../utils/retry-after.js");
const backoff_js_namespaceObject = require("../utils/backoff.js");
const MAX_RETRIES_PER_BATCH = 8;
function clockNow() {
    return (0, external_span_js_namespaceObject.monotonicNow)() ?? Date.now();
}
function isOwnSpan(value) {
    try {
        return value instanceof external_span_js_namespaceObject.PostHogSpan;
    } catch  {
        return false;
    }
}
function remoteContext(header, tracestate) {
    const remote = (0, external_traceparent_js_namespaceObject.parseTraceparent)(header);
    if (!remote) return;
    return {
        traceId: remote.traceId,
        parentSpanId: remote.spanId,
        traceState: (0, external_traceparent_js_namespaceObject.sanitizeTracestate)(tracestate),
        traceFlags: remote.flags,
        isRemote: true
    };
}
function looksLikeSpan(value) {
    try {
        return 'function' == typeof value.traceparent;
    } catch  {
        return false;
    }
}
function isSpanRecordShape(record) {
    return !!record.attributes && 'object' == typeof record.attributes && !Array.isArray(record.attributes) && Array.isArray(record.events) && void 0 !== record.name && void 0 !== record.kind && void 0 !== record.startTime && void 0 !== record.endTime;
}
function restoreField(record, field, value) {
    if (record[field] !== value) record[field] = value;
}
function withRestoredIdentity(hooked, original) {
    try {
        const descriptors = Object.getOwnPropertyDescriptors(hooked);
        for (const field of [
            'traceId',
            'spanId',
            'parentSpanId',
            'traceState'
        ])descriptors[field] = {
            value: original[field],
            enumerable: true,
            writable: true,
            configurable: true
        };
        return Object.create(Object.getPrototypeOf(hooked), descriptors);
    } catch  {
        return hooked;
    }
}
class PostHogTraces {
    constructor(_instance, _config, _logger, _getContext, _contextManager, _onSpanQueued){
        this._instance = _instance;
        this._config = _config;
        this._logger = _logger;
        this._getContext = _getContext;
        this._contextManager = _contextManager;
        this._onSpanQueued = _onSpanQueued;
        this._queue = [];
        this._flushTimer = new flush_timer_js_namespaceObject.FlushTimer(()=>this._flushInBackground());
        this._flushPromise = null;
        this._droppedSinceWarning = 0;
        this._lastDropWarningAt = 0;
        this._dropReasons = new Set();
        this._consecutiveFlushFailures = 0;
        this._flushJitter = backoff_js_namespaceObject.NO_JITTER;
        this._retryAfter = new retry_after_js_namespaceObject.RetryAfterWindow();
        this._headBatchFailures = 0;
        this._headBatchSize = 0;
        this._headBatchChargeableAt = 0;
        this._generation = 0;
        this._liveSpans = new Map();
        this._maxExportBatchSize = _config.maxExportBatchSize;
    }
    startSpan(name, options) {
        if (this._instance.isDisabled || this._instance.optedOut) return (0, external_span_js_namespaceObject.inertSpan)(options, this._contextManager.active());
        const explicitParent = (0, external_traceparent_js_namespaceObject.traceparentHeader)(options?.parent);
        if (explicitParent && 'string' != typeof explicitParent && !isOwnSpan(explicitParent)) {
            if (looksLikeSpan(explicitParent)) {
                this._logger.debug('Span parent is not a span from this SDK; returning an inert span');
                return (0, external_span_js_namespaceObject.inertSpan)(options, this._contextManager.active());
            }
            this._logger.debug('Ignoring an unusable span parent');
        }
        const parent = this._resolveParent(explicitParent, options);
        if (this._liveSpans.size >= this._config.maxLiveSpans) this._evictAgedSpans();
        if (this._liveSpans.size >= this._config.maxLiveSpans) {
            this._recordDrop(1, `the live-span limit (${this._config.maxLiveSpans}) was reached — spans are being started and never ended`);
            return (0, external_span_js_namespaceObject.inertSpan)(options, this._contextManager.active());
        }
        const now = Date.now();
        const startTime = (0, external_sanitize_js_namespaceObject.resolveStartTime)(options?.startTime, now, this._logger);
        const spanId = (0, external_ids_js_namespaceObject.newSpanId)();
        this._liveSpans.set(spanId, clockNow());
        const autoAttributes = this._autoContextAttributes();
        return new external_span_js_namespaceObject.PostHogSpan({
            traceId: parent?.traceId ?? (0, external_ids_js_namespaceObject.newTraceId)(),
            spanId,
            parentSpanId: parent?.parentSpanId,
            traceState: parent?.traceState,
            traceFlags: parent?.traceFlags,
            parentIsRemote: parent?.isRemote,
            name: (0, external_sanitize_js_namespaceObject.sanitizeName)(name, 'Span name', this._config.maxAttributeValueLength, this._logger),
            kind: options?.kind ?? 'internal',
            attributes: (0, json_utils_js_namespaceObject.assignUserAttributes)({
                ...autoAttributes
            }, options?.attributes),
            autoAttributeKeys: Object.keys(autoAttributes),
            maxAttributes: this._config.maxAttributesPerSpan,
            maxEvents: this._config.maxEventsPerSpan,
            maxAttributesPerEvent: this._config.maxAttributesPerEvent,
            maxAttributeValueLength: this._config.maxAttributeValueLength,
            startTime,
            backdated: startTime !== now,
            clockAnchor: void 0 === (0, external_sanitize_js_namespaceObject.toEpochMs)(options?.startTime) ? parent?.clockAnchor : void 0
        }, (record, autoKeys)=>this._onSpanEnd(record, autoKeys), this._logger);
    }
    withSpan(name, optionsOrFn, maybeFn) {
        const options = 'function' == typeof optionsOrFn ? void 0 : optionsOrFn;
        const fn = 'function' == typeof optionsOrFn ? optionsOrFn : maybeFn;
        const span = this.startSpan(name, options);
        try {
            const result = (0, external_span_js_namespaceObject.runWithActiveSpan)(this._contextManager, span, fn);
            if ((0, index_js_namespaceObject.isPromise)(result)) return result.then((value)=>{
                span.end();
                return value;
            }, (error)=>{
                this._recordCallbackError(span, error);
                span.end();
                throw error;
            });
            span.end();
            return result;
        } catch (error) {
            this._recordCallbackError(span, error);
            span.end();
            throw error;
        }
    }
    getActiveSpan() {
        return this._contextManager.active() ?? null;
    }
    get throttled() {
        return this._retryAfter.isOpen();
    }
    async flush() {
        for(;;){
            if (!this._queue.length) return;
            const inFlight = this._flushPromise;
            const removed = await (inFlight ?? this._startFlush());
            if (!removed) return;
        }
    }
    _startFlush() {
        this._flushTimer.clear();
        const startedAtGeneration = this._generation;
        const promise = Promise.resolve().then(()=>startedAtGeneration === this._generation ? this._flushInner() : 0).finally(()=>{
            if (this._flushPromise === promise) this._flushPromise = null;
            this._armFlushTimerIfQueuedNoEarlierThan();
        });
        this._flushPromise = promise;
        return promise;
    }
    reset() {
        this._flushTimer.clear();
        if (this._queue.length) this._logger.critical(`Discarding ${this._queue.length} span(s) that were still queued when tracing was shut down. Raise the shutdown timeout or flush earlier if they matter.`);
        this._queue = [];
        this._liveSpans.clear();
        this._flushPromise = null;
        this._generation++;
        this._maxExportBatchSize = this._config.maxExportBatchSize;
        this._droppedSinceWarning = 0;
        this._dropReasons.clear();
        this._lastDropWarningAt = 0;
        this._consecutiveFlushFailures = 0;
        this._flushJitter = backoff_js_namespaceObject.NO_JITTER;
        this._retryAfter.reset();
        this._resetHeadBatchBudget();
    }
    _resetHeadBatchBudget() {
        this._headBatchFailures = 0;
        this._headBatchChargeableAt = 0;
    }
    _resolveParent(explicit, options) {
        if ('string' == typeof explicit) {
            const remote = remoteContext(explicit, options?.tracestate);
            if (!remote) this._logger.debug('Ignoring malformed traceparent; starting a new trace');
            return remote;
        }
        if (isOwnSpan(explicit)) return explicit.childContext();
        const active = this._contextManager.active();
        if (isOwnSpan(active)) return active.childContext();
        if (active instanceof external_span_js_namespaceObject.PassThroughSpan) return remoteContext(active.traceparent(), active.tracestate() ?? void 0);
    }
    _autoContextAttributes() {
        let context;
        try {
            context = this._getContext();
        } catch (error) {
            this._logger.debug('Failed to read tracing context; span will carry no PostHog attributes', error);
            return {};
        }
        const attributes = {};
        if (context.distinctId) attributes.posthogDistinctId = context.distinctId;
        if (context.sessionId) attributes.sessionId = context.sessionId;
        if (context.currentUrl) attributes['url.full'] = context.currentUrl;
        if (context.screenName) attributes['screen.name'] = context.screenName;
        if (context.appState) attributes['app.state'] = context.appState;
        return attributes;
    }
    _recordCallbackError(span, error) {
        if (!(span instanceof external_span_js_namespaceObject.PostHogSpan)) return;
        const { type, message, stack } = (0, external_span_js_namespaceObject.describeError)(error);
        span.addEvent('exception', {
            'exception.type': type,
            'exception.message': message,
            ...stack && {
                'exception.stacktrace': stack
            }
        });
        if (!span.statusIsExplicitlyOk) span.setStatus('error', message);
    }
    _evictAgedSpans() {
        const cutoff = clockNow() - this._config.maxSpanAgeMs;
        let evicted = 0;
        for (const [spanId, startedAt] of this._liveSpans){
            if (startedAt > cutoff) break;
            this._liveSpans.delete(spanId);
            evicted++;
        }
        if (evicted) this._recordDrop(evicted, `they were still live after ${this._config.maxSpanAgeMs}ms`);
    }
    _onSpanEnd(incoming, autoKeys) {
        if (!this._liveSpans.delete(incoming.spanId)) return;
        if (this._instance.isDisabled || this._instance.optedOut) return void this._recordDrop(1, 'the user has opted out');
        const record = this._runBeforeSpanSend(incoming, autoKeys);
        if (!record) return;
        this._reportLimitDrops(record);
        if (this._queue.length >= this._config.maxQueueSize) return void this._recordDrop(1, `the queue is full (${this._config.maxQueueSize}) — raise the flush frequency or reduce span volume`);
        this._queue.push(record);
        try {
            this._onSpanQueued?.();
        } catch (error) {
            this._logger.debug('Span queue notification failed', error);
        }
        if (!(this._queue.length >= this._maxExportBatchSize) || this._consecutiveFlushFailures || this._retryAfter.isOpen()) this._armFlushTimerIfQueued();
        else this._flushInBackground();
    }
    _reportLimitDrops(record) {
        const attributes = record.droppedAttributesCount ?? 0;
        const events = record.droppedEventsCount ?? 0;
        let eventAttributes = 0;
        for (const event of record.events)eventAttributes += event.droppedAttributesCount ?? 0;
        if (attributes || events || eventAttributes) this._logger.debug(`Span limits discarded data from "${record.name}": ${attributes} attributes, ${events} events, ${eventAttributes} event attributes`);
    }
    _runBeforeSpanSend(record, autoKeys) {
        if (!this._config.beforeSpanSend.length) return record;
        const identity = {
            traceId: record.traceId,
            spanId: record.spanId,
            parentSpanId: record.parentSpanId,
            traceState: record.traceState
        };
        const originalTimes = {
            startTime: record.startTime,
            endTime: record.endTime
        };
        const originalDropped = {
            attributes: record.droppedAttributesCount,
            events: record.droppedEventsCount
        };
        const keysBeforeHook = Object.keys(record.attributes);
        const originalPropagation = {
            traceFlags: record.traceFlags,
            parentIsRemote: record.parentIsRemote
        };
        const originalStatus = record.status && {
            ...record.status
        };
        let hooked = record;
        let current = record;
        try {
            for (const hook of this._config.beforeSpanSend){
                const result = hook(hooked);
                if (!result) {
                    this._recordDrop(1, 'beforeSpanSend dropped it');
                    return null;
                }
                hooked = this._keepSpanIdentity(result, identity);
            }
            const rebuilt = {
                traceId: identity.traceId,
                spanId: identity.spanId,
                parentSpanId: identity.parentSpanId,
                traceState: identity.traceState,
                name: hooked.name,
                kind: hooked.kind,
                status: hooked.status,
                attributes: hooked.attributes,
                events: hooked.events,
                startTime: hooked.startTime,
                endTime: hooked.endTime,
                traceFlags: originalPropagation.traceFlags,
                parentIsRemote: originalPropagation.parentIsRemote,
                droppedAttributesCount: originalDropped.attributes,
                droppedEventsCount: originalDropped.events
            };
            current = rebuilt;
            if (!isSpanRecordShape(current)) {
                this._logger.debug('beforeSpanSend did not return a span record; dropping the span');
                this._recordDrop(1, 'beforeSpanSend returned an unusable record');
                return null;
            }
            current.name = (0, external_sanitize_js_namespaceObject.sanitizeName)(current.name, 'Span name', this._config.maxAttributeValueLength, this._logger);
            if (current.status && 'ok' !== current.status.code && 'error' !== current.status.code) {
                this._logger.debug('beforeSpanSend set an unknown span status; keeping the original');
                current.status = originalStatus;
            }
            current.startTime = (0, external_sanitize_js_namespaceObject.toEpochMs)(current.startTime) ?? originalTimes.startTime;
            current.endTime = (0, external_sanitize_js_namespaceObject.clampEndTime)((0, external_sanitize_js_namespaceObject.toEpochMs)(current.endTime) ?? originalTimes.endTime, current.startTime);
            const sanitizedEvents = [];
            for (const event of current.events)try {
                sanitizedEvents.push({
                    ...event,
                    name: (0, external_sanitize_js_namespaceObject.sanitizeName)(event.name, 'Span event name', this._config.maxAttributeValueLength, this._logger),
                    timestamp: (0, external_sanitize_js_namespaceObject.resolveSuppliedTime)(event.timestamp, current.startTime, 'event timestamp', this._logger)
                });
            } catch  {
                this._logger.debug('beforeSpanSend left an unreadable span event; dropping it');
            }
            current.events = sanitizedEvents;
            (0, external_span_js_namespaceObject.applySpanLimits)(current, autoKeys, this._config.maxAttributesPerSpan, this._config.maxEventsPerSpan, this._config.maxAttributesPerEvent, this._config.maxAttributeValueLength, keysBeforeHook);
            return current;
        } catch (error) {
            this._logger.debug('beforeSpanSend failed; dropping the span rather than exporting it unscrubbed', error);
            this._recordDrop(1, 'beforeSpanSend failed');
            return null;
        }
    }
    _keepSpanIdentity(hooked, original) {
        if (hooked.traceId !== original.traceId || hooked.spanId !== original.spanId || hooked.parentSpanId !== original.parentSpanId) this._logger.debug('beforeSpanSend changed a span identity field; keeping the original ids');
        try {
            restoreField(hooked, 'traceId', original.traceId);
            restoreField(hooked, 'spanId', original.spanId);
            restoreField(hooked, 'parentSpanId', original.parentSpanId);
            restoreField(hooked, 'traceState', original.traceState);
        } catch  {
            return withRestoredIdentity(hooked, original);
        }
        return hooked;
    }
    _recordDrop(count, reason) {
        this._droppedSinceWarning += count;
        this._dropReasons.add(reason);
        if (Date.now() - this._lastDropWarningAt >= this._config.flushIntervalMs) this._warnAboutDrops();
    }
    _warnAboutDrops() {
        if (!this._droppedSinceWarning) return;
        this._lastDropWarningAt = Date.now();
        this._logger.warn(`Dropping ${this._droppedSinceWarning} span(s): ${[
            ...this._dropReasons
        ].join('; ')}`);
        this._droppedSinceWarning = 0;
        this._dropReasons.clear();
    }
    _encodeBatch(batch) {
        const encoded = [];
        for (const record of batch)try {
            encoded.push((0, external_otlp_js_namespaceObject.buildOtlpSpan)(record, this._logger));
        } catch (error) {
            this._logger.debug('Failed to encode a span; dropping it', error);
            this._recordDrop(1, 'its attributes could not be encoded');
        }
        return encoded;
    }
    _discardQueueIfConsentWithdrawn() {
        if (!this._instance.isDisabled && !this._instance.optedOut) return 0;
        const discarded = this._queue.length;
        this._queue = [];
        this._resetHeadBatchBudget();
        this._recordDrop(discarded, 'the user has opted out');
        this._warnAboutDrops();
        return discarded;
    }
    async _flushInner() {
        if (!this._queue.length) return 0;
        const discardedBeforeDrain = this._discardQueueIfConsentWithdrawn();
        if (discardedBeforeDrain) return discardedBeforeDrain;
        const resourceAttributes = (0, external_span_js_namespaceObject.truncateAttributes)((0, external_otlp_js_namespaceObject.buildTracesResourceAttributes)(this._config, this._instance.getLibraryId(), this._instance.getLibraryVersion()), this._config.maxAttributeValueLength);
        const scopeName = this._instance.getLibraryId();
        const scopeVersion = this._instance.getLibraryVersion();
        let remaining = this._queue.length;
        let removed = 0;
        let localCap = 1 / 0;
        const generation = this._generation;
        try {
            while(remaining > 0 && this._queue.length > 0){
                const discardedMidDrain = this._discardQueueIfConsentWithdrawn();
                if (discardedMidDrain) return removed + discardedMidDrain;
                const cap = this._headBatchFailures > 0 ? Math.min(this._maxExportBatchSize, this._headBatchSize) : this._maxExportBatchSize;
                const size = Math.max(1, Math.min(cap, localCap, remaining, this._queue.length));
                const batch = this._queue.slice(0, size);
                const spans = this._encodeBatch(batch);
                if (!spans.length) {
                    this._queue.splice(0, size);
                    remaining -= size;
                    removed += size;
                    this._resetHeadBatchBudget();
                    continue;
                }
                const chargeable = clockNow() >= this._headBatchChargeableAt && !this._retryAfter.isOpen();
                const outcome = await this._instance._sendTracesBatch((0, external_otlp_js_namespaceObject.buildOtlpTracesPayload)(spans, resourceAttributes, scopeName, scopeVersion, this._logger));
                if (generation !== this._generation) break;
                this._retryAfter.record(outcome);
                if ('ok' === outcome.kind) {
                    this._consecutiveFlushFailures = 0;
                    this._flushJitter = backoff_js_namespaceObject.NO_JITTER;
                    this._resetHeadBatchBudget();
                    this._queue.splice(0, size);
                    remaining -= size;
                    removed += size;
                    if (this._maxExportBatchSize < this._config.maxExportBatchSize) this._maxExportBatchSize++;
                    continue;
                }
                if ('too-large' === outcome.kind) {
                    if (1 === size) {
                        this._queue.splice(0, 1);
                        remaining -= 1;
                        removed += 1;
                        this._recordDrop(1, 'it is too large for the ingestion endpoint');
                        this._consecutiveFlushFailures = 0;
                        this._flushJitter = backoff_js_namespaceObject.NO_JITTER;
                        this._resetHeadBatchBudget();
                        continue;
                    }
                    const halved = Math.max(1, Math.floor(size / 2));
                    if (outcome.measuredLocally) localCap = halved;
                    else this._maxExportBatchSize = halved;
                    this._resetHeadBatchBudget();
                    this._logger.debug(`Batch too large; retrying the same spans in batches of ${halved}`);
                    continue;
                }
                if ('retry-later' === outcome.kind) {
                    this._consecutiveFlushFailures++;
                    this._flushJitter = (0, backoff_js_namespaceObject.drawJitter)();
                    this._headBatchSize = size;
                    if (chargeable) {
                        this._headBatchFailures++;
                        this._headBatchChargeableAt = clockNow() + this._nextFlushDelay();
                    }
                    if (this._headBatchFailures < MAX_RETRIES_PER_BATCH) {
                        this._logger.debug('Span export failed; retrying on the next flush', outcome.error);
                        return removed;
                    }
                    this._queue.splice(0, size);
                    remaining -= size;
                    removed += size;
                    this._consecutiveFlushFailures = 0;
                    this._flushJitter = backoff_js_namespaceObject.NO_JITTER;
                    this._resetHeadBatchBudget();
                    this._recordDrop(size, `the ingestion endpoint failed ${MAX_RETRIES_PER_BATCH} times in a row`);
                    if (this._retryAfter.isOpen()) return removed;
                    continue;
                }
                this._logger.debug('Dropping a span batch the ingestion endpoint rejected', outcome.error);
                this._queue.splice(0, size);
                remaining -= size;
                removed += size;
                this._consecutiveFlushFailures = 0;
                this._flushJitter = backoff_js_namespaceObject.NO_JITTER;
                this._resetHeadBatchBudget();
                this._recordDrop(size, 'the ingestion endpoint rejected the batch');
            }
            return removed;
        } finally{
            this._warnAboutDrops();
        }
    }
    _flushInBackground() {
        if (this._backgroundFlush) return;
        this._backgroundFlush = this.flush().catch((error)=>{
            this._logger.debug('Background span flush failed', error);
        }).finally(()=>{
            this._backgroundFlush = void 0;
            this._armFlushTimerIfQueuedNoEarlierThan();
        });
    }
    _armFlushTimerIfQueued() {
        if (this._flushTimer.pending || !this._queue.length) return;
        this._flushTimer.arm(this._nextFlushDelay());
    }
    _armFlushTimerIfQueuedNoEarlierThan() {
        if (!this._queue.length) return;
        this._flushTimer.armNoEarlierThan(this._nextFlushDelay());
    }
    _nextFlushDelay() {
        return Math.max((0, backoff_js_namespaceObject.backoffDelayMs)(this._config.flushIntervalMs, this._consecutiveFlushFailures, this._flushJitter, backoff_js_namespaceObject.MAX_FLUSH_BACKOFF_MS), this._retryAfter.remainingMs());
    }
}
exports.PostHogTraces = __webpack_exports__.PostHogTraces;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "PostHogTraces"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
