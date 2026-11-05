import { isUndefined } from "../../utils/index.mjs";
const UNKNOWN_FUNCTION = '?';
const ANONYMOUS_FILENAME = '<anonymous>';
const URL_SCHEME = /^([a-z][a-z0-9.+-]+):/i;
const APP_URL_SCHEMES = [
    'http',
    'https',
    'file',
    'blob',
    'app',
    'capacitor',
    'ionic',
    'webpack',
    'webpack-internal',
    'ng'
];
function isAppFilename(filename) {
    if (!filename || filename === ANONYMOUS_FILENAME) return false;
    const scheme = URL_SCHEME.exec(filename);
    return !scheme || APP_URL_SCHEMES.includes(scheme[1].toLowerCase());
}
function createFrame(platform, filename, func, lineno, colno) {
    const frame = {
        platform,
        filename,
        function: '<anonymous>' === func ? UNKNOWN_FUNCTION : func,
        in_app: isAppFilename(filename)
    };
    if (!isUndefined(lineno)) frame.lineno = lineno;
    if (!isUndefined(colno)) frame.colno = colno;
    return frame;
}
export { UNKNOWN_FUNCTION, createFrame };
