const audioCtx = new AudioContext();

const makeInstrument = properties => {

    const instrument = properties;

    instrument.noteOn = (note, time, dest) => {
        
        time = time || audioCtx.currentTime;
        const envelope = audioCtx.createGain();
        envelope.gain.setValueAtTime(0, time);
        envelope.gain.linearRampToValueAtTime(1, time + properties.attack);
        envelope.connect(dest);

        const osc = new OscillatorNode(audioCtx, {
            type: properties.type,
            frequency: 440 * Math.pow(2, (note - 69) / 12)
        });
        osc.connect(envelope);
        osc.start();
    
        return envelope;

    };

    instrument.noteOff = (envelope, time) => {
        time = time || audioCtx.currentTime;
        envelope.gain.cancelAndHoldAtTime(time);
        envelope.gain.setValueAtTime(envelope.gain.value, time);
        envelope.gain.linearRampToValueAtTime(0, time + properties.release);
        setTimeout(() => envelope.disconnect(), (time - audioCtx.currentTime + properties.release) * 1000);
    };

    return instrument;

};

const beep = makeInstrument({type: "square", attack: 0.015, release: 0.05, color: "#4e61d8"});