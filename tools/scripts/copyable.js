const createCopyable = element => {
                
    const copyable = document.createElement("span");
    copyable.classList.add("copyable");
    
    const text = document.createElement("span");
    copyable.append(text);
    
    const tooltip = document.createElement("span"); 
    tooltip.classList.add("tooltip");
    tooltip.textContent = "click to copy";
    copyable.append(tooltip);

    copyable.addEventListener("click", (event) => {
        navigator.clipboard.writeText(event.target.textContent);
        tooltip.textContent = "copied!";
        tooltip.classList.add("fade");
    });

    tooltip.addEventListener("animationend", () => {
        tooltip.classList.remove("fade");
        tooltip.textContent = "click to copy";
    });
    element.append(copyable);
    return text;

};