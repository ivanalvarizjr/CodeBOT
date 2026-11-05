import { TRACE_FLAGS_SAMPLED, formatTraceparent, normalizeTraceparent, sanitizeTracestate, traceparentHeader } from "./traceparent.mjs";
import { clampEndTime, resolveSuppliedTime, sanitizeName } from "./sanitize.mjs";
import { isArray, isError, isNullish } from "../utils/index.mjs";
import { CIRCULAR_VALUE, MAX_JSON_SAFE_VALUE_DEPTH, MAX_JSON_SAFE_VALUE_ITEMS, MAX_JSON_SAFE_VALUE_NODES, UNSERIALIZABLE_VALUE, assignUserAttributes } from "../utils/json-utils.mjs";
function monotonicNow() {
    const perf = globalThis.performance;
    return 'function' == typeof perf?.now ? perf.now() : void 0;
}
class PostHogSpan {
    constructor(init, _onEnd, _logger){
        this._onEnd = _onEnd;
        this._logger = _logger;
        this._events = [];
        this._ended = false;
        this._userAttributeCount = 0;
        this._userEventCount = 0;
        this._droppedAttributes = 0;
        this._droppedEvents = 0;
        this._traceId = init.traceId;
        this._spanId = init.spanId;
        this._parentSpanId = init.parentSpanId;
        this._traceState = init.traceState;
        this._traceFlags = init.traceFlags ?? TRACE_FLAGS_SAMPLED;
        this._parentIsRemote = init.parentIsRemote ?? false;
        this._name = init.name;
        this._kind = init.kind;
        this._autoKeys = new Set(init.autoAttributeKeys);
        this._maxAttributes = init.maxAttributes;
        this._maxEvents = init.maxEvents;
        this._maxAttributesPerEvent = init.maxAttributesPerEvent;
        this._maxAttributeValueLength = init.maxAttributeValueLength;
        this._attributes = Object.create(null);
        for (const key of Object.keys(init.attributes))this._writeAttribute(key, init.attributes[key]);
        this._startMono = init.backdated ? void 0 : monotonicNow();
        this._startTime = init.clockAnchor && void 0 !== this._startMono ? init.clockAnchor.wall + (this._startMono - init.clockAnchor.mono) : init.startTime;
        if (void 0 !== this._startMono) this._clockAnchor = init.clockAnchor ?? {
            wall: this._startTime,
            mono: this._startMono
        };
    }
    _now() {
        if (void 0 !== this._startMono) {
            const mono = monotonicNow();
            if (void 0 !== mono) return this._startTime + Math.max(0, mono - this._startMono);
        }
        return Date.now();
    }
    _mutable(operation) {
        if (this._ended) {
            this._logger?.debug(`Ignoring ${operation} on a span that has already ended`);
            return false;
        }
        return true;
    }
    _writeAttribute(key, value) {
        if (isNullish(value)) {
            if (key in this._attributes && !this._autoKeys.has(key)) this._userAttributeCount--;
            delete this._attributes[key];
            return;
        }
        if (!this._autoKeys.has(key) && !(key in this._attributes)) {
            if (this._userAttributeCount >= this._maxAttributes) return void this._droppedAttributes++;
            this._userAttributeCount++;
        }
        this._attributes[key] = truncateAttributeValue(value, this._maxAttributeValueLength);
    }
    setAttribute(key, value) {
        if (this._mutable('setAttribute')) this._writeAttribute(key, value);
        return this;
    }
    setAttributes(attributes) {
        if (this._mutable('setAttributes')) {
            const safe = assignUserAttributes({}, attributes);
            for (const key of Object.keys(safe))this._writeAttribute(key, safe[key]);
        }
        return this;
    }
    addEvent(name, attributes, timestamp) {
        if (this._mutable('addEvent')) {
            if (this._userEventCount >= this._maxEvents) {
                this._droppedEvents++;
                return this;
            }
            this._userEventCount++;
            const bounded = attributes && boundAttributes(attributes, this._maxAttributesPerEvent, this._maxAttributeValueLength);
            this._events.push({
                name: sanitizeName(name, 'Span event name', this._maxAttributeValueLength, this._logger),
                timestamp: resolveSuppliedTime(timestamp, this._now(), 'event timestamp', this._logger),
                ...bounded && {
                    attributes: bounded.attributes,
                    ...bounded.dropped && {
                        droppedAttributesCount: bounded.dropped
                    }
                }
            });
        }
        return this;
    }
    setStatus(status, message) {
        if (this._mutable('setStatus')) {
            if ('ok' !== status && 'error' !== status) {
                this._logger?.debug(`Ignoring unknown span status "${String(status)}"; expected "ok" or "error"`);
                return this;
            }
            this._status = {
                code: status,
                ...message && {
                    message: truncateString(message, this._maxAttributeValueLength)
                }
            };
        }
        return this;
    }
    get statusIsExplicitlyOk() {
        return this._status?.code === 'ok';
    }
    recordException(error) {
        if (!this._mutable('recordException')) return this;
        const { type, message, stack } = describeError(error);
        this.addEvent(EXCEPTION_EVENT_NAME, {
            'exception.type': type,
            'exception.message': message,
            ...stack && {
                'exception.stacktrace': stack
            }
        });
        return this.setStatus('error', message);
    }
    updateName(name) {
        if (this._mutable('updateName')) this._name = sanitizeName(name, 'Span name', this._maxAttributeValueLength, this._logger);
        return this;
    }
    traceparent() {
        return formatTraceparent(this._traceId, this._spanId, this._traceFlags);
    }
    tracestate() {
        return this._traceState ?? null;
    }
    childContext() {
        return {
            traceId: this._traceId,
            parentSpanId: this._spanId,
            traceState: this._traceState,
            traceFlags: this._traceFlags,
            clockAnchor: this._clockAnchor
        };
    }
    end(endTime) {
        if (this._ended) return void this._logger?.debug('Ignoring end() on a span that has already ended');
        this._ended = true;
        const derived = this._now();
        const resolved = resolveSuppliedTime(endTime, derived, 'end time', this._logger);
        this._onEnd({
            traceId: this._traceId,
            spanId: this._spanId,
            ...this._parentSpanId && {
                parentSpanId: this._parentSpanId
            },
            ...this._traceState && {
                traceState: this._traceState
            },
            traceFlags: this._traceFlags,
            parentIsRemote: this._parentIsRemote,
            name: this._name,
            kind: this._kind,
            ...this._status && {
                status: this._status
            },
            attributes: {
                ...this._attributes
            },
            events: this._events,
            startTime: this._startTime,
            endTime: clampEndTime(resolved, this._startTime),
            ...this._droppedAttributes && {
                droppedAttributesCount: this._droppedAttributes
            },
            ...this._droppedEvents && {
                droppedEventsCount: this._droppedEvents
            }
        }, this._autoKeys);
    }
}
const EXCEPTION_EVENT_NAME = 'exception';
const MAX_UINT32 = 0xffffffff;
function safeString(value) {
    try {
        return 'string' == typeof value ? value : String(value);
    } catch  {
        return UNSERIALIZABLE_VALUE;
    }
}
function nonNegativeCount(value) {
    if ('number' != typeof value || !Number.isFinite(value) || value <= 0) return 0;
    return Math.min(Math.floor(value), MAX_UINT32);
}
function orderedKeys(attributes, keysBeforeHook) {
    if (!keysBeforeHook.length) return Object.keys(attributes);
    const beforeHook = keysBeforeHook.filter((key)=>Object.prototype.propertyIsEnumerable.call(attributes, key));
    const seen = new Set(beforeHook);
    return [
        ...beforeHook,
        ...Object.keys(attributes).filter((key)=>!seen.has(key))
    ];
}
function applySpanLimits(record, autoKeys, maxAttributes, maxEvents, maxAttributesPerEvent, maxAttributeValueLength, keysBeforeHook = []) {
    let kept = 0;
    let droppedAttributes = 0;
    const attributes = {};
    for (const key of orderedKeys(record.attributes, keysBeforeHook)){
        const value = record.attributes[key];
        if (!isNullish(value)) {
            if (!autoKeys.has(key)) {
                if (kept >= maxAttributes) {
                    droppedAttributes++;
                    continue;
                }
                kept++;
            }
            Object.defineProperty(attributes, key, {
                value: truncateAttributeValue(value, maxAttributeValueLength),
                enumerable: true,
                writable: true,
                configurable: true
            });
        }
    }
    record.attributes = attributes;
    if (droppedAttributes) record.droppedAttributesCount = nonNegativeCount(record.droppedAttributesCount) + droppedAttributes;
    let keptEvents = 0;
    let droppedEvents = 0;
    const events = [];
    for (const event of record.events){
        if (keptEvents >= maxEvents) {
            droppedEvents++;
            continue;
        }
        keptEvents++;
        if (event.attributes) {
            const bounded = boundAttributes(event.attributes, maxAttributesPerEvent, maxAttributeValueLength);
            event.attributes = bounded.attributes;
            if (bounded.dropped) event.droppedAttributesCount = nonNegativeCount(event.droppedAttributesCount) + bounded.dropped;
        }
        events.push(event);
    }
    record.events = events;
    if (droppedEvents) record.droppedEventsCount = nonNegativeCount(record.droppedEventsCount) + droppedEvents;
    if (record.status?.message) record.status = {
        ...record.status,
        message: truncateString(safeString(record.status.message), maxAttributeValueLength)
    };
}
class NoopSpan {
    setAttribute() {
        return this;
    }
    setAttributes() {
        return this;
    }
    addEvent() {
        return this;
    }
    setStatus() {
        return this;
    }
    recordException() {
        return this;
    }
    updateName() {
        return this;
    }
    traceparent() {
        return null;
    }
    tracestate() {
        return null;
    }
    end() {}
}
const NOOP_SPAN = /* @__PURE__ */ new NoopSpan();
class PassThroughSpan extends NoopSpan {
    constructor(_traceparent, _tracestate){
        super(), this._traceparent = _traceparent, this._tracestate = _tracestate;
    }
    traceparent() {
        return this._traceparent;
    }
    tracestate() {
        return this._tracestate ?? null;
    }
}
function readStack(error) {
    try {
        const stack = error.stack;
        return 'string' == typeof stack && stack ? {
            stack
        } : {};
    } catch  {
        return {};
    }
}
function inertSpan(options, active) {
    const parent = traceparentHeader(options?.parent) ?? active;
    const inbound = 'string' == typeof parent || null == parent ? parent : readHandle(parent, 'traceparent');
    const traceparent = normalizeTraceparent(inbound);
    if (!traceparent) return NOOP_SPAN;
    const tracestate = 'string' == typeof parent || null == parent ? options?.tracestate : readHandle(parent, 'tracestate');
    return new PassThroughSpan(traceparent, sanitizeTracestate(tracestate));
}
function readHandle(parent, method) {
    try {
        const fn = parent[method];
        return 'function' == typeof fn ? fn.call(parent) : void 0;
    } catch  {
        return;
    }
}
function truncateString(value, maxLength) {
    return value.length > maxLength ? value.slice(0, maxLength) : value;
}
function truncateAttributeValue(value, maxLength) {
    return truncateValue(value, maxLength, {
        ancestors: new WeakSet(),
        remainingNodes: MAX_JSON_SAFE_VALUE_NODES
    }, 0);
}
function truncateValue(value, maxLength, state, depth) {
    if (null === value || 'object' != typeof value) {
        if (isNullish(value)) return value;
        if (state.remainingNodes <= 0) return value;
        state.remainingNodes--;
        return 'string' == typeof value ? truncateString(value, maxLength) : value;
    }
    if (state.ancestors.has(value)) return CIRCULAR_VALUE;
    if (state.remainingNodes <= 0 || depth >= MAX_JSON_SAFE_VALUE_DEPTH) return value;
    state.remainingNodes--;
    state.ancestors.add(value);
    try {
        if (value instanceof Date) return value;
        const resolved = resolveToJson(value);
        if (resolved.selfDescribed) return isNullish(resolved.value) ? String(resolved.value) : truncateValue(resolved.value, maxLength, state, depth + 1);
        if (isArray(value)) {
            const walked = Math.min(value.length, MAX_JSON_SAFE_VALUE_ITEMS);
            const boundedItems = [];
            for(let index = 0; index < walked; index++)try {
                boundedItems.push(truncateValue(value[index], maxLength, state, depth + 1));
            } catch  {
                boundedItems.push(UNSERIALIZABLE_VALUE);
            }
            if (value.length > walked) boundedItems.length = value.length;
            return boundedItems;
        }
        const bounded = {};
        let emittable = 0;
        for (const key of Object.keys(value)){
            if (emittable >= MAX_JSON_SAFE_VALUE_ITEMS) break;
            let boundedItem;
            try {
                boundedItem = truncateValue(value[key], maxLength, state, depth + 1);
            } catch  {
                boundedItem = UNSERIALIZABLE_VALUE;
            }
            if (key && !isNullish(boundedItem)) emittable++;
            Object.defineProperty(bounded, key, {
                value: boundedItem,
                enumerable: true,
                writable: true,
                configurable: true
            });
        }
        return bounded;
    } catch  {
        return value;
    } finally{
        state.ancestors.delete(value);
    }
}
function resolveToJson(value) {
    try {
        const toJSON = value.toJSON;
        if ('function' == typeof toJSON) return {
            selfDescribed: true,
            value: toJSON.call(value)
        };
    } catch  {}
    return {
        selfDescribed: false
    };
}
function boundAttributes(source, max, maxLength) {
    let keys;
    try {
        keys = Object.keys(source);
    } catch  {
        return {
            attributes: {},
            dropped: 0
        };
    }
    const attributes = {};
    let kept = 0;
    let dropped = 0;
    for (const key of keys){
        if (kept >= max) {
            dropped++;
            continue;
        }
        let value;
        try {
            value = truncateAttributeValue(source[key], maxLength);
        } catch  {
            value = UNSERIALIZABLE_VALUE;
        }
        if (!isNullish(value)) {
            kept++;
            Object.defineProperty(attributes, key, {
                value,
                enumerable: true,
                writable: true,
                configurable: true
            });
        }
    }
    return {
        attributes,
        dropped
    };
}
function truncateAttributes(attributes, maxLength) {
    for (const key of Object.keys(attributes))attributes[key] = truncateAttributeValue(attributes[key], maxLength);
    return attributes;
}
function runWithActiveSpan(contextManager, span, fn) {
    return span === NOOP_SPAN ? fn(span) : contextManager.with(span, ()=>fn(span));
}
function describeError(error) {
    try {
        const stack = readStack(error);
        if (isError(error)) return {
            type: error.name || 'Error',
            message: error.message || '',
            ...stack
        };
        if ('string' == typeof error) return {
            type: 'string',
            message: error
        };
        if (error && 'object' == typeof error) {
            const maybe = error;
            if ('string' == typeof maybe.message) return {
                type: 'string' == typeof maybe.name ? maybe.name : 'Object',
                message: maybe.message,
                ...stack
            };
        }
        return {
            type: typeof error,
            message: String(error)
        };
    } catch  {
        return {
            type: typeof error,
            message: ''
        };
    }
}
export { NOOP_SPAN, NoopSpan, PassThroughSpan, PostHogSpan, applySpanLimits, describeError, inertSpan, monotonicNow, nonNegativeCount, runWithActiveSpan, truncateAttributeValue, truncateAttributes };
