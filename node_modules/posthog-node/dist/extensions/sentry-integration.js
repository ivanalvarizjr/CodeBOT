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
    PostHogSentryIntegration: ()=>PostHogSentryIntegration,
    createEventProcessor: ()=>createEventProcessor,
    sentryIntegration: ()=>sentryIntegration
});
const core_namespaceObject = require("@posthog/core");
const NAME = 'posthog-node';
function createEventProcessor(_posthog, { organization, projectId, prefix, severityAllowList = [
    'error'
], sendExceptionsToPostHog = true } = {}) {
    return (event)=>{
        const shouldProcessLevel = '*' === severityAllowList || severityAllowList.includes(event.level);
        if (!shouldProcessLevel) return event;
        if (!event.tags) event.tags = {};
        const userId = event.tags[PostHogSentryIntegration.POSTHOG_ID_TAG];
        if (void 0 === userId) return event;
        const uiHost = _posthog.options.host ?? 'https://us.i.posthog.com';
        const personUrl = new URL(`/project/${_posthog.apiKey}/person/${userId}`, uiHost).toString();
        event.tags['PostHog Person URL'] = personUrl;
        const exceptions = event.exception?.values || [];
        const exceptionList = exceptions.map((exception)=>({
                ...exception,
                stacktrace: exception.stacktrace ? {
                    ...exception.stacktrace,
                    type: 'raw',
                    frames: (exception.stacktrace.frames || []).map((frame)=>({
                            ...frame,
                            platform: "node:javascript"
                        }))
                } : void 0
            }));
        const properties = {
            $exception_message: exceptions[0]?.value || event.message,
            $exception_type: exceptions[0]?.type,
            $exception_level: event.level,
            $exception_list: exceptionList,
            $sentry_event_id: event.event_id,
            $sentry_exception: event.exception,
            $sentry_exception_message: exceptions[0]?.value || event.message,
            $sentry_exception_type: exceptions[0]?.type,
            $sentry_tags: event.tags
        };
        const injectedReleaseId = core_namespaceObject.ErrorTracking.getInjectedReleaseId();
        if (injectedReleaseId) properties.$release_id = injectedReleaseId;
        if (organization && projectId) properties['$sentry_url'] = (prefix || 'https://sentry.io/organizations/') + organization + '/issues/?project=' + projectId + '&query=' + event.event_id;
        if (sendExceptionsToPostHog) _posthog.capture({
            event: '$exception',
            distinctId: userId,
            properties
        });
        return event;
    };
}
function sentryIntegration(_posthog, options) {
    const processor = createEventProcessor(_posthog, options);
    return {
        name: NAME,
        processEvent (event) {
            return processor(event);
        }
    };
}
class PostHogSentryIntegration {
    static{
        this.POSTHOG_ID_TAG = 'posthog_distinct_id';
    }
    constructor(_posthog, organization, prefix, severityAllowList, sendExceptionsToPostHog){
        this.name = NAME;
        this.name = NAME;
        this.setupOnce = function(addGlobalEventProcessor, getCurrentHub) {
            const projectId = getCurrentHub()?.getClient()?.getDsn()?.projectId;
            addGlobalEventProcessor(createEventProcessor(_posthog, {
                organization,
                projectId,
                prefix,
                severityAllowList,
                sendExceptionsToPostHog: sendExceptionsToPostHog ?? true
            }));
        };
    }
}
exports.PostHogSentryIntegration = __webpack_exports__.PostHogSentryIntegration;
exports.createEventProcessor = __webpack_exports__.createEventProcessor;
exports.sentryIntegration = __webpack_exports__.sentryIntegration;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "PostHogSentryIntegration",
    "createEventProcessor",
    "sentryIntegration"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
