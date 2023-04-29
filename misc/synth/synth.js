// 1 tick = 1/48 of a beat. `notes` maps ticks to a list of notes that *start* on that tick.
let song = {
    notes: new Map(),
    timeSig: {upper: 5, lower: 4}
};

let instruments = [
    {name: "beep", type: "square", attack: 0.015, delay: 0.05, color: "#4e61d8"}
];
