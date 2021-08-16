const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const hiddenCtx = document.getElementById("hidden-canvas").getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// constants
const BACKDROP_COLOR = "#333333";
const WIDTH = 256, HEIGHT = 256;
const GROW_TIME = 30;

[hiddenCtx.canvas.width, hiddenCtx.canvas.height] = [WIDTH, HEIGHT];

const Tile = Object.freeze({
    DIRT: 0,
    GRASS: 1,
    ROCKS: 2,
    WATER: 3
});

const TileColors = Object.freeze({
    [Tile.DIRT]: "#8f694c",
    [Tile.GRASS]: "#10ad3d",
    [Tile.ROCKS]: "#bababa",
    [Tile.WATER]: "#00c3ff",
    [Tile.SNOW]: "#fafafa"
});

const generateWorld = () => {
    
    const world = {time: 0};
    const tiles = Array.from({length: WIDTH}, () => new Array(HEIGHT).fill(Tile.DIRT));

    for(let x = 0; x < WIDTH; x++) {
        for(let y = 0; y < HEIGHT; y++) {
            const random = Math.random() * 100;
            let tile;
            if(random < 1) {
                tile = Tile.ROCKS;
            } else if(random < 44) {
                tile = Tile.WATER;
            } else {
                tile = Tile.GRASS;
            }
            tiles[x][y] = {id: tile};
        }
    }

    world.tiles = tiles;
    return world;
    
};

const redrawWorld = () => {  
    for(let x = 0; x < WIDTH; x++) {
        for(let y = 0; y < HEIGHT; y++) {
            hiddenCtx.fillStyle = TileColors[world.tiles[x][y].id];
            hiddenCtx.fillRect(x, y, 1, 1);
        }
    }
};

// ui state
let mouseDown = false;

const camera = {
    x: 0,
    y: 0,
    zoom: 0,
    scale: 1
};

// simulation state
const world = generateWorld();
redrawWorld();

const setTile = (x, y, id) => {
    world.tiles[x][y].id = id;
    if(world.time > world.GROW_TIME) {
        hiddenCtx.fillStyle = TileColors[id];
        hiddenCtx.fillRect(x, y, 1, 1);
    }
};

// loop funcs
const step = () => {

    for(let x = 0; x < WIDTH; x++) {
        for(let y = 0; y < HEIGHT; y++) {

            const tile = world.tiles[x][y];
            
            let grass = 0, water = 0, rocks = 0;
            for(let dx = -1; dx <= 1; dx++) {
                for(let dy = -1; dy <= 1; dy++) {
                    if(dx == 0 && dy == 0) continue;
                    const neighbor = world.tiles[x + dx]?.[y + dy]?.id;
                    if(neighbor == Tile.GRASS) grass++;
                    if(neighbor == Tile.WATER) water++;
                    if(neighbor == Tile.ROCKS) rocks++;
                }
            }    

            if(tile.id === Tile.DIRT && Math.random() < 0.001 * grass) {
                tile.next = Tile.GRASS;
            }

            // growth stage
            if(world.time < GROW_TIME) {
                if(water >= 5 || (tile.id == Tile.WATER && water >= 4)) {
                    tile.next = Tile.WATER;
                } else {
                    tile.next = Tile.GRASS;
                }
            }

        }
    }

    for(let x = 0; x < WIDTH; x++) {
        for(let y = 0; y < HEIGHT; y++) {
            if(world.tiles[x][y].next) {
                setTile(x, y, world.tiles[x][y].next);
                delete world.tiles[x][y].next;
            }
        }
    }

    if(world.time == GROW_TIME) {
        redrawWorld();
    }

    world.time++;

};

const draw = () => {

    // draw background
    ctx.resetTransform();
    ctx.fillStyle = BACKDROP_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // set up transform
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // draw ui
    if(world.time < GROW_TIME) {
        ctx.fillStyle = "#ff0000";
        ctx.font = "72px sans-serif";
        ctx.fillText("generating world", 0, 0);
    }

    // worldtransform
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(camera.x, camera.y);

    // draw layers
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(hiddenCtx.canvas, 0, 0);

};

let frame = 0;

const run = () => {
    if(frame % 10 == 0) {
        step();
    }
    draw();
    frame++;
    requestAnimationFrame(run);
};

// set up event handlers
window.addEventListener("wheel", event => {
    camera.zoom += event.deltaY * 0.01;
    camera.scale = Math.pow(0.9, camera.zoom);
});

window.addEventListener("mousedown", () => mouseDown = true);
window.addEventListener("mouseup", () => mouseDown = false);

window.addEventListener("mousemove", event => {
    if(mouseDown) {
        camera.x += event.movementX / camera.scale;
        camera.y += event.movementY / camera.scale;
    }
});

// start simulation
run();