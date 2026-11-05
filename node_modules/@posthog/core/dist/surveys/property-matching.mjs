const isValidRegex = (pattern)=>{
    try {
        new RegExp(pattern);
    } catch  {
        return false;
    }
    return true;
};
const isMatchingRegex = (value, pattern)=>{
    if (!isValidRegex(pattern)) return false;
    try {
        return new RegExp(pattern).test(value);
    } catch  {
        return false;
    }
};
const toLowerCase = (value)=>value.toLowerCase();
const propertyComparisons = {
    exact: (targets, values)=>values.some((value)=>targets.some((target)=>value === target)),
    is_not: (targets, values)=>values.every((value)=>targets.every((target)=>value !== target)),
    regex: (targets, values)=>values.some((value)=>targets.some((target)=>isMatchingRegex(value, target))),
    not_regex: (targets, values)=>values.every((value)=>targets.every((target)=>!isMatchingRegex(value, target))),
    icontains: (targets, values)=>values.map(toLowerCase).some((value)=>targets.map(toLowerCase).some((target)=>value.includes(target))),
    not_icontains: (targets, values)=>values.map(toLowerCase).every((value)=>targets.map(toLowerCase).every((target)=>!value.includes(target))),
    gt: (targets, values)=>values.some((value)=>{
            const numValue = parseFloat(value);
            return !isNaN(numValue) && targets.some((target)=>numValue > parseFloat(target));
        }),
    lt: (targets, values)=>values.some((value)=>{
            const numValue = parseFloat(value);
            return !isNaN(numValue) && targets.some((target)=>numValue < parseFloat(target));
        })
};
function matchPropertyFilters(propertyFilters, eventProperties) {
    if (!propertyFilters) return true;
    return Object.entries(propertyFilters).every(([propertyName, filter])=>{
        const eventPropertyValue = eventProperties?.[propertyName];
        if (null == eventPropertyValue) return false;
        const comparisonFunction = propertyComparisons[filter.operator];
        if (!comparisonFunction) return false;
        return comparisonFunction(filter.values.map(String), [
            String(eventPropertyValue)
        ]);
    });
}
export { isMatchingRegex, isValidRegex, matchPropertyFilters, propertyComparisons };
