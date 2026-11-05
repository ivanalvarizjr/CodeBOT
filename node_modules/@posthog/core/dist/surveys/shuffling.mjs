import { isNull } from "../utils/type-utils.mjs";
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
    if (!isNull(openEndedChoice)) shuffledChoices.push(openEndedChoice);
    return shuffledChoices;
};
export { getDisplayOrderChoices, shuffle };
