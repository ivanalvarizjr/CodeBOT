"use strict";
var __webpack_require__ = {};
(()=>{
    __webpack_require__.d = (exports1, getters, values)=>{
        var define = (defs, kind)=>{
            for(var key in defs)if (__webpack_require__.o(defs, key) && !__webpack_require__.o(exports1, key)) Object.defineProperty(exports1, key, {
                enumerable: true,
                [kind]: defs[key]
            });
        };
        define(getters, "get");
        define(values, "value");
    };
})();
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
(()=>{
    __webpack_require__.r = (exports1)=>{
        if ("u" > typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports1, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports1, '__esModule', {
            value: true
        });
    };
})();
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
const DEFAULT_BLOCKED_UA_STRS = [
    'amazonbot',
    'amazonproductbot',
    'app.hypefactors.com',
    'applebot',
    'archive.org_bot',
    'awariobot',
    'backlinksextendedbot',
    'baiduspider',
    'bingbot',
    'bingpreview',
    'chrome-lighthouse',
    'dataforseobot',
    'deepscan',
    'duckduckbot',
    'facebookexternal',
    'facebookcatalog',
    'http://yandex.com/bots',
    'hubspot',
    'ia_archiver',
    'leikibot',
    'linkedinbot',
    'meta-externalagent',
    'mj12bot',
    'msnbot',
    'nessus',
    'petalbot',
    'pinterestbot',
    'prerender',
    'rogerbot',
    'screaming frog',
    'sebot-wa',
    'sitebulb',
    'slackbot',
    'slurp',
    'trendictionbot',
    'turnitin',
    'twitterbot',
    'vercel-screenshot',
    'vercelbot',
    'yahoo! slurp',
    'yandexbot',
    'zoombot',
    'bot.htm',
    'bot.php',
    '(bot;',
    'bot/',
    'crawler',
    'ahrefsbot',
    'ahrefssiteaudit',
    'semrushbot',
    'siteauditbot',
    'splitsignalbot',
    'gptbot',
    'oai-searchbot',
    'chatgpt-user',
    'perplexitybot',
    'better uptime bot',
    'sentryuptimebot',
    'uptimerobot',
    'headlesschrome',
    'lightpanda',
    'cypress',
    'google-hoteladsverifier',
    'adsbot-google',
    'apis-google',
    'duplexweb-google',
    'feedfetcher-google',
    'google favicon',
    'google web preview',
    'google-read-aloud',
    'googlebot',
    'googleother',
    'google-cloudvertexbot',
    'googleweblight',
    'mediapartners-google',
    'storebot-google',
    'google-inspectiontool',
    'bytespider'
];
const UA_CACHE = new Map();
const MAX_CACHE_ENTRIES = 256;
function __resetBotDetectionCacheForTests() {
    UA_CACHE.clear();
}
function buildCacheKey(ua, custom) {
    let customEncoded = '';
    for(let i = 0; i < custom.length; i++){
        const c = custom[i];
        customEncoded += c.length + ':' + c;
    }
    return ua.length + ':' + ua + '|' + custom.length + ':' + customEncoded;
}
const isBlockedUA = function(ua, customBlockedUserAgents = []) {
    if (!ua) return false;
    const key = buildCacheKey(ua, customBlockedUserAgents);
    const cached = UA_CACHE.get(key);
    if (void 0 !== cached) return cached;
    const uaLower = ua.toLowerCase();
    const result = DEFAULT_BLOCKED_UA_STRS.concat(customBlockedUserAgents).some((blockedUA)=>-1 !== uaLower.indexOf(blockedUA.toLowerCase()));
    if (UA_CACHE.size >= MAX_CACHE_ENTRIES) UA_CACHE.clear();
    UA_CACHE.set(key, result);
    return result;
};
__webpack_require__.d(__webpack_exports__, {
    __resetBotDetectionCacheForTests: ()=>__resetBotDetectionCacheForTests
}, {
    DEFAULT_BLOCKED_UA_STRS: DEFAULT_BLOCKED_UA_STRS,
    isBlockedUA: isBlockedUA
});
exports.DEFAULT_BLOCKED_UA_STRS = __webpack_exports__.DEFAULT_BLOCKED_UA_STRS;
exports.__resetBotDetectionCacheForTests = __webpack_exports__.__resetBotDetectionCacheForTests;
exports.isBlockedUA = __webpack_exports__.isBlockedUA;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "DEFAULT_BLOCKED_UA_STRS",
    "__resetBotDetectionCacheForTests",
    "isBlockedUA"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
