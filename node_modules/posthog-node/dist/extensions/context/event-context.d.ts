import type { EventMessage } from '../../types';
import type { ContextData } from './types';
export declare function snapshotEventContext(context: ContextData | undefined): (event: EventMessage) => EventMessage;
export declare function getEventContext(event: EventMessage, fallback: ContextData | undefined): ContextData | undefined;
//# sourceMappingURL=event-context.d.ts.map