const capturedContext = Symbol('capturedContext');
function snapshotEventContext(context) {
    const snapshot = context ? {
        ...context,
        properties: {
            ...context.properties
        }
    } : null;
    return (event)=>Object.assign(event, {
            [capturedContext]: snapshot
        });
}
function getEventContext(event, fallback) {
    return capturedContext in event ? event[capturedContext] ?? void 0 : fallback;
}
export { getEventContext, snapshotEventContext };
