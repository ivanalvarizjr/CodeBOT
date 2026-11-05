import { includes } from "./string-utils.mjs";
function isWebKit(userAgent) {
    return includes(userAgent, 'AppleWebKit') && !includes(userAgent, 'Chrome');
}
export { isWebKit };
