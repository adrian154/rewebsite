// DISCLAIMER: THIS CODE STINKS! Readers may be compelled to gouge out their own eyes.
// You have been warned.

// sounds
const sounds = {
    shoot: new Audio("shoot.wav"),
    explode: new Audio("explosion.wav")
};

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// physics constants
const GRAVITY = 100.0;
const BOUNCINESS = 0.7;
const DT = 1 / 60;
const ACCELERATION = 250;
const EXHAUST_SPEED = 300;
const MAX_PARTICLE_AGE = 50;
const BULLET_SPEED = 500;
const BULLET_MASS = 0.1;
const FRAGMENT_SPEED = 100;
const MIN_MASS = 50;
let debug = false;

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

let ctrl = false;

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

const exhaustColors = ["#9c9c9c", "#ff8c00", "#fff200", "#ff5e00"];

const addExhaustParticles = () => {
    
    if(Math.random() < DT * 30) {

        const angle = player.heading + Math.random() * 0.4 - 0.2;
        const speed = EXHAUST_SPEED + Math.random() * 20 - 10;

        particles.push({
            age: 0,
            x: player.x,
            y: player.y,
            dx: -Math.cos(angle) * speed,
            dy: -Math.sin(angle) * speed,
            color: exhaustColors[Math.floor(Math.random() * exhaustColors.length)],
            size: Math.random() * 5 + 5
        });

    }

};

const updateParticles = () => {

    // move and age particles
    for(const particle of particles) {
        particle.age += 60 * DT;
        particle.x += particle.dx * DT;
        particle.y += particle.dy * DT;
    }
    
    // remove old particles
    for(let i = particles.length - 1; i >= 0; i--) {
        if(particles[i].age > MAX_PARTICLE_AGE) particles.splice(i, 1);
    }

};

const drawParticles = () => {

    for(const particle of particles) {
        const scaledAge = particle.age / MAX_PARTICLE_AGE;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size + particle.age, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.globalAlpha = 1 - Math.pow(scaledAge, 0.3);
        ctx.fillStyle = particle.color;
        ctx.fill();
    }

    ctx.globalAlpha = 1.0;

};

const applyControls = () => {
    player.heading = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    if(mouse.down && !ctrl && player.fuel > 0.2) {
        player.ddx += Math.cos(player.heading) * ACCELERATION;
        player.ddy += Math.sin(player.heading) * ACCELERATION;
        player.fuel -= 10 * DT;
        addExhaustParticles();
    }
};

const applyGravity = () => {

    // accumulate accelerations
    for(let i = 0; i < planets.length; i++) {
        const planet0 = planets[i];
        for(let j = i + 1; j < planets.length; j++) {
            const planet1 = planets[j];

            if(planet0.isPlayer && planet1.bullet) continue;

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
            
            // don't collide with self
            if(otherPlanet == planet) continue;
            if(planet.isPlayer && otherPlanet.bullet || planet.bullet && otherPlanet.isPlayer) continue;

            const dx = otherPlanet.x - planet.x;
            const dy = otherPlanet.y - planet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = planet.radius + otherPlanet.radius;
            if(dist < minDist) {
                
                if(planet.isPlayer || otherPlanet.isPlayer) {
                    state = GAME_STATE.DEAD;
                    return;
                }

                if((planet.bullet && !planet.destroy) || (otherPlanet.bullet && !otherPlanet.destroy)) {
                    
                    planet.destroy = true;
                    otherPlanet.destroy = true;

                    const original = planet.bullet ? otherPlanet : planet;
                    
                    if(original.mass > MIN_MASS) {
                        const fragments = Math.random() * 3 + 2;
                        
                        const weights = [];
                        let total = 0;
                        for(let i = 0; i < fragments; i++) {
                            const fragment = Math.random();
                            weights[i] = fragment;
                            total += fragment;
                        }

                        for(const weight of weights) {
                            const mass = weight / total * original.mass;
                            const angle = Math.random() * 2 * Math.PI;
                            planets.push({
                                x: original.x + Math.random() * 10 - 5,
                                y: original.y + Math.random() * 10 - 5,
                                dx: Math.cos(angle) * FRAGMENT_SPEED,
                                dy: Math.sin(angle) * FRAGMENT_SPEED,
                                ddx: 0,
                                ddy: 0,
                                radius: Math.sqrt(mass),
                                mass: mass
                            });
                        }
                    }

                    sounds.explode.play();

                }

                let overlap = (dist - minDist);
                nextX += overlap * dx / dist;
                nextY += overlap * dy / dist;
            }
        }

        if(nextX + planet.radius > canvas.width) {
            nextX = canvas.width - planet.radius;
            planet.dx *= -BOUNCINESS;
            if(planet.bullet) planet.destroy = true;
        }
        
        if(nextY + planet.radius > canvas.height) {
            nextY = canvas.height - planet.radius;
            planet.dy *= -BOUNCINESS;
            if(planet.bullet) planet.destroy = true;
        }

        if(nextX < planet.radius) {
            nextX = planet.radius;
            planet.dx *= -BOUNCINESS;
            if(planet.bullet) planet.destroy = true;
        }

        if(nextY < planet.radius) {
            nextY = planet.radius;
            planet.dy *= -BOUNCINESS;
            if(planet.bullet) planet.destroy = true;
        }

        planet.x = nextX;
        planet.y = nextY;

    }

};

const removePlanets = () => {
    for(let i = planets.length - 1; i >= 0; i--) {
        if(planets[i].destroy) planets.splice(i, 1);
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
    removePlanets();

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
        ctx.fillStyle = planet.isPlayer ? "#ff0000" : planet.bullet ? "#ffff00" : "#ffffff";

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

        if(debug) {
            
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ff0000";
            ctx.beginPath();
            ctx.moveTo(planet.x, planet.y);
            ctx.lineTo(planet.x + planet.dx, planet.y + planet.dy);
            ctx.closePath();
            ctx.stroke();

            ctx.strokeStyle = "#00ff00";
            ctx.beginPath();
            ctx.moveTo(planet.x, planet.y);
            ctx.lineTo(planet.x + planet.ddx, planet.y + planet.ddy);
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

    requestAnimationFrame(run);
    
    if(state === GAME_STATE.RUNNING) {
        step();
    }

    draw();

};

const keyEvent = (key, state) => {
    if(key === "Control") ctrl = state;
};

const mouseClick = () => {
    if(ctrl && player.fuel > 2) {
        planets.push({
            x: player.x,
            y: player.y,
            dx: Math.cos(player.heading) * BULLET_SPEED,
            dy: Math.sin(player.heading) * BULLET_SPEED,
            ddx: 0,
            ddy: 0,
            radius: 3,
            mass: BULLET_MASS,
            bullet: true
        });
        sounds.shoot.play();
        player.fuel -= 2;
    }
};

// handle input
window.addEventListener("mousemove", (event) => {
    const box = canvas.getBoundingClientRect();
    mouse.x = event.clientX - box.left;
    mouse.y = event.clientY - box.top;
});

window.addEventListener("mousedown", (event) => {
    mouse.down = true;
    mouseClick();
});

window.addEventListener("mouseup", (event) => {
    mouse.down = false;
});

window.addEventListener("keydown", (event) => {
    keyEvent(event.key, true);
});

window.addEventListener("keyup", (event) => {
    keyEvent(event.key, false);
});

resetGame();
run();