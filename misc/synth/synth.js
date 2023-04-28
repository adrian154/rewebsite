// 1 tick = 1/32 of a beat. `notes` maps ticks to a list of notes that *start* on that tick.
let song = {
    notes: new Map(),
    rhythm: 4
};

let instruments = [
    {name: "beep", type: "square", attack: 0.015, delay: 0.05, color: "#4e61d8"}
];

song.notes.set(100, [{note: 60, length: 32, instrument: instruments[0]}]);