import { parsePayload } from "./featureFlagUtils.mjs";
const NULL_VALUES_ALLOWED_OPERATORS = [
    'exact',
    'is_not',
    'icontains',
    'not_icontains',
    'starts_with',
    'not_starts_with',
    'ends_with',
    'not_ends_with',
    'regex',
    'not_regex'
];
const LONG_SCALE = 0xfffffffffffffff;
class InconclusiveMatchError extends Error {
    constructor(message, reason = 'unsupported_definition'){
        super(message);
        this.name = this.constructor.name;
        this.reason = reason;
        Object.setPrototypeOf(this, InconclusiveMatchError.prototype);
    }
}
function readContextValue(read) {
    try {
        return read();
    } catch (e) {
        if (e instanceof InconclusiveMatchError) throw new InconclusiveMatchError(e.message, 'missing_context');
        throw e;
    }
}
function isTruthyOrFalsyPropertyValue(value) {
    if ('boolean' == typeof value) return true;
    if ('string' == typeof value) {
        const lowercaseValue = value.toLowerCase();
        return 'true' === lowercaseValue || 'false' === lowercaseValue;
    }
    if (!Array.isArray(value)) return false;
    for(let index = 0; index < value.length; index++)if (!isTruthyOrFalsyPropertyValue(index in value ? value[index] : null)) return false;
    return true;
}
function isTruthyPropertyValue(value) {
    if ('boolean' == typeof value) return value;
    if ('string' == typeof value) return 'true' === value.toLowerCase();
    if (!Array.isArray(value)) return false;
    for(let index = 0; index < value.length; index++)if (!isTruthyPropertyValue(index in value ? value[index] : null)) return false;
    return true;
}
function assertUnicodeScalarString(value) {
    for(let index = 0; index < value.length; index++){
        const unit = value.charCodeAt(index);
        if (unit >= 0xd800 && unit <= 0xdbff) {
            const next = value.charCodeAt(index + 1);
            if (index + 1 >= value.length || next < 0xdc00 || next > 0xdfff) throw new InconclusiveMatchError('Cannot stringify an unpaired surrogate like the flags service');
            index++;
        } else if (unit >= 0xdc00 && unit <= 0xdfff) throw new InconclusiveMatchError('Cannot stringify an unpaired surrogate like the flags service');
    }
}
function assertJsonRepresentable(value, seen = new Set()) {
    if (null === value || 'boolean' == typeof value) return;
    if ('string' == typeof value) return void assertUnicodeScalarString(value);
    if ('number' == typeof value) {
        if (!Number.isFinite(value)) throw new InconclusiveMatchError(`Cannot represent non-finite number ${value} like the flags service`);
        return;
    }
    if (Array.isArray(value)) {
        if (seen.has(value)) throw new InconclusiveMatchError('Cannot represent a circular array during local evaluation');
        seen.add(value);
        try {
            for(let index = 0; index < value.length; index++)if (index in value) assertJsonRepresentable(value[index], seen);
        } finally{
            seen.delete(value);
        }
        return;
    }
    if ('object' == typeof value) {
        const prototype = Object.getPrototypeOf(value);
        if (prototype !== Object.prototype && null !== prototype) throw new InconclusiveMatchError('Cannot represent a non-JSON object like the flags service');
        if (seen.has(value)) throw new InconclusiveMatchError('Cannot represent a circular object during local evaluation');
        seen.add(value);
        try {
            for (const key of Object.keys(value)){
                assertUnicodeScalarString(key);
                assertJsonRepresentable(value[key], seen);
            }
        } finally{
            seen.delete(value);
        }
        return;
    }
    throw new InconclusiveMatchError(`Cannot represent ${typeof value} like the flags service`);
}
function compareJsonObjectKeys(left, right) {
    let leftIndex = 0;
    let rightIndex = 0;
    while(leftIndex < left.length && rightIndex < right.length){
        const leftUnit = left.charCodeAt(leftIndex);
        const rightUnit = right.charCodeAt(rightIndex);
        const leftIsHighSurrogate = leftUnit >= 0xd800 && leftUnit <= 0xdbff;
        const rightIsHighSurrogate = rightUnit >= 0xd800 && rightUnit <= 0xdbff;
        const leftNext = leftIsHighSurrogate ? left.charCodeAt(leftIndex + 1) : 0;
        const rightNext = rightIsHighSurrogate ? right.charCodeAt(rightIndex + 1) : 0;
        const leftCodePoint = leftIsHighSurrogate ? (leftUnit - 0xd800) * 0x400 + leftNext - 0xdc00 + 0x10000 : leftUnit;
        const rightCodePoint = rightIsHighSurrogate ? (rightUnit - 0xd800) * 0x400 + rightNext - 0xdc00 + 0x10000 : rightUnit;
        if (leftCodePoint !== rightCodePoint) return leftCodePoint - rightCodePoint;
        leftIndex += leftIsHighSurrogate ? 2 : 1;
        rightIndex += rightIsHighSurrogate ? 2 : 1;
    }
    return left.length - right.length;
}
function serializeJsonValue(value, seen = new Set()) {
    if (null === value) return 'null';
    if ('string' == typeof value) {
        assertUnicodeScalarString(value);
        return JSON.stringify(value);
    }
    if ('boolean' == typeof value) return value ? 'true' : 'false';
    if ('number' == typeof value) {
        if (!Number.isFinite(value)) throw new InconclusiveMatchError(`Cannot stringify non-finite number ${value} like the flags service`);
        if (Number.isInteger(value)) throw new InconclusiveMatchError(`Cannot distinguish integer ${value} from an integral JSON float during local evaluation`);
        return String(value);
    }
    if (Array.isArray(value)) {
        if (seen.has(value)) throw new InconclusiveMatchError('Cannot stringify a circular array during local evaluation');
        seen.add(value);
        try {
            const items = [];
            for(let index = 0; index < value.length; index++)items.push(index in value ? serializeJsonValue(value[index], seen) : 'null');
            return `[${items.join(',')}]`;
        } finally{
            seen.delete(value);
        }
    }
    if ('object' == typeof value) {
        const prototype = Object.getPrototypeOf(value);
        if (prototype !== Object.prototype && null !== prototype) throw new InconclusiveMatchError('Cannot stringify a non-JSON object like the flags service');
        if (seen.has(value)) throw new InconclusiveMatchError('Cannot stringify a circular object during local evaluation');
        seen.add(value);
        try {
            const keys = Object.keys(value);
            keys.forEach(assertUnicodeScalarString);
            return `{${keys.sort(compareJsonObjectKeys).map((key)=>`${JSON.stringify(key)}:${serializeJsonValue(value[key], seen)}`).join(',')}}`;
        } finally{
            seen.delete(value);
        }
    }
    throw new InconclusiveMatchError(`Cannot stringify ${typeof value} like the flags service`);
}
function exactMatchString(value) {
    if ('string' == typeof value) {
        assertUnicodeScalarString(value);
        return value;
    }
    return serializeJsonValue(value);
}
const LITERAL_ESCAPED_PUNCTUATION = /[\x20-\x2f:;=?@\x5b-\x60\x7b-\x7e]/;
function getPortableRegexClasses(pattern) {
    const classes = [];
    let classStart = -1;
    let previousToken = '';
    for(let index = 0; index < pattern.length; index++){
        const character = pattern[index];
        if (character.charCodeAt(0) > 0x7f) return null;
        if ('\\' === character) {
            const escaped = pattern[++index];
            if (void 0 === escaped) break;
            if ('x' === escaped) {
                if (!/^[\da-f]{2}$/i.test(pattern.slice(index + 1, index + 3))) return null;
                index += 2;
            } else if (!'dDsSwWbBfnrtv'.includes(escaped) && !LITERAL_ESCAPED_PUNCTUATION.test(escaped)) return null;
            if (-1 === classStart && 'bB'.includes(escaped)) return null;
            previousToken = 'literal';
            continue;
        }
        if ('[' === character) {
            if (-1 !== classStart) return null;
            classStart = index;
        } else if (']' === character && -1 !== classStart) {
            const contentStart = classStart + ('^' === pattern[classStart + 1] ? 2 : 1);
            if (index === contentStart) return null;
            classes.push(pattern.slice(classStart, index + 1));
            classStart = -1;
            previousToken = 'literal';
            continue;
        } else if (-1 !== classStart) {
            if ([
                '&&',
                '--',
                '~~'
            ].includes(pattern.slice(index, index + 2))) return null;
            continue;
        } else if ('(' === character && '?' === pattern[index + 1]) {
            if (':' !== pattern[index + 2]) return null;
            index += 2;
        } else if ('{' === character) {
            const repetition = /^\{(\d+)(?:,(\d*))?\}/.exec(pattern.slice(index));
            if (!repetition || [
                '',
                '|',
                '('
            ].includes(previousToken) || repetition.slice(1).some((count)=>Number(count) > 0xffffffff)) return null;
        } else if ('*+?}'.includes(character) && ('+' === pattern[index + 1] || '{' === pattern[index + 1])) return null;
        if ('*+?{'.includes(character) && [
            '^',
            '$',
            'empty group'
        ].includes(previousToken)) return null;
        previousToken = ')' === character && [
            '(',
            'empty group'
        ].includes(previousToken) ? 'empty group' : character;
    }
    return classes;
}
function regexRequiresServerEvaluation(message) {
    const error = new InconclusiveMatchError(message);
    Object.defineProperty(error, Symbol.for('posthog.requiresServerRegexEvaluation'), {
        value: true
    });
    return error;
}
function matchFeatureFlagRegex(pattern, value) {
    if ('' === pattern) return true;
    const characterClasses = getPortableRegexClasses(pattern);
    if (null === characterClasses) throw regexRequiresServerEvaluation('Regex syntax requires server evaluation');
    let regex;
    try {
        regex = new RegExp(pattern);
    } catch (error) {
        if (error instanceof SyntaxError) return null;
        throw regexRequiresServerEvaluation('Regex compilation requires server evaluation');
    }
    for (const characterClass of characterClasses)try {
        new RegExp(characterClass, 'u');
    } catch  {
        throw regexRequiresServerEvaluation('Regex character class syntax requires server evaluation');
    }
    for(let index = 0; index < value.length; index++){
        const character = value[index];
        if (character.charCodeAt(0) > 0x7f || '\r' === character) throw regexRequiresServerEvaluation('Regex matching for Unicode or carriage returns requires server evaluation');
    }
    try {
        return regex.test(value);
    } catch  {
        throw regexRequiresServerEvaluation('Regex execution requires server evaluation');
    }
}
function asciiLowercase(value) {
    return String(value).replace(/[A-Z]/g, (character)=>character.toLowerCase());
}
function parseSemverNumericIdentifier(part, raw, parsingPolicy) {
    if (!/^\d+$/.test(part) || 'strict' === parsingPolicy && part.length > 1 && '0' === part[0]) throw new InconclusiveMatchError(`Invalid semver: ${raw}`);
    return parseInt(part, 10);
}
function parseFeatureFlagSemver(value, parsingPolicy = 'strict') {
    const text = String(value).trim().replace(/^[vV]/, '');
    const baseVersion = text.split('-')[0].split('+')[0];
    if (!baseVersion || baseVersion.startsWith('.')) throw new InconclusiveMatchError(`Invalid semver: ${value}`);
    const parts = baseVersion.split('.');
    const parsePart = (part)=>{
        if (void 0 === part || '' === part) return 0;
        return parseSemverNumericIdentifier(part, value, parsingPolicy);
    };
    return [
        parsePart(parts[0]),
        parsePart(parts[1]),
        parsePart(parts[2])
    ];
}
function compareSemverTuples(a, b) {
    for(let i = 0; i < 3; i++){
        if (a[i] < b[i]) return -1;
        if (a[i] > b[i]) return 1;
    }
    return 0;
}
function computeTildeBounds(value, parsingPolicy) {
    const parsed = parseFeatureFlagSemver(value, parsingPolicy);
    return {
        lower: [
            parsed[0],
            parsed[1],
            parsed[2]
        ],
        upper: [
            parsed[0],
            parsed[1] + 1,
            0
        ]
    };
}
function computeCaretBounds(value, parsingPolicy) {
    const [major, minor, patch] = parseFeatureFlagSemver(value, parsingPolicy);
    const lower = [
        major,
        minor,
        patch
    ];
    let upper;
    upper = major > 0 ? [
        major + 1,
        0,
        0
    ] : minor > 0 ? [
        0,
        minor + 1,
        0
    ] : [
        0,
        0,
        patch + 1
    ];
    return {
        lower,
        upper
    };
}
function computeWildcardBounds(value, parsingPolicy) {
    const text = String(value).trim().replace(/^[vV]/, '');
    const cleanedText = text.replace(/\.\*$/, '').replace(/\*$/, '');
    if (!cleanedText) throw new InconclusiveMatchError(`Invalid wildcard semver: ${value}`);
    const parts = cleanedText.split('.');
    const parseWildcardPart = (part)=>{
        if ('legacy-permissive' === parsingPolicy) {
            const parsed = parseInt(part, 10);
            if (!isNaN(parsed)) return parsed;
        } else try {
            return parseSemverNumericIdentifier(part, value, parsingPolicy);
        } catch  {}
        throw new InconclusiveMatchError(`Invalid wildcard semver: ${value}`);
    };
    const major = parseWildcardPart(parts[0]);
    if (1 === parts.length) return {
        lower: [
            major,
            0,
            0
        ],
        upper: [
            major + 1,
            0,
            0
        ]
    };
    const minor = parseWildcardPart(parts[1]);
    return {
        lower: [
            major,
            minor,
            0
        ],
        upper: [
            major,
            minor + 1,
            0
        ]
    };
}
function convertToDateTime(value) {
    if (value instanceof Date) return value;
    if ('string' == typeof value || 'number' == typeof value) {
        const date = new Date(value);
        if (!isNaN(date.valueOf())) return date;
        throw new InconclusiveMatchError(`${value} is in an invalid date format`);
    }
    throw new InconclusiveMatchError(`The date provided ${value} must be a string, number, or date object`);
}
function relativeDateParseForFeatureFlagMatching(value) {
    const regex = /^-?(?<number>[0-9]+)(?<interval>[a-z])$/;
    const match = value.match(regex);
    const parsedDt = new Date(new Date().toISOString());
    if (!match || !match.groups) return null;
    const number = parseInt(match.groups['number']);
    if (number >= 10000) return null;
    const interval = match.groups['interval'];
    if ('h' === interval) parsedDt.setUTCHours(parsedDt.getUTCHours() - number);
    else if ('d' === interval) parsedDt.setUTCDate(parsedDt.getUTCDate() - number);
    else if ('w' === interval) parsedDt.setUTCDate(parsedDt.getUTCDate() - 7 * number);
    else if ('m' === interval) parsedDt.setUTCMonth(parsedDt.getUTCMonth() - number);
    else {
        if ('y' !== interval) return null;
        parsedDt.setUTCFullYear(parsedDt.getUTCFullYear() - number);
    }
    return parsedDt;
}
function parseDateFilter(value) {
    if ('boolean' == typeof value) throw new InconclusiveMatchError('Date operations cannot be performed on boolean values');
    return relativeDateParseForFeatureFlagMatching(String(value)) ?? convertToDateTime(value);
}
function assertFeatureFlagFilterSupported(property, options = {}) {
    const value = property.value;
    const parsingPolicy = options.semverParsingPolicy ?? 'strict';
    switch(property.operator || 'exact'){
        case 'exact':
        case 'is_not':
            for (const item of Array.isArray(value) ? value : [
                value
            ])exactMatchString(item);
            return;
        case 'is_set':
        case 'is_not_set':
        case 'icontains':
        case 'not_icontains':
        case 'starts_with':
        case 'not_starts_with':
        case 'ends_with':
        case 'not_ends_with':
        case 'regex':
        case 'not_regex':
        case 'gt':
        case 'gte':
        case 'lt':
        case 'lte':
            return;
        case 'is_date_after':
        case 'is_date_before':
            parseDateFilter(value);
            return;
        case 'semver_eq':
        case 'semver_neq':
        case 'semver_gt':
        case 'semver_gte':
        case 'semver_lt':
        case 'semver_lte':
            parseFeatureFlagSemver(String(value), parsingPolicy);
            return;
        case 'semver_tilde':
            computeTildeBounds(String(value), parsingPolicy);
            return;
        case 'semver_caret':
            computeCaretBounds(String(value), parsingPolicy);
            return;
        case 'semver_wildcard':
            computeWildcardBounds(String(value), parsingPolicy);
            return;
        default:
            throw new InconclusiveMatchError(`Unknown operator: ${property.operator}`);
    }
}
function matchFeatureFlagProperty(property, propertyValues, options = {}) {
    try {
        return matchPropertyValue(property, propertyValues, options);
    } catch (e) {
        if (e instanceof InconclusiveMatchError && 'missing_context' === e.reason) assertFeatureFlagFilterSupported(property, options);
        throw e;
    }
}
function matchPropertyValue(property, propertyValues, options) {
    const key = property.key;
    const value = property.value;
    const operator = property.operator || 'exact';
    const parsingPolicy = options.semverParsingPolicy ?? 'strict';
    const hasProperty = Object.prototype.hasOwnProperty.call(propertyValues, key);
    if (hasProperty) {
        if ('is_not_set' === operator) return false;
        else if ('is_set' === operator) return true;
    } else throw new InconclusiveMatchError(`Property ${key} not found in propertyValues`, 'missing_context');
    const overrideValue = propertyValues[key];
    if (void 0 === overrideValue) {
        options.warnFunction?.(`Property ${key} cannot have a value of undefined with the ${operator} operator`);
        throw new InconclusiveMatchError(`Property ${key} is undefined in propertyValues`);
    }
    if (null === overrideValue && !NULL_VALUES_ALLOWED_OPERATORS.includes(operator)) {
        options.warnFunction?.(`Property ${key} cannot have a value of null with the ${operator} operator`);
        return false;
    }
    const computeExactMatch = (target, actual)=>{
        if (2 !== options.propertyMatchingVersion && isTruthyOrFalsyPropertyValue(target) || Array.isArray(target) && 0 === target.length) {
            readContextValue(()=>assertJsonRepresentable(actual));
            return isTruthyPropertyValue(target) === isTruthyPropertyValue(actual);
        }
        if (2 === options.propertyMatchingVersion && 'number' == typeof actual && isTruthyOrFalsyPropertyValue(target)) {
            readContextValue(()=>assertJsonRepresentable(actual));
            return false;
        }
        if (Array.isArray(target)) {
            const actualString = readContextValue(()=>exactMatchString(actual)).toLowerCase();
            return target.some((item)=>exactMatchString(item).toLowerCase() === actualString);
        }
        const targetString = exactMatchString(target).toLowerCase();
        return targetString === readContextValue(()=>exactMatchString(actual)).toLowerCase();
    };
    const compare = (lhs, rhs, comparisonOperator)=>{
        if ('gt' === comparisonOperator) return lhs > rhs;
        if ('gte' === comparisonOperator) return lhs >= rhs;
        if ('lt' === comparisonOperator) return lhs < rhs;
        if ('lte' === comparisonOperator) return lhs <= rhs;
        throw new Error(`Invalid operator: ${comparisonOperator}`);
    };
    const parseContextSemver = ()=>readContextValue(()=>parseFeatureFlagSemver(String(overrideValue), parsingPolicy));
    const compareContextSemverToFilter = ()=>{
        const filterParsed = parseFeatureFlagSemver(String(value), parsingPolicy);
        return compareSemverTuples(parseContextSemver(), filterParsed);
    };
    const isContextSemverWithin = ({ lower, upper })=>{
        const overrideParsed = parseContextSemver();
        return compareSemverTuples(overrideParsed, lower) >= 0 && compareSemverTuples(overrideParsed, upper) < 0;
    };
    switch(operator){
        case 'exact':
            return computeExactMatch(value, overrideValue);
        case 'is_not':
            return !computeExactMatch(value, overrideValue);
        case 'is_set':
            return true;
        case 'icontains':
            return asciiLowercase(overrideValue).includes(asciiLowercase(value));
        case 'not_icontains':
            return !asciiLowercase(overrideValue).includes(asciiLowercase(value));
        case 'starts_with':
            return asciiLowercase(overrideValue).startsWith(asciiLowercase(value));
        case 'not_starts_with':
            return !asciiLowercase(overrideValue).startsWith(asciiLowercase(value));
        case 'ends_with':
            return asciiLowercase(overrideValue).endsWith(asciiLowercase(value));
        case 'not_ends_with':
            return !asciiLowercase(overrideValue).endsWith(asciiLowercase(value));
        case 'regex':
        case 'not_regex':
            {
                const matched = matchFeatureFlagRegex(String(value), String(overrideValue));
                if (null === matched) return false;
                return 'regex' === operator ? matched : !matched;
            }
        case 'gt':
        case 'gte':
        case 'lt':
        case 'lte':
            {
                const parsedValue = 'number' == typeof value ? value : parseFloat(String(value));
                const parsedOverride = 'number' == typeof overrideValue ? overrideValue : null != overrideValue ? parseFloat(String(overrideValue)) : 0 / 0;
                if (Number.isFinite(parsedValue) && Number.isFinite(parsedOverride)) return compare(parsedOverride, parsedValue, operator);
                return compare(String(overrideValue), String(value), operator);
            }
        case 'is_date_after':
        case 'is_date_before':
            {
                const parsedDate = parseDateFilter(value);
                const overrideDate = readContextValue(()=>convertToDateTime(overrideValue));
                return 'is_date_before' === operator ? overrideDate < parsedDate : overrideDate > parsedDate;
            }
        case 'semver_eq':
            return 0 === compareContextSemverToFilter();
        case 'semver_neq':
            return 0 !== compareContextSemverToFilter();
        case 'semver_gt':
            return compareContextSemverToFilter() > 0;
        case 'semver_gte':
            return compareContextSemverToFilter() >= 0;
        case 'semver_lt':
            return compareContextSemverToFilter() < 0;
        case 'semver_lte':
            return compareContextSemverToFilter() <= 0;
        case 'semver_tilde':
            return isContextSemverWithin(computeTildeBounds(String(value), parsingPolicy));
        case 'semver_caret':
            return isContextSemverWithin(computeCaretBounds(String(value), parsingPolicy));
        case 'semver_wildcard':
            return isContextSemverWithin(computeWildcardBounds(String(value), parsingPolicy));
        default:
            throw new InconclusiveMatchError(`Unknown operator: ${operator}`);
    }
}
async function hashSHA1(text) {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) throw new Error('SubtleCrypto API not available');
    const hashBuffer = await subtle.digest('SHA-1', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(hashBuffer)).map((byte)=>byte.toString(16).padStart(2, '0')).join('');
}
async function getFeatureFlagHash(key, bucketingValue, salt = '', separator = '.') {
    const hashString = await hashSHA1(`${key}${separator}${bucketingValue}${salt}`);
    return parseInt(hashString.slice(0, 15), 16) / LONG_SCALE;
}
async function getHoldoutVariant(holdout, bucketingValue) {
    if (null == holdout || null == holdout.id || null == holdout.exclusion_percentage) return;
    const rawPercentage = Number(holdout.exclusion_percentage);
    if (!Number.isFinite(rawPercentage)) return;
    const percentage = Math.min(Math.max(rawPercentage, 0), 100);
    if (100 !== percentage) {
        const hash = await getFeatureFlagHash('holdout', bucketingValue, '', '-');
        if (hash > percentage / 100) return;
    }
    return `holdout-${holdout.id}`;
}
function getFeatureFlagVariantLookupTable(variants) {
    const table = [];
    let valueMin = 0;
    for (const variant of variants){
        const valueMax = valueMin + variant.rollout_percentage / 100.0;
        table.push({
            valueMin,
            valueMax,
            key: variant.key
        });
        valueMin = valueMax;
    }
    return table;
}
async function getFeatureFlagVariant(key, bucketingValue, variants) {
    const hashValue = await getFeatureFlagHash(key, bucketingValue, 'variant');
    return getFeatureFlagVariantLookupTable(variants).find((variant)=>hashValue >= variant.valueMin && hashValue < variant.valueMax)?.key;
}
function resolveFeatureFlagPayload(payloads, flagValue) {
    if (false === flagValue || null == flagValue || !payloads) return null;
    const payloadKey = 'boolean' == typeof flagValue ? flagValue.toString() : flagValue;
    const payload = payloads[payloadKey] || null;
    return null == payload ? null : parsePayload(payload);
}
export { InconclusiveMatchError, assertFeatureFlagFilterSupported, getFeatureFlagHash, getFeatureFlagVariant, getFeatureFlagVariantLookupTable, getHoldoutVariant, hashSHA1, matchFeatureFlagProperty, parseFeatureFlagSemver, relativeDateParseForFeatureFlagMatching, resolveFeatureFlagPayload };
