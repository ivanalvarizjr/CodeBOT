"use strict";
var __webpack_require__ = {};
(()=>{
    __webpack_require__.d = (exports1, getters, values)=>{
        var define = (defs, kind)=>{
            for(var key in defs)if (__webpack_require__.o(defs, key) && !__webpack_require__.o(exports1, key)) Object.defineProperty(exports1, key, {
                enumerable: true,
                [kind]: defs[key]
            });
        };
        define(getters, "get");
        define(values, "value");
    };
})();
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
(()=>{
    __webpack_require__.r = (exports1)=>{
        if ("u" > typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports1, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports1, '__esModule', {
            value: true
        });
    };
})();
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
    toOtlpAnyValue: ()=>toOtlpAnyValue,
    toOtlpKeyValueList: ()=>toOtlpKeyValueList
});
const external_type_utils_js_namespaceObject = require("./type-utils.js");
const external_json_utils_js_namespaceObject = require("./json-utils.js");
const INT64_RANGE_LIMIT = 9223372036854775808;
const INT64_RANGE_LIMIT_DECIMAL = '9223372036854775808';
const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
function newState() {
    return {
        ancestors: new WeakSet(),
        remainingNodes: external_json_utils_js_namespaceObject.MAX_JSON_SAFE_VALUE_NODES
    };
}
function toOtlpAnyValue(value, logger) {
    try {
        return encodeAnyValue(value, logger, newState(), 0);
    } catch  {
        return {
            stringValue: external_json_utils_js_namespaceObject.UNSERIALIZABLE_VALUE
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
        stringValue: external_json_utils_js_namespaceObject.TRUNCATED_VALUE
    };
    state.remainingNodes--;
    if ((0, external_type_utils_js_namespaceObject.isBoolean)(value)) return {
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
        stringValue: (0, external_json_utils_js_namespaceObject.sanitizeString)(value)
    };
    if ('function' == typeof value) return {
        stringValue: external_json_utils_js_namespaceObject.FUNCTION_VALUE
    };
    if ('symbol' == typeof value) return {
        stringValue: String(value)
    };
    if ('object' == typeof value && null !== value) {
        if (state.ancestors.has(value)) return {
            stringValue: external_json_utils_js_namespaceObject.CIRCULAR_VALUE
        };
        if (depth >= external_json_utils_js_namespaceObject.MAX_JSON_SAFE_VALUE_DEPTH) return {
            stringValue: external_json_utils_js_namespaceObject.TRUNCATED_VALUE
        };
        if (value instanceof Date) {
            const time = value.getTime();
            const iso = Number.isFinite(time) ? value.toISOString() : String(value);
            return {
                stringValue: 'string' == typeof iso ? (0, external_json_utils_js_namespaceObject.sanitizeString)(iso) : String(iso)
            };
        }
        state.ancestors.add(value);
        try {
            try {
                const toJSON = value.toJSON;
                if ('function' == typeof toJSON) return encodeAnyValue(toJSON.call(value), logger, state, depth + 1);
            } catch  {}
            if ((0, external_type_utils_js_namespaceObject.isArray)(value)) return {
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
        stringValue: (0, external_json_utils_js_namespaceObject.sanitizeString)(String(value))
    };
}
function encodeArrayValues(values, logger, state, depth) {
    const result = [];
    const itemCount = Math.min(values.length, external_json_utils_js_namespaceObject.MAX_JSON_SAFE_VALUE_ITEMS);
    let index = 0;
    for(; index < itemCount && state.remainingNodes > 0; index++)try {
        const element = index in values ? values[index] : void 0;
        if ((0, external_type_utils_js_namespaceObject.isNullish)(element)) continue;
        result.push(encodeAnyValue(element, logger, state, depth));
    } catch  {
        result.push({
            stringValue: external_json_utils_js_namespaceObject.UNSERIALIZABLE_VALUE
        });
    }
    if (values.length > index) result.push({
        stringValue: external_json_utils_js_namespaceObject.TRUNCATED_VALUE
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
        if (result.length >= external_json_utils_js_namespaceObject.MAX_JSON_SAFE_VALUE_ITEMS || state.remainingNodes <= 0) {
            logger?.debug('Attributes truncated: the value exceeds the OTLP encoder budget');
            break;
        }
        try {
            const value = attrs[key];
            if ((0, external_type_utils_js_namespaceObject.isNull)(value) || (0, external_type_utils_js_namespaceObject.isUndefined)(value)) continue;
            result.push({
                key: (0, external_json_utils_js_namespaceObject.sanitizeString)(key),
                value: encodeAnyValue(value, logger, state, depth)
            });
        } catch  {
            result.push({
                key: (0, external_json_utils_js_namespaceObject.sanitizeString)(key),
                value: {
                    stringValue: external_json_utils_js_namespaceObject.UNSERIALIZABLE_VALUE
                }
            });
        }
    }
    return result;
}
exports.toOtlpAnyValue = __webpack_exports__.toOtlpAnyValue;
exports.toOtlpKeyValueList = __webpack_exports__.toOtlpKeyValueList;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "toOtlpAnyValue",
    "toOtlpKeyValueList"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
