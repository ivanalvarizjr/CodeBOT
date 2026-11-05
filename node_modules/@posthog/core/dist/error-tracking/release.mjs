function getInjectedReleaseId() {
    if ("u" > typeof process) {
        const fromEnvironment = process.env.POSTHOG_RELEASE_ID?.trim();
        if (fromEnvironment) return fromEnvironment;
    }
    const injected = globalThis._posthogReleaseId;
    return 'string' == typeof injected && injected.length > 0 ? injected : void 0;
}
export { getInjectedReleaseId };
