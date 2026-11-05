import { ErrorTracking as CoreErrorTracking } from '@posthog/core';
import type { ContextData } from '../context/types';
type UnhandledRejectionMode = 'throw' | 'strict' | 'warn' | 'warn-with-error-code' | 'none';
export declare function getUnhandledRejectionMode(execArgv?: string[], nodeOptions?: string | undefined): UnhandledRejectionMode;
/** A client that captures exceptions through the shared process listeners. */
export type AutocaptureClient = {
    key: string;
    capture: (exception: unknown, hint: CoreErrorTracking.EventHint) => void;
    getContext: () => ContextData | undefined;
    flush: () => Promise<void>;
    shutdown: () => Promise<void>;
};
/**
 * Captures uncaught exceptions and unhandled rejections for a client, through one set of process listeners shared by
 * every client in the process. Returns a function the client calls on shutdown. The listeners stay for the life of
 * the process, as they always have, and the last client of a project keeps capturing after it shuts down until
 * another client of the project starts.
 */
export declare function startExceptionAutocapture(client: AutocaptureClient, mode?: UnhandledRejectionMode): () => void;
/**
 * Records an error passed to captureException, and reports whether to capture it: false when autocapture already sent
 * this error to the project during this turn. Otherwise the app's capture wins, and autocapture skips the error for the
 * project for the rest of the turn. The same occurrence comes both ways when a framework hands an error from its own
 * process listener to an error hook that calls captureException (Nitro's error hook, which @posthog/nuxt captures),
 * and when an app captures an error and rethrows it. A capture of the same error object in a later turn is a new
 * occurrence.
 */
export declare function claimExplicitCapture(error: unknown, key: string): boolean;
/**
 * Captures at once the exceptions waiting for the end of the turn. A flush or shutdown calls this first: an app's
 * crash handler often flushes or shuts the client down and exits before the turn ends.
 */
export declare function capturePendingExceptions(): Set<AutocaptureClient>;
/** @internal Removes the shared listeners and forgets every client, for tests. */
export declare function resetExceptionAutocapture(): void;
export {};
//# sourceMappingURL=autocapture.d.ts.map