const MAX_RETRY_AFTER_MS = 300000;
const CLOCK_STEP_TOLERANCE_MS = 5000;
function parseRetryAfterMs(value, now = Date.now(), maxMs = MAX_RETRY_AFTER_MS) {
    if ('string' != typeof value || !value) return;
    const raw = value.trim();
    const trimmed = /^\d+\s*,/.test(raw) ? raw.slice(0, raw.indexOf(',')).trim() : raw;
    if (/^\d+$/.test(trimmed)) {
        const ms = 1000 * Math.min(Number(trimmed), maxMs / 1000);
        return ms > 0 ? ms : void 0;
    }
    if (!/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*[ ,]/.test(trimmed)) return;
    const date = /^\w{3} \w{3} /.test(trimmed) ? trimmed + ' GMT' : trimmed;
    const ms = Date.parse(date) - now;
    if (!Number.isFinite(ms) || ms <= 0) return;
    return Math.min(ms, maxMs);
}
class RetryAfterWindow {
    record(outcome) {
        if ('too-large' === outcome.kind) return;
        if ('retry-later' !== outcome.kind) return void this.reset();
        if (!outcome.retryAfterMs) return;
        const open = this.isOpen();
        const now = Date.now();
        const asked = Math.min(outcome.retryAfterMs, MAX_RETRY_AFTER_MS);
        if (!open) {
            this._installedAt = now;
            this._until = now + asked;
            return;
        }
        this._until = Math.max(this._until, Math.min(now + asked, this._installedAt + MAX_RETRY_AFTER_MS));
    }
    remainingMs() {
        const now = Date.now();
        if (now < this._installedAt - CLOCK_STEP_TOLERANCE_MS) {
            this.reset();
            return 0;
        }
        const remaining = Math.min(MAX_RETRY_AFTER_MS, Math.max(0, this._until - now));
        if (0 === remaining) this.reset();
        return remaining;
    }
    isOpen() {
        return this.remainingMs() > 0;
    }
    reset() {
        this._until = 0;
        this._installedAt = 0;
    }
    constructor(){
        this._until = 0;
        this._installedAt = 0;
    }
}
export { MAX_RETRY_AFTER_MS, RetryAfterWindow, parseRetryAfterMs };
