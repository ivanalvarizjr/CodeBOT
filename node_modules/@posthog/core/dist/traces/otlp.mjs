import { nonNegativeCount } from "./span.mjs";
import { toOtlpKeyValueList } from "../utils/otlp-any-value.mjs";
import { UNSERIALIZABLE_VALUE, sanitizeString } from "../utils/json-utils.mjs";
import { buildOtlpResourceAttributes, toOtlpResourceKeyValueList } from "../utils/otlp-resource.mjs";
const SPAN_KIND_TO_OTLP = {
    internal: 1,
    server: 2,
    client: 3,
    producer: 4,
    consumer: 5
};
const SPAN_STATUS_TO_OTLP = {
    ok: 1,
    error: 2
};
const TRACE_FLAGS_SAMPLED = 0x01;
const SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE = 0x100;
const SPAN_FLAGS_CONTEXT_IS_REMOTE = 0x200;
function spanFlags(record) {
    const traceFlags = parseInt(record.traceFlags, 16);
    const w3c = Number.isFinite(traceFlags) ? 0xff & traceFlags : TRACE_FLAGS_SAMPLED;
    return w3c | SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE | (record.parentIsRemote ? SPAN_FLAGS_CONTEXT_IS_REMOTE : 0);
}
function wireString(value) {
    if ('string' == typeof value) return sanitizeString(value);
    try {
        return sanitizeString(String(value));
    } catch  {
        return UNSERIALIZABLE_VALUE;
    }
}
function spanKindToOtlp(kind) {
    if (kind && Object.prototype.hasOwnProperty.call(SPAN_KIND_TO_OTLP, kind)) return SPAN_KIND_TO_OTLP[kind];
    return SPAN_KIND_TO_OTLP.internal;
}
function msToUnixNanoString(ms) {
    let whole = Math.floor(ms);
    let fractionalNanos = Math.round((ms - whole) * 1e6);
    if (fractionalNanos >= 1e6) {
        whole += 1;
        fractionalNanos = 0;
    }
    return String(whole) + String(fractionalNanos).padStart(6, '0');
}
function toOtlpEvent(event, logger) {
    const encoded = {
        name: wireString(event.name),
        timeUnixNano: msToUnixNanoString(event.timestamp)
    };
    if (event.attributes) {
        const attributes = toOtlpKeyValueList(event.attributes, logger);
        if (attributes.length) encoded.attributes = attributes;
    }
    const dropped = nonNegativeCount(event.droppedAttributesCount);
    if (dropped) encoded.droppedAttributesCount = dropped;
    return encoded;
}
function buildOtlpSpan(record, logger) {
    const span = {
        traceId: record.traceId,
        spanId: record.spanId,
        name: wireString(record.name),
        kind: spanKindToOtlp(record.kind),
        startTimeUnixNano: msToUnixNanoString(record.startTime),
        endTimeUnixNano: msToUnixNanoString(record.endTime),
        flags: spanFlags(record)
    };
    if (record.parentSpanId) span.parentSpanId = record.parentSpanId;
    if (record.traceState) span.traceState = wireString(record.traceState);
    const attributes = toOtlpKeyValueList(record.attributes, logger);
    if (attributes.length) span.attributes = attributes;
    if (record.events.length) span.events = record.events.map((event)=>toOtlpEvent(event, logger));
    const droppedAttributes = nonNegativeCount(record.droppedAttributesCount);
    if (droppedAttributes) span.droppedAttributesCount = droppedAttributes;
    const droppedEvents = nonNegativeCount(record.droppedEventsCount);
    if (droppedEvents) span.droppedEventsCount = droppedEvents;
    if (record.status) span.status = {
        code: SPAN_STATUS_TO_OTLP[record.status.code],
        ...record.status.message && {
            message: wireString(record.status.message)
        }
    };
    return span;
}
function buildTracesResourceAttributes(config, sdkName, sdkVersion) {
    return buildOtlpResourceAttributes(config, sdkName, sdkVersion);
}
function buildOtlpTracesPayload(spans, resourceAttributes, scopeName, scopeVersion, logger) {
    return {
        resourceSpans: [
            {
                resource: {
                    attributes: toOtlpResourceKeyValueList(resourceAttributes, logger)
                },
                scopeSpans: [
                    {
                        scope: {
                            name: scopeName,
                            version: scopeVersion
                        },
                        spans
                    }
                ]
            }
        ]
    };
}
export { buildOtlpSpan, buildOtlpTracesPayload, buildTracesResourceAttributes, msToUnixNanoString, spanKindToOtlp };
