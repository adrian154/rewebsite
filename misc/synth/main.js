const INPUT_ID = "input-0";

const elements = {
    problem: document.getElementById("problem"),
    waveforms: document.getElementById("waveforms")
};

const audioCtx = new AudioContext();
const notes = new Array(128);

const ATTACK = 0,
      DELAY = 0.1;

const playNote = note => {
    
    console.log("play", note);

    const envelope = audioCtx.createGain();
    envelope.gain.setValueAtTime(0, audioCtx.currentTime);
    envelope.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + ATTACK);
    envelope.connect(audioCtx.destination);
    notes[note] = envelope;

    const waveform = waveforms.querySelector(":checked").id;
    const osc = new OscillatorNode(audioCtx, {type: waveform, frequency: 440 * Math.pow(2, (note - 69) / 12)});
    osc.connect(envelope);
    osc.start();

};

const stopNote = note => {

    console.log("stop", note);
    
    const envelope = notes[note];
    envelope.gain.cancelAndHoldAtTime(audioCtx.currentTime);
    envelope.gain.setValueAtTime(envelope.gain.value, audioCtx.currentTime);
    envelope.gain.linearRampToValueAtTime(0, audioCtx.currentTime + DELAY);
    
    setTimeout(() => {
        envelope.disconnect();
    }, DELAY * 1000);

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