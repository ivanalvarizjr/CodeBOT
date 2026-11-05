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
const UNHANDLED_REJECTION_OPTION_NAMES = [
    '--unhandled-rejections',
    '--unhandled_rejections'
];
const UNHANDLED_REJECTION_MODES = new Set([
    'throw',
    'strict',
    'warn',
    'warn-with-error-code',
    'none'
]);
const STARTUP_EXEC_ARGV = [
    ...globalThis.process?.execArgv ?? []
];
const STARTUP_NODE_OPTIONS = globalThis.process?.env?.NODE_OPTIONS;
function splitNodeOptions(nodeOptions) {
    const args = [];
    let current = '';
    let isInString = false;
    for(let index = 0; index < nodeOptions.length; index++){
        const character = nodeOptions[index];
        if ('\\' === character && isInString && index + 1 < nodeOptions.length) current += nodeOptions[++index];
        else if (' ' !== character || isInString) if ('"' === character) isInString = !isInString;
        else current += character;
        else if (current) {
            args.push(current);
            current = '';
        }
    }
    if (current) args.push(current);
    return args;
}
function findUnhandledRejectionMode(args) {
    let mode;
    for(let index = 0; index < args.length; index++){
        const argument = args[index];
        const optionName = UNHANDLED_REJECTION_OPTION_NAMES.find((name)=>argument === name || argument.startsWith(`${name}=`));
        if (!optionName) continue;
        const value = argument === optionName ? args[++index] : argument.slice(optionName.length + 1);
        if (UNHANDLED_REJECTION_MODES.has(value)) mode = value;
    }
    return mode;
}
function getUnhandledRejectionMode(execArgv = STARTUP_EXEC_ARGV, nodeOptions = STARTUP_NODE_OPTIONS) {
    return findUnhandledRejectionMode(execArgv) ?? findUnhandledRejectionMode(splitNodeOptions(nodeOptions ?? '')) ?? 'throw';
}
const STARTUP_UNHANDLED_REJECTION_MODE = getUnhandledRejectionMode();
function snapshotAsyncContext() {
    try {
        const process = globalThis.process;
        const asyncHooks = process?.getBuiltinModule?.('node:async_hooks');
        const snapshot = asyncHooks?.AsyncLocalStorage?.snapshot?.();
        if (snapshot) return snapshot;
    } catch  {}
    return (run)=>run();
}
const UNHANDLED_REJECTION_HINT = {
    mechanism: {
        type: 'onunhandledrejection',
        handled: false
    }
};
const UNCAUGHT_EXCEPTION_HINT = {
    mechanism: {
        type: 'onuncaughtexception',
        handled: false
    }
};
const CONTROL_FLOW_DIGESTS = new Set([
    'HANGING_PROMISE_REJECTION',
    'NEXT_PRERENDER_INTERRUPTED',
    'DYNAMIC_SERVER_USAGE',
    'BAILOUT_TO_CLIENT_SIDE_RENDERING'
]);
const REACT_POSTPONE = Symbol.for('react.postpone');
const NEXT_REJECTION_FILTER = Symbol.for('next.unhandledRejectionFilter');
const NEXT_LISTENER_EVENT = 'Next.UnhandledRejectionFilter.MacguffinEvent';
const STATE_KEY = Symbol.for('posthog-node.exception-autocapture.v1');
const posthogGlobal = globalThis;
function isPostHogListener(listener) {
    return 'function' == typeof listener && true === listener._posthogErrorHandler;
}
function isWeakKey(value) {
    return 'object' == typeof value && null !== value || 'function' == typeof value;
}
function markListener(listener) {
    return Object.assign(listener, {
        _posthogErrorHandler: true
    });
}
function hasHostUnhandledRejectionListener(process) {
    return process.listeners('unhandledRejection').some((listener)=>!isPostHogListener(listener));
}
function isFrameworkControlFlow(reason, depth = 0) {
    try {
        if (!isWeakKey(reason)) return false;
        const candidate = reason;
        if (candidate.$$typeof === REACT_POSTPONE) return true;
        if ('string' == typeof candidate.digest && CONTROL_FLOW_DIGESTS.has(candidate.digest)) return true;
        return depth < 5 && isFrameworkControlFlow(candidate.cause, depth + 1);
    } catch  {
        return false;
    }
}
function isAbortError(reason) {
    try {
        return isWeakKey(reason) && 'AbortError' === reason.name;
    } catch  {
        return false;
    }
}
function isIgnored(exception, origin) {
    return isFrameworkControlFlow(exception) || 'unhandledRejection' === origin && isAbortError(exception);
}
function captureTargets(state) {
    const targets = new Map();
    for (const client of state.clients){
        const chosen = targets.get(client.key);
        if (!chosen || void 0 === chosen.getContext() && void 0 !== client.getContext()) targets.set(client.key, client);
    }
    for (const [key, client] of state.retired)if (!targets.has(key)) targets.set(key, client);
    return [
        ...targets.values()
    ];
}
function nextTurn(callback) {
    if ('function' == typeof globalThis.setImmediate) setImmediate(callback);
    else setTimeout(callback, 0);
}
function scheduleTurnReset(state) {
    if (state.turnResetScheduled) return;
    state.turnResetScheduled = true;
    nextTurn(()=>{
        nextTurn(()=>{
            state.capturedThisTurn.clear();
            state.turnResetScheduled = false;
        });
    });
}
function recordCapture(state, exception, key, source) {
    const captured = state.capturedThisTurn.get(exception) ?? new Map();
    if (!captured.has(key)) captured.set(key, source);
    state.capturedThisTurn.set(exception, captured);
    scheduleTurnReset(state);
}
function wasCapturedThisTurn(state, exception) {
    const captured = state.capturedThisTurn.get(exception);
    return void 0 !== captured && captureTargets(state).every((client)=>captured.has(client.key));
}
function dispatch(state, exception, hint, skipKeys) {
    const captured = state.capturedThisTurn.get(exception);
    const owners = [];
    for (const client of captureTargets(state))if (!(captured?.has(client.key) || skipKeys?.has(client.key))) {
        recordCapture(state, exception, client.key, 'autocapture');
        client.capture(exception, hint);
        owners.push(client);
    }
    return owners;
}
function captureDeferred(state, deferred) {
    if (state.deferred.get(deferred.exception) !== deferred) return [];
    state.deferred.delete(deferred.exception);
    return deferred.runInContext(()=>dispatch(state, deferred.exception, deferred.hint, deferred.skipKeys));
}
function deferCapture(state, exception, hint) {
    if (wasCapturedThisTurn(state, exception) || state.deferred.has(exception)) return;
    const deferred = {
        exception,
        hint,
        skipKeys: new Set(state.capturedThisTurn.get(exception)?.keys()),
        runInContext: snapshotAsyncContext()
    };
    state.deferred.set(exception, deferred);
    nextTurn(()=>captureDeferred(state, deferred));
}
async function exitAfterFatalError(state, error) {
    try {
        console.error(error);
    } catch  {}
    capturePendingExceptions();
    const clients = new Set([
        ...state.clients,
        ...state.retired.values()
    ]);
    await Promise.all([
        ...clients
    ].map((client)=>client.shutdown().catch(()=>void 0)));
    globalThis.process.exit(1);
}
function captureUncaughtException(state, error, origin, fatal) {
    const hint = 'unhandledRejection' === origin ? UNHANDLED_REJECTION_HINT : UNCAUGHT_EXCEPTION_HINT;
    if (!fatal) {
        if (!isIgnored(error, origin)) deferCapture(state, error, hint);
        return;
    }
    const deferred = state.deferred.get(error);
    if (deferred) captureDeferred(state, deferred);
    else dispatch(state, error, hint);
}
function makeUncaughtExceptionHandler(state) {
    return markListener((error, origin)=>{
        const process = globalThis.process;
        const userProvidedListenersCount = process.listeners('uncaughtException').filter((listener)=>'domainUncaughtExceptionClear' !== listener.name && !isPostHogListener(listener)).length;
        const fatal = 0 === userProvidedListenersCount;
        captureUncaughtException(state, error, origin, fatal);
        if (fatal && !state.calledFatalError) {
            state.calledFatalError = true;
            exitAfterFatalError(state, error);
        }
    });
}
function describeReason(reason) {
    try {
        return String(reason);
    } catch  {
        return typeof reason;
    }
}
function toUnhandledRejectionError(reason) {
    if (reason instanceof Error) return reason;
    const error = new Error(`This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). The promise rejected with the reason "${describeReason(reason)}".`);
    return Object.assign(error, {
        name: 'UnhandledPromiseRejection',
        code: 'ERR_UNHANDLED_REJECTION'
    });
}
function applyDefaultRejectionHandling(state, reason) {
    const process = globalThis.process;
    if ('warn-with-error-code' === state.mode) {
        process.emitWarning(`Unhandled promise rejection: ${describeReason(reason)}`, 'UnhandledPromiseRejectionWarning');
        process.exitCode = 1;
        if (!isIgnored(reason, 'unhandledRejection')) dispatch(state, reason, UNHANDLED_REJECTION_HINT);
        return;
    }
    if (process.versions?.bun) {
        process.exitCode = 1;
        dispatch(state, reason, UNHANDLED_REJECTION_HINT);
        if (!state.calledFatalError) {
            state.calledFatalError = true;
            exitAfterFatalError(state, reason);
        }
        return;
    }
    const escalated = toUnhandledRejectionError(reason);
    const emit = process.emit;
    emit.call(process, 'uncaughtExceptionMonitor', escalated, 'unhandledRejection');
    emit.call(process, 'uncaughtException', escalated, 'unhandledRejection');
}
function makeUnhandledRejectionHandler(state, replacesDefaultHandling, isInstalled) {
    return markListener((reason)=>{
        if (replacesDefaultHandling && !hasHostUnhandledRejectionListener(globalThis.process) && isInstalled()) return void applyDefaultRejectionHandling(state, reason);
        if (!isIgnored(reason, 'unhandledRejection')) deferCapture(state, reason, UNHANDLED_REJECTION_HINT);
    });
}
function joinHostRejectionQueue(listener) {
    const process = globalThis.process;
    if (!posthogGlobal[NEXT_REJECTION_FILTER] || 'function' != typeof process.rawListeners) return;
    if (!process.rawListeners('unhandledRejection').includes(listener)) return;
    const removeListener = Object.getPrototypeOf(process).removeListener;
    removeListener.call(process, 'unhandledRejection', listener);
    if (!process.listeners('unhandledRejection').includes(listener)) process.prependListener('unhandledRejection', listener);
}
function installListeners(state) {
    const process = globalThis.process;
    const removals = [];
    const listen = (event, listener)=>{
        process.on(event, listener);
        removals.push(()=>process.removeListener(event, listener));
    };
    const remove = ()=>removals.forEach((removal)=>removal());
    if ('strict' === state.mode) {
        const monitor = (error, origin)=>captureUncaughtException(state, error, origin, true);
        listen('uncaughtExceptionMonitor', monitor);
        return {
            remove,
            areInstalled: ()=>process.listeners('uncaughtExceptionMonitor').includes(monitor)
        };
    }
    const uncaughtExceptionHandler = makeUncaughtExceptionHandler(state);
    listen('uncaughtException', uncaughtExceptionHandler);
    const replacesDefaultHandling = 'throw' === state.mode || 'warn-with-error-code' === state.mode;
    const followsHostListeners = replacesDefaultHandling && !process.versions?.bun;
    const isInstalled = ()=>process.listeners('unhandledRejection').includes(listener);
    const listener = makeUnhandledRejectionHandler(state, replacesDefaultHandling, isInstalled);
    const keepFirst = ()=>{
        const raw = 'function' == typeof process.rawListeners ? process.rawListeners('unhandledRejection') : [];
        if (raw.includes(listener) && raw[0] !== listener) {
            process.removeListener('unhandledRejection', listener);
            process.prependListener('unhandledRejection', listener);
        }
    };
    listen('newListener', markListener((event, added)=>{
        if (isPostHogListener(added)) return;
        if ('unhandledRejection' === event) {
            if (!isInstalled()) process.prependListener('unhandledRejection', listener);
            queueMicrotask(()=>{
                keepFirst();
                joinHostRejectionQueue(listener);
            });
        } else if (event === NEXT_LISTENER_EVENT) queueMicrotask(()=>{
            if (!isInstalled()) process.prependListener('unhandledRejection', listener);
        });
    }));
    if (followsHostListeners) {
        listen('removeListener', markListener((event)=>{
            if ('unhandledRejection' === event && isInstalled() && !hasHostUnhandledRejectionListener(process)) process.removeListener('unhandledRejection', listener);
        }));
        if (hasHostUnhandledRejectionListener(process)) process.prependListener('unhandledRejection', listener);
    } else process.prependListener('unhandledRejection', listener);
    joinHostRejectionQueue(listener);
    removals.push(()=>{
        process.removeListener('unhandledRejection', listener);
        if ('function' == typeof process.rawListeners && process.rawListeners('unhandledRejection').includes(listener)) {
            const removeListener = Object.getPrototypeOf(process).removeListener;
            removeListener.call(process, 'unhandledRejection', listener);
        }
    });
    return {
        remove,
        areInstalled: ()=>process.listeners('uncaughtException').includes(uncaughtExceptionHandler) && (followsHostListeners || isInstalled())
    };
}
function startExceptionAutocapture(client, mode = STARTUP_UNHANDLED_REJECTION_MODE) {
    if (!globalThis.process?.on) return ()=>void 0;
    let state = posthogGlobal[STATE_KEY];
    if (state) {
        if (!state.listeners.areInstalled()) {
            state.listeners.remove();
            state.listeners = installListeners(state);
        }
    } else {
        const created = {
            mode,
            clients: new Set(),
            retired: new Map(),
            capturedThisTurn: new Map(),
            deferred: new Map(),
            turnResetScheduled: false,
            calledFatalError: false,
            listeners: {
                remove: ()=>void 0,
                areInstalled: ()=>true
            }
        };
        created.listeners = installListeners(created);
        posthogGlobal[STATE_KEY] = created;
        state = created;
    }
    state.clients.add(client);
    state.retired.delete(client.key);
    const activeState = state;
    return ()=>{
        if (!activeState.clients.delete(client)) return;
        if (![
            ...activeState.clients
        ].some((other)=>other.key === client.key)) activeState.retired.set(client.key, client);
    };
}
function claimExplicitCapture(error, key) {
    const state = posthogGlobal[STATE_KEY];
    if (!state) return true;
    if (state.capturedThisTurn.get(error)?.get(key) === 'autocapture') return false;
    recordCapture(state, error, key, 'app');
    state.deferred.get(error)?.skipKeys.add(key);
    return true;
}
function capturePendingExceptions() {
    const owners = new Set();
    const state = posthogGlobal[STATE_KEY];
    if (state) for (const deferred of [
        ...state.deferred.values()
    ])captureDeferred(state, deferred).forEach((owner)=>owners.add(owner));
    return owners;
}
function resetExceptionAutocapture() {
    const state = posthogGlobal[STATE_KEY];
    if (state) {
        state.deferred.clear();
        state.listeners.remove();
        delete posthogGlobal[STATE_KEY];
    }
}
__webpack_require__.d(__webpack_exports__, {
    capturePendingExceptions: ()=>capturePendingExceptions,
    claimExplicitCapture: ()=>claimExplicitCapture,
    getUnhandledRejectionMode: ()=>getUnhandledRejectionMode,
    resetExceptionAutocapture: ()=>resetExceptionAutocapture,
    startExceptionAutocapture: ()=>startExceptionAutocapture
});
exports.capturePendingExceptions = __webpack_exports__.capturePendingExceptions;
exports.claimExplicitCapture = __webpack_exports__.claimExplicitCapture;
exports.getUnhandledRejectionMode = __webpack_exports__.getUnhandledRejectionMode;
exports.resetExceptionAutocapture = __webpack_exports__.resetExceptionAutocapture;
exports.startExceptionAutocapture = __webpack_exports__.startExceptionAutocapture;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "capturePendingExceptions",
    "claimExplicitCapture",
    "getUnhandledRejectionMode",
    "resetExceptionAutocapture",
    "startExceptionAutocapture"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
