import { isErrorEvent, isString } from "../../utils/index.mjs";
class ErrorEventCoercer {
    match(err) {
        if (!isErrorEvent(err)) return false;
        const errorEvent = err;
        return void 0 != errorEvent.error || this._hasUsableMessage(errorEvent);
    }
    coerce(err, ctx) {
        if (void 0 != err.error) return ctx.apply(err.error);
        const exceptionLike = ctx.apply(err.message);
        return {
            ...exceptionLike,
            stack: this._buildLocationStack(err) ?? exceptionLike.stack,
            synthetic: true
        };
    }
    _hasUsableMessage(err) {
        return isString(err.message) && err.message.length > 0;
    }
    _buildLocationStack(err) {
        const location = err;
        const lineno = location.lineno ?? 0;
        const colno = location.colno ?? 0;
        if (!isString(location.filename) || 0 === location.filename.length) return;
        if (0 === lineno) return;
        return `Error\n    at ${location.filename}:${lineno}:${colno}`;
    }
}
export { ErrorEventCoercer };
