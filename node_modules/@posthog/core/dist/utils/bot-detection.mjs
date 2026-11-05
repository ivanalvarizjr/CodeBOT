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
export { DEFAULT_BLOCKED_UA_STRS, __resetBotDetectionCacheForTests, isBlockedUA };
