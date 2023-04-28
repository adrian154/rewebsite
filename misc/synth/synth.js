// 1 tick = 1/32 of a beat. `notes` maps ticks to a list of notes that *start* on that tick.
let song = {
    notes: new Map(),
    rhythm: 4
};

let instruments = [
    {name: "beep", type: "square", attack: 0.015, delay: 0.05, color: "#4e61d8"}
];

for(let i = 0; i < 100; i++) {
    song.notes.set(i * 50 + 100, [
        {note: 60 + i, length: 32, instrument: instruments[0]},
        {note: 50 + i, length: 64, instrument: instruments[0]},
        {note: 40 + i, length: 8, instrument: instruments[0]}
    ]);
}