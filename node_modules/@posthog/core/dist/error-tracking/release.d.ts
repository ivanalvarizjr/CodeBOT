/**
 * Read the release id embedded at build time or injected into a processed bundle.
 *
 * Framework integrations can compile `POSTHOG_RELEASE_ID` into browser code before asset hashes
 * are finalized. The global remains as a fallback for bundles processed by posthog-cli.
 */
export declare function getInjectedReleaseId(): string | undefined;
//# sourceMappingURL=release.d.ts.map