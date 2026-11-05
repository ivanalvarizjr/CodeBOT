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
    ErrorPropertiesBuilder: ()=>ErrorPropertiesBuilder
});
const index_js_namespaceObject = require("../utils/index.js");
const external_chunk_ids_js_namespaceObject = require("./chunk-ids.js");
const MAX_EXCEPTIONS = 50;
const MAX_AGGREGATE_MEMBER_INSPECTIONS = 1000;
const MAX_ERROR_PROTOTYPE_DEPTH = 100;
const MAX_WRAPPER_RECURSION = 4;
class ErrorPropertiesBuilder {
    constructor(coercers, stackParser, modifiers = []){
        this.coercers = coercers;
        this.stackParser = stackParser;
        this.modifiers = modifiers;
    }
    buildFromUnknown(input, hint = {}) {
        const providedMechanism = hint && hint.mechanism;
        const mechanism = providedMechanism || {
            handled: true,
            type: 'generic'
        };
        const coercingContext = this.buildCoercingContext(mechanism, hint, 0);
        const exceptionWithCause = coercingContext.apply(input);
        const parsingContext = this.buildParsingContext(hint);
        const exceptionWithStack = this.parseStacktrace(exceptionWithCause, parsingContext);
        const exceptionList = this.convertToExceptionList(exceptionWithStack, mechanism);
        return {
            $exception_list: exceptionList,
            $exception_level: 'error'
        };
    }
    async modifyFrames(exceptionList) {
        for (const exc of exceptionList)if (exc.stacktrace && exc.stacktrace.frames && (0, index_js_namespaceObject.isArray)(exc.stacktrace.frames)) exc.stacktrace.frames = await this.applyModifiers(exc.stacktrace.frames);
        return exceptionList;
    }
    coerceFallback(ctx) {
        return {
            type: 'Error',
            value: 'Unknown error',
            stack: ctx.syntheticException?.stack,
            synthetic: true
        };
    }
    parseStacktrace(err, ctx) {
        let cause;
        if (null != err.cause) cause = this.parseStacktrace(err.cause, ctx);
        let stack;
        if ('' != err.stack && null != err.stack) try {
            stack = this.applyChunkIds(this.stackParser(err.stack, err.synthetic ? ctx.skipFirstLines : 0), ctx.chunkIdMap);
        } catch  {}
        return {
            ...err,
            cause,
            stack,
            errors: err.errors?.map((child)=>this.parseStacktrace(child, ctx))
        };
    }
    applyChunkIds(frames, chunkIdMap) {
        return frames.map((frame)=>{
            if (frame.filename && chunkIdMap) frame.chunk_id = chunkIdMap[frame.filename];
            return frame;
        });
    }
    applyCoercers(input, ctx) {
        for (const adapter of this.coercers)if (adapter.match(input)) return adapter.coerce(input, ctx);
        return this.coerceFallback(ctx);
    }
    async applyModifiers(frames) {
        let newFrames = frames;
        for (const modifier of this.modifiers)newFrames = await modifier(newFrames);
        return newFrames;
    }
    convertToExceptionList(exceptionWithStack, mechanism) {
        const exceptionList = [];
        const append = (exception, parentId, source)=>{
            const exceptionId = exceptionList.length;
            const entryMechanism = void 0 === parentId ? {
                type: 'string' == typeof mechanism.type && mechanism.type.length > 0 ? mechanism.type : 'generic',
                ...'boolean' == typeof mechanism.handled ? {
                    handled: mechanism.handled
                } : void 0 === mechanism.handled ? {
                    handled: true
                } : {},
                synthetic: 'boolean' == typeof mechanism.synthetic ? mechanism.synthetic : exception.synthetic,
                exception_id: exceptionId
            } : {
                type: 'chained',
                source,
                synthetic: exception.synthetic,
                exception_id: exceptionId,
                parent_id: parentId
            };
            const currentException = {
                type: exception.type,
                value: exception.value,
                mechanism: entryMechanism
            };
            if (exception.stack) currentException.stacktrace = {
                type: 'raw',
                frames: exception.stack
            };
            exceptionList.push(currentException);
            if (exception.cause) append(exception.cause, exceptionId, 'cause');
            for (const child of exception.errors ?? [])append(child, exceptionId, 'member');
        };
        append(exceptionWithStack);
        return exceptionList;
    }
    buildParsingContext(hint) {
        const context = {
            chunkIdMap: (0, external_chunk_ids_js_namespaceObject.getFilenameToChunkIdMap)(this.stackParser),
            skipFirstLines: hint.skipFirstLines ?? 1
        };
        return context;
    }
    getAggregateErrors(input) {
        try {
            if ((0, index_js_namespaceObject.isError)(input)) {
                let prototype = Object.getPrototypeOf(input);
                for(let depth = 0; prototype && depth < MAX_ERROR_PROTOTYPE_DEPTH; depth++){
                    const constructor = Object.getOwnPropertyDescriptor(prototype, 'constructor')?.value;
                    if ('function' == typeof constructor && 'AggregateError' === constructor.name) {
                        const errors = input.errors;
                        return (0, index_js_namespaceObject.isArray)(errors) ? errors : void 0;
                    }
                    prototype = Object.getPrototypeOf(prototype);
                }
            }
        } catch  {}
    }
    buildCoercingContext(mechanism, hint, depth = 0) {
        let count = 0;
        let memberInspections = 0;
        let hasAggregate = false;
        const seen = new Set();
        const wrappers = [];
        const skipped = {};
        const coerce = (input, depth, wrapperDepth = 0)=>{
            const ctx = createContext(depth, wrapperDepth);
            const forward = ctx.apply;
            ctx.apply = (nextInput)=>{
                wrappers.push(input);
                try {
                    return forward(nextInput);
                } finally{
                    wrappers.pop();
                }
            };
            if (wrapperDepth > MAX_WRAPPER_RECURSION || wrapperDepth > 0 && -1 !== wrappers.indexOf(input)) return this.coerceFallback(ctx);
            const isReference = 'object' == typeof input && null !== input || 'function' == typeof input;
            if (0 === wrapperDepth && count >= MAX_EXCEPTIONS || isReference && seen.has(input)) return;
            if (isReference) seen.add(input);
            if (0 === wrapperDepth) count++;
            const errors = this.getAggregateErrors(input);
            hasAggregate ||= !!errors;
            let exception;
            try {
                exception = this.applyCoercers(input, ctx);
                if (!exception) throw skipped;
            } catch (error) {
                if (error === skipped) {
                    if (0 === wrapperDepth) count--;
                    return;
                }
                if (!hasAggregate) throw error;
                exception = this.coerceFallback(ctx);
            }
            if (!errors || count >= MAX_EXCEPTIONS) return exception;
            let length;
            try {
                length = errors.length;
            } catch  {
                return exception;
            }
            if (!Number.isInteger(length) || length < 0 || length > 0xffffffff) return exception;
            const children = [];
            for(let index = 0; count < MAX_EXCEPTIONS && memberInspections < MAX_AGGREGATE_MEMBER_INSPECTIONS && index < length; index++){
                memberInspections++;
                let child;
                try {
                    child = ctx.next(errors[index]);
                } catch  {
                    count++;
                    child = this.coerceFallback(createContext(depth + 1));
                }
                if (child) children.push(child);
            }
            return {
                ...exception,
                errors: children
            };
        };
        const createContext = (depth, wrapperDepth = 0)=>({
                ...hint,
                syntheticException: 0 == depth ? hint.syntheticException : void 0,
                mechanism: 0 == depth ? mechanism : {},
                apply: (input)=>{
                    const exception = coerce(input, depth, wrapperDepth + 1);
                    if (!exception) throw skipped;
                    return exception;
                },
                next: (input)=>coerce(input, depth + 1)
            });
        const context = createContext(depth);
        return {
            ...context,
            apply: (input)=>coerce(input, depth) ?? this.coerceFallback(context)
        };
    }
}
exports.ErrorPropertiesBuilder = __webpack_exports__.ErrorPropertiesBuilder;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "ErrorPropertiesBuilder"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
