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
const REDACTED_VALUE = '[redacted]';
const BINARY_REDACTED_VALUE = '[binary data redacted - not supported by PostHog MCP analytics]';
const BASE64_PATTERN = /^[A-Za-z0-9+/\n\r]+=*$/;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+={0,2}$/;
const BASE64URL_SPECIFIC_CHAR_PATTERN = /[-_]/;
const BASE64_DATA_URL_PREFIX_PATTERN = /^data:[^,\s]*;base64,/i;
const BASE64_DATA_URL_PAYLOAD_PATTERN = /^[A-Za-z0-9+/_-]+={0,2}$/;
const SIZE_GATE = 10240;
const POSTHOG_TOKEN_PATTERN = /\bph[a-z]_[A-Za-z0-9_-]{20,}\b/g;
const SENSITIVE_KEY_PATTERN = /^(authorization|cookie|set-cookie|x-api-key|api[-_]?key|api[-_]?token|access[-_]?token|refresh[-_]?token|token|password|secret|client[-_]?secret|private[-_]?key)$/i;
const URL_PATTERN = /[a-z][a-z0-9+.-]{0,63}:[^\s<>"]+/gi;
const URL_END_PATTERN = /[\s<>"]/;
const URL_PATTERN_ONCE = /* @__PURE__ */ (()=>new RegExp(URL_PATTERN.source, 'i'))();
const URL_AUTHORITY_SEARCH = /[a-z][a-z0-9+.-]{0,63}:\/\//i;
const URL_AUTHORITY_PATTERN = /* @__PURE__ */ (()=>new RegExp(`^${URL_AUTHORITY_SEARCH.source}`, 'i'))();
const URL_AUTHORITY_SEARCH_ALL = /* @__PURE__ */ (()=>new RegExp(URL_AUTHORITY_SEARCH.source, 'gi'))();
const URL_FIELD_CHARACTERS = '=&';
const LEGACY_FIELD_SEPARATOR = ';';
const URL_TRAILING_PUNCTUATION = ".,;:!?)]}'";
const MAX_URL_LENGTH = 8192;
const MAX_URL_QUERY_FIELDS = 128;
const SENSITIVE_QUERY_KEY_SEGMENT_PATTERN = /(^|[-_./;])(auth|token|secret|password|passwd|pwd|credential|signature|sig|key|hmac|sas|bearer|jwt|session|sessionid)([-_./;]|$)/i;
const SENSITIVE_QUERY_KEY_EXACT_PATTERN = /^(code|AWSAccessKeyId|GoogleAccessId|Policy)$/i;
const UNICODE_SPACE_PATTERN = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,255}\.[A-Za-z]{2,24}/g;
const IPV4_PATTERN = /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g;
const IPV6_PATTERN = /(^|[^\w:])((?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,7}:|(?:[0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4}){0,5}|::(?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4}){0,6})))(?=$|[^\w:])/g;
const US_SSN_PATTERN = /\b\d{3}[ .-]\d{2}[ .-]\d{4}\b/g;
const CREDIT_CARD_CANDIDATE_PATTERN = /\b\d(?:[ ./-]?\d){12,}\b/g;
const DIGIT_GROUP_PATTERN = /\d+/g;
const PHONE_NANP_PATTERN = /(^|[^\w+])((?:\+?1[ ./-]?)?(?:\(\d{3}\)[ ./-]?|\d{3}[ ./-])\d{3}[ ./-]\d{4})(?![\w])/g;
const PHONE_INTL_PATTERN = /(^|[^\w])(\+\d{1,3}(?:[ ./()-]{0,2}\d){7,13})(?![\w])/g;
function shouldRedactKey(key) {
    return SENSITIVE_KEY_PATTERN.test(key);
}
function shouldRedactQueryKey(key) {
    return shouldRedactKey(key) || SENSITIVE_QUERY_KEY_SEGMENT_PATTERN.test(key) || SENSITIVE_QUERY_KEY_EXACT_PATTERN.test(key);
}
function isBase64DataUrl(value) {
    const prefix = BASE64_DATA_URL_PREFIX_PATTERN.exec(value);
    if (!prefix) return false;
    let payload;
    try {
        payload = decodeURIComponent(value.slice(prefix[0].length));
    } catch  {
        return false;
    }
    return BASE64_DATA_URL_PAYLOAD_PATTERN.test(payload.replace(/[\r\n]/g, ''));
}
function exceedsUrlFieldLimit(fields) {
    return fields.split('&', MAX_URL_QUERY_FIELDS + 1).length > MAX_URL_QUERY_FIELDS;
}
function hasLegacySensitiveField(value) {
    return value.split(LEGACY_FIELD_SEPARATOR).some((piece)=>shouldRedactQueryKey(piece.split('=', 1)[0]));
}
function sanitizeUrlFieldValue(key, value, allowNestedUrls) {
    if (shouldRedactQueryKey(key)) return REDACTED_VALUE;
    if (value.includes(LEGACY_FIELD_SEPARATOR) && hasLegacySensitiveField(value)) return REDACTED_VALUE;
    if (!URL_PATTERN_ONCE.test(value)) return value;
    return allowNestedUrls ? sanitizeUrlsInString(value, {
        allowNestedUrls: false,
        stripPunctuation: true
    }) : REDACTED_VALUE;
}
function sanitizeUrlFields(fields, allowNestedUrls) {
    const sanitized = new URLSearchParams();
    let changed = false;
    let lastFieldSensitive = false;
    for (const [decodedKey, decodedValue] of new URLSearchParams(fields)){
        const key = redactCredentials(decodedKey);
        const value = redactCredentials(decodedValue);
        changed ||= key !== decodedKey || value !== decodedValue;
        const sanitizedValue = sanitizeUrlFieldValue(key, value, allowNestedUrls);
        changed ||= sanitizedValue !== value;
        lastFieldSensitive = shouldRedactQueryKey(key) || sanitizedValue !== value;
        sanitized.append(key, sanitizedValue);
    }
    return {
        changed,
        lastFieldSensitive,
        serialized: sanitized.toString()
    };
}
function splitTrailingPunctuation(value) {
    let end = value.length;
    while(end > 0 && URL_TRAILING_PUNCTUATION.includes(value[end - 1]))end--;
    return {
        address: value.slice(0, end),
        suffix: value.slice(end)
    };
}
function sanitizeFragmentTail(tail, headLastFieldSensitive, allowNestedUrls) {
    if (!headLastFieldSensitive) return sanitizeFragmentPart(tail, allowNestedUrls);
    return {
        value: '' === tail ? '' : REDACTED_VALUE,
        lastFieldSensitive: true
    };
}
function splitFragmentParts(hash) {
    const fragment = hash.slice(1);
    const separator = fragment.indexOf('?');
    if (separator < 0) return {
        head: fragment,
        tail: null
    };
    return {
        head: fragment.slice(0, separator),
        tail: fragment.slice(separator + 1)
    };
}
function sanitizeFragmentPart(part, allowNestedUrls) {
    if (!part.includes('=')) return {
        value: sanitizeFragmentText(part, allowNestedUrls),
        lastFieldSensitive: false
    };
    const fields = sanitizeUrlFields(part, allowNestedUrls);
    return {
        value: fields.changed ? fields.serialized : part,
        lastFieldSensitive: fields.lastFieldSensitive
    };
}
function sanitizeFragmentText(text, allowNestedUrls) {
    if (!allowNestedUrls) return URL_PATTERN_ONCE.test(text) ? REDACTED_VALUE : text;
    return sanitizeUrlsInString(text, {
        allowNestedUrls: false,
        stripPunctuation: true
    });
}
function findEmbeddedAuthorityIndexes(value) {
    if (!value.includes('://')) return [];
    const starts = [
        ...value.matchAll(URL_AUTHORITY_SEARCH_ALL)
    ].map((match)=>match.index);
    const indexes = [];
    const delimiters = {
        query: false,
        fragment: false,
        fragmentQuery: false
    };
    let pending = 0;
    let inFields = false;
    let lastStructural = '';
    for(let cursor = 0; cursor < value.length && pending < starts.length; cursor++){
        if (starts[pending] === cursor) {
            if (cursor > 0 && '=' !== lastStructural) indexes.push(cursor);
            pending++;
        }
        const character = value[cursor];
        if (isDelimiter(character, delimiters, lastStructural)) {
            lastStructural = character;
            inFields = true;
        } else if (inFields && URL_FIELD_CHARACTERS.includes(character)) lastStructural = character;
    }
    return indexes;
}
function isDelimiter(character, seen, lastStructural) {
    if ('#' === character) return seen.fragment ? false : seen.fragment = true;
    if ('?' !== character) return false;
    if (seen.fragment) {
        if ('=' === lastStructural) return false;
        return seen.fragmentQuery ? false : seen.fragmentQuery = true;
    }
    return seen.query ? false : seen.query = true;
}
function sanitizeUrl(value, mode) {
    const embedded = findEmbeddedAuthorityIndexes(value);
    if (0 === embedded.length) return sanitizeSingleUrl(value, mode);
    let result = '';
    let start = 0;
    for (const index of embedded){
        result += sanitizeSingleUrl(value.slice(start, index), {
            ...mode,
            stripPunctuation: false
        });
        start = index;
    }
    return result + sanitizeSingleUrl(value.slice(start), mode);
}
function sanitizeSingleUrl(value, mode) {
    if (value.length > MAX_URL_LENGTH && URL_AUTHORITY_PATTERN.test(value)) return REDACTED_VALUE;
    const { address, suffix } = mode.stripPunctuation ? splitTrailingPunctuation(value) : {
        address: value,
        suffix: ''
    };
    let url;
    try {
        url = new URL(address);
    } catch  {
        return REDACTED_VALUE + suffix;
    }
    const query = url.search.slice(1);
    const hasFragment = '' !== url.hash;
    const fragment = splitFragmentParts(url.hash);
    if (exceedsUrlFieldLimit(query) || exceedsUrlFieldLimit(fragment.head) || exceedsUrlFieldLimit(fragment.tail ?? '')) return REDACTED_VALUE + suffix;
    let changed = false;
    if (url.username || url.password) {
        url.username = REDACTED_VALUE;
        url.password = '';
        changed = true;
    }
    const sanitizedQuery = sanitizeUrlFields(query, mode.allowNestedUrls);
    if (sanitizedQuery.changed) {
        url.search = sanitizedQuery.serialized;
        changed = true;
    }
    const sanitizedHead = sanitizeFragmentPart(fragment.head, mode.allowNestedUrls);
    const sanitizedTail = null === fragment.tail ? null : sanitizeFragmentTail(fragment.tail, sanitizedHead.lastFieldSensitive, mode.allowNestedUrls);
    const sanitizedHash = null === sanitizedTail ? sanitizedHead.value : `${sanitizedHead.value}?${sanitizedTail.value}`;
    if (sanitizedHash !== url.hash.slice(1)) {
        url.hash = sanitizedHash;
        changed = true;
    }
    const trailingFields = hasFragment ? sanitizedTail ?? sanitizedHead : sanitizedQuery;
    return (changed ? redactCredentials(url.toString()) : address) + (trailingFields.lastFieldSensitive ? '' : suffix);
}
function sanitizeUrlsInString(text, mode) {
    return text.replace(URL_PATTERN, (match)=>sanitizeUrl(match, {
            ...mode,
            stripPunctuation: mode.stripPunctuation && match.length !== text.length
        }));
}
function isBinaryBlob(value) {
    return value.length >= SIZE_GATE && (BASE64_PATTERN.test(value) || isBase64DataUrl(value) || BASE64URL_SPECIFIC_CHAR_PATTERN.test(value) && BASE64URL_PATTERN.test(value));
}
function redactCredentials(value) {
    return value.replace(POSTHOG_TOKEN_PATTERN, REDACTED_VALUE);
}
function redactUrls(value) {
    return sanitizeUrlsInString(value, {
        allowNestedUrls: true,
        stripPunctuation: true
    });
}
function redactCapturedHead(value, redact, options) {
    const scannedHeadLength = 4 * options.maxStringLength;
    if (value.length > scannedHeadLength) {
        const head = redact(value.slice(0, headLength(value, scannedHeadLength)));
        if (head.length >= 2 * options.maxStringLength) return head + options.truncationSuffix;
    }
    return redact(value);
}
function headLength(value, scannedHeadLength) {
    let end = scannedHeadLength;
    while(end > 0 && !URL_END_PATTERN.test(value[end - 1]))end--;
    return end;
}
function sanitizeString(value, options) {
    return isBinaryBlob(value) ? BINARY_REDACTED_VALUE : redactCapturedHead(value, (head)=>redactUrls(redactCredentials(head)), options);
}
function sanitizeFreeText(value, options) {
    if (isBinaryBlob(value)) return BINARY_REDACTED_VALUE;
    return redactCapturedHead(value, (head)=>redactUrls(redactPii(redactCredentials(head))), options);
}
function passesLuhn(digits) {
    let sum = 0;
    let double = false;
    for(let index = digits.length - 1; index >= 0; index--){
        let digit = digits.charCodeAt(index) - 48;
        if (digit < 0 || digit > 9) return false;
        if (double) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        double = !double;
    }
    return sum % 10 === 0;
}
function redactCardInMatch(match) {
    const groups = [];
    for(let m = DIGIT_GROUP_PATTERN.exec(match); null !== m; m = DIGIT_GROUP_PATTERN.exec(match))groups.push({
        digits: m[0],
        start: m.index,
        end: m.index + m[0].length
    });
    let output = '';
    let cursor = 0;
    let first = 0;
    while(first < groups.length){
        let digits = '';
        let matchedLast = -1;
        for(let last = first; last < groups.length; last++){
            digits += groups[last].digits;
            if (digits.length > 19) break;
            if (digits.length >= 13 && passesLuhn(digits)) matchedLast = last;
        }
        if (matchedLast >= 0) {
            output += match.slice(cursor, groups[first].start) + REDACTED_VALUE;
            cursor = groups[matchedLast].end;
            first = matchedLast + 1;
        } else first++;
    }
    return output + match.slice(cursor);
}
function redactPii(value) {
    let result = value.replace(UNICODE_SPACE_PATTERN, ' ');
    result = result.replace(EMAIL_PATTERN, REDACTED_VALUE);
    result = result.replace(IPV4_PATTERN, REDACTED_VALUE);
    result = result.replace(IPV6_PATTERN, `$1${REDACTED_VALUE}`);
    result = result.replace(CREDIT_CARD_CANDIDATE_PATTERN, redactCardInMatch);
    result = result.replace(US_SSN_PATTERN, REDACTED_VALUE);
    result = result.replace(PHONE_NANP_PATTERN, `$1${REDACTED_VALUE}`);
    result = result.replace(PHONE_INTL_PATTERN, `$1${REDACTED_VALUE}`);
    return result;
}
function sanitizeCapturedValue(value, options) {
    return sanitizeValueWith(value, (stringValue)=>sanitizeString(stringValue, options));
}
function sanitizeFreeTextValue(value, options) {
    return sanitizeValueWith(value, (stringValue)=>sanitizeFreeText(stringValue, options));
}
function sanitizeValueWith(value, sanitizeStringFn) {
    if (null == value) return value;
    if ('string' == typeof value) return sanitizeStringFn(value);
    if (Array.isArray(value)) return value.map((item)=>sanitizeValueWith(item, sanitizeStringFn));
    if (value instanceof Date) return value;
    if ('object' != typeof value) return value;
    const result = {};
    for (const [key, nestedValue] of Object.entries(value))result[key] = shouldRedactKey(key) ? REDACTED_VALUE : sanitizeValueWith(nestedValue, sanitizeStringFn);
    return result;
}
__webpack_require__.d(__webpack_exports__, {
    redactPii: ()=>redactPii,
    sanitizeCapturedValue: ()=>sanitizeCapturedValue,
    sanitizeFreeText: ()=>sanitizeFreeText,
    sanitizeFreeTextValue: ()=>sanitizeFreeTextValue
});
exports.redactPii = __webpack_exports__.redactPii;
exports.sanitizeCapturedValue = __webpack_exports__.sanitizeCapturedValue;
exports.sanitizeFreeText = __webpack_exports__.sanitizeFreeText;
exports.sanitizeFreeTextValue = __webpack_exports__.sanitizeFreeTextValue;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "redactPii",
    "sanitizeCapturedValue",
    "sanitizeFreeText",
    "sanitizeFreeTextValue"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
