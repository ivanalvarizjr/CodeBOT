import { isNullish, isNumber, isUndefined } from "../utils/index.mjs";
import { UNSERIALIZABLE_VALUE, sanitizeString } from "../utils/json-utils.mjs";
import { toOtlpKeyValueList } from "../utils/otlp-any-value.mjs";
import { buildOtlpResourceAttributes, toOtlpResourceKeyValueList } from "../utils/otlp-resource.mjs";
const DEFAULT_OTLP_SEVERITY = {
    text: 'INFO',
    number: 9
};
const OTLP_SEVERITY_MAP = {
    trace: {
        text: 'TRACE',
        number: 1
    },
    debug: {
        text: 'DEBUG',
        number: 5
    },
    info: DEFAULT_OTLP_SEVERITY,
    warn: {
        text: 'WARN',
        number: 13
    },
    error: {
        text: 'ERROR',
        number: 17
    },
    fatal: {
        text: 'FATAL',
        number: 21
    }
};
function getOtlpSeverityText(level) {
    return (OTLP_SEVERITY_MAP[level] || DEFAULT_OTLP_SEVERITY).text;
}
function getOtlpSeverityNumber(level) {
    return (OTLP_SEVERITY_MAP[level] || DEFAULT_OTLP_SEVERITY).number;
}
function timestampToUnixNano(timestampMs = Date.now()) {
    return String(timestampMs) + '000000';
}
function encodeBody(body) {
    try {
        return sanitizeString(String(body));
    } catch  {
        return UNSERIALIZABLE_VALUE;
    }
}
function buildOtlpLogRecord(options, sdkContext, logger, occurredAtMs) {
    const level = options.level || 'info';
    const { text: severityText, number: severityNumber } = OTLP_SEVERITY_MAP[level] || DEFAULT_OTLP_SEVERITY;
    const eventTimeNano = timestampToUnixNano(isNumber(occurredAtMs) ? occurredAtMs : void 0);
    const autoAttributes = {};
    if (sdkContext.distinctId) autoAttributes.posthogDistinctId = sdkContext.distinctId;
    if (sdkContext.sessionId) autoAttributes.sessionId = sdkContext.sessionId;
    if (sdkContext.windowId) autoAttributes['window.id'] = sdkContext.windowId;
    if (!isNullish(sdkContext.sessionStartTimestamp)) autoAttributes.sessionStartTimestamp = String(sdkContext.sessionStartTimestamp);
    if (!isNullish(sdkContext.lastActivityTimestamp)) autoAttributes.lastActivityTimestamp = String(sdkContext.lastActivityTimestamp);
    if (sdkContext.currentUrl) autoAttributes['url.full'] = sdkContext.currentUrl;
    if (sdkContext.screenName) autoAttributes['screen.name'] = sdkContext.screenName;
    if (sdkContext.appState) autoAttributes['app.state'] = sdkContext.appState;
    if (sdkContext.activeFeatureFlags && sdkContext.activeFeatureFlags.length > 0) autoAttributes.feature_flags = sdkContext.activeFeatureFlags;
    const mergedAttributes = {
        ...autoAttributes
    };
    const userAttributes = options.attributes;
    if (userAttributes) {
        let keys = [];
        try {
            keys = Object.keys(userAttributes);
        } catch  {
            keys = [];
        }
        for (const key of keys){
            let value;
            try {
                value = userAttributes[key];
            } catch  {
                value = UNSERIALIZABLE_VALUE;
            }
            Object.defineProperty(mergedAttributes, key, {
                value,
                enumerable: true,
                writable: true,
                configurable: true
            });
        }
    }
    const record = {
        timeUnixNano: eventTimeNano,
        observedTimeUnixNano: eventTimeNano,
        severityNumber,
        severityText,
        body: {
            stringValue: encodeBody(options.body)
        },
        attributes: toOtlpKeyValueList(mergedAttributes, logger)
    };
    if (options.trace_id) record.traceId = options.trace_id;
    if (options.span_id) record.spanId = options.span_id;
    if (!isUndefined(options.trace_flags)) record.flags = options.trace_flags;
    return record;
}
function buildResourceAttributes(config, sdkName, sdkVersion) {
    return buildOtlpResourceAttributes(config, sdkName, sdkVersion);
}
function buildOtlpLogsPayload(logRecords, resourceAttributes, scopeName, scopeVersion) {
    return {
        resourceLogs: [
            {
                resource: {
                    attributes: toOtlpResourceKeyValueList(resourceAttributes)
                },
                scopeLogs: [
                    {
                        scope: {
                            name: scopeName,
                            version: scopeVersion
                        },
                        logRecords
                    }
                ]
            }
        ]
    };
}
export { buildOtlpLogRecord, buildOtlpLogsPayload, buildResourceAttributes, getOtlpSeverityNumber, getOtlpSeverityText };
