import { PostHogBackendClient } from '../../client';
import type { ContextData } from '../context/types';
import { EventMessage, PostHogOptions } from '../../types';
import type { Logger } from '@posthog/core';
import { ErrorTracking as CoreErrorTracking } from '@posthog/core';
export default class ErrorTracking {
    private client;
    private _exceptionAutocaptureEnabled;
    private _rateLimiter;
    private _logger;
    private _autocaptureClient?;
    private _stopAutocapture?;
    constructor(client: PostHogBackendClient, options: PostHogOptions, _logger: Logger);
    static isPreviouslyCapturedError(x: unknown): boolean;
    static buildEventMessage(builder: CoreErrorTracking.ErrorPropertiesBuilder, error: unknown, hint: CoreErrorTracking.EventHint, distinctId?: string, additionalProperties?: Record<string | number, any>, context?: ContextData): Promise<EventMessage>;
    private get destinationKey();
    private startAutocaptureIfEnabled;
    /**
     * Whether captureException should capture this error. False when exception autocapture already sent the same error
     * object to this project in this turn of the event loop, for example when a framework passes an error from its own
     * process listener to an error hook that calls captureException.
     */
    claimExplicitCapture(error: unknown): boolean;
    /**
     * Captures at once the exceptions autocapture holds until the end of the turn, so that this client's flush or
     * shutdown sends them: an app's crash handler often flushes or shuts the client down and exits before the turn ends.
     * The capture can land in another client of the project, the one whose request context is active, so this client
     * waits for that client's flush too.
     */
    capturePendingExceptions(): void;
    private onException;
    isEnabled(): boolean;
    shutdown(): void;
}
//# sourceMappingURL=index.d.ts.map