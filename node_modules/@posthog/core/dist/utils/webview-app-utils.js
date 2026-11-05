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
const facebookAppVersion = /\bFBAV\/(\d+(?:\.\d+)*)/i;
const webviewAppMatchers = [
    [
        /\bInstagram(?:[ /](\d+(?:\.\d+)*))?\b/i,
        'Instagram'
    ],
    [
        /\bBarcelona[ /](\d+(?:\.\d+)*)?/i,
        'Threads'
    ],
    [
        /\b(?:MessengerForiOS|(?:FBAN|FB_IAB)\/Orca-Android)\b/i,
        'Messenger',
        facebookAppVersion
    ],
    [
        /\bFBAN\/EMA\b/i,
        'Facebook Lite',
        facebookAppVersion
    ],
    [
        /\b(?:FBIOS|(?:FBAN|FB_IAB)\/(?:FB4A|FBIOS))\b/i,
        'Facebook',
        facebookAppVersion
    ],
    [
        /\bLinkedInApp(?:\]?\/(\d+(?:\.\d+)*))?\b/i,
        'LinkedIn'
    ],
    [
        /\bTwitter(?:Android| for (?:iPhone|iPad|Android))(?:\/(\d+(?:\.\d+)*))?\b/i,
        'Twitter'
    ],
    [
        /\b(?:musical_ly|trill)(?:[_/](\d+\.\d+(?:\.\d+)*))?(?=\b|_)/i,
        'TikTok',
        /\bapp_version\/(\d+(?:\.\d+)*)/i
    ],
    [
        /\b(?:MicroMessenger|WeChat)\/(\d+(?:\.\d+)*)?/i,
        'WeChat'
    ],
    [
        /\bLine\/(\d+(?:\.\d+)*)?/i,
        'Line'
    ],
    [
        /\bGSA\/(\d+(?:\.\d+)*)?/i,
        'Google'
    ],
    [
        /\[Pinterest\/(?:iOS|Android)\b|\bPinterest(?: for (?:Android(?: Tablet)?|iOS))?\/(\d+(?:\.\d+)*)/i,
        'Pinterest'
    ],
    [
        /\b(?:WA4A|WAiOS)\/(\d+(?:\.\d+)*)?/i,
        'WhatsApp'
    ],
    [
        /\bSnapchat[ /](\d+(?:\.\d+)*)?/i,
        'Snapchat'
    ],
    [
        /\bBing(?:Web|Sapphire)\/(\d+(?:\.\d+)*)?/i,
        'Bing'
    ],
    [
        /\bNAVER\(inapp; search;/i,
        'Naver',
        /\bNAVER\(inapp; search;[^;)]*; (\d+(?:\.\d+)*)/i
    ],
    [
        /\bKAKAOTALK[ /](\d+\.\d+(?:\.\d+)*)?/i,
        'KakaoTalk'
    ]
];
function detectWebviewApp(userAgent) {
    for(let i = 0; i < webviewAppMatchers.length; i++){
        const [regex, name, versionRegex] = webviewAppMatchers[i];
        const match = userAgent.match(regex);
        if (match) {
            const versionMatch = versionRegex && userAgent.match(versionRegex) || match;
            return [
                name,
                versionMatch?.[1] || ''
            ];
        }
    }
    return [
        '',
        ''
    ];
}
__webpack_require__.d(__webpack_exports__, {
    detectWebviewApp: ()=>detectWebviewApp
});
exports.detectWebviewApp = __webpack_exports__.detectWebviewApp;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "detectWebviewApp"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
