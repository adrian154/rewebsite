const VERTEX_SRC = `

attribute vec4 position;
varying vec4 pos;

void main() {
    gl_Position = position;
    pos = position; // pass position to fragment shader
}

`;

const FRAGMENT_SRC = `

precision mediump float;
varying vec4 pos;
uniform float time;

// crappy hash
float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    float sintime = sin(time);
    float r = rand(vec2(pos) * sintime);
    float g = rand(vec2(pos) * sintime * 2.0);
    float b = rand(vec2(pos) * sintime * 3.0);
    gl_FragColor = vec4(r, g, b, 1);
}

`;