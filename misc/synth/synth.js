// 1 tick = 1/48 of a beat. `notes` maps ticks to a list of notes that *start* on that tick.
let song = {
    notes: new Map(),
    timeSig: {upper: 5, lower: 4}
};

let instruments = [
    {name: "beep", type: "square", attack: 0.015, delay: 0.05, color: "#4e61d8"}
];

const addNote = (note, startTick) => {
    let notes = song.notes.get(startTick);
    if(!notes) {
        notes = [];
        song.notes.set(startTick, notes);
    }
    notes.push(note);
};

const removeNote = (note, startTick) => {
    const notes = song.notes.get(startTick);
    if(!notes) {
        console.warn("Attempt to remove note where there is none");
        return;
    }
    const idx = notes.find(note);
    if(idx < 0) {
        console.warn("Attempt to remove note from position it isn't in");
        return;
    }
    notes.splice(idx, 1);
};