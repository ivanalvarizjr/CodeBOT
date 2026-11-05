import { parseRetryAfterMs, removeTrailingSlash, safeJsonStringify } from "@posthog/core";
import { EmailError } from "./errors.mjs";
const SEND_PATH = '/api/projects/@current/messaging/send/email/';
const STATUS_PATH = '/api/projects/@current/messaging/emails/{messageId}/';
const US_APP_HOST = 'https://us.posthog.com';
const EU_APP_HOST = 'https://eu.posthog.com';
const CLOUD_APP_HOSTS = {
    'https://us.i.posthog.com': US_APP_HOST,
    'https://us.posthog.com': US_APP_HOST,
    'https://app.posthog.com': US_APP_HOST,
    'https://eu.i.posthog.com': EU_APP_HOST,
    'https://eu.posthog.com': EU_APP_HOST
};
const MAX_RETRY_DELAY_MS = 30000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const IDEMPOTENCY_KEY_PATTERN = /^[\x21-\x7e]{1,255}$/;
const TEMPLATE_KEY_PATTERN = /^[a-zA-Z0-9_-]{1,400}$/;
const SHARED_FIELDS = {
    to: true,
    distinctId: true,
    idempotencyKey: true,
    maxRetries: true
};
const TEMPLATE_FIELDS = {
    templateId: true,
    templateData: true
};
const CODE_FIELDS = {
    templateKey: true,
    subject: true,
    from: true,
    replyTo: true,
    captureEngagement: true,
    html: true,
    text: true
};
const TEMPLATE_FORM = {
    name: 'templateId',
    fields: fieldSet(SHARED_FIELDS, TEMPLATE_FIELDS),
    why: "A template made in PostHog sets its own sender, subject and content, and follows the project's engagement setting.",
    howToSend: 'send a template made in PostHog with templateId'
};
const CODE_FORM = {
    name: 'templateKey',
    fields: fieldSet(SHARED_FIELDS, CODE_FIELDS),
    why: 'A send with templateKey takes its content from your code.',
    howToSend: 'send content from your code with templateKey'
};
const DEFAULT_EMAIL_REQUEST_TIMEOUT_MS = 15000;
const DEFAULT_EMAIL_REQUEST_MAX_RETRIES = 2;
class EmailSender {
    constructor(config, hooks){
        this.inFlight = new Set();
        this.config = config;
        this.hooks = hooks;
    }
    send(options, ...unexpected) {
        return this.track(this.sendUntracked(options, unexpected));
    }
    get(id) {
        return this.track(this.getUntracked(id));
    }
    track(pending) {
        this.inFlight.add(pending);
        pending.finally(()=>this.inFlight.delete(pending));
        return pending;
    }
    async drain() {
        while(this.inFlight.size > 0)await Promise.all(this.inFlight);
    }
    async sendUntracked(options, unexpected) {
        try {
            refuseSecondArgument(unexpected);
            const prepared = prepareSend(options, this.config.maxRetries);
            const { appHost, secretKey } = this.connect('no email was sent', 'Sending email needs secretKey, a project secret API key with the transactional_email:write scope.');
            const headers = this.headers(secretKey, {
                'Content-Type': 'application/json',
                'Idempotency-Key': prepared.idempotencyKey
            });
            const result = await this.withRetries(prepared.maxRetries, async ()=>parseSendReply(await this.request(appHost + prepared.path, 'POST', headers, prepared.body)));
            for (const warning of result.warnings)this.hooks.logger.warn(`PostHog email warning ${warning.code}: ${warning.message}`);
            return {
                data: result,
                error: null
            };
        } catch (error) {
            return {
                data: null,
                error: asEmailError(error, 'Sending the email failed unexpectedly.')
            };
        }
    }
    async getUntracked(id) {
        try {
            if ('string' != typeof id || !UUID_PATTERN.test(id)) throw invalid('invalid_message_id', 'id must be the message ID that send() returned.', 'id');
            const { appHost, secretKey } = this.connect('no email status was read', 'Reading an email status needs secretKey, a project secret API key with the transactional_email:read or transactional_email:write scope.');
            const url = appHost + STATUS_PATH.replace('{messageId}', id.toLowerCase());
            const headers = this.headers(secretKey, {});
            const status = await this.withRetries(this.config.maxRetries, async ()=>parseStatusReply(await this.request(url, 'GET', headers)));
            return {
                data: status,
                error: null
            };
        } catch (error) {
            return {
                data: null,
                error: asEmailError(error, 'Reading the email status failed unexpectedly.')
            };
        }
    }
    connect(nothingDone, missingSecretKey) {
        if (this.hooks.isDisabled()) throw new EmailError({
            code: 'client_disabled',
            message: `The PostHog client is disabled, so ${nothingDone}.`
        });
        if (this.hooks.isClosed()) throw new EmailError({
            code: 'client_closed',
            message: `The PostHog client is shut down, so ${nothingDone}.`
        });
        const appHost = resolveAppHost(this.config.host, this.config.appHost);
        if (!appHost) throw new EmailError({
            code: 'missing_app_host',
            message: "The client's host is not PostHog Cloud, so the client can't tell where to send email. Set appHost to your PostHog app host on the client."
        });
        const secretKey = this.config.secretKey?.trim();
        if (!secretKey) throw new EmailError({
            code: 'missing_secret_key',
            message: missingSecretKey
        });
        return {
            appHost,
            secretKey
        };
    }
    headers(secretKey, extra) {
        const headers = {
            Authorization: `Bearer ${secretKey}`,
            Accept: 'application/json',
            ...extra
        };
        if (this.hooks.userAgent) headers['User-Agent'] = this.hooks.userAgent;
        if (this.config.migratedFrom) headers['X-PostHog-Migrated-From'] = this.config.migratedFrom;
        return headers;
    }
    async withRetries(maxRetries, attemptOnce) {
        for(let attempt = 0;; attempt++){
            let error;
            try {
                return await attemptOnce();
            } catch (caught) {
                error = caught instanceof EmailError ? caught : new EmailError({
                    code: 'network_error',
                    message: 'The request to PostHog failed.',
                    cause: caught
                });
            }
            const delayMs = retryDelayMs(error, attempt, maxRetries);
            if (void 0 === delayMs) throw error;
            await new Promise((resolve)=>setTimeout(resolve, delayMs));
        }
    }
    async request(url, method, headers, body) {
        const controller = new AbortController();
        const timeoutMs = this.config.requestTimeoutMs;
        let timer;
        const deadline = new Promise((_resolve, reject)=>{
            timer = setTimeout(()=>{
                const timeoutError = new Error(`Email request timed out after ${timeoutMs}ms`);
                timeoutError.name = 'AbortError';
                reject(timeoutError);
                controller.abort(timeoutError);
            }, timeoutMs);
        });
        const fetchPromise = Promise.resolve().then(()=>this.hooks.fetch(url, {
                method,
                headers,
                ...void 0 === body ? {} : {
                    body
                },
                signal: controller.signal
            }));
        fetchPromise.then((lateResponse)=>{
            if (controller.signal.aborted) Promise.resolve(lateResponse.body?.cancel()).catch(()=>{});
        }).catch(()=>{});
        let response;
        try {
            response = await Promise.race([
                fetchPromise,
                deadline
            ]);
            let text;
            try {
                text = await Promise.race([
                    response.text(),
                    deadline
                ]);
            } catch (error) {
                if (response.status >= 200 && response.status < 300) throw error;
                return {
                    status: response.status,
                    payload: null,
                    retryAfterMs: readRetryAfter(response)
                };
            }
            return {
                status: response.status,
                payload: parseJson(text),
                retryAfterMs: readRetryAfter(response)
            };
        } finally{
            clearTimeout(timer);
            if (controller.signal.aborted && response) Promise.resolve(response.body?.cancel()).catch(()=>{});
        }
    }
}
function refuseSecondArgument(unexpected) {
    if (unexpected.some((argument)=>void 0 !== argument)) throw new EmailError({
        code: 'invalid_form',
        message: 'send takes one options object, so no email was sent. Put idempotencyKey and every other option in it.'
    });
}
function prepareSend(options, defaultMaxRetries) {
    const send = options ?? {};
    const { to, distinctId, idempotencyKey, maxRetries } = send;
    if ('string' != typeof to || !to.trim()) throw invalid('invalid_recipient', 'to must be one email address as a nonempty string.', 'to');
    if (void 0 !== distinctId && ('string' != typeof distinctId || !distinctId)) throw invalid('invalid_distinct_id', 'distinctId must be a nonempty string.', 'distinctId');
    const content = contentOf(send, distinctId);
    if (void 0 !== idempotencyKey && ('string' != typeof idempotencyKey || !IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey))) throw invalid('invalid_idempotency_key', 'idempotencyKey must be 1 to 255 visible ASCII characters without spaces.', 'idempotencyKey');
    if (void 0 !== maxRetries && !isRetryCount(maxRetries)) throw invalid('invalid_max_retries', 'maxRetries must be a nonnegative integer.', 'maxRetries');
    return {
        path: SEND_PATH,
        body: safeJsonStringify({
            ...content,
            to
        }),
        idempotencyKey: idempotencyKey ?? globalThis.crypto.randomUUID(),
        maxRetries: isRetryCount(maxRetries) ? maxRetries : defaultMaxRetries
    };
}
function isRetryCount(value) {
    return 'number' == typeof value && Number.isInteger(value) && value >= 0;
}
function contentOf(send, distinctId) {
    if (void 0 === send.templateId === (void 0 === send.templateKey)) throw new EmailError({
        code: 'invalid_form',
        message: 'Send either templateId, or templateKey with subject and html or text.'
    });
    return void 0 === send.templateKey ? templateContent(send, distinctId) : codeContent(send, distinctId);
}
function templateContent(send, distinctId) {
    const { templateId, templateData } = send;
    if ('string' != typeof templateId || !UUID_PATTERN.test(templateId)) throw invalid('invalid_template_id', "templateId must be the template's UUID.", 'templateId');
    if (void 0 !== templateData && ('object' != typeof templateData || null === templateData || Array.isArray(templateData))) throw invalid('invalid_template_data', 'templateData must be an object.', 'templateData');
    refuseFieldsOutside(send, TEMPLATE_FORM, CODE_FORM);
    return {
        template_id: templateId.toLowerCase(),
        message_data: templateData ?? {},
        ...void 0 !== distinctId && {
            distinct_id: distinctId
        }
    };
}
function codeContent(send, distinctId) {
    const { templateKey, subject, html, text, from, replyTo, captureEngagement } = send;
    if ('string' != typeof templateKey || !TEMPLATE_KEY_PATTERN.test(templateKey)) throw invalid('invalid_template_key', 'templateKey can only have letters, digits, hyphens (-) and underscores (_), at most 400.', 'templateKey');
    refuseFieldsOutside(send, CODE_FORM, TEMPLATE_FORM);
    if ('string' != typeof subject) throw invalid('invalid_form', 'A send with templateKey needs a subject.', 'subject');
    if (void 0 !== html && 'string' != typeof html) throw invalid('invalid_form', 'html must be a string.', 'html');
    if (void 0 !== text && 'string' != typeof text) throw invalid('invalid_form', 'text must be a string.', 'text');
    if (void 0 === html && void 0 === text) throw invalid('invalid_form', 'A send with templateKey needs html, text or both.', 'html');
    const sendsReplyTo = void 0 !== replyTo && !(Array.isArray(replyTo) && 0 === replyTo.length);
    return {
        template_key: templateKey,
        subject,
        ...void 0 !== html && {
            html
        },
        ...void 0 !== text && {
            text
        },
        ...void 0 !== from && {
            from
        },
        ...sendsReplyTo && {
            reply_to: 'string' == typeof replyTo ? [
                replyTo
            ] : replyTo
        },
        capture_engagement: captureEngagement ?? true,
        ...void 0 !== distinctId && {
            distinct_id: distinctId
        }
    };
}
function refuseFieldsOutside(send, form, otherForm) {
    const field = Object.entries(send).find(([name, value])=>void 0 !== value && !form.fields.has(name))?.[0];
    if (void 0 === field) return;
    const message = `A send with ${form.name} doesn't take ${field}, so no email was sent.`;
    if (!otherForm.fields.has(field)) throw new EmailError({
        code: 'invalid_form',
        message,
        field,
        fix: `Remove ${field} and send again.`
    });
    throw new EmailError({
        code: 'invalid_form',
        message,
        field,
        why: form.why,
        fix: `Remove ${field}, or ${otherForm.howToSend}.`
    });
}
function fieldSet(...groups) {
    return new Set(groups.flatMap((group)=>Object.keys(group)));
}
function invalid(code, message, field) {
    return new EmailError({
        code,
        message,
        field
    });
}
function resolveAppHost(host, appHost) {
    const explicit = 'string' == typeof appHost ? removeTrailingSlash(appHost.trim()) : '';
    if (explicit) return CLOUD_APP_HOSTS[explicit] ?? explicit;
    return CLOUD_APP_HOSTS[removeTrailingSlash(host)];
}
function parseJson(text) {
    try {
        return JSON.parse(text);
    } catch  {
        return null;
    }
}
function readRetryAfter(response) {
    try {
        return parseRetryAfterMs(response.headers?.get('retry-after'), Date.now(), Number.MAX_SAFE_INTEGER);
    } catch  {
        return;
    }
}
function emails_text(value) {
    return 'string' == typeof value && value ? value : void 0;
}
function replyFields(payload) {
    return null === payload || 'object' != typeof payload || Array.isArray(payload) ? {} : payload;
}
function parseSendReply({ status, payload, retryAfterMs }) {
    const fields = replyFields(payload);
    if (status >= 200 && status < 300) {
        const id = emails_text(fields.message_id);
        if (!id) throw new EmailError({
            code: 'api_error',
            message: 'PostHog answered without a message ID.',
            statusCode: status
        });
        const warnings = [];
        if (Array.isArray(fields.warnings)) {
            for (const warning of fields.warnings)if (null !== warning && 'object' == typeof warning) warnings.push({
                code: emails_text(warning.code) ?? 'warning',
                message: emails_text(warning.detail) ?? emails_text(warning.message) ?? '',
                fix: emails_text(warning.fix)
            });
        }
        return {
            id,
            replayed: true === fields.replayed,
            warnings
        };
    }
    throw replyError(fields, status, retryAfterMs);
}
function parseStatusReply({ status, payload, retryAfterMs }) {
    const fields = replyFields(payload);
    if (status < 200 || status >= 300) throw replyError(fields, status, retryAfterMs);
    const id = emails_text(fields.id);
    const deliveryStatus = emails_text(fields.status);
    const createdAt = emails_text(fields.created_at);
    const statusAt = emails_text(fields.status_at);
    if (!id || !deliveryStatus || !createdAt || !statusAt) throw new EmailError({
        code: 'api_error',
        message: 'PostHog answered without an email status.',
        statusCode: status
    });
    return {
        id,
        status: deliveryStatus,
        createdAt,
        statusAt,
        reason: emails_text(fields.reason) ?? null
    };
}
function replyError(fields, status, retryAfterMs) {
    return new EmailError({
        code: emails_text(fields.code) ?? 'api_error',
        message: emails_text(fields.detail) ?? `PostHog answered HTTP ${status}.`,
        statusCode: status,
        why: emails_text(fields.why),
        fix: emails_text(fields.fix),
        docsUrl: emails_text(fields.docs_url),
        field: emails_text(fields.attr),
        retryAfterMs
    });
}
function asEmailError(error, message) {
    return error instanceof EmailError ? error : new EmailError({
        code: 'unexpected_error',
        message,
        cause: error
    });
}
function isRetryable(error) {
    if (void 0 === error.statusCode) return 'network_error' === error.code;
    if (409 === error.statusCode) return 'idempotency_key_in_flight' === error.code;
    if (429 === error.statusCode) return 'quota_limited' !== error.code;
    return 503 === error.statusCode;
}
function retryDelayMs(error, attempt, maxRetries) {
    if (attempt >= maxRetries || !isRetryable(error)) return;
    if (void 0 !== error.retryAfterMs && error.retryAfterMs > MAX_RETRY_DELAY_MS) return;
    const backoffMs = Math.min(MAX_RETRY_DELAY_MS, 1000 * 2 ** attempt * (0.8 + 0.4 * Math.random()));
    return Math.max(backoffMs, error.retryAfterMs ?? 0);
}
export { DEFAULT_EMAIL_REQUEST_MAX_RETRIES, DEFAULT_EMAIL_REQUEST_TIMEOUT_MS, EmailSender };
