// --- constants
const MODE = {
    BUILDING: "Building",
    TESTING: "Testing",
    VIEWING: "Viewing"
};

const MODES = [MODE.BUILDING, MODE.TESTING, MODE.VIEWING];

// --- state
const simulation = {
    modeIndex: 0,
    mode: MODES[0],
    nodes: new Set(),
    selectedNode: null,
    nextID: 0
};