import { assignUserAttributes } from "./json-utils.mjs";
import { toOtlpKeyValueList } from "./otlp-any-value.mjs";
function buildOtlpResourceAttributes(config, sdkName, sdkVersion) {
    return {
        ...assignUserAttributes({}, config.resourceAttributes),
        'service.name': config.serviceName || 'unknown_service',
        ...config.environment && {
            'deployment.environment': config.environment
        },
        ...config.serviceVersion && {
            'service.version': config.serviceVersion
        },
        'telemetry.sdk.name': sdkName,
        'telemetry.sdk.version': sdkVersion
    };
}
const SDK_RESOURCE_KEYS = [
    'service.name',
    'deployment.environment',
    'service.version',
    'telemetry.sdk.name',
    'telemetry.sdk.version'
];
function toOtlpResourceKeyValueList(attributes, logger) {
    const user = assignUserAttributes({}, attributes);
    const sdk = {};
    for (const key of SDK_RESOURCE_KEYS)if (Object.prototype.hasOwnProperty.call(user, key)) {
        sdk[key] = user[key];
        delete user[key];
    }
    return [
        ...toOtlpKeyValueList(user, logger),
        ...toOtlpKeyValueList(sdk, logger)
    ];
}
const OS_NAMES = {
    darwin: 'macOS',
    win32: 'Windows',
    cygwin: 'Windows',
    linux: 'Linux',
    android: 'Android',
    freebsd: 'FreeBSD',
    openbsd: 'OpenBSD',
    netbsd: 'NetBSD',
    sunos: 'SunOS',
    aix: 'AIX',
    haiku: 'Haiku',
    'Mac OS X': 'macOS'
};
function normalizeOsName(name) {
    if (!name) return;
    return Object.prototype.hasOwnProperty.call(OS_NAMES, name) ? OS_NAMES[name] : name;
}
function osResourceAttributes(name, version) {
    const osName = normalizeOsName(name);
    return {
        ...osName ? {
            'os.name': osName
        } : {},
        ...version ? {
            'os.version': version
        } : {}
    };
}
export { buildOtlpResourceAttributes, normalizeOsName, osResourceAttributes, toOtlpResourceKeyValueList };
