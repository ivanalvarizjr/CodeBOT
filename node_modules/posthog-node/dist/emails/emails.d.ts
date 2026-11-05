import { type FetchLike, type Logger } from '@posthog/core';
import type { Emails, GetEmailResponse, SendEmailOptions, SendEmailResponse } from './types';
export declare const DEFAULT_EMAIL_REQUEST_TIMEOUT_MS = 15000;
export declare const DEFAULT_EMAIL_REQUEST_MAX_RETRIES = 2;
export interface EmailSenderConfig {
    secretKey?: string;
    /** The client's `host`. Used only when it is PostHog Cloud. */
    host: string;
    appHost?: string;
    requestTimeoutMs: number;
    maxRetries: number;
    migratedFrom?: string;
}
export interface EmailSenderHooks {
    fetch: FetchLike;
    isDisabled: () => boolean;
    isClosed: () => boolean;
    logger: Logger;
    userAgent?: string;
}
/**
 * Sends one transactional email per call to the messaging send API on the app host, and reads
 * the status of a sent email. Owns the attempt loop, so every attempt of a send carries the same
 * idempotency key.
 */
export declare class EmailSender implements Emails {
    private readonly config;
    private readonly hooks;
    private readonly inFlight;
    constructor(config: EmailSenderConfig, hooks: EmailSenderHooks);
    send(options: SendEmailOptions, ...unexpected: unknown[]): Promise<SendEmailResponse>;
    get(id: string): Promise<GetEmailResponse>;
    private track;
    /**
     * Resolves when every send and status read in flight, retries included, has settled.
     * Kept apart from the client's pending-promise queue, so a send in its retry backoff does not hold back `flush()`.
     */
    drain(): Promise<void>;
    private sendUntracked;
    private getUntracked;
    private connect;
    private headers;
    private withRetries;
    private request;
}
//# sourceMappingURL=emails.d.ts.map