// Process the mappings and generate an easily searchable dictionary
const fs = require("fs"),
      mappingsText = fs.readFileSync("evil_nonfree/client.txt", "utf-8");

const objects = {
    classes: [],
    fields: [],
    methods: []
};

// parser state
let curClassName, curObfuscatedClass, curFQCN;

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
        curObfuscatedClass = obfuscated;
        curClassName = className;
        curFQCN = fqcn;
        objects.classes.push({type: "class", name: fqcn, obfuscated});
        continue;
    }

    const methodMatch = line.match(/(?<startLine>\d+):(?<endLine>\d+):(?<retType>.+) (?<methodName>.+)\((?<signature>.*)\) -> (?<obfuscated>.+)/);
    if(methodMatch) {
        const {startLine, endLine, retType, methodName, signature, obfuscated} = methodMatch.groups;
        objects.methods.push({
            type: "method",
            params: signature.split(',').map(param => param.trim()),
            retType,
            startLine,
            endLine,
            name: curFQCN + "." + methodName,
            obfuscated
        });
        continue;
    }

    const fieldMatch = line.match(/(?<type>.+) (?<fieldName>.+) -> (?<obfuscated>.+)/);
    if(fieldMatch) {
        const {type, fieldName, obfuscated} = fieldMatch.groups;
        objects.fields.push({
            type: "field",
            name: curFQCN + fieldName,
            fieldtype: type,
            obfuscated: curObfuscatedClass + "." + fieldName
        });
    }

}

fs.writeFileSync("dictionary.json", JSON.stringify(objects));