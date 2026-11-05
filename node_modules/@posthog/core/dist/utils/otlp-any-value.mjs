import { isArray, isBoolean, isNull, isNullish, isUndefined } from "./type-utils.mjs";
import { CIRCULAR_VALUE, FUNCTION_VALUE, MAX_JSON_SAFE_VALUE_DEPTH, MAX_JSON_SAFE_VALUE_ITEMS, MAX_JSON_SAFE_VALUE_NODES, TRUNCATED_VALUE, UNSERIALIZABLE_VALUE, sanitizeString } from "./json-utils.mjs";
const INT64_RANGE_LIMIT = 9223372036854775808;
const INT64_RANGE_LIMIT_DECIMAL = '9223372036854775808';
const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
function newState() {
    return {
        ancestors: new WeakSet(),
        remainingNodes: MAX_JSON_SAFE_VALUE_NODES
    };
}
function toOtlpAnyValue(value, logger) {
    try {
        return encodeAnyValue(value, logger, newState(), 0);
    } catch  {
        return {
            stringValue: UNSERIALIZABLE_VALUE
        };
    }
}
function toOtlpKeyValueList(attrs, logger) {
    try {
        return encodeKeyValueList(attrs, logger, newState(), 0);
    } catch  {
        return [];
    }
}
function encodeBigInt(value, logger) {
    const decimal = value.toString();
    const limit = BigInt(INT64_RANGE_LIMIT_DECIMAL);
    if (value >= limit || value < -limit) {
        logger?.debug(`Attribute ${decimal} is outside the int64 range; encoding it as a string`);
        return {
            stringValue: decimal
        };
    }
    return {
        intValue: decimal
    };
}
function encodeAnyValue(value, logger, state, depth) {
    if (state.remainingNodes <= 0) return {
        stringValue: TRUNCATED_VALUE
    };
    state.remainingNodes--;
    if (isBoolean(value)) return {
        boolValue: value
    };
    if ('bigint' == typeof value) return encodeBigInt(value, logger);
    if ('number' == typeof value) {
        if (!Number.isFinite(value)) return {
            stringValue: String(value)
        };
        if (Number.isInteger(value)) {
            if (Number.isSafeInteger(value)) return {
                intValue: String(value)
            };
            if ("u" < typeof BigInt) return {
                stringValue: String(value)
            };
            const decimal = BigInt(value).toString();
            if (value >= INT64_RANGE_LIMIT || value < -INT64_RANGE_LIMIT) {
                logger?.debug(`Attribute ${decimal} is outside the int64 range; encoding it as a string`);
                return {
                    stringValue: decimal
                };
            }
            return {
                intValue: decimal
            };
        }
        return {
            doubleValue: value
        };
    }
    if ('string' == typeof value) return {
        stringValue: sanitizeString(value)
    };
    if ('function' == typeof value) return {
        stringValue: FUNCTION_VALUE
    };
    if ('symbol' == typeof value) return {
        stringValue: String(value)
    };
    if ('object' == typeof value && null !== value) {
        if (state.ancestors.has(value)) return {
            stringValue: CIRCULAR_VALUE
        };
        if (depth >= MAX_JSON_SAFE_VALUE_DEPTH) return {
            stringValue: TRUNCATED_VALUE
        };
        if (value instanceof Date) {
            const time = value.getTime();
            const iso = Number.isFinite(time) ? value.toISOString() : String(value);
            return {
                stringValue: 'string' == typeof iso ? sanitizeString(iso) : String(iso)
            };
        }
        state.ancestors.add(value);
        try {
            try {
                const toJSON = value.toJSON;
                if ('function' == typeof toJSON) return encodeAnyValue(toJSON.call(value), logger, state, depth + 1);
            } catch  {}
            if (isArray(value)) return {
                arrayValue: {
                    values: encodeArrayValues(value, logger, state, depth + 1)
                }
            };
            return {
                kvlistValue: {
                    values: encodeKeyValueList(value, logger, state, depth + 1)
                }
            };
        } finally{
            state.ancestors.delete(value);
        }
    }
    return {
        stringValue: sanitizeString(String(value))
    };
}
function encodeArrayValues(values, logger, state, depth) {
    const result = [];
    const itemCount = Math.min(values.length, MAX_JSON_SAFE_VALUE_ITEMS);
    let index = 0;
    for(; index < itemCount && state.remainingNodes > 0; index++)try {
        const element = index in values ? values[index] : void 0;
        if (isNullish(element)) continue;
        result.push(encodeAnyValue(element, logger, state, depth));
    } catch  {
        result.push({
            stringValue: UNSERIALIZABLE_VALUE
        });
    }
    if (values.length > index) result.push({
        stringValue: TRUNCATED_VALUE
    });
    return result;
}
function encodeKeyValueList(attrs, logger, state, depth) {
    const result = [];
    for(const key in attrs)if (propertyIsEnumerable.call(attrs, key)) {
        if (!key) {
            logger?.debug('Dropping an attribute with an empty key');
            continue;
        }
        if (result.length >= MAX_JSON_SAFE_VALUE_ITEMS || state.remainingNodes <= 0) {
            logger?.debug('Attributes truncated: the value exceeds the OTLP encoder budget');
            break;
        }
        try {
            const value = attrs[key];
            if (isNull(value) || isUndefined(value)) continue;
            result.push({
                key: sanitizeString(key),
                value: encodeAnyValue(value, logger, state, depth)
            });
        } catch  {
            result.push({
                key: sanitizeString(key),
                value: {
                    stringValue: UNSERIALIZABLE_VALUE
                }
            });
        }
    }
    return result;
}
export { toOtlpAnyValue, toOtlpKeyValueList };
