// constants 
const CELL_SIZE = 2;
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
	curBoard: makeBoard(),
	nextBoard: makeBoard(),
	running: false
};

const loadSettingsFromURL = () => {
	
	const params = new URL(window.location.href).searchParams;
	if(params.has("d")) {
		game.initial = {density: Number(params.get("d"))};
	} else if(params.has("p")) {
		game.initial = {pattern: params.get("p")};
	}
	
	const parsedRule = params.get("r")?.match(/b(\d+)s(\d+)/);
	if(parsedRule) {
		game.rules.born = parsedRule[1].split("").map(Number);
		game.rules.survive = parsedRule[2].split("").map(Number);
	}

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
						neighbors += game.curBoard[(x + dx + WIDTH) % WIDTH][(y + dy + HEIGHT) % HEIGHT];
					}	
				}

				game.nextBoard[x][y] = game.rules.born.includes(neighbors) ? 1 : (game.rules.survive.includes(neighbors) ? cur : 0);
			
			}

			// if something actually changed, redraw
			const next = game.nextBoard[x][y];
            if(cur != next || redraw) {
				ctx.fillStyle = next ? ALIVE_COLOR : DEAD_COLOR;
				ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
			}
			
		}
	}

	// switch buffers
	[game.curBoard, game.nextBoard] = [game.nextBoard, game.curBoard];

};

const run = () => {
	if(game.running && game.frame % game.speed == 0) {
		step();
	}
	game.frame++;
	requestAnimationFrame(run);
};
