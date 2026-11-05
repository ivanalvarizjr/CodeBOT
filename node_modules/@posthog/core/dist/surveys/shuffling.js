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
__webpack_require__.d(__webpack_exports__, {
    getDisplayOrderChoices: ()=>getDisplayOrderChoices,
    shuffle: ()=>shuffle
});
const type_utils_js_namespaceObject = require("../utils/type-utils.js");
const shuffle = (array)=>{
    const shuffled = [
        ...array
    ];
    for(let index = shuffled.length - 1; index > 0; index--){
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [
            shuffled[swapIndex],
            shuffled[index]
        ];
    }
    return shuffled;
};
const reverseIfUnshuffled = (unshuffled, shuffled)=>{
    if (shuffled.length > 1 && unshuffled.every((value, index)=>value === shuffled[index])) return shuffled.reverse();
    return shuffled;
};
const getDisplayOrderChoices = (question)=>{
    if (!question.shuffleOptions) return question.choices;
    const choices = [
        ...question.choices
    ];
    const openEndedChoice = question.hasOpenChoice ? choices.pop() ?? null : null;
    const shuffledChoices = reverseIfUnshuffled(choices, shuffle(choices));
    if (!(0, type_utils_js_namespaceObject.isNull)(openEndedChoice)) shuffledChoices.push(openEndedChoice);
    return shuffledChoices;
};
exports.getDisplayOrderChoices = __webpack_exports__.getDisplayOrderChoices;
exports.shuffle = __webpack_exports__.shuffle;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "getDisplayOrderChoices",
    "shuffle"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
