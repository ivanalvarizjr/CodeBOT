const MAX_FLUSH_BACKOFF_EXPONENT = 6;
const MAX_FLUSH_BACKOFF_MS = 30000;
const JITTER = 0.25;
function drawJitter() {
    return 1 - JITTER + Math.random() * JITTER * 2;
}
const NO_JITTER = 1;
function backoffDelayMs(baseMs, failures, jitter, maxMs) {
    const exponent = Math.min(Math.max(0, failures - 1), MAX_FLUSH_BACKOFF_EXPONENT);
    const delay = baseMs * 2 ** exponent;
    const capped = void 0 === maxMs ? delay : Math.min(delay, Math.max(maxMs, baseMs));
    return Math.round(capped * jitter);
}
export { MAX_FLUSH_BACKOFF_EXPONENT, MAX_FLUSH_BACKOFF_MS, NO_JITTER, backoffDelayMs, drawJitter };
