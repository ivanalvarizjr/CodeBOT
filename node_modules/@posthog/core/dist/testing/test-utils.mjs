import { setTimeout as promises_setTimeout } from "node:timers/promises";
const wait = async (t)=>{
    await new Promise((r)=>setTimeout(r, t));
};
const waitForPromises = async ()=>{
    await promises_setTimeout(10);
};
const parseBody = (mockCall)=>{
    const options = mockCall[1];
    expect(options.method).toBe('POST');
    return JSON.parse(options.body || '');
};
const createImperativePromise = ()=>{
    let resolve;
    const promise = new Promise((r)=>{
        resolve = r;
    });
    return [
        promise,
        (val)=>resolve?.(val)
    ];
};
const delay = (ms)=>new Promise((resolve)=>{
        setTimeout(resolve, ms);
    });
const createMockLogger = ()=>({
        debug: vi.fn((...args)=>console.debug(...args)),
        info: vi.fn((...args)=>console.log(...args)),
        warn: vi.fn((...args)=>console.warn(...args)),
        error: vi.fn((...args)=>console.error(...args)),
        critical: vi.fn((...args)=>console.error(...args)),
        createLogger: createMockLogger
    });
export { createImperativePromise, createMockLogger, delay, parseBody, wait, waitForPromises };
