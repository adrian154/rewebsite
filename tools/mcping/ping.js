// IF YOU ARE READING THIS TO FIGURE OUT HOW TO PING A MINECRAFT SERVER:
// I made node-mc-api to ping Minecraft servers.
// Check it out: https://www.npmjs.com/package/node-mc-api

// templates
const infoTemplate = document.getElementById("server-info-template");
const failureTemplate = document.getElementById("ping-failure-template");

// elems
const textbox = document.getElementById("host");
const button = document.getElementById("ping-button");

const pingClicked = async () => {
    
    // remove existing
    const info = document.querySelector(".server-info");
    if(info) {
        info.remove();
    }

    // ping
    const host = document.getElementById("host").value;

    const url = new URL(window.location);
    url.searchParams.set("host", host);
    window.history.pushState({}, "", url);

    textbox.disabled = true;
    button.disabled = true;
    await ping(host);
    textbox.disabled = false;
    button.disabled = false;
    
};

const ping = async (host) => {
    
    // ping
    const url = "https://apis.bithole.dev/mc/ping-server?host=" + encodeURIComponent(host);
    const resp = await fetch(url);
    const result = await resp.json();

    if(resp.status == 200) {

        const clone = infoTemplate.content.cloneNode(true);

        // fill in element
        clone.getElementById("host-name").textContent = host;
        clone.getElementById("version").appendChild(formatMC(result.version.name));
        clone.getElementById("playercount").textContent = `${result.players.online} / ${result.players.max}`;
        clone.getElementById("protocol-version").textContent = result.version.protocol;
        clone.getElementById("raw-json").href = url;
        clone.getElementById("favicon").src = result.favicon ?? "/images/default-server-favicon.png";
        
        // do motd (this needs some logic)
        let motd;
        if(typeof result.description === "string") {
            motd = formatMC(result.description);
        } else if(result.description.text && result.description.text.match(/\S+/g)) {
            motd = formatMC(result.description.text);
        } else if(result.description.extra) {
            motd = formatRaw(result.description.extra);
        }

        if(motd) clone.getElementById("motd").appendChild(motd);

        // insert
        document.querySelector("body").insertBefore(clone, document.getElementById("anchor"));

    } else {

        const clone = failureTemplate.content.cloneNode(true);
        clone.getElementById("host").textContent = host;
        clone.getElementById("error-reason").textContent = result.error;
        document.querySelector("body").insertBefore(clone, document.getElementById("anchor"));

    }

};

const searchParamsHost = (new URL(window.location)).searchParams.get("host");
if(searchParamsHost) {
    textbox.value = searchParamsHost;
    pingClicked();
}