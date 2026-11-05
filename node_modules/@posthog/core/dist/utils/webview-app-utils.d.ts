/**
 * Best-effort detection of the app hosting a webview from explicit User-Agent
 * markers. Some apps use the same UA as a standalone browser, so no match means
 * unknown, not that this is definitely NOT an in-app browser. A generic Android
 * `wv` marker alone cannot identify the host app. Never infer it from a referrer.
 *
 * Returns [app name, app version], using empty strings for unknown values. Only
 * explicit app versions are returned, as strings to preserve all components;
 * browser/OS versions are not substitutes for a missing app version.
 */
export declare function detectWebviewApp(userAgent: string): [string, string];
//# sourceMappingURL=webview-app-utils.d.ts.map