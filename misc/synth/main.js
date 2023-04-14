const INPUT_ID = "input-0";

const elements = {
    problem: document.getElementById("problem"),
    waveforms: document.getElementById("waveforms")
};

const audioCtx = new AudioContext();
const notes = new Array(128);

const gainNode = audioCtx.createGain();
gainNode.gain.value = 1;
gainNode.connect(audioCtx.destination);
let numNotes = 0;

const playNote = note => {
    
    numNotes++;
    gainNode.gain.value = 1 / numNotes;

    const waveform = waveforms.querySelector(":checked").id;
    const osc = new OscillatorNode(audioCtx, {type: waveform, frequency: 440 * Math.pow(2, (note - 69) / 12)});
    osc.connect(gainNode);
    osc.start();
    notes[note] = osc;

};

const stopNote = note => {
    
    numNotes--;
    gainNode.gain.value = 1 / Math.max(numNotes, 1);

    notes[note].disconnect();
    notes[note] = null;

};

(async () => {

    const midi = await navigator?.requestMIDIAccess();
    if(!midi) {
        throw new Error("Failed to get MIDI access");
    }
    
    const input = midi.inputs.get(INPUT_ID);
    if(!input) {
        throw new Error("MIDI input not detected");
    }

    document.getElementById("input-name").textContent = input.name;
    input.addEventListener("midimessage", event => {

        const message = event.data;
        if(message[0] == 0x90) {
            if(message[2] > 0) {
                playNote(message[1]);
            } else {
                stopNote(message[1]);
            }
        } else if(message[0] == 0x80) {
            stopNote(message[1]);
        }
        
    });

})().catch(err => {
    console.error(err);
    elements.problem.textContent = err;
});