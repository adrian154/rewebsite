// Process the mappings and generate an easily searchable dictionary
const fs = require("fs"),
      mappingsText = fs.readFileSync("evil_nonfree/client.txt", "utf-8");

// 12:30 AM variable names really hit different
// oh, right, 24 hour time. 00:30 variable naming at play here.
// (is that right? too late to tell. or, well, I guess too early.)
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

console.log("building dictionary..");
for(const rawLine of mappingsText.split('\n')) {
    
    const line = rawLine.trim();

    // skip comments... even though there's just one
    if(line[0] === '#') continue;

    // regex for parsing? unthinkable.
    // god, I need to finish that parser combinator library so bad
    // in case it isn't obvious this code isn't robust at all, but who cares
    const classNameMatch = line.match(/(?<package>.+)\.(?<className>.+) -> (?<obfuscatedClassName>.+):/);
    if(classNameMatch) {
        const {package, className, obfuscatedClassName} = classNameMatch.groups;
        const fqcn = package + "." + className;
        curClassName = className;
        curFQCN = fqcn;
        const thing = {type: "class", fqcn, obfuscated: obfuscatedClassName};
        addEntry(fqcn, thing);
        addEntry(className, thing);
        continue;
    }

    const methodNameMatch = line.match(/(?<startLine>\d+):(?<endLine>\d+):(?<retType>.+) (?<methodName>.+)\((?<signature>.*)\) -> (?<obfuscatedMethodName>.+)/);
    if(methodNameMatch) {
        const {startLine, endLine, retType, methodName, signature, obfuscatedMethodName} = methodNameMatch.groups;

        // further parse the method name
        const params = signature.split(',').map(param => param.trim());
        
        // method descriptor TODO
        const thing = {
            type: "method",
            params,
            class: curFQCN,
            retType,
            startLine,
            endLine,
            name: methodName,
            obfuscated: obfuscatedMethodName
        };

        addEntry(methodName, thing);
        addEntry(curClassName + "." + methodName, thing);
        addEntry(curFQCN + "." + methodName, thing);
        continue;
    }

    const fieldNameMatch = line.match(/(?<type>.+) (?<fieldName>.+) -> (?<obfuscatedFieldName>.+)/);
    if(fieldNameMatch) {
        const {type, fieldName, obfuscatedFieldName} = fieldNameMatch.groups;
        const thing = {
            type: "field",
            fieldtype: type,
            obfuscated: obfuscatedFieldName
        };
        addEntry(fieldName, thing);
        addEntry(curClassName + "." + fieldName, thing);
        addEntry(curFQCN + "." + fieldName, thing);
    }

}

// if we naiively JSONify the dictionary it will be absolutely huge because of all the duplicate values
// we can achieve pretty good space reduction by reducing the redundancy

console.log("condensing dictionary..");
const things = [], flatDict = [];

for(const [term, entries] of dict) {
    const updated = entries.map(entry => {
        const index = things.indexOf(entry);
        if(index >= 0) {
            return index;
        }
        things.push(entry);
        return things.length - 1;
    });
    flatDict.push([term, updated]);
}

fs.writeFileSync("dictionary.json", JSON.stringify({
    dictionary: flatDict,
    things
}));