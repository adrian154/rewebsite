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
    vertScroll = 600,
    tickSize = 4; 

const draw = () => {

    // draw background
    ctx.resetTransform();
    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.translate(0, -vertScroll);

    // draw horizontal lines
    ctx.strokeStyle = "rgba(0, 0, 0, 25%)";
    for(let key = 0; key < 84; key++) {
        ctx.beginPath();
        ctx.moveTo(0, key * ROW_HEIGHT);
        ctx.lineTo(canvas.width, key * ROW_HEIGHT);
        ctx.stroke();
    }

    const startTick = Math.floor(horizScroll / tickSize),
          endTick = startTick + canvas.width / tickSize;

    const noteLen = 48 / song.timeSig.lower;

    // draw barlines
    for(let tick = startTick; tick < endTick; tick++) {
        if(tick % noteLen == 0) {
            ctx.strokeStyle = (tick / noteLen) % song.timeSig.upper == 0 ? "rgba(0, 0, 0, 50%)" : "rgba(0, 0, 0, 10%)";
            ctx.beginPath();
            ctx.moveTo(tick * tickSize - horizScroll, 0);
            ctx.lineTo(tick * tickSize - horizScroll, 84 * ROW_HEIGHT);
            ctx.stroke();
        }
    }

    // draw octave lines
    for(let i = 0; i < 84; i += 12) {
        ctx.strokeStyle = "rgba(0, 0, 0, 30%)";
        ctx.beginPath();
        ctx.moveTo(0, i * ROW_HEIGHT);
        ctx.lineTo(canvas.width, i * ROW_HEIGHT);
        ctx.stroke();
    }

    // draw notes
    // FIXME: notes longer than 256 ticks have a tendency to disappear off the left
    for(let tick = startTick - 256; tick < endTick; tick++) {
        const notes = song.notes.get(tick);
        if(notes) {
            for(const note of notes) {
                if(tick + note.length > startTick) {
                    ctx.fillStyle = note.instrument.color;
                    ctx.fillRect(tick * tickSize - horizScroll + 1, (83 - note.note + 24) * ROW_HEIGHT + 1, note.length * tickSize - 2, ROW_HEIGHT - 2);
                }
            }
        }
    }

    // draw bar number
    ctx.fillStyle = "rgb(255, 255, 255, 20%)";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "left";
    for(let tick = startTick; tick < endTick; tick++) {
        if(tick % (noteLen * song.timeSig.upper) == 0) {
            ctx.fillText(tick / noteLen / song.timeSig.upper, tick * tickSize - horizScroll + 4, vertScroll + 22);
        }
    }

    // draw keyboard
    ctx.font = "14px sans-serif";
    ctx.textAlign = "right";
    ctx.strokeStyle = "#000000";
    for(let key = 0; key < 84; key++) {

        const octave = Math.floor(key / 12) + 1;
        const NOTE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][key % 12];
        
        const y = (83 - key) * ROW_HEIGHT;

        // draw key
        if(NOTE.includes("#"))
            ctx.fillStyle = "#000000";
        else
            ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, y, PIANO_WIDTH, ROW_HEIGHT);
        
        // draw line dividing keys 
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(PIANO_WIDTH, y + 0.5);
        ctx.stroke();

        // draw note name
        if(NOTE.includes("#"))
            ctx.fillStyle = "#ffffff";
        else
            ctx.fillStyle = "#000000";
        ctx.fillText(NOTE + octave, PIANO_WIDTH - 4, y + ROW_HEIGHT * 0.65);

    }

};

let noteLength = 12;

canvas.addEventListener("wheel", event => {
    vertScroll = Math.max(0, Math.min(84 * ROW_HEIGHT - canvas.height, vertScroll + event.deltaY));
    horizScroll = Math.max(0, horizScroll + event.deltaX);
    draw();
});

// 

resizeCanvas();
window.addEventListener("resize", resizeCanvas);