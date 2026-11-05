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
const MAX_JSON_SAFE_VALUE_DEPTH = 20;
const MAX_JSON_SAFE_VALUE_ITEMS = 1000;
const MAX_JSON_SAFE_VALUE_NODES = 10000;
const CIRCULAR_VALUE = '[Circular]';
const TRUNCATED_VALUE = '[Truncated]';
const UNSERIALIZABLE_VALUE = '[Unserializable]';
const FUNCTION_VALUE = '[Function]';
const dateGetTime = Date.prototype.getTime;
const dateToISOString = Date.prototype.toISOString;
const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
function sanitizeString(value) {
    let output = '';
    for(let index = 0; index < value.length; index++){
        const codeUnit = value.charCodeAt(index);
        if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
            const nextCodeUnit = value.charCodeAt(index + 1);
            if (nextCodeUnit >= 0xdc00 && nextCodeUnit <= 0xdfff) {
                output += value[index] + value[index + 1];
                index++;
            } else output += '\ufffd';
        } else output += codeUnit >= 0xdc00 && codeUnit <= 0xdfff ? '\ufffd' : value[index];
    }
    return output;
}
function toJsonSafeValue(value) {
    const state = {
        ancestors: new WeakSet(),
        remainingNodes: MAX_JSON_SAFE_VALUE_NODES
    };
    const convert = (current, depth)=>{
        if (state.remainingNodes <= 0) return TRUNCATED_VALUE;
        state.remainingNodes--;
        try {
            if (null == current || 'boolean' == typeof current) return current;
            if ('string' == typeof current) return sanitizeString(current);
            if ('number' == typeof current) return Number.isFinite(current) ? current : null;
            if ('bigint' == typeof current) return current.toString();
            if ('function' == typeof current) return FUNCTION_VALUE;
            if ('symbol' == typeof current) return current.description ? `Symbol(${current.description})` : 'Symbol()';
            if (depth >= MAX_JSON_SAFE_VALUE_DEPTH) return TRUNCATED_VALUE;
            if (state.ancestors.has(current)) return CIRCULAR_VALUE;
            state.ancestors.add(current);
            try {
                if (current instanceof Date) return Number.isFinite(dateGetTime.call(current)) ? dateToISOString.call(current) : null;
                let hasToJSONResult = false;
                let toJSONResult;
                try {
                    const toJSON = current.toJSON;
                    if ('function' == typeof toJSON) {
                        toJSONResult = toJSON.call(current);
                        hasToJSONResult = true;
                    }
                } catch  {
                    hasToJSONResult = false;
                }
                if (hasToJSONResult) return convert(toJSONResult, depth + 1);
                if (Array.isArray(current)) {
                    const itemCount = Math.min(current.length, MAX_JSON_SAFE_VALUE_ITEMS);
                    const output = [];
                    let index = 0;
                    for(; index < itemCount && state.remainingNodes > 0; index++)output.push(convert(current[index], depth + 1));
                    if (current.length > index) output.push(TRUNCATED_VALUE);
                    return output;
                }
                const output = {};
                let itemCount = 0;
                let truncated = false;
                for(const key in current){
                    if (!propertyIsEnumerable.call(current, key)) break;
                    if (itemCount >= MAX_JSON_SAFE_VALUE_ITEMS || state.remainingNodes <= 0) {
                        truncated = true;
                        break;
                    }
                    const converted = convert(current[key], depth + 1);
                    Object.defineProperty(output, key, {
                        value: converted,
                        enumerable: true,
                        configurable: true,
                        writable: true
                    });
                    itemCount++;
                }
                if (truncated) output[TRUNCATED_VALUE] = 'Additional properties omitted';
                return output;
            } finally{
                state.ancestors.delete(current);
            }
        } catch  {
            return UNSERIALIZABLE_VALUE;
        }
    };
    return convert(value, 0);
}
function assignUserAttributes(target, source) {
    if (!source) return target;
    let keys = [];
    try {
        keys = Object.keys(source);
    } catch  {
        keys = [];
    }
    for (const key of keys){
        let value;
        try {
            value = source[key];
        } catch  {
            value = UNSERIALIZABLE_VALUE;
        }
        Object.defineProperty(target, key, {
            value,
            enumerable: true,
            writable: true,
            configurable: true
        });
    }
    return target;
}
__webpack_require__.d(__webpack_exports__, {
    assignUserAttributes: ()=>assignUserAttributes,
    sanitizeString: ()=>sanitizeString,
    toJsonSafeValue: ()=>toJsonSafeValue
}, {
    CIRCULAR_VALUE: CIRCULAR_VALUE,
    FUNCTION_VALUE: FUNCTION_VALUE,
    MAX_JSON_SAFE_VALUE_DEPTH: MAX_JSON_SAFE_VALUE_DEPTH,
    MAX_JSON_SAFE_VALUE_ITEMS: MAX_JSON_SAFE_VALUE_ITEMS,
    MAX_JSON_SAFE_VALUE_NODES: MAX_JSON_SAFE_VALUE_NODES,
    TRUNCATED_VALUE: TRUNCATED_VALUE,
    UNSERIALIZABLE_VALUE: UNSERIALIZABLE_VALUE
});
exports.CIRCULAR_VALUE = __webpack_exports__.CIRCULAR_VALUE;
exports.FUNCTION_VALUE = __webpack_exports__.FUNCTION_VALUE;
exports.MAX_JSON_SAFE_VALUE_DEPTH = __webpack_exports__.MAX_JSON_SAFE_VALUE_DEPTH;
exports.MAX_JSON_SAFE_VALUE_ITEMS = __webpack_exports__.MAX_JSON_SAFE_VALUE_ITEMS;
exports.MAX_JSON_SAFE_VALUE_NODES = __webpack_exports__.MAX_JSON_SAFE_VALUE_NODES;
exports.TRUNCATED_VALUE = __webpack_exports__.TRUNCATED_VALUE;
exports.UNSERIALIZABLE_VALUE = __webpack_exports__.UNSERIALIZABLE_VALUE;
exports.assignUserAttributes = __webpack_exports__.assignUserAttributes;
exports.sanitizeString = __webpack_exports__.sanitizeString;
exports.toJsonSafeValue = __webpack_exports__.toJsonSafeValue;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "CIRCULAR_VALUE",
    "FUNCTION_VALUE",
    "MAX_JSON_SAFE_VALUE_DEPTH",
    "MAX_JSON_SAFE_VALUE_ITEMS",
    "MAX_JSON_SAFE_VALUE_NODES",
    "TRUNCATED_VALUE",
    "UNSERIALIZABLE_VALUE",
    "assignUserAttributes",
    "sanitizeString",
    "toJsonSafeValue"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
