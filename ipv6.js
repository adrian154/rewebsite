// Feel free to embed this script in your sites.
// <script src="https://bithole.dev/ipv6.js"></script>
(() => {
    const text = document.createElement("span");
    text.style.position = "fixed";
    text.style.right = "0.5em";
    text.style.top = "0.5em";
    text.style.zIndex = "100";
    text.style.font = "16px Arial";
    document.body.append(text);
    fetch("https://apis.bithole.dev/ip").then(resp => resp.text()).then(ip => {
        if(ip.includes(":")) {
            text.style.color = "#888888";
            text.textContent = "IPv6 supported :)";
        } else {
            text.style.color = "#ea0000";
            text.textContent = "IPv6 not supported :(";
        }
    });
})();