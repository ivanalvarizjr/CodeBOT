import { createModulerModifier } from "../extensions/error-tracking/modifiers/module.node.mjs";
import { addSourceContext } from "../extensions/error-tracking/modifiers/context-lines.node.mjs";
import { createRelativePathModifier } from "../extensions/error-tracking/modifiers/relative-path.node.mjs";
import { PostHogBackendClient } from "../client.mjs";
import { ErrorTracking } from "@posthog/core";
import { PostHogContext } from "../extensions/context/context.mjs";
import { AsyncLocalStorageSpanContextManager } from "../extensions/context/span-context.node.mjs";
import { gzipCompress } from "../gzip.node.mjs";
import { hostOsResourceAttributes } from "../host-os.node.mjs";
export * from "../exports.mjs";
class PostHog extends PostHogBackendClient {
    getLibraryId() {
        return 'posthog-node';
    }
    compressPayload(payload) {
        return gzipCompress(payload, this.isDebug);
    }
    initializeContext() {
        return new PostHogContext();
    }
    initializeSpanContextManager() {
        return new AsyncLocalStorageSpanContextManager();
    }
    hostResourceAttributes() {
        return hostOsResourceAttributes();
    }
    createErrorPropertiesBuilder() {
        return new ErrorTracking.ErrorPropertiesBuilder([
            new ErrorTracking.EventCoercer(),
            new ErrorTracking.ErrorCoercer(),
            new ErrorTracking.ObjectCoercer(),
            new ErrorTracking.StringCoercer(),
            new ErrorTracking.PrimitiveCoercer()
        ], ErrorTracking.createStackParser("node:javascript", ErrorTracking.nodeStackLineParser), [
            createModulerModifier(),
            (frames)=>addSourceContext(frames, void 0, this._logger),
            createRelativePathModifier()
        ]);
    }
}
export { PostHog };
