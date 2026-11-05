import { PostHogCore } from '../posthog-core';
import type { GetFlagsResult, JsonType, PostHogCoreOptions, PostHogFetchOptions, PostHogFetchResponse } from '../types';
export interface PostHogCoreTestClientMocks {
    fetch: vi.Mock<Promise<PostHogFetchResponse>, [string, PostHogFetchOptions]>;
    storage: {
        getItem: vi.Mock<any | undefined, [string]>;
        setItem: vi.Mock<void, [string, any | null]>;
    };
}
export declare class PostHogCoreTestClient extends PostHogCore {
    private mocks;
    _cachedDistinctId?: string;
    constructor(mocks: PostHogCoreTestClientMocks, projectToken: string, options?: PostHogCoreOptions);
    getFlags(distinctId: string, groups?: Record<string, string | number>, personProperties?: Record<string, string>, groupProperties?: Record<string, Record<string, string>>, extraPayload?: Record<string, any>): Promise<GetFlagsResult>;
    flushWithPendingPromises(): Promise<void>;
    getPersistedProperty<T>(key: string): T;
    setPersistedProperty<T>(key: string, value: T | null): void;
    fetch(url: string, options: PostHogFetchOptions): Promise<PostHogFetchResponse>;
    getLibraryId(): string;
    getLibraryVersion(): string;
    getCustomUserAgent(): string;
}
export declare const createTestClient: (projectToken: string, options?: PostHogCoreOptions, setupMocks?: (mocks: PostHogCoreTestClientMocks) => void, storageCache?: {
    [key: string]: string | JsonType;
}) => [PostHogCoreTestClient, PostHogCoreTestClientMocks];
//# sourceMappingURL=PostHogCoreTestClient.d.ts.map