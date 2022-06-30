// Process the mappings and generate an easily searchable dictionary
const fs = require("fs"),
      mappingsText = fs.readFileSync("evil_nonfree/client.txt", "utf-8");

const dict = new Map();
const addEntry = (str, thing) => {
    const list = dict.get(str);
    if(list)
        list.push(thing);
    else
        dict.set(str, [thing]);
};

// parser state
let curClassName, curFQCN;

console.log("building dictionary...");
for(const rawLine of mappingsText.split('\n')) {
    
    const line = rawLine.trim();

    // skip comments... even though there's just one
    if(line[0] === '#') continue;

    // regex for parsing? unthinkable.
    // god, I need to finish that parser combinator library so bad
    // in case it isn't obvious this code isn't robust at all, but who cares
    const classMatch = line.match(/(?<package>.+)\.(?<className>.+) -> (?<obfuscated>.+):/);
    if(classMatch) {
        const {package, className, obfuscated} = classMatch.groups;
        const fqcn = package + "." + className;
        curClassName = className;
        curFQCN = fqcn;
        const entry = {type: "class", fqcn, obfuscated};
        addEntry(fqcn, entry);
        addEntry(className, entry);
        continue;
    }

    const methodMatch = line.match(/(?<startLine>\d+):(?<endLine>\d+):(?<retType>.+) (?<methodName>.+)\((?<signature>.*)\) -> (?<obfuscated>.+)/);
    if(methodMatch) {
        const {startLine, endLine, retType, methodName, signature, obfuscated} = methodMatch.groups;

        // further parse the method name
        const params = signature.split(',').map(param => param.trim());
        
        // method descriptor TODO
        const entry = {
            type: "method",
            params,
            class: curFQCN,
            retType,
            startLine,
            endLine,
            name: methodName,
            obfuscated
        };

        addEntry(methodName, entry);
        addEntry(curClassName + "." + methodName, entry);
        addEntry(curFQCN + "." + methodName, entry);
        continue;
    }

    const fieldMatch = line.match(/(?<type>.+) (?<fieldName>.+) -> (?<obfuscated>.+)/);
    if(fieldMatch) {
        const {type, fieldName, obfuscated} = fieldMatch.groups;
        const entry = {
            type: "field",
            name: fieldName,
            fieldtype: type,
            obfuscated
        };
        addEntry(fieldName, entry);
        addEntry(curClassName + "." + fieldName, entry);
        addEntry(curFQCN + "." + fieldName, entry);
    }

}

// if we naiively JSONify the dictionary it will be absolutely huge because of all the duplicate values
// we can achieve pretty good space reduction by reducing the redundancy
console.log("condensing dictionary..");
const objects = [], flattenedDict = [];

for(const [term, entries] of dict) {
    flattenedDict.push([term, entries.map(entry => {
        const index = objects.indexOf(entry);
        if(index < 0) {
            objects.push(entry);
            return objects.length - 1;
        }
        return index;
    })]);
}

fs.writeFileSync("dictionary.json", JSON.stringify({
    dictionary: flattenedDict,
    objects
}));