import { isString } from "./type-utils.mjs";
export * from "./bot-detection.mjs";
export * from "./browser-utils.mjs";
export * from "./bucketed-rate-limiter.mjs";
export * from "./number-utils.mjs";
export * from "./string-utils.mjs";
export * from "./type-utils.mjs";
export * from "./promise-queue.mjs";
export * from "./logger.mjs";
export * from "./user-agent-utils.mjs";
export * from "./webview-app-utils.mjs";
const STRING_FORMAT = 'utf8';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(value) {
    return 'string' == typeof value && UUID_REGEX.test(value);
}
function getEventUuid(uuid, generateUuid) {
    return isValidUUID(uuid) ? uuid : generateUuid();
}
function createNamedError(name, message) {
    const error = new Error(message);
    try {
        Object.defineProperty(error, 'name', {
            value: name,
            writable: true,
            enumerable: true,
            configurable: true
        });
    } catch  {}
    return error;
}
function assert(truthyValue, message) {
    if (!truthyValue || 'string' != typeof truthyValue || isEmpty(truthyValue)) throw new Error(message);
}
function isEmpty(truthyValue) {
    if (0 === truthyValue.trim().length) return true;
    return false;
}
function isUrl(value) {
    return isString(value) && /^(https?:\/\/|\/|\.\.?\/)/i.test(value.trim());
}
function removeTrailingSlash(url) {
    return url?.replace(/\/+$/, '');
}
function stripUrlHash(url) {
    if (!url) return url;
    return url.split('#')[0];
}
async function retriable(fn, props) {
    let lastError = null;
    for(let i = 0; i < props.retryCount + 1; i++){
        if (i > 0) await new Promise((r)=>setTimeout(r, props.retryDelay));
        try {
            const res = await fn();
            return res;
        } catch (e) {
            lastError = e;
            if (!props.retryCheck(e)) throw e;
        }
    }
    throw lastError;
}
function currentTimestamp() {
    return new Date().getTime();
}
function currentISOTime() {
    return new Date().toISOString();
}
function trySafe(fn) {
    try {
        return fn();
    } catch  {
        return;
    }
}
function safeSetTimeout(fn, timeout) {
    const t = setTimeout(fn, timeout);
    t?.unref && t?.unref();
    return t;
}
async function raceWithTimeout(promise, timeoutMs, onTimeout) {
    let timeoutHandle;
    try {
        return await Promise.race([
            promise,
            new Promise((resolve, reject)=>{
                timeoutHandle = safeSetTimeout(()=>{
                    try {
                        onTimeout?.();
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }, timeoutMs);
            })
        ]);
    } finally{
        clearTimeout(timeoutHandle);
    }
}
const isPromise = (obj)=>obj && 'function' == typeof obj.then;
function getFetch() {
    return "u" > typeof fetch ? fetch : void 0 !== globalThis.fetch ? globalThis.fetch : void 0;
}
function allSettled(promises) {
    return Promise.all(promises.map((p)=>(p ?? Promise.resolve()).then((value)=>({
                status: 'fulfilled',
                value
            }), (reason)=>({
                status: 'rejected',
                reason
            }))));
}
export { toJsonSafeValue } from "./json-utils.mjs";
export { parseRetryAfterMs } from "./retry-after.mjs";
export { STRING_FORMAT, UUID_REGEX, allSettled, assert, createNamedError, currentISOTime, currentTimestamp, getEventUuid, getFetch, isPromise, isUrl, isValidUUID, raceWithTimeout, removeTrailingSlash, retriable, safeSetTimeout, stripUrlHash, trySafe };
