import type { ContextData } from './types';
export interface ContextLifetime {
    signal: AbortSignal;
    parent?: ContextLifetime;
}
export declare function inheritContextLifetime(parent: ContextData | undefined, child: ContextData, signal?: AbortSignal): ContextData;
export declare function isContextActive(context: ContextData): boolean;
//# sourceMappingURL=lifetime.d.ts.map