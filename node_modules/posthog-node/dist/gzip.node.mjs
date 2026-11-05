import { gzip } from "node:zlib";
import { promisify } from "node:util";
const gzipAsync = promisify(gzip);
async function gzipCompress(input, isDebug = true) {
    try {
        const compressed = await gzipAsync(input);
        return new Uint8Array(compressed);
    } catch (error) {
        if (isDebug) console.error('Failed to gzip compress data', error);
        return null;
    }
}
export { gzipCompress };
