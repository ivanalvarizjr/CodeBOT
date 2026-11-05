const FALLBACK_SPAN_NAME = 'unknown';
const MAX_TIMESTAMP_MS = 9223372036854;
const MIN_TIMESTAMP_MS = 0;
const DEEP_BACKDATE_WARNING_MS = 86400000;
function sanitizeName(name, label, maxLength, logger) {
    if ('string' == typeof name && name.trim()) return name.length > maxLength ? name.slice(0, maxLength) : name;
    logger?.debug(`${label} must be a non-empty string; using "${FALLBACK_SPAN_NAME}"`);
    return FALLBACK_SPAN_NAME;
}
function toEpochMs(value) {
    if (null == value) return;
    let ms = value;
    if (value instanceof Date) try {
        ms = value.getTime();
    } catch  {
        return;
    }
    if ('number' != typeof ms || !Number.isFinite(ms)) return;
    if (ms < MIN_TIMESTAMP_MS || ms > MAX_TIMESTAMP_MS) return;
    return ms;
}
function resolveStartTime(value, now, logger) {
    const supplied = toEpochMs(value);
    if (void 0 === supplied) {
        if (void 0 !== value) logger?.debug('Span startTime is out of range or not a valid time; using the current time');
        return now;
    }
    if (now - supplied > DEEP_BACKDATE_WARNING_MS) logger?.debug('Span startTime is more than 24 hours in the past; the server will clamp it to receive time and keep the original in $originalTimestamp');
    else if (supplied > now) logger?.debug('Span startTime is in the future; the span may export with a zero duration');
    return supplied;
}
function clampEndTime(endTime, startTime) {
    return endTime < startTime ? startTime : endTime;
}
function resolveSuppliedTime(value, derived, label, logger) {
    const supplied = toEpochMs(value);
    if (void 0 === supplied) {
        if (void 0 !== value) logger?.debug(`Span ${label} is out of range or not a valid time; using the derived time`);
        return derived;
    }
    return supplied;
}
export { clampEndTime, resolveStartTime, resolveSuppliedTime, sanitizeName, toEpochMs };
