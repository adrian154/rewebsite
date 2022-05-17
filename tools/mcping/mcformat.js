const StyleMap = Object.freeze({
    black: "f0",
    dark_blue: "f1",
    dark_green: "f2",
    dark_aqua: "f3",
    dark_red: "f4",
    dark_purple: "f5",
    gold: "f6",
    gray: "f7",
    dark_gray: "f8",
    blue: "f9",
    green: "fa",
    aqua: "fb",
    red: "fc",
    light_purple: "fd",
    yellow: "fe",
    white: "ff"
});

const formatMC = (text) => {

    const root = document.createElement("span");
    let curSpan = root;

    for(const fragment of text.split(/(§.)/)) {
        if(fragment[0] === "§") {
            const span = document.createElement("span");
            span.classList.add("f" + fragment[1]);
            curSpan.append(span);
            curSpan = span;
        } else {
            curSpan.append(document.createTextNode(fragment));
        }
    }

    return root;

};

const formatRaw = (arr) => {
    
    const elems = arr.map(group => {
        const elem = document.createElement("span");
        elem.textContent = group.text;
        if(group.bold) elem.classList.add("fl");
        if(group.italic) elem.classList.add("fo");
        if(group.strikethrough) elem.classList.add("fm");
        elem.classList.add(StyleMap[group.color]);
        return elem;
    });
    
    const root = document.createElement("span");
    for(const elem of elems) {
        root.appendChild(elem);
    }
    
    return root;

};