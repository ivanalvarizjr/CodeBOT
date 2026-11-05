export declare const DEFAULT_BLOCKED_UA_STRS: string[];
/** Exposed for tests only. Not part of the public API. */
export declare function __resetBotDetectionCacheForTests(): void;
/**
 * Block various web spiders from executing our JS and sending false capturing data.
 *
 * @param ua - User agent string to check
 * @param customBlockedUserAgents - Additional UA substrings to block
 * @returns true if the UA matches a known-bot substring
 */
export declare const isBlockedUA: (ua: string | undefined, customBlockedUserAgents?: string[]) => boolean;
//# sourceMappingURL=bot-detection.d.ts.map