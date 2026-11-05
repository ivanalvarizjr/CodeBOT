const lifetimes = new WeakMap();
function inheritContextLifetime(parent, child, signal) {
    const lifetime = parent && lifetimes.get(parent);
    if (signal) lifetimes.set(child, {
        signal,
        parent: lifetime
    });
    else if (lifetime) lifetimes.set(child, lifetime);
    return child;
}
function isContextActive(context) {
    let lifetime = lifetimes.get(context);
    while(lifetime){
        if (lifetime.signal.aborted) return false;
        lifetime = lifetime.parent;
    }
    return true;
}
export { inheritContextLifetime, isContextActive };
