import { safeJsonStringify } from "@posthog/core";
import { AI_BATCH_TARGET_BYTES, AI_MAX_EVENT_BYTES } from "./routing.mjs";
const encoder = new TextEncoder();
function eventByteSize(message) {
    return encoder.encode(safeJsonStringify(message)).length;
}
function partitionAiBatch(messages, maxEventBytes = AI_MAX_EVENT_BYTES, targetBatchBytes = AI_BATCH_TARGET_BYTES) {
    const batches = [];
    const dropped = [];
    let current = [];
    let currentBytes = 0;
    for (const message of messages){
        if (void 0 === message) continue;
        const bytes = eventByteSize(message);
        if (bytes > maxEventBytes) {
            dropped.push({
                event: 'string' == typeof message.event ? message.event : 'unknown',
                bytes
            });
            continue;
        }
        if (current.length > 0 && currentBytes + bytes > targetBatchBytes) {
            batches.push(current);
            current = [];
            currentBytes = 0;
        }
        current.push(message);
        currentBytes += bytes;
    }
    if (current.length > 0) batches.push(current);
    return {
        batches,
        dropped
    };
}
export { eventByteSize, partitionAiBatch };
