const canvas = document.getElementById("canvas"),
      ctx = canvas.getContext("2d");

const histogramCanvas = document.getElementById("histogram"),
      histogramCtx = histogramCanvas.getContext("2d");

const particles = [];

// physics parameters
let DT = 1/200;
const MASS = 1;
const EPSILON = 50;
const RADIUS = 10;

const INITIAL_TEMP = 1;
const INITIAL_DIST = 15;

// histogram parameters
let HIST_BIN_COUNT = 20,
    HIST_BIN_SZ = 20,
    HIST_SCALE = 1;

// precomputed constants
const RADIUS6 = RADIUS**6;
const MAXDIST = (RADIUS*4)**2;

const gaussianRand = () => {
    const u = 1 - Math.random();
    const v = Math.random();
    return Math.sqrt(-2 * Math.log(u))*Math.cos(2*Math.PI*v);
};

const init = () => {

    for(let X = 0; X < 40; X++) {
        for(let Y = 0; Y < 40; Y++) {

            // generate position
            const x = (X-20)*INITIAL_DIST+canvas.width/2, y = (Y-20)*INITIAL_DIST+canvas.height/2;

            // generate velocity
            const vx = gaussianRand()*INITIAL_TEMP, vy = gaussianRand()*INITIAL_TEMP;
           
            particles.push({
                x, y,
                vx, vy
            });
        }
    }

    computeAcceleration();
    
};

let totKE = 0,
    totPE = 0;

let stepNum = 0;

const draw = () => {
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    for(const particle of particles) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, RADIUS/2, 0, 2 * Math.PI);
        ctx.fill();
    }

    // write observables
    document.getElementById("avgKE").textContent = Math.round(totKE / particles.length);
    document.getElementById("totKE").textContent = Math.round(totKE);
    document.getElementById("totPE").textContent = Math.round(totPE);
    document.getElementById("totE").textContent = Math.round(totPE + totKE);
    document.getElementById("step").textContent = stepNum;
    drawHistogram(histogramCtx);

};

const drawHistogram = ctx => {
    
    const histogram = new Array(HIST_BIN_COUNT).fill(0);
        
    for(const particle of particles) {
        const vel = Math.sqrt(particle.vx**2 + particle.vy**2);
        const idx = Math.floor(vel / HIST_BIN_SZ * HIST_BIN_COUNT);
        if(idx < histogram.length) {
            histogram[idx]++;
        }
    }

    const barWidth = ctx.canvas.width / histogram.length;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#ff0000";
    for(let i = 0; i < histogram.length; i++) {
        ctx.fillRect(i * barWidth, ctx.canvas.height - histogram[i] * HIST_SCALE, barWidth, histogram[i] * HIST_SCALE);
    }

};

const computeAcceleration = () => {

    totPE = 0;
    for(const particle of particles) {
        particle.axOld = particle.ax;
        particle.ayOld = particle.ay;
        particle.ax = 0;
        particle.ay = 0;
    }

    for(let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        for(let j = i + 1; j < particles.length; j++) {
            
            const other = particles[j];
            const dx = other.x - particle.x, dy = other.y - particle.y;

            // compute force with LJ potential
            const distSq = dx*dx + dy*dy;
            if(distSq > MAXDIST) {
                continue;
            }
            const a = RADIUS6/distSq**3;
            const forceOverDist = -48*EPSILON*a*(a - 0.5)/distSq;
            
            // accumulate force
            particle.ax += forceOverDist * dx / MASS;
            particle.ay += forceOverDist * dy / MASS;
            other.ax -= forceOverDist * dx / MASS;
            other.ay -= forceOverDist * dy / MASS;
            
            // add potential
            totPE += 4*EPSILON*(a*a-a);

        }
    }

};

const step = () => {

    for(const particle of particles) {
        particle.x = particle.x + particle.vx*DT + particle.ax*DT*DT*0.5;
        particle.y = particle.y + particle.vy*DT + particle.ay*DT*DT*0.5;
    }

    computeAcceleration();

    for(const particle of particles) {
        particle.vx = particle.vx + 0.5*DT*(particle.ax + particle.axOld);
        particle.vy = particle.vy + 0.5*DT*(particle.ay + particle.ayOld);
    }

    // compute observables
    totKE = 0;
    for(const particle of particles) {
        totKE += 0.5 * MASS * (particle.vx**2 + particle.vy**2);
    }

    stepNum++;

};

const run = () => {
    for(let i = 0; i < 5; i++) {
        step();
    }
    draw();
    requestAnimationFrame(run);
};

init();
run();