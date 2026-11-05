import { isValidSpanId, isValidTraceId } from "./ids.mjs";
const TRACEPARENT_RE = /^([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})(-.*)?$/;
function parseTraceparent(value) {
    const fields = matchTraceparent(value);
    return fields && {
        traceId: fields.traceId,
        spanId: fields.spanId,
        flags: definedFlags(fields.flags)
    };
}
function definedFlags(flags) {
    return 0x01 & parseInt(flags, 16) ? TRACE_FLAGS_SAMPLED : TRACE_FLAGS_UNSAMPLED;
}
function matchTraceparent(value) {
    if ('string' != typeof value) return;
    const match = TRACEPARENT_RE.exec(value.trim());
    if (!match) return;
    const [, version, traceId, spanId, flags, trailing] = match;
    if ('ff' === version) return;
    if ('00' === version && trailing) return;
    if (!isValidTraceId(traceId) || !isValidSpanId(spanId)) return;
    return {
        version,
        traceId,
        spanId,
        flags
    };
}
function normalizeTraceparent(value) {
    return matchTraceparent(value) && value.trim();
}
function traceparentHeader(value) {
    return Array.isArray(value) && 1 === value.length ? value[0] : value;
}
const TRACE_FLAGS_SAMPLED = '01';
const TRACE_FLAGS_UNSAMPLED = '00';
function formatTraceparent(traceId, spanId, flags = TRACE_FLAGS_SAMPLED) {
    return `00-${traceId}-${spanId}-${flags}`;
}
const TRACESTATE_MAX_MEMBERS = 32;
const TRACESTATE_MAX_LENGTH = 512;
function sanitizeTracestate(value) {
    if ('string' != typeof value) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    if (/[^\x20-\x7e\t]/.test(trimmed)) return;
    const members = trimmed.split(',');
    if (members.length > TRACESTATE_MAX_MEMBERS) return;
    for (const member of members)if (member.trim() && !member.includes('=')) return;
    if (trimmed.length <= TRACESTATE_MAX_LENGTH) return trimmed;
    return trimToLength(members);
}
const TRACESTATE_LARGE_MEMBER_LENGTH = 128;
function trimToLength(members) {
    const kept = [
        ...members
    ];
    const joinedLength = ()=>kept.reduce((total, member)=>total + member.length, 0) + kept.length - 1;
    for(let index = kept.length - 1; index >= 0 && joinedLength() > TRACESTATE_MAX_LENGTH; index--)if (kept[index].length > TRACESTATE_LARGE_MEMBER_LENGTH) kept.splice(index, 1);
    while(kept.length && joinedLength() > TRACESTATE_MAX_LENGTH)kept.pop();
    return kept.length ? kept.join(',') : void 0;
}
export { TRACE_FLAGS_SAMPLED, formatTraceparent, normalizeTraceparent, parseTraceparent, sanitizeTracestate, traceparentHeader };
