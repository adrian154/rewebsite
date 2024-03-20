// elements
const playButton = document.getElementById("play"),
      signalType = document.getElementById("input-type"),
      filterType = document.getElementById("filter-type"),
      hint = document.getElementById("hint"),
      impulseResponseCanvas = document.getElementById("impulse-response"),
      freqResponseCanvas = document.getElementById("frequency-response"),
      spectrumCanvas = document.getElementById("spectrum"),
      waveformCanvas = document.getElementById("waveform");

// create audio context
const audioCtx = new AudioContext();
const convolverNode = audioCtx.createConvolver();
const analyzerNode = audioCtx.createAnalyser();
convolverNode.connect(analyzerNode);
analyzerNode.connect(audioCtx.destination);

analyzerNode.fftSize = 2048;
const freqDataBuffer = new Uint8Array(analyzerNode.frequencyBinCount);
const timeDataBuffer = new Uint8Array(600);

// create buffer of random values for noise signal
const noiseBuffer = audioCtx.createBuffer(1, 4096, 48000);
const values = noiseBuffer.getChannelData(0);
for(let i = 0; i < values.length; i++) {
    values[i] = Math.random() * 2 - 1;
}

const noiseSource = audioCtx.createBufferSource();
noiseSource.buffer = noiseBuffer;
noiseSource.loop = true;

let sourceNode = noiseSource;

const updateSource = name => {
    
    if(sourceNode) {
        sourceNode.disconnect();
    }
    
    if(name === "noise") {
        sourceNode = noiseSource;
    } else {
        sourceNode = audioCtx.createOscillator();
        sourceNode.type = name;
    }

    console.log("connect and start");
    sourceNode.connect(convolverNode);
    sourceNode.start();

};

const filter = audioCtx.createBuffer(1, 3, 48000);
filter.copyToChannel(new Float32Array([0,1,0]), 0);
convolverNode.buffer = filter;

// ui logic
playButton.addEventListener("click", () => {
    audioCtx.resume();
});

signalType.addEventListener("input", () => {
    updateSource(signalType.value);   
});

filterType.addEventListener("input", () => {

    // update hint
    if(filterType.value == "custom-frequency") {
        hint.textContent = "Use your mouse to draw in the Frequency Response display!";
    } else if(filterType.value === "custom-impulse") {
        hint.textContent = "Use your mouse to draw in the Impulse Response display";
    } else {
        hint.textContent = "";
    }

});