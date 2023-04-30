// 1 tick = 1/48 of a beat. `notes` maps ticks to a list of notes that *start* on that tick.
const createSong = () => {

    const song = {
        notes: new Map(),
        timeSig: {upper: 4, lower: 4},
        tempo: 100
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

    song.play = startTick => {

        const gain = audioCtx.createGain();
        gain.gain.value = 0.1;
        gain.connect(audioCtx.destination);

        // calculate tempo
        const beatLength = 60 / song.tempo; 

        // for smooth playback, schedule notes to be played ahead-of-time
        const playNotes = startTick => {
            console.log("play");
            for(let tick = startTick; tick < startTick + 48; tick++) {
                const notes = song.notes.get(tick);
                if(notes) {
                    for(const note of notes) {
                        const startTime = audioCtx.currentTime + beatLength + (tick - startTick) / 48 * beatLength;
                        const play = note.instrument.noteOn(note.note, startTime, gain);
                        note.instrument.noteOff(play, startTime + note.length / 48 * beatLength);
                    } 
                }
            }
        };

        let tick = 0;
        setInterval(() => {
            playNotes(tick);
            tick += 48;
        }, beatLength * 1000);

    };

    return song;

};

let song = createSong();