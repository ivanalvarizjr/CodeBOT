class EmailError extends Error {
    constructor(params){
        super(params.message, void 0 === params.cause ? void 0 : {
            cause: params.cause
        });
        this.name = emailErrorName(params.statusCode, params.code);
        this.code = params.code;
        this.statusCode = params.statusCode;
        this.why = params.why;
        this.fix = params.fix;
        this.docsUrl = params.docsUrl;
        this.field = params.field;
        this.retryAfterMs = params.retryAfterMs;
    }
}
function emailErrorName(status, code) {
    if ('missing_secret_key' === code || 401 === status) return 'missing_api_key';
    if (void 0 === status) {
        if ('network_error' === code) return 'service_unavailable';
        return code.startsWith('invalid_') ? 'validation_error' : 'application_error';
    }
    switch(status){
        case 400:
            return 'validation_error';
        case 403:
            return 'invalid_permission';
        case 404:
            return 'not_found';
        case 409:
            return 'template_outdated' === code ? 'validation_error' : 'concurrent_idempotent_requests';
        case 422:
            return 'idempotency_key_reused' === code ? 'invalid_idempotent_request' : 'validation_error';
        case 429:
            return 'quota_limited' === code ? 'monthly_quota_exceeded' : 'rate_limit_exceeded';
        case 503:
            return 'service_unavailable';
        default:
            return 'application_error';
    }
}
export { EmailError };
