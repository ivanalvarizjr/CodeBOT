import { isError } from "../../utils/type-utils.mjs";
class ErrorCoercer {
    match(err) {
        return isError(err);
    }
    coerce(err, ctx) {
        const stack = this.getStack(err);
        const replacementStack = void 0 === stack ? ctx.syntheticException?.stack : void 0;
        const synthetic = !!replacementStack;
        return {
            type: this.getType(err),
            value: this.getMessage(err, ctx),
            stack: stack ?? replacementStack,
            cause: err.cause ? ctx.next(err.cause) : void 0,
            synthetic
        };
    }
    getType(err) {
        return err.name || err.constructor.name;
    }
    getMessage(err, _ctx) {
        const message = err.message;
        if (message.error && 'string' == typeof message.error.message) return String(message.error.message);
        return String(message);
    }
    getStack(err) {
        try {
            const stacktrace = err.stacktrace;
            if ('string' == typeof stacktrace && stacktrace.length > 0) return stacktrace;
            const stack = err.stack;
            return 'string' == typeof stack && stack.length > 0 ? stack : void 0;
        } catch  {
            return;
        }
    }
}
export { ErrorCoercer };
