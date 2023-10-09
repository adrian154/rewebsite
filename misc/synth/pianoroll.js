const ROW_HEIGHT = 24 * devicePixelRatio,
      PIANO_WIDTH = 90;

const canvas = document.getElementById("pianoroll"),
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
    tickSize = 4,
    zoomLevel = 0; 

let noteLength = 12,
    noteSnap = 3,
    hoverStartTick = null,
    hoverRow = null,
    highlightedNote = null
    highlightedNoteStartTick = null,
    editingNote = null,
    editingNoteStartTick = null,
    anchorTick = null,
    floatingTick = null;

let selectedInstrument = beep;

// convert MIDI note to row number
const noteToRow = note => 83 - note + 24;

// convert MIDI note to note name, starting from A0
const noteToName = note => {
    return ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"][(note - 21) % 12] + Math.floor((note - 12) / 12);
};

const previewGain = audioCtx.createGain();
previewGain.gain.value = 0.1;
previewGain.connect(audioCtx.destination);

const draw = () => {

    // draw background
    ctx.resetTransform();
    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.translate(0, -vertScroll);

    // draw black key lines
    ctx.fillStyle = "rgba(0, 0, 0, 10%)";
    for(let key = 0; key < 84; key++) {
        if([false, true, false, true, false, false, true, false, true, false, true, false][key % 12]) {
            ctx.fillRect(0, (83 - key) * ROW_HEIGHT, canvas.width, ROW_HEIGHT);
        }
    }

    const startTick = Math.floor(horizScroll / tickSize),
          endTick = startTick + canvas.width / tickSize;

    const noteLen = 48 / song.timeSig.lower;

    // draw barlines
    for(let tick = startTick; tick < endTick; tick++) {
        if(tick % noteLen == 0) {
            ctx.strokeStyle = (tick / noteLen) % song.timeSig.upper == 0 ? "rgba(0, 0, 0, 65%)" : "rgba(0, 0, 0, 10%)";
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
    ctx.textAlign = "left";
    for(let tick = startTick - 256; tick < endTick; tick++) {
        const notes = song.notes.get(tick);
        if(notes) {
            for(const note of notes) {
                if(tick + note.length > startTick) {
                    
                    const x = tick * tickSize - horizScroll + 1,
                          y = noteToRow(note.note) * ROW_HEIGHT + 1;
                    
                    // draw note body
                    ctx.fillStyle = note.instrument.color;
                    ctx.fillRect(x, y, note.length * tickSize - 2, ROW_HEIGHT - 2);
                    
                    // write note name if there's enough space
                    const name = noteToName(note.note);
                    if(ctx.measureText(name).width + 6 < note.length * tickSize) {
                        ctx.fillStyle = "rgba(0, 0, 0, 40%)";
                        ctx.fillText(name, x + 3, y + 16);
                    }

                }
            }
        }
    }

    // draw outlines for currently editing note / hovered note
    if(editingNote) {
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(editingNoteStartTick * tickSize - horizScroll, noteToRow(editingNote.note) * ROW_HEIGHT, editingNote.length * tickSize, ROW_HEIGHT);
    } else if(highlightedNote) {
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(highlightedNoteStartTick * tickSize - horizScroll, noteToRow(highlightedNote.note) * ROW_HEIGHT, highlightedNote.length * tickSize, ROW_HEIGHT);
    } else if(hoverStartTick) {
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(hoverStartTick * tickSize - horizScroll, hoverRow * ROW_HEIGHT, noteLength * tickSize, ROW_HEIGHT);
    }

    // draw bar number
    ctx.fillStyle = "rgb(255, 255, 255, 20%)";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "left";
    for(let tick = startTick; tick < endTick; tick++) {
        if(tick % (noteLen * song.timeSig.upper) == 0) {
            ctx.fillText(tick / noteLen / song.timeSig.upper, tick * tickSize - horizScroll + 4, vertScroll + 18);
        }
    }

    // draw keyboard
    ctx.font = "14px sans-serif";
    ctx.textAlign = "right";
    ctx.strokeStyle = "#000000";
    for(let row = 0; row < 84; row++) {

        const note = noteToName(noteToRow(row));
        const y = row * ROW_HEIGHT;

        // draw key
        if(note.includes("#"))
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
        if(note.includes("#"))
            ctx.fillStyle = "#ffffff";
        else
            ctx.fillStyle = "#000000";
        ctx.fillText(note, PIANO_WIDTH - 4, y + ROW_HEIGHT * 0.65);

    }

};

canvas.addEventListener("wheel", event => {
    vertScroll = Math.max(0, Math.min(84 * ROW_HEIGHT - canvas.height, vertScroll + event.deltaY));
    horizScroll = Math.max(0, horizScroll + event.deltaX);
    draw();
});

canvas.addEventListener("keydown", event => {
    if(event.key === "ArrowLeft") {
        horizScroll = Math.max(0, horizScroll - 100);
        draw();
    } else if(event.key === "ArrowRight") {
        horizScroll += 100;
        draw();
    } else if(event.key === "Control") {
        ctrlHeld = true;
    } else if(event.key === "PageUp" || event.key === "PageDown") {

        // we want the zoom to be centered on the middle of the screen
        // in order to achieve this, the horizontal scroll must be adjusted
        // TODO: center on cursor
        const originalTickSize = tickSize,
              originalScroll = horizScroll;
        zoomLevel += event.key === "PageUp" ? 1 : -1;
        tickSize = 4 * Math.pow(1.5, zoomLevel);
        horizScroll = (canvas.width / 2 + originalScroll) * tickSize / originalTickSize - canvas.width / 2;
        draw();

    }
}); 

canvas.addEventListener("keyup", event => {
    if(event.key === "Control") {
        ctrlHeld = false;
    }
});

// keep track of where the mousedown event occurred
// we use this to ignore small accidental movements, or else clicks may be interpreted as drags
let mouseDownX = null, mouseDownY = null;

canvas.addEventListener("contextmenu", event => event.preventDefault());

canvas.addEventListener("mousemove", event => {

    const x = event.offsetX * devicePixelRatio,
          y = event.offsetY * devicePixelRatio;

    const tick = Math.floor((x + horizScroll) / tickSize);
    const snappedTick = Math.floor(tick / noteSnap) * noteSnap;

    if(editingNote) {

        if(Math.abs(x - mouseDownX) < 2 && Math.abs(y - mouseDownY) < 2) {
            return;
        }

        // update note duration
        floatingTick = snappedTick;
        if(floatingTick >= anchorTick) {
            editingNote.length = floatingTick - anchorTick + noteSnap;
            if(editingNoteStartTick < anchorTick) {
                song.removeNote(editingNote, editingNoteStartTick);
                song.addNote(editingNote, anchorTick);
                editingNoteStartTick = anchorTick;
            }
        } else {
            song.removeNote(editingNote, editingNoteStartTick);
            editingNote.length = anchorTick - floatingTick;
            song.addNote(editingNote, floatingTick);
            editingNoteStartTick = floatingTick;
        }

    } else {

        hoverRow = Math.floor((y + vertScroll) / ROW_HEIGHT);

        // check if we're hovering over a note
        // FIXME: might not be able to hover on really long note
        highlightedNote = null;
        for(let t = tick - 256; t <= tick; t++) {
            const notes = song.notes.get(t);
            if(notes) {
                for(const note of notes) {
                    if(noteToRow(note.note) == hoverRow && t + note.length > tick) {
                        highlightedNote = note;
                        highlightedNoteStartTick = t;
                        break;
                    }
                }
            }
        }

        if(!highlightedNote) {
            hoverStartTick = snappedTick;
        }

    }

    draw();

});

let keyboardNote = null;

canvas.addEventListener("mousedown", event => {

    const x = event.offsetX * devicePixelRatio,
          y = event.offsetY * devicePixelRatio;


    // handle right click to delete notes
    if(event.button == 2) {
        if(highlightedNote) {
            song.removeNote(highlightedNote, highlightedNoteStartTick);
        }
    } else if(x < PIANO_WIDTH) {
        const note = Math.floor((y + vertScroll) / ROW_HEIGHT);
        keyboardNote = beep.noteOn(noteToRow(note), null, previewGain);
    } else {
        mouseDownX = x;
        mouseDownY = y;
        if(highlightedNote) {

            editingNote = highlightedNote;
            editingNoteStartTick = highlightedNoteStartTick;

            // if the click was on the first half of the note, use the end of the note as the anchor
            // otherwise, use the start of the note as the anchor
            if((x + horizScroll - highlightedNoteStartTick * tickSize) < highlightedNote.length * tickSize / 2) {
                anchorTick = highlightedNoteStartTick + highlightedNote.length;
            } else {
                anchorTick = highlightedNoteStartTick;
            }
            
        } else {
            editingNote = {note: noteToRow(hoverRow), length: noteLength, instrument: beep};
            anchorTick = hoverStartTick;
            editingNoteStartTick = hoverStartTick;
            song.addNote(editingNote, hoverStartTick);
            beep.noteOff(beep.noteOn(editingNote.note, null, previewGain), audioCtx.currentTime + 0.1);
        }
    }
    draw();
});

canvas.addEventListener("mouseup", event => {
    if(editingNote) {
        noteLength = editingNote.length;
        editingNote = null;
    }
    if(keyboardNote) {
        beep.noteOff(keyboardNote);
        keyboardNote = null;
    }
});

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// set up midi play
(async () => {

    const notes = new Array(128);

    const midi = await navigator?.requestMIDIAccess();
    if(!midi) {
        throw new Error("Failed to get MIDI access");
    }
    
    const input = midi.inputs.get("input-0");
    if(!input) {
        throw new Error("MIDI input not detected");
    }

    //document.getElementById("input-name").textContent = input.name;
    input.addEventListener("midimessage", event => {

        const message = event.data;
        if(message[0] == 0x90) {
            if(message[2] > 0) {
                notes[message[1]] = beep.noteOn(message[1], null, previewGain);
            } else {
                beep.noteOff(notes[message[1]]);
            }
        } else if(message[0] == 0x80) {
            beep.noteOff(notes[message[1]]);
        }
        
    });

})().catch(console.error);