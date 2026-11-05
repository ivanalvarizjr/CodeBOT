import { buildOtlpResourceAttributes, toOtlpResourceKeyValueList } from "../utils/otlp-resource.mjs";
const DEFAULT_HISTOGRAM_BOUNDS = [
    0,
    5,
    10,
    25,
    50,
    75,
    100,
    250,
    500,
    750,
    1000,
    2500,
    5000,
    7500,
    10000
];
function msToUnixNano(ms) {
    return String(ms) + '000000';
}
function seriesKey(type, name, unit, attributes) {
    let attrsKey = '';
    if (attributes) {
        const keys = Object.keys(attributes).sort();
        attrsKey = keys.map((k)=>`${JSON.stringify(k)}:${JSON.stringify(attributes[k])}`).join(',');
    }
    return `${type}\u0000${name}\u0000${unit ?? ''}\u0000${attrsKey}`;
}
function bucketIndexFor(value, bounds) {
    for(let i = 0; i < bounds.length; i++)if (value <= bounds[i]) return i;
    return bounds.length;
}
function buildMetricsResourceAttributes(config, scopeName, scopeVersion) {
    return buildOtlpResourceAttributes(config, scopeName, scopeVersion);
}
function buildOtlpMetricsPayload(metrics, resourceAttributes, scopeName, scopeVersion) {
    return {
        resourceMetrics: [
            {
                resource: {
                    attributes: toOtlpResourceKeyValueList(resourceAttributes)
                },
                scopeMetrics: [
                    {
                        scope: {
                            name: scopeName,
                            version: scopeVersion
                        },
                        metrics
                    }
                ]
            }
        ]
    };
}
export { DEFAULT_HISTOGRAM_BOUNDS, bucketIndexFor, buildMetricsResourceAttributes, buildOtlpMetricsPayload, msToUnixNano, seriesKey };
