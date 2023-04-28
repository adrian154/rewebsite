const ROW_HEIGHT = 24 * devicePixelRatio;

const canvas = document.getElementById("sequencer"),
      ctx = canvas.getContext("2d", {alpha: false});

const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    draw();
};

// horizScroll = # ticks
// vertScroll = pixels
// tickScale = pixels/tick
let horizScroll = 0,
    vertScroll = 0,
    tickSize = 8; 

const draw = () => {

    // draw background
    ctx.fillStyle = "#222222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw keyboard
    ctx.font = "14px Arial";
    ctx.textAlign = "right";
    for(let key = 0; key < 84; key++) {
        const octave = Math.floor(key / 12) + 1;
        const NOTE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][key % 12];
        if(NOTE.includes("#"))
            ctx.fillStyle = "#000000";
        else
            ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, key * ROW_HEIGHT, 90, ROW_HEIGHT);
        if(NOTE.includes("#"))
            ctx.fillStyle = "#ffffff";
        else
            ctx.fillStyle = "#000000";
        ctx.fillText(NOTE + octave, 86, key * ROW_HEIGHT + ROW_HEIGHT * 0.65);
    }

    // draw notes
    for(let tick = Math.floor(horizScroll); tick < horizScroll + canvas.width / tickSize; tick++) {
        const notes = song.notes.get(tick);
        // ... draw ...
    }

};

resizeCanvas();
window.addEventListener("resize", resizeCanvas);