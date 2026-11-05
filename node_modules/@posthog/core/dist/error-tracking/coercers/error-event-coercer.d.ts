import { CoercingContext, ErrorTrackingCoercer, ExceptionLike } from '../types';
interface ErrorEventLike {
    message: string;
    error?: unknown;
}
export declare class ErrorEventCoercer implements ErrorTrackingCoercer<ErrorEventLike> {
    constructor();
    match(err: unknown): err is ErrorEventLike;
    coerce(err: ErrorEventLike, ctx: CoercingContext): ExceptionLike;
    private _hasUsableMessage;
    private _buildLocationStack;
}
export {};
//# sourceMappingURL=error-event-coercer.d.ts.map