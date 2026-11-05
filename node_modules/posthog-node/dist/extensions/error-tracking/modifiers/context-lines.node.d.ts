import { ErrorTracking as CoreErrorTracking, type Logger } from '@posthog/core';
import { type FileHandle } from 'node:fs/promises';
export declare const MAX_CONTEXTLINES_COLNO: number;
export declare const MAX_CONTEXTLINES_LINENO: number;
export declare const MAX_CONTEXTLINES_FILE_SIZE: number;
type OpenSourceFile = (path: string, flags: number) => Promise<FileHandle>;
export declare function addSourceContext(frames: CoreErrorTracking.StackFrame[], openSourceFile?: OpenSourceFile, logger?: Pick<Logger, 'debug'>): Promise<CoreErrorTracking.StackFrame[]>;
export {};
//# sourceMappingURL=context-lines.node.d.ts.map