import { gzipCompress, safeJsonStringify, safeSetTimeout, uuidv7 } from "@posthog/core";
import { CaptureV1Error } from "./errors.mjs";
import { buildV1Batch } from "./transform.mjs";
const V1_ANALYTICS_PATH = '/i/v1/analytics/events';
const DEFAULT_MAX_BACKOFF_MS = 30000;
const RETRYABLE_STATUSES = new Set([
    408,
    500,
    502,
    503,
    504
]);
class V1CaptureSender {
    constructor(config, hooks){
        this.config = config;
        this.maxBackoffMs = config.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS;
        this.fetchFn = hooks.fetch;
        this.onError = hooks.onError;
        this.now = hooks.now ?? Date.now;
        this.sleep = hooks.sleep ?? ((ms)=>new Promise((resolve)=>safeSetTimeout(resolve, ms)));
        this.generateRequestId = hooks.generateRequestId ?? uuidv7;
        this.compress = hooks.compress ?? gzipCompress;
    }
    async sendV1Batch(messages) {
        if (0 === messages.length) return;
        const requestId = this.generateRequestId();
        const createdAt = new Date(this.now()).toISOString();
        const { batch } = buildV1Batch(messages, {
            createdAt,
            historicalMigration: this.config.historicalMigration
        });
        const url = `${this.config.host}${V1_ANALYTICS_PATH}`;
        const drops = [];
        let pending = batch;
        const maxAttempts = Math.max(1, this.config.maxAttempts);
        for(let attempt = 1; attempt <= maxAttempts; attempt++){
            const isLastAttempt = attempt === maxAttempts;
            const payload = safeJsonStringify({
                created_at: createdAt,
                ...this.config.historicalMigration ? {
                    historical_migration: true
                } : {},
                batch: pending
            });
            let captureAttempt;
            let retryDelayMs;
            try {
                captureAttempt = await this.sendOnce(url, payload, attempt, requestId);
                const { response, signal } = captureAttempt;
                const { status } = response;
                if (status < 200 || status >= 300) if (!isLastAttempt && RETRYABLE_STATUSES.has(status)) {
                    const retryAfterMs = this.parseRetryAfter(response);
                    await captureAttempt.waitFor(captureAttempt.cancelBody()).catch(()=>{});
                    retryDelayMs = this.backoffDelay(attempt, retryAfterMs);
                } else {
                    const httpError = await this.buildHttpError(response, status, captureAttempt.waitFor);
                    return this.surfaceBatchFailure(requestId, drops, pending, httpError);
                }
                else {
                    let parsed;
                    try {
                        parsed = await captureAttempt.waitFor(this.parseResponse(response));
                    } catch (error) {
                        if (signal.aborted) throw error;
                        return this.surfaceBatchFailure(requestId, drops, pending, new Error(`Capture V1 returned an unparseable ${status} response body`));
                    }
                    const retryable = this.classify(pending, parsed, drops);
                    if (0 === retryable.length) return this.surfacePartialDrops(requestId, drops);
                    if (isLastAttempt) return void this.onError(new CaptureV1Error({
                        requestId,
                        drops,
                        retryExhausted: retryable.map((event)=>event.uuid)
                    }));
                    pending = retryable;
                    const retryAfterMs = this.parseRetryAfter(response);
                    retryDelayMs = this.backoffDelay(attempt, retryAfterMs);
                }
            } catch (transportError) {
                if (captureAttempt && !captureAttempt.signal.aborted) throw transportError;
                if (isLastAttempt) return this.surfaceBatchFailure(requestId, drops, pending, transportError);
                retryDelayMs = this.backoffDelay(attempt);
            } finally{
                captureAttempt?.cleanup();
            }
            if (void 0 !== retryDelayMs) await this.sleep(retryDelayMs);
        }
    }
    async sendOnce(url, payload, attempt, requestId) {
        const headers = this.buildHeaders(attempt, requestId);
        let body = payload;
        if (this.config.compressionEnabled) {
            const compressed = await this.compress(payload, this.config.isDebug);
            if (null !== compressed) {
                body = compressed;
                headers['Content-Encoding'] = 'gzip';
            }
        }
        const controller = new AbortController();
        let timeoutPhase = 'waiting for response headers';
        let timer;
        const deadline = new Promise((_resolve, reject)=>{
            timer = safeSetTimeout(()=>{
                const timeoutError = new Error(`Capture V1 request timed out ${timeoutPhase} after ${this.config.requestTimeoutMs}ms`);
                timeoutError.name = 'AbortError';
                reject(timeoutError);
                controller.abort(timeoutError);
            }, this.config.requestTimeoutMs);
        });
        try {
            const fetchPromise = this.fetchFn(url, {
                method: 'POST',
                headers,
                body,
                signal: controller.signal
            });
            let responseAccepted = false;
            fetchPromise.then((lateResponse)=>{
                if (controller.signal.aborted && !responseAccepted) this.cancelBody(lateResponse);
            }).catch(()=>{});
            const response = await Promise.race([
                fetchPromise,
                deadline
            ]);
            responseAccepted = true;
            timeoutPhase = 'while reading the response body';
            let cleanedUp = false;
            let cancellation;
            const cancelBody = ()=>cancellation ??= this.cancelBody(response);
            return {
                response,
                signal: controller.signal,
                waitFor: (operation)=>Promise.race([
                        operation,
                        deadline
                    ]),
                cancelBody,
                cleanup: ()=>{
                    if (cleanedUp) return;
                    cleanedUp = true;
                    clearTimeout(timer);
                    if (controller.signal.aborted) cancelBody();
                }
            };
        } catch (error) {
            clearTimeout(timer);
            throw error;
        }
    }
    buildHeaders(attempt, requestId) {
        const sdkInfo = `${this.config.libraryId}/${this.config.libraryVersion}`;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
            'PostHog-Sdk-Info': sdkInfo,
            'PostHog-Attempt': String(attempt),
            'PostHog-Request-Id': requestId,
            'PostHog-Request-Timestamp': new Date(this.now()).toISOString()
        };
        if (this.config.userAgent) headers['User-Agent'] = this.config.userAgent;
        return headers;
    }
    classify(pending, parsed, drops) {
        const results = parsed.results ?? {};
        const retryable = [];
        for (const event of pending){
            const result = results[event.uuid];
            if (result) {
                if ('drop' === result.result) drops.push({
                    uuid: event.uuid,
                    details: result.details ?? void 0
                });
                else if ('retry' === result.result) retryable.push(event);
            }
        }
        return retryable;
    }
    backoffDelay(attempt, retryAfterMs) {
        const exponential = Math.min(this.config.initialRetryDelayMs * 2 ** (attempt - 1), this.maxBackoffMs);
        if (void 0 === retryAfterMs) return exponential;
        return Math.max(exponential, Math.min(retryAfterMs, this.maxBackoffMs));
    }
    parseRetryAfter(response) {
        const raw = response.headers?.get('Retry-After');
        if (!raw) return;
        const trimmed = raw.trim();
        if (/^\d+$/.test(trimmed)) {
            const seconds = parseInt(trimmed, 10);
            return Number.isFinite(seconds) && seconds > 0 ? 1000 * seconds : void 0;
        }
        const dateMs = Date.parse(trimmed);
        if (Number.isNaN(dateMs)) return;
        const delta = dateMs - this.now();
        return delta > 0 ? delta : void 0;
    }
    async parseResponse(response) {
        const text = await response.text();
        const parsed = JSON.parse(text);
        if ('object' != typeof parsed || null === parsed || Array.isArray(parsed)) throw new Error('unexpected response shape');
        const results = parsed.results;
        if (void 0 !== results && ('object' != typeof results || null === results || Array.isArray(results))) throw new Error('unexpected results shape');
        return {
            results: results ?? {}
        };
    }
    async buildHttpError(response, status, waitFor) {
        let bodyText = '';
        try {
            bodyText = (await waitFor(response.text())).slice(0, 512);
        } catch  {}
        const suffix = bodyText ? `: ${bodyText}` : '';
        return new Error(`Capture V1 request failed with HTTP ${status}${suffix}`);
    }
    surfaceBatchFailure(requestId, drops, pending, cause) {
        this.onError(new CaptureV1Error({
            requestId,
            drops,
            retryExhausted: pending.map((event)=>event.uuid),
            cause
        }));
    }
    surfacePartialDrops(requestId, drops) {
        if (drops.length > 0) this.onError(new CaptureV1Error({
            requestId,
            drops,
            retryExhausted: []
        }));
    }
    async cancelBody(response) {
        try {
            await response.body?.cancel();
        } catch  {}
    }
}
export { V1CaptureSender };
