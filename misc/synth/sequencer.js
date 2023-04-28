const ROW_HEIGHT = 24 * devicePixelRatio,
      PIANO_WIDTH = 90;

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
    tickSize = 2; 

const draw = () => {

    // draw background
    ctx.fillStyle = "#222222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.translate(0, -vertScroll);

    // draw keyboard
    ctx.font = "14px Arial";
    ctx.textAlign = "right";
    ctx.strokeStyle = "#000000";
    for(let key = 0; key <= 84; key++) {
        const octave = Math.floor(key / 12) + 1;
        const NOTE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][key % 12];
        if(NOTE.includes("#"))
            ctx.fillStyle = "#000000";
        else
            ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, key * ROW_HEIGHT, PIANO_WIDTH, ROW_HEIGHT);
        ctx.strokeRect(0, key * ROW_HEIGHT, PIANO_WIDTH, ROW_HEIGHT);
        if(NOTE.includes("#"))
            ctx.fillStyle = "#ffffff";
        else
            ctx.fillStyle = "#000000";
        ctx.fillText(NOTE + octave, PIANO_WIDTH - 4, key * ROW_HEIGHT + ROW_HEIGHT * 0.65);
    }

    // draw notes
    for(let tick = Math.floor(horizScroll); tick < horizScroll + (canvas.width - PIANO_WIDTH) / tickSize; tick++) {
        const notes = song.notes.get(tick);
        if(notes) {
            for(const note of notes) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(tick * tickSize - horizScroll + PIANO_WIDTH, (note.note - 24) * ROW_HEIGHT, note.length * tickSize, ROW_HEIGHT);
            }
        }
    }

};

resizeCanvas();
window.addEventListener("resize", resizeCanvas);