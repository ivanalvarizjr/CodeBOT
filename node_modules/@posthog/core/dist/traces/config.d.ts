import type { ResolvedTracesConfig } from './types';
import type { TracesConfig } from '@posthog/types';
import type { Logger } from '../types';
/**
 * Resolves the public `traces` config into the shape core `PostHogTraces` consumes.
 * OTLP resource attributes take precedence over the named fields, matching the
 * logs config. `hostResourceAttributes` are runtime-detected by the entrypoint and
 * merge first, so a user-supplied value of the same key wins.
 *
 * @internal Exposed for cross-package use within this SDK; not part of the stable public API.
 */
export declare function resolveTracesConfig(config: TracesConfig | undefined, hostResourceAttributes?: Record<string, string>, logger?: Logger): ResolvedTracesConfig;
//# sourceMappingURL=config.d.ts.map