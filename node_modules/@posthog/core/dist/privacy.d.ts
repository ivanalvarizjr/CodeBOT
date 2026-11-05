export interface TextSanitizationOptions {
    maxStringLength: number;
    truncationSuffix: string;
}
/**
 * Sanitizes agent-narrated free text (`$mcp_intent`, the `send_feedback`
 * fields): structured PII on top of the passes every captured string gets.
 *
 * Every step of the order is load-bearing. The binary gate reads the value as it
 * arrived, because splicing `[redacted]` into a blob — a Luhn-valid run inside
 * base64 is enough — stops it looking like base64 and would ship it whole.
 * Credentials go before PII, because a PII pattern can cut a token in half (a
 * phone-shaped run inside one) and leave the halves behind. PII goes before the
 * URL pass, because the URL rewrite percent-encodes the `@` that the email
 * pattern anchors on.
 */
export declare function sanitizeFreeText(value: string, options: TextSanitizationOptions): string;
/**
 * Redacts structured personal identifiers (emails, IP addresses, credit-card
 * numbers, US SSNs, and phone numbers) from a free-text string. Intended for the
 * agent-narrated `$mcp_intent` value only — not for structured tool parameters or
 * responses, where the same shapes are often legitimate data. Horizontal Unicode
 * spaces are first normalized to an ASCII space so copy-pasted identifiers still
 * match. Returns a new string; leaves the input's identifiers untouched when
 * nothing matches.
 */
export declare function redactPii(value: string): string;
export declare function sanitizeCapturedValue(value: unknown, options: TextSanitizationOptions): unknown;
/**
 * {@link sanitizeCapturedValue} with the intent-grade string pass
 * ({@link sanitizeFreeText}) on every string leaf, so nested agent-narrated
 * values get structured-PII redaction in the load-bearing order too.
 */
export declare function sanitizeFreeTextValue(value: unknown, options: TextSanitizationOptions): unknown;
//# sourceMappingURL=privacy.d.ts.map