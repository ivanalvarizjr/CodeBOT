import { PostHogEventProperties } from '@posthog/core';
export type AiBatchPartition = {
    batches: PostHogEventProperties[][];
    dropped: {
        event: string;
        bytes: number;
    }[];
};
export declare function eventByteSize(message: PostHogEventProperties): number;
export declare function partitionAiBatch(messages: (PostHogEventProperties | undefined)[], maxEventBytes?: number, targetBatchBytes?: number): AiBatchPartition;
//# sourceMappingURL=batching.d.ts.map