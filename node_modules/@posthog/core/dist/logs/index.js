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
    PostHogLogs: ()=>PostHogLogs
});
const external_logs_utils_js_namespaceObject = require("./logs-utils.js");
const external_types_js_namespaceObject = require("../types.js");
const index_js_namespaceObject = require("../utils/index.js");
const flush_timer_js_namespaceObject = require("../utils/flush-timer.js");
const retry_after_js_namespaceObject = require("../utils/retry-after.js");
const backoff_js_namespaceObject = require("../utils/backoff.js");
class PostHogLogs {
    constructor(_instance, _config, _logger, _getContext, _onReady, _waitForStoragePersist = ()=>Promise.resolve(), _scopeName){
        this._instance = _instance;
        this._config = _config;
        this._logger = _logger;
        this._getContext = _getContext;
        this._onReady = _onReady;
        this._waitForStoragePersist = _waitForStoragePersist;
        this._scopeName = _scopeName;
        this._flushTimer = new flush_timer_js_namespaceObject.FlushTimer(()=>this._flushInBackground());
        this._flushPromise = null;
        this._evictedSinceAdvance = 0;
        this._queueGeneration = 0;
        this._retryAfter = new retry_after_js_namespaceObject.RetryAfterWindow();
        this._consecutiveFlushFailures = 0;
        this._flushJitter = backoff_js_namespaceObject.NO_JITTER;
        this._intervalWindowStart = 0;
        this._intervalLogCount = 0;
        this._droppedWarned = false;
        this._maxBufferSize = _config.maxBufferSize;
        this._maxQueueSize = Math.max(_config.maxQueueSize ?? _config.maxBufferSize, _config.maxBufferSize);
        this._flushIntervalMs = _config.flushIntervalMs;
        this._maxBatchRecordsPerPost = _config.maxBatchRecordsPerPost;
        this._rateCapWindowMs = _config.rateCapWindowMs;
        this._maxLogsPerInterval = _config.maxLogsPerInterval;
    }
    clearQueue() {
        this._queueGeneration++;
        this._instance.setPersistedProperty(external_types_js_namespaceObject.PostHogPersistedProperty.LogsQueue, []);
    }
    reset() {
        this._flushTimer.clear();
        this._intervalWindowStart = 0;
        this._intervalLogCount = 0;
        this._droppedWarned = false;
        this._consecutiveFlushFailures = 0;
        this._flushJitter = backoff_js_namespaceObject.NO_JITTER;
        this._retryAfter.reset();
        this._maxBatchRecordsPerPost = this._config.maxBatchRecordsPerPost;
    }
    onReconnect() {
        this._consecutiveFlushFailures = 0;
        this._flushJitter = backoff_js_namespaceObject.NO_JITTER;
        if (this._retryAfter.isOpen()) {
            if (this._hasQueuedRecords()) this._armFlushTimer();
            return;
        }
        this._flushInBackground();
    }
    captureLog(options, capturedAt) {
        if (this._instance.isDisabled) return;
        if (this._instance.optedOut) return;
        if (!options?.body) return;
        const filtered = this._runBeforeSend(options);
        if (null === filtered) return;
        if (!filtered.body) return void this._logger.info("Log was rejected in beforeSend function");
        if (!this._checkRateLimit()) return;
        const record = (0, external_logs_utils_js_namespaceObject.buildOtlpLogRecord)(filtered, capturedAt?.context ?? this._getContext(), this._logger, capturedAt?.occurredAtMs);
        const entry = {
            record
        };
        this._onReady(()=>this._enqueue(entry));
    }
    _runBeforeSend(options) {
        const beforeSend = this._config.beforeSend;
        if (!beforeSend) return options;
        const fns = (0, index_js_namespaceObject.isArray)(beforeSend) ? beforeSend : [
            beforeSend
        ];
        let result = options;
        for (const fn of fns)try {
            const next = fn(result);
            if (!next) {
                this._logger.info("Log was rejected in beforeSend function");
                return null;
            }
            result = next;
        } catch (e) {
            this._logger.error("Error in beforeSend function for log:", e);
            return null;
        }
        return result;
    }
    _checkRateLimit() {
        if (void 0 === this._maxLogsPerInterval) return true;
        const now = Date.now();
        const elapsed = now - this._intervalWindowStart;
        if (elapsed >= this._rateCapWindowMs || elapsed < 0) {
            this._intervalWindowStart = now;
            this._intervalLogCount = 0;
            this._droppedWarned = false;
        }
        if (this._intervalLogCount >= this._maxLogsPerInterval) {
            if (!this._droppedWarned) {
                this._logger.warn(`captureLog dropping logs: exceeded ${this._maxLogsPerInterval} logs per ${this._rateCapWindowMs}ms`);
                this._droppedWarned = true;
            }
            return false;
        }
        this._intervalLogCount++;
        return true;
    }
    async flush() {
        if (this._instance.isDisabled) return;
        if (this._flushPromise) return this._flushPromise;
        this._flushPromise = this._flushInner().finally(()=>{
            this._flushPromise = null;
        });
        return this._flushPromise;
    }
    async _flushInner() {
        this._flushTimer.clear();
        let queue = this._instance.getPersistedProperty(external_types_js_namespaceObject.PostHogPersistedProperty.LogsQueue) ?? [];
        if (0 === queue.length) return;
        const originalQueueLength = queue.length;
        let sentCount = 0;
        while(queue.length > 0 && sentCount < originalQueueLength){
            const generation = this._queueGeneration;
            this._evictedSinceAdvance = 0;
            const batchSize = Math.min(queue.length, this._maxBatchRecordsPerPost);
            const batch = queue.slice(0, batchSize);
            const records = batch.map((e)=>e.record);
            const payload = (0, external_logs_utils_js_namespaceObject.buildOtlpLogsPayload)(records, this._buildResourceAttributes(), this._scopeName ?? this._instance.getLibraryId(), this._instance.getLibraryVersion());
            const outcome = await this._instance._sendLogsBatch(payload);
            if (this._queueGeneration !== generation) return;
            if ('too-large' === outcome.kind && batch.length > 1) {
                this._maxBatchRecordsPerPost = Math.max(1, Math.floor(batch.length / 2));
                this._logger.warn(`Logs batch of size ${batch.length} was too large for the ingestion endpoint, reducing batch size to ${this._maxBatchRecordsPerPost}`);
                continue;
            }
            this._retryAfter.record(outcome);
            if (this._flushTimer.pending) this._flushTimer.arm(Math.max(this._flushIntervalMs, this._retryAfter.remainingMs()));
            if ('retry-later' === outcome.kind) throw outcome.error;
            if ('too-large' === outcome.kind) this._logger.warn('Dropping a single log record with batch size 1 — the record is larger than the server cap and cannot be split further.');
            else if ('ok' === outcome.kind && this._maxBatchRecordsPerPost < this._config.maxBatchRecordsPerPost) this._maxBatchRecordsPerPost = Math.min(this._config.maxBatchRecordsPerPost, this._maxBatchRecordsPerPost + 1);
            await this._persistQueueAdvance(batch.length);
            queue = this._instance.getPersistedProperty(external_types_js_namespaceObject.PostHogPersistedProperty.LogsQueue) ?? [];
            sentCount += batch.length;
            if ('fatal' === outcome.kind) throw outcome.error;
        }
    }
    async _persistQueueAdvance(consumed) {
        const evicted = this._evictedSinceAdvance;
        const drop = Math.max(0, consumed - evicted);
        const refreshed = this._instance.getPersistedProperty(external_types_js_namespaceObject.PostHogPersistedProperty.LogsQueue) ?? [];
        this._instance.setPersistedProperty(external_types_js_namespaceObject.PostHogPersistedProperty.LogsQueue, refreshed.slice(drop));
        await this._waitForStoragePersist();
    }
    _buildResourceAttributes() {
        return (0, external_logs_utils_js_namespaceObject.buildResourceAttributes)(this._config, this._instance.getLibraryId(), this._instance.getLibraryVersion());
    }
    _enqueue(entry) {
        if (this._instance.optedOut) return;
        const queue = this._instance.getPersistedProperty(external_types_js_namespaceObject.PostHogPersistedProperty.LogsQueue) ?? [];
        if (queue.length >= this._maxQueueSize) {
            queue.shift();
            this._evictedSinceAdvance++;
            this._logger.info('Logs queue is full, dropping oldest record.');
        }
        queue.push(entry);
        this._instance.setPersistedProperty(external_types_js_namespaceObject.PostHogPersistedProperty.LogsQueue, queue);
        if (queue.length >= this._maxBufferSize && !this._retryAfter.isOpen()) return void this._flushInBackground();
        this._armFlushTimer();
    }
    _armFlushTimer() {
        if (this._flushTimer.pending) return;
        this._flushTimer.arm(Math.max(this._flushIntervalMs, this._retryAfter.remainingMs()));
    }
    _nextFlushDelay() {
        return Math.max((0, backoff_js_namespaceObject.backoffDelayMs)(this._flushIntervalMs, this._consecutiveFlushFailures, this._flushJitter, backoff_js_namespaceObject.MAX_FLUSH_BACKOFF_MS), this._retryAfter.remainingMs());
    }
    _hasQueuedRecords() {
        const queue = this._instance.getPersistedProperty(external_types_js_namespaceObject.PostHogPersistedProperty.LogsQueue);
        return !!queue && queue.length > 0;
    }
    async shutdown(timeoutMs) {
        this._flushTimer.clear();
        const flushPromise = this.flush().catch(()=>{});
        if (void 0 === timeoutMs) return void await flushPromise;
        await (0, index_js_namespaceObject.raceWithTimeout)(flushPromise, timeoutMs);
    }
    async flushWithTimeout(timeoutMs) {
        const flushPromise = this.flush();
        await (0, index_js_namespaceObject.raceWithTimeout)(flushPromise, timeoutMs, ()=>{
            flushPromise.catch(()=>{});
        });
    }
    _flushInBackground() {
        this.flush().then(()=>{
            this._consecutiveFlushFailures = 0;
            this._flushJitter = backoff_js_namespaceObject.NO_JITTER;
        }, (err)=>{
            this._consecutiveFlushFailures++;
            this._flushJitter = (0, backoff_js_namespaceObject.drawJitter)();
            this._logger.error('PostHog logs flush failed:', err);
        }).finally(()=>{
            if (!this._instance.isDisabled && this._hasQueuedRecords()) this._flushTimer.armNoEarlierThan(this._nextFlushDelay());
        });
    }
}
exports.PostHogLogs = __webpack_exports__.PostHogLogs;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "PostHogLogs"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
