const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d");
const patternField = document.getElementById("pattern");
const link = document.getElementById("link");

// Automata rules
let born = [3];
let survive = [2, 3];

// other settings
let aliveColor, deadColor;

// Parse URL
const url = new URL(window.location.href);
const rule = url.searchParams.get("rule")?.match(/b(\d+)s(\d+)/);

if(rule) {
	born = rule[1].split("").map(str => parseInt(str));
	survive = rule[2].split("").map(str => parseInt(str));
}

// set up initial conds based on url 
let initialType = url.searchParams.get("initialType") || "random";
let density = url.searchParams.get("density") || 0.5;
let pattern = url.searchParams.get("pattern");

// other simulation state
let running = true;

// Other constants
const CELL_SIZE = 2;
const WIDTH = 256;
const HEIGHT = 256;

canvas.width = WIDTH * CELL_SIZE;
canvas.height = HEIGHT * CELL_SIZE;
const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)

const make2DArr = (xSize, ySize) => {
	const result = new Array(xSize);
	for(let x = 0; x < xSize; x++) {
		result[x] = new Array(ySize);
	}
	return result;
};

// Double-buffer board 
const board = [make2DArr(WIDTH, HEIGHT), make2DArr(WIDTH * HEIGHT)];
let which;

const clear = () => {
	for(let x = 0; x < WIDTH; x++) {
		for(let y = 0; y < HEIGHT; y++) {
			board[which][x][y] = 0;
		}
	}
};

const init = function() {
	which = 0;
	if(initialType === "random") {
		for(let x = 0; x < WIDTH; x++) {
			for(let y = 0; y < HEIGHT; y++) {
				board[which][x][y] = Math.random() < density ? 1 : 0;
			}
		}
	} else if(initialType === "pattern") {
		loadPattern(pattern);
	} else {
		alert("Couldn't initialize: unknown initial type");
	}
};

const step = function() {

	let next = 1 - which;

	for(let x = 0; x < WIDTH; x++) {
		for(let y = 0; y < HEIGHT; y++) {
		
			let neighbors = 0;
			for(let dx = -1; dx <= 1; dx++) {
				for(let dy = -1; dy <= 1; dy++) {
					if(dx == 0 && dy == 0) continue;
					neighbors += board[which][(x + dx + WIDTH) % WIDTH][(y + dy + HEIGHT) % HEIGHT];
				}	
			}

            const nextVal = born.includes(neighbors) ? 1 : (survive.includes(neighbors) ? board[which][x][y] : 0);
			board[next][x][y] = nextVal;

            // Draw
            for(let px = 0; px < CELL_SIZE; px++) {
                for(let py = 0; py < CELL_SIZE; py++) {
                    const idx = ((x * CELL_SIZE + px) * canvas.height + (y * CELL_SIZE + py)) * 4;
                    imgData.data[idx] = nextVal ? 255 : 0;
                    imgData.data[idx + 1] = nextVal ? 255 : 0;
                    imgData.data[idx + 2] = nextVal ? 255 : 0;
                    imgData.data[idx + 3] = 255;
                }
            }
			
		}
	}

	which = next;
    ctx.putImageData(imgData, 0, 0);

};

const run = () => {
	if(running) step();
	setTimeout(run, 30);
};

const updateURL = () => {
	
	const url = new URL(window.location);
	url.searchParams.set("rule", `b${born.join("")}s${survive.join("")}`);
	url.searchParams.set("initialType", initialType);
	
	if(initialType === "random") {
		url.searchParams.set("density", density);
		url.searchParams.delete("pattern");
	} else if(initialType === "pattern") {
		url.searchParams.set("pattern", pattern);
		url.searchParams.delete("density");
	}
	
	window.history.replaceState(null, null, url.href);
	document.getElementById("share-link").value = url.href;

};

// --- control funcs

// elements
const modalLayer = document.getElementById("modals");
const initDialog = document.getElementById("init-dialog");
const patternButton = document.getElementById("init-pattern");
const randomButton = document.getElementById("init-random");
const densityControl = document.getElementById("density-control");
const patternControl = document.getElementById("pattern-control");
const densitySlider = document.getElementById("init-density");
const patternTextbox = document.getElementById("pattern");
const rulesDialog = document.getElementById("rules-dialog");
const birthRules = document.getElementById("birth-rules");
const surviveRules = document.getElementById("survive-rules");
const colorSchemeDialog = document.getElementById("colorscheme-dialog");
const shareDialog = document.getElementById("share-dialog");
const toggleButton = document.getElementById("toggle");

let currentDialog;

const toggle = () => {
	if((running = !running)) {
		toggleButton.style.background = "#f24949";
		toggleButton.textContent = "pause";
	} else {
		toggleButton.style.background = "#5dcf5d";
		toggleButton.textContent = "go";
	}
};

const setDialogVisibility = (dialog, visible) => {
	modalLayer.style.display = visible ? "block" : "none";
	dialog.style.display = visible ? "block" : "none";
	if(visible) currentDialog = dialog;
};

const showDialog = (dialog) => setDialogVisibility(dialog, true);
const hideDialog = (dialog) => setDialogVisibility(dialog, false);

const updateRules = () => {
	born = birthRules.value.split("").map(Number);
	survive = surviveRules.value.split("").map(Number);
	hideDialog(rulesDialog);
	updateURL();
};

const updateStartConds = () => {
	if(!patternButton.checked && !randomButton.checked) return alert("You haven't selected an initial condition.");
	initialType = patternButton.checked ? "pattern" : "random";
	density = densitySlider.value / 100;
	pattern = patternTextbox.value;
	init();
	hideDialog(initDialog);
	updateURL();
};

const loadPattern = (pattern) => {
	
	// clear
	clear();

	const lines = pattern.split("\n");
	
	// find longest line for width
	let width = 0;
	for(const line of lines) {
		width = Math.max(line.length, width);
	}

	const height = lines.length;
	const xMargin = Math.floor((WIDTH - width) / 2);
	const yMargin = Math.floor((HEIGHT - height) / 2);

	for(let x = 0; x < width; x++) {
		for(let y = 0; y < height; y++) {
			board[which][y + yMargin][x + xMargin] = (lines[y][x] && lines[y][x] != '.') ? 1 : 0;
		}
	}
	
}

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

document.getElementById("alive-color").addEventListener("input", (event) => {
	if(event.target.value) {
		aliveColor = event.target.value;
	}
});

document.getElementById("dead-color").addEventListener("input", (event) => {
	if(event.target.value) {
		deadColor = event.target.value;
	}
});

init();
run();
updateURL();

window.addEventListener("keydown", (event) => {
	if(event.key === "Escape" && currentDialog) hideDialog(currentDialog); 
});