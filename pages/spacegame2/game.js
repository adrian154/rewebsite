// DISCLAIMER: THIS CODE STINKS! Readers may be compelled to gouge out their own eyes.
// You have been warned.

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// physics constants
const GRAVITY = 100.0;
const BOUNCINESS = 0.7;
const DT = 1 / 60;
const ACCELERATION = 150;
const EXHAUST_SPEED = 300;
const MAX_PARTICLE_AGE = 50;

const GAME_STATE = {
    TITLE_SCREEN: 0,
    RUNNING: 1,
    DEAD: 2,
    PAUSE: 3
};

let mouse = {
    x: 0,
    y: 0,
    down: false
};

// various game state
let state = GAME_STATE.TITLE_SCREEN;
let planets = null;
let particles = null;
let player = null;
let ticks = 0;

const resetGame = () => {
    
    // generate planets
    planets = [];
    for(let i = 0; i < 20; i++) {
        let radius = Math.random() * Math.random() * 30 + 10;
        planets.push({
            x: Math.random() * (canvas.width - radius) + radius / 2,
            y: Math.random() * (canvas.height - radius) + radius / 2,
            dx: Math.random() * 80 - 40,
            dy: Math.random() * 80 - 40,
            ddx: 0,
            ddy: 0,
            radius: radius,
            mass: radius * radius
        });
    }

    player = planets[0];
    player.heading = 0;
    player.radius = 16;
    player.fuel = 100;
    player.isPlayer = true;

    // reset all else
    particles = [];
    state = GAME_STATE.RUNNING;

};

const addExhaustParticles = () => {
    
    if(Math.random() < 0.2) return;

    const angle = player.heading + Math.random() * 0.2 - 0.1;
    particles.push({
        age: 0,
        x: player.x,
        y: player.y,
        dx: -Math.cos(angle) * EXHAUST_SPEED,
        dy: -Math.sin(angle) * EXHAUST_SPEED,
        color: "#ff0000",
        size: Math.random() * 5 + 5
    });
    2
};

const updateParticles = () => {

    // move and age particles
    for(const particle of particles) {
        particle.age++;
        particle.x += particle.dx * DT;
        particle.y += particle.dy * DT;
        particle.size += 1;
    }
    
    // remove old particles
    for(let i = particles.length - 1; i >= 0; i--) {
        if(particles[i].age > MAX_PARTICLE_AGE) particles.splice(i, 1);
    }

};

const drawParticles = () => {
    
    ctx.fillStyle = "#91491a";
    for(const particle of particles) {
        const scaledAge = particle.age / MAX_PARTICLE_AGE;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.globalAlpha = 1 - Math.pow(scaledAge, 0.1);
        ctx.fill();
    }

    ctx.globalAlpha = 1.0;

};

const applyControls = () => {
    player.heading = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    if(mouse.down && player.fuel > 0.2) {
        player.ddx += Math.cos(player.heading) * ACCELERATION;
        player.ddy += Math.sin(player.heading) * ACCELERATION;
        player.fuel -= 0.2;
        addExhaustParticles();
    }
};

const applyGravity = () => {
    // accumulate accelerations
    for(let i = 0; i < planets.length; i++) {
        const planet0 = planets[i];
        for(let j = i + 1; j < planets.length; j++) {
            const planet1 = planets[j];
            const dx = planet1.x - planet0.x;
            const dy = planet1.y - planet0.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const gravityForce = GRAVITY * planet0.mass * planet1.mass / (dist * dist);
            planet0.ddx += gravityForce / planet0.mass * dx / dist;
            planet0.ddy += gravityForce / planet0.mass * dy / dist;
            planet1.ddx -= gravityForce / planet1.mass * dx / dist;
            planet1.ddy -= gravityForce / planet1.mass * dy / dist;
        }
    }
};

const moveObjects = () => {

    // move, taking into account boundaries
    for(const planet of planets) {

        planet.dx += planet.ddx * DT;
        planet.dy += planet.ddy * DT;
        let nextX = planet.x + planet.dx * DT;
        let nextY = planet.y + planet.dy * DT;

        // prevent collisions
        for(const otherPlanet of planets) {
            if(otherPlanet == planet) continue;
            const dx = otherPlanet.x - planet.x;
            const dy = otherPlanet.y - planet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = planet.radius + otherPlanet.radius;
            if(dist < minDist) {
                //if(planet.isPlayer || otherPlanet.isPlayer) {
                //    state = GAME_STATE.DEAD;
                //    return;
                //}
                let overlap = (dist - minDist);
                nextX += overlap * dx / dist;
                nextY += overlap * dy / dist;
            }
        }

        if(nextX + planet.radius > canvas.width) {
            nextX = canvas.width - planet.radius;
            planet.dx *= -BOUNCINESS;
        }
        
        if(nextY + planet.radius > canvas.height) {
            nextY = canvas.height - planet.radius;
            planet.dy *= -BOUNCINESS;
        }

        if(nextX < planet.radius) {
            nextX = planet.radius;
            planet.dx *= -BOUNCINESS;
        }

        if(nextY < planet.radius) {
            nextY = planet.radius;
            planet.dy *= -BOUNCINESS;
        }

        planet.x = nextX;
        planet.y = nextY;

    }

};

const step = () => {

    // reset acceleration
    for(const planet of planets) {
        planet.ddx = 0;
        planet.ddy = 0;
    }

    applyGravity();
    applyControls();
    moveObjects();
    updateParticles();

};

const drawFuelBar = () => {
    const height = player.fuel / 100 * (canvas.height - 40);
    ctx.fillStyle = `rgb(${(100 - player.fuel) * 2.56}, ${player.fuel * 2.56}, 0)`;
    ctx.fillRect(canvas.width - 20, 20, 10, height);
    ctx.font = "11px Consolas"
    ctx.fillText(Math.floor(player.fuel) + "%", canvas.width - 28, height + 30);
};

const drawPlanets = () => {

    for(const planet of planets) {
        
        // draw body
        ctx.fillStyle = planet.isPlayer ? "#ff0000" : "#ffffff";
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        // draw turret
        if(planet.isPlayer) {
            ctx.beginPath();
            ctx.moveTo(planet.x, planet.y);
            ctx.lineTo(planet.x + Math.cos(planet.heading) * 24, planet.y + Math.sin(planet.heading) * 24);
            ctx.strokeStyle = "#ff0000";
            ctx.lineWidth = 7;
            ctx.closePath();
            ctx.stroke();
        }

    }

};

const draw = () => {

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawParticles();
    drawPlanets()
    drawFuelBar();

};

const run = () => {
    draw();
    if(state === GAME_STATE.RUNNING) {
        step();
    }
    requestAnimationFrame(run);
};

// handle input
window.addEventListener("mousemove", (event) => {
    const box = canvas.getBoundingClientRect();
    mouse.x = event.clientX - box.left;
    mouse.y = event.clientY - box.top;
});

window.addEventListener("mousedown", (event) => {
    mouse.down = true;
});

window.addEventListener("mouseup", (event) => {
    mouse.down = false;
});

window.addEventListener("keydown", (event) => {
    // todo
});

resetGame();
run();