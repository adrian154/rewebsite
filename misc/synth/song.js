// 1 tick = 1/48 of a beat. `notes` maps ticks to a list of notes that *start* on that tick.
const createSong = () => {

    const song = {
        notes: new Map(),
        timeSig: {upper: 4, lower: 4}
    };

    song.addNote = (note, startTick) => {
        let notes = song.notes.get(startTick);
        if(!notes) {
            notes = [];
            song.notes.set(startTick, notes);
        }
        notes.push(note);
    };

    song.removeNote = (note, startTick) => {
        const notes = song.notes.get(startTick);
        if(!notes) {
            console.warn("Attempt to remove note where there is none");
            return;
        }
        const idx = notes.indexOf(note);
        if(idx < 0) {
            console.warn("Attempt to remove note from position it isn't in");
            return;
        }
        notes.splice(idx, 1);
    };

    return song;

};

let song = createSong();