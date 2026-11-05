import { assignUserAttributes } from "../utils/json-utils.mjs";
const DEFAULT_FLUSH_INTERVAL_MS = 5000;
const DEFAULT_MAX_EXPORT_BATCH_SIZE = 512;
const DEFAULT_MAX_QUEUE_SIZE = 2048;
const DEFAULT_MAX_ATTRIBUTES_PER_SPAN = 128;
const DEFAULT_MAX_EVENTS_PER_SPAN = 128;
const DEFAULT_MAX_ATTRIBUTES_PER_EVENT = 128;
const DEFAULT_MAX_ATTRIBUTE_VALUE_LENGTH = 8192;
const DEFAULT_MAX_LIVE_SPANS = 10000;
const DEFAULT_MAX_SPAN_AGE_MS = 3600000;
function positiveInteger(value, fallback) {
    return 'number' == typeof value && Number.isInteger(value) && value >= 1 ? value : fallback;
}
const IDENTITY_KEYS = [
    'service.name',
    'service.version',
    'deployment.environment'
];
function withUsableIdentityKeys(attributes) {
    if (!attributes || 'object' != typeof attributes || Array.isArray(attributes)) return;
    try {
        if (IDENTITY_KEYS.every((key)=>!(key in attributes) || 'string' == typeof attributes[key])) return attributes;
        const usable = {
            ...attributes
        };
        for (const key of IDENTITY_KEYS)if (key in usable && 'string' != typeof usable[key]) delete usable[key];
        return usable;
    } catch  {
        return;
    }
}
function resolveBeforeSpanSend(beforeSpanSend, logger) {
    if (!beforeSpanSend) return [];
    const supplied = [
        beforeSpanSend
    ].flat().filter((hook)=>Boolean(hook));
    const hooks = supplied.filter((hook)=>'function' == typeof hook);
    if (hooks.length !== supplied.length) logger?.critical(`beforeSpanSend: ignoring ${supplied.length - hooks.length} of ${supplied.length} entries that are not functions. Spans export without them, so whatever they were redacting is not redacted.`);
    return hooks;
}
function resolveTracesConfig(config, hostResourceAttributes, logger) {
    const resourceAttributes = assignUserAttributes({
        ...hostResourceAttributes
    }, withUsableIdentityKeys(config?.resourceAttributes));
    const maxExportBatchSize = positiveInteger(config?.maxExportBatchSize, DEFAULT_MAX_EXPORT_BATCH_SIZE);
    return {
        serviceName: resourceAttributes?.['service.name'] ?? config?.serviceName,
        serviceVersion: resourceAttributes?.['service.version'] ?? config?.serviceVersion,
        environment: resourceAttributes?.['deployment.environment'] ?? config?.environment,
        resourceAttributes,
        beforeSpanSend: resolveBeforeSpanSend(config?.beforeSpanSend, logger),
        maxAttributesPerSpan: positiveInteger(config?.maxAttributesPerSpan, DEFAULT_MAX_ATTRIBUTES_PER_SPAN),
        maxEventsPerSpan: positiveInteger(config?.maxEventsPerSpan, DEFAULT_MAX_EVENTS_PER_SPAN),
        maxAttributesPerEvent: DEFAULT_MAX_ATTRIBUTES_PER_EVENT,
        maxAttributeValueLength: positiveInteger(config?.maxAttributeValueLength, DEFAULT_MAX_ATTRIBUTE_VALUE_LENGTH),
        flushIntervalMs: positiveInteger(config?.flushIntervalMs, DEFAULT_FLUSH_INTERVAL_MS),
        maxExportBatchSize,
        maxQueueSize: Math.max(positiveInteger(config?.maxQueueSize, DEFAULT_MAX_QUEUE_SIZE), maxExportBatchSize),
        maxLiveSpans: positiveInteger(config?.maxLiveSpans, DEFAULT_MAX_LIVE_SPANS),
        maxSpanAgeMs: positiveInteger(config?.maxSpanAgeMs, DEFAULT_MAX_SPAN_AGE_MS)
    };
}
export { resolveTracesConfig };
