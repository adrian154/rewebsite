const fs = require("fs");
const classes = require("./outputs/dictionary.json").classes;

fs.writeFileSync("outputs/intermediary-to-mojmap.properties", fs.readFileSync("inputs/1.19.tiny", "utf-8")
    .split("\n")
    .filter(line => line.slice(0, 5) === "CLASS")
    .map(line => line.split(/\s+/))
    .map(([_, official, intermediary]) => {
        const intermediaryClassname = intermediary.split('/').pop().split('$').pop();
        const mojangClassname = classes.find(clazz => clazz.obfuscated == official)?.name.split('.').pop().split('$').pop();
        if(mojangClassname) {
            return [intermediaryClassname, mojangClassname];
        }
        return [intermediaryClassname, "<unknown class>"];
    })
    .map(pair => `${pair[0]} = ${pair[1]}`)
    .join("\n"));
