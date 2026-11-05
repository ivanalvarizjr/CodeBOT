const TRACE_ID_PATTERN = /^[0-9a-f]{32}$/i;
const SPAN_ID_PATTERN = /^[0-9a-f]{16}$/i;
const OTEL_API_GLOBAL_KEY = Symbol.for('opentelemetry.js.api.1');
const SPAN_CONTEXT_KEY = Symbol.for('OpenTelemetry Context Key SPAN');
async function getActiveTraceProperties() {
    try {
        const otelApi = globalThis[OTEL_API_GLOBAL_KEY];
        const span = otelApi?.context?.active().getValue(SPAN_CONTEXT_KEY);
        const spanContext = span?.spanContext();
        const traceId = spanContext?.traceId;
        const spanId = spanContext?.spanId;
        if ('string' == typeof traceId && 'string' == typeof spanId && TRACE_ID_PATTERN.test(traceId) && SPAN_ID_PATTERN.test(spanId) && !/^0+$/.test(traceId) && !/^0+$/.test(spanId)) return {
            $trace_id: traceId.toLowerCase(),
            $span_id: spanId.toLowerCase()
        };
    } catch  {}
    return {};
}
export { getActiveTraceProperties };
