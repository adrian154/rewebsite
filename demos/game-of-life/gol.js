// constants 
const CELL_SIZE = 1;
const WIDTH = 256;
const HEIGHT = 256;
const ALIVE_COLOR = "#ffffff";
const DEAD_COLOR = "#000000";

// set up canvas
const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d");
canvas.width = WIDTH * CELL_SIZE;
canvas.height = HEIGHT * CELL_SIZE;

// helpers
const makeBoard = () => Array.from({length: WIDTH}, () => new Array(HEIGHT).fill(0));

// game state
const game = {
	rules: {
		born: [3],
		survive: [2,3]
	},
	initial: {
		density: 0.5
	},
	frame: 0,
	speed: 1,
	wrap: true,
	curBoard: makeBoard(),
	nextBoard: makeBoard(),
	bitmap: ctx.createImageData(WIDTH, HEIGHT),
	running: false
};

// make canvas imagedata opaque
for(let i = 3; i < game.bitmap.data.length; i += 4) {
	game.bitmap.data[i] = 255;
}

const loadSettingsFromURL = () => {
	
	const params = new URL(window.location.href).searchParams;
	if(params.has("s")) game.speed = Number(params.get("s"));
	if(params.has("w")) game.wrap = Number(params.get("w"));

	if(params.has("d")) {
		game.initial = {density: Number(params.get("d"))};
		densitySlider.value = game.initial.density * 100;
	} else if(params.has("p")) {
		game.initial = {pattern: params.get("p")};
		patternTextbox.value = game.initial.pattern;
	}
	
	const parsedRule = params.get("r")?.match(/b(\d+)s(\d+)/);
	if(parsedRule) {
		game.rules.born = parsedRule[1].split("").map(Number);
		game.rules.survive = parsedRule[2].split("").map(Number);
	}

	// update UI
	shouldWrap.checked = game.wrap;
	speed.value = 60 / game.speed;
	birthRules.value = game.rules.born.join("");
	surviveRules.value = game.rules.survive.join("");

};

const loadPattern = (pattern) => {
	
	// clear
	for(let x = 0; x < WIDTH; x++) {
		for(let y = 0; y < HEIGHT; y++) {
			game.nextBoard[x][y] = 0;
		}
	}

	const lines = game.initial.pattern.split("\n");
	
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
			game.nextBoard[y + yMargin][x + xMargin] = (lines[y][x] && lines[y][x] != '.') ? 1 : 0;
		}
	}
	
}

const reset = () => {
	if(game.initial.density) {
		for(let x = 0; x < WIDTH; x++) {
			for(let y = 0; y < HEIGHT; y++) {
				game.nextBoard[x][y] = Math.random() < game.initial.density ? 1 : 0;
			}
		}
	} else {
		loadPattern(pattern);
	}
	step(true);
};

const step = (redraw) => {

	for(let x = 0; x < WIDTH; x++) {
		for(let y = 0; y < HEIGHT; y++) {

			const cur = game.curBoard[x][y];
			if(!redraw) {

				// count up neighbors
				let neighbors = 0;
				for(let dx = -1; dx <= 1; dx++) {
					for(let dy = -1; dy <= 1; dy++) {
						if(dx == 0 && dy == 0) continue;
						if(!game.wrap && (x + dx >= WIDTH || x + dx < 0 || y + dy >= HEIGHT || y + dy < 0)) continue;
						neighbors += game.curBoard[(x + dx + WIDTH) % WIDTH][(y + dy + HEIGHT) % HEIGHT];
					}	
				}

				game.nextBoard[x][y] = game.rules.born.includes(neighbors) ? 1 : (game.rules.survive.includes(neighbors) ? cur : 0);
			
			}

			// if something actually changed, redraw
			const next = game.nextBoard[x][y];
            if(cur != next || redraw) {
				const idx = (y * WIDTH + x) * 4;
				const color = next ? 255 : 0;
				game.bitmap.data[idx] = color;
				game.bitmap.data[idx + 1] = color;
				game.bitmap.data[idx + 2] = color;
			}
			
		}
	}

	// switch buffers
	[game.curBoard, game.nextBoard] = [game.nextBoard, game.curBoard];
	ctx.putImageData(game.bitmap, 0, 0);

};

const run = () => {
	if(game.running && game.frame % game.speed == 0) {
		step();
	}
	game.frame++;
	requestAnimationFrame(run);
};
