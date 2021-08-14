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

    let spans = 0;

    text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // no xss for you ;)
    text = text.replace(/\n/g, "<br>");
    text = text.replace(/§(.)/g, (match, group) => {
        spans++;
        return `<span class="f${group}">`;
    });
    
    text += "</span>".repeat(spans);
    
    const template = document.createElement("template");
    template.innerHTML = text;
    return template.content;

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