// elements
const toggleButton = document.getElementById("toggle");
const modalLayer = document.getElementById("modals");

// init dialog
const initDialog = document.getElementById("init-dialog"),
      patternButton = document.getElementById("init-pattern"),
      randomButton = document.getElementById("init-random"),
      densityControl = document.getElementById("density-control"),
      densitySlider = document.getElementById("init-density"),
      patternControl = document.getElementById("pattern-control"),
	  patternPreset = document.getElementById("pattern-preset"),
      patternTextbox = document.getElementById("pattern");

// rules dialog
const rulesDialog = document.getElementById("rules-dialog"),
      birthRules = document.getElementById("birth-rules"),
      surviveRules = document.getElementById("survive-rules");

// shares dialog
const shareDialog = document.getElementById("share-dialog"),
      shareLink = document.getElementById("share-link");

const settingsDialog = document.getElementById("settings-dialog");
      
let currentDialog;

const toggle = () => changeRunState(!game.running);

const changeRunState = state => {
	if(game.running = state) {
		toggleButton.style.background = "#f24949";
		toggleButton.textContent = "pause";
	} else {
		toggleButton.style.background = "#5dcf5d";
		toggleButton.textContent = "go";
	}
};

const showDialog = dialog => {
    modalLayer.style.display = "";
    dialog.style.display = "";
    currentDialog = dialog;
};

const closeDialog = () => {
    if(currentDialog) {
        currentDialog.style.display = "none";
        modalLayer.style.display = "none";
        currentDialog = null;
    }  
};

document.getElementById("submit-rules-dialog").addEventListener("click", () => {
	born = birthRules.value.split("").map(Number);
	survive = surviveRules.value.split("").map(Number);
	closeDialog();
	updateURL();
});

// update patterns dropdown
for(const patternName in PATTERNS) {
	const option = document.createElement("option");
	option.textContent = patternName;
	patternPreset.append(option);
}

document.getElementById("load-preset-button").addEventListener("click", () => {
	patternTextbox.value = PATTERNS[patternPreset.value];
});

document.getElementById("submit-init-dialog").addEventListener("click", () => {
	if(!patternButton.checked && !randomButton.checked) return alert("You haven't selected an initial condition.");
    if(patternButton.checked) {
        game.initial = {pattern: patternTextbox.value};
    } else {
        game.initial = {density: densitySlider.value / 100};
    }
	closeDialog();
	updateURL();
    changeRunState(false);
    reset();
});

document.getElementById("copy-button").addEventListener("click", async () => {
	try {
		await navigator.clipboard.writeText(shareLink.value);
	} catch(err) {
		alert("Failed to copy to clipboard automatically");
	}
	closeDialog();
});

document.getElementById("should-wrap").addEventListener("click", event => game.wrap = event.target.checked);
document.getElementById("speed").addEventListener("input", event => game.speed = Math.floor(60 / event.target.value));

const resetAll = () => location.href = window.location.pathname;

// little bit of ui logic
const onInitTypeChange = () => {
	if(patternButton.checked) {
		densityControl.style.display = "none";
		patternControl.style.display = "block";
	} else if(randomButton.checked) {
		densityControl.style.display = "block";
		patternControl.style.display = "none";
	}
};

patternButton.addEventListener("input", onInitTypeChange);
randomButton.addEventListener("input", onInitTypeChange);

// close controls
document.querySelectorAll(".close-button").forEach(button => button.addEventListener("click", closeDialog));
window.addEventListener("keydown", (event) => {
    if(event.key === "Escape") closeDialog();
});

const updateURL = () => {
	
	const url = new URL(window.location);
	url.searchParams.set("r", `b${game.rules.born.join("")}s${game.rules.survive.join("")}`);

	if(game.initial.density) {
		url.searchParams.set("d", game.initial.density);
		url.searchParams.delete("p");
	} else {
		url.searchParams.set("p", game.initial.pattern);
		url.searchParams.delete("d");
	}
	
	window.history.replaceState(null, null, url.href);
	shareLink.value = url.href;

};

// start simulation
loadSettingsFromURL();
updateURL();
reset();
changeRunState(true);
run();