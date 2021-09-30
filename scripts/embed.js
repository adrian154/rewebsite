onClickEmbedLink = (() => {

    const modalLayer = document.createElement("div");
    modalLayer.style = "width: 100%; height: 100%; background: rgba(0, 0, 0, 50%); position: fixed; top: 0; left: 0; display: none;";

    const modal = document.createElement("div");
    modal.style = "background: #fff; margin: auto; padding: 1.0em"

    modal.insertAdjacentHTML("afterbegin", "<p>You can use this HTML code to embed this page in any other website.</p>");
    const input = document.createElement("input");
    input.style = "width: 100%; box-sizing: border-box;";
    const url =  `<iframe src="${window.location.href}"></iframe>`;
    input.value = url;
    input.readOnly = true;
    modal.append(input);

    const copyButton = document.createElement("button");
    copyButton.textContent = "copy";
    copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(url).catch(console.error);
    });

    const closeButton = document.createElement("button");
    closeButton.textContent = "close";
    closeButton.addEventListener("click", () => {
        modalLayer.style.display = "none";
    });
    
    modal.append(copyButton);
    modal.append(closeButton);
    modalLayer.append(modal);
    document.body.append(modalLayer);
    
    window.addEventListener("keydown", (event) => {
        if(event.key === "Escape") {
            modalLayer.style.display = "none";
        }
    });

    return () => modalLayer.style.display = "flex";

})();