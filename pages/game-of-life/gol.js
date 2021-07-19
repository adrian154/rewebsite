const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d");
const patternField = document.getElementById("pattern");
const link = document.getElementById("link");

// Default CGOL rules
let born = [3];
let survive = [2, 3];
let initDensity = 0.5;

// Parse URL
const url = new URL(window.location.href);
const rule = url.searchParams.get("rule")?.match(/b(\d+)s(\d+)/);

if(rule) {
	born = rule[1].split("").map(str => parseInt(str));
	survive = rule[2].split("").map(str => parseInt(str));
}

let initDensityParam = url.searchParams.get("density");
if(initDensityParam !== null) {
    initDensity = Number(initDensityParam);
}

// other simulation state
let running = true;

// Other constants
const CELL_SIZE = 2;
const WIDTH = 256;
const HEIGHT = 256;

canvas.width = WIDTH * CELL_SIZE;
canvas.height = HEIGHT * CELL_SIZE;
const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)

const make2DArr = function(xSize, ySize) {
	let result = new Array(xSize);
	for(let x = 0; x < xSize; x++) {
		result[x] = new Array(ySize);
	}
	return result;
}

// Double-buffer board 
const board = [make2DArr(WIDTH, HEIGHT), make2DArr(WIDTH * HEIGHT)];
let which = 0;

const clear = function() {
	for(let x = 0; x < WIDTH; x++) {
		for(let y = 0; y < HEIGHT; y++) {
			board[which][x][y] = 0;
		}
	}	
};

const init = function() {
	if(url.searchParams.get("pattern") != null) {
		clear();
		loadPattern(url.searchParams.get("pattern"));
	} else {
		for(let x = 0; x < WIDTH; x++) {
			for(let y = 0; y < HEIGHT; y++) {
				board[which][x][y] = Math.random() < initDensity ? 1 : 0;
			}
        }
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

const run = function() {
	if(running) step();
	setTimeout(() => {requestAnimationFrame(run);}, 30);
};

const putPattern = function() {
	clear();
	loadPattern(patternField.value);
	url.searchParams.set("pattern", patternField.value);
	document.getElementById("link").innerHTML = url;
};

const loadPattern = function(pattern) {
	const lines = pattern.split("\n");
	const width = lines[0].length;
	const height = lines.length;
	const xMargin = Math.floor((WIDTH - width) / 2);
	const yMargin = Math.floor((HEIGHT - height) / 2);
	for(let x = 0; x < width; x++) {
		for(let y = 0; y < height; y++) {
			board[which][x + xMargin][y + yMargin] = lines[y][x] != '.' ? 1 : 0;
		}
	}
}

init();
run();