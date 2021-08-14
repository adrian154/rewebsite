let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");

const GRAV_CONST = 2.0;
const DT = 1 / 60;
const RADIUS = 12;
const PARTICLE_RADIUS = 5;
const BOUNCINESS = 0.7;
const PLAYER_ACC = 5;
const GAME_STATE = {
	CONTROLS: 0,
	RUNNING: 1,
	DEAD: 2,
	PAUSE: 3
};

let planets = [];
let particles = [];
let fuel = 100;
let debug = false;

let mouse = {
	x: 0,
	y: 0,
	down: false
};

let game = {
	state: GAME_STATE.CONTROLS,
	ticks: 0,
	highTicks: 0
};

let toTimeStr = function(ticks) {
	let time = ticks / 60;
	let secs = Math.floor(time % 60);
	let mins = Math.floor(time / 60);
	
	return (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs);
}

let generatePlanets = function() {
	for(let i = 0; i < 15; i++) {
		let radius = Math.random() * 10 - 5 + RADIUS;
		planets.push({
			x: Math.random() * (canvas.width - RADIUS) + RADIUS / 2,
			y: Math.random() * (canvas.height - RADIUS) + RADIUS / 2,
			vx: Math.random() * 30 - 15,
			vy: Math.random() * 30 - 15,
			ax: 0,
			ay: 0,
			radius: radius,
			mass: radius * radius
		});
	}
	
	/* add player properties to player planet */
	planets[0].heading = 0;
	planets[0].radius = 16;
};

let resetGame = function() {
	planets = [];
	particles = [];
	generatePlanets();
	game.ticks = 0;
	game.state = GAME_STATE.RUNNING;
	fuel = 100;
};

let step = function() {
	for(let i = 0; i < planets.length; i++) {
		let planet = planets[i];
		
		let xForce = 0; 
		let yForce = 0;
		for(let j = 0; j < planets.length; j++) {
			if(i == j) continue;
			
			let planet2 = planets[j];
			let dx = planet2.x - planet.x;
			let dy = planet2.y - planet.y;
			let distSquared = dx * dx + dy * dy;
			let dist = Math.sqrt(distSquared);
			
			let force = GRAV_CONST * planet.mass * planet2.mass / distSquared;
			
			xForce += force * dx / dist;
			yForce += force * dy / dist;
		}
		
		/* apply acceleration to velocity */
		planet.vx += xForce / planet.mass + planet.ax;
		planet.vy += yForce / planet.mass + planet.ay;
		
		/* update position */
		planet.x += planet.vx * DT;
		planet.y += planet.vy * DT; 
		
		/* keep planets in boundaries */
		if(planet.x + planet.radius > canvas.width) {
			planet.x = canvas.width - planet.radius;
			planet.vx *= -BOUNCINESS;
		}
		
		if(planet.y + planet.radius > canvas.height) {
			planet.y = canvas.height - planet.radius;
			planet.vy *= -BOUNCINESS;
		}
		
		if(planet.x - planet.radius < 0) {
			planet.x = planet.radius;
			planet.vx *= -BOUNCINESS;
		}
		
		if(planet.y - planet.radius < 0) {
			planet.y = planet.radius;
			planet.vy *= -BOUNCINESS;
		}
		
		/* make sure planets don't collide */
		for(let j = 0; j < planets.length; j++) {
			if(i == j) continue;
			
			let planet2 = planets[j];
			let dx = planet2.x - planet.x;
			let dy = planet2.y - planet.y;
			let dist = Math.sqrt(dx * dx + dy * dy);

			if(dist < planet.radius + planet2.radius) {
				
				if(i == 0) {
					game.state = GAME_STATE.DEAD;
				}
			
				/* move planets out */
				let overlap = (planet.radius + planet2.radius - dist) / 2;
				let overlapX = overlap * dx / dist;
				let overlapY = overlap * dy / dist;
				planet.x -= overlapX;
				planet.y -= overlapY;
			
			}
		}
		
		/* Debug */
		if(debug) {
			ctx.beginPath();
			ctx.moveTo(planet.x, planet.y);
			ctx.lineTo(planet.x + planet.vx, planet.y + planet.vy);
			ctx.closePath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#00FFFF";
			ctx.stroke();
		}
	}
	
	/* update player by controls */
	planets[0].heading = Math.atan2((mouse.y - planets[0].y), (mouse.x - planets[0].x));
	if(mouse.down) {
		if(fuel >= 0.2) {
			planets[0].ax = Math.cos(planets[0].heading) * PLAYER_ACC;
			planets[0].ay = Math.sin(planets[0].heading) * PLAYER_ACC;
			
			/* potentially create particle */
			if(Math.random() > 0.7) {
				let angle = planets[0].heading + Math.random() * 2 - 1;
				
				let color = ["#fc5a03", "#fca503", "#ffff00", "#4f4f4f"][Math.floor(Math.random() * 4)];          
				
				particles.push({
					age: 0,
					x: planets[0].x,
					y: planets[0].y,
					vx: -Math.cos(angle) * PLAYER_ACC * 30,
					vy: -Math.sin(angle) * PLAYER_ACC * 30,
					color: color,
					size: Math.random() * 5 + 5
				});
			}
			
			/* deplete fuel */
			fuel -= 0.2;
		}
		
	} else {
		planets[0].ax = 0;
		planets[0].ay = 0;
	}
	
};

let draw = function() {

	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* draw particles */
	for(let i = 0; i < particles.length; i++) {
		let particle = particles[i];
		
		if(game.state == GAME_STATE.RUNNING || game.state == GAME_STATE.DEAD) {
			particle.x += particle.vx * DT;
			particle.y += particle.vy * DT;
			particle.age++;
		}

		ctx.fillStyle = particle.color;
		ctx.globalAlpha = 1 / Math.max(particle.age / 2 - 3, 1);
		
		ctx.beginPath();
		ctx.arc(particle.x, particle.y, particle.size * (1 + (particle.age / 40)), 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();
	}
	ctx.globalAlpha = 1;
	
	/* destroy totally darkened smoke particles */
	for(let i = particles.length - 1; i >= 0; i--)
		if(particles[i].age > 100) particles.splice(i, 1);

	/* draw everything faded if in death screen */
	if(game.state == GAME_STATE.DEAD || game.state == GAME_STATE.CONTROLS) ctx.globalAlpha = 0.5;
	
	for(let i = 0; i < planets.length; i++) {
		let planet = planets[i];
		
		ctx.beginPath();
		ctx.arc(planet.x, planet.y, planet.radius, 0, 2 * Math.PI);
		ctx.closePath();	

		/* 0 is player */
		if(i == 0) ctx.fillStyle = "#ff0000";
		else ctx.fillStyle = "#ffffff";
		ctx.fill();
		
		/* if player draw heading marker */
		if(i == 0) {
			ctx.beginPath();
			ctx.moveTo(planet.x, planet.y);
			ctx.lineTo(planet.x + Math.cos(planet.heading) * 24, planet.y + Math.sin(planet.heading) * 24);
			ctx.strokeStyle = "red";
			ctx.lineWidth = 7;
			ctx.stroke();
		}
	}
	
	if(game.state == GAME_STATE.RUNNING) {
		ctx.font = "24px Consolas";
		ctx.fillStyle = "#00ff00";
		ctx.fillText(toTimeStr(game.ticks), 10, 24);
	} else if(game.state == GAME_STATE.CONTROLS) {
		
		/* draw controls */
		ctx.globalAlpha = 1.0;
		ctx.font = "50px Consolas";
		ctx.fillStyle = "#ffff00";
		ctx.textAlign = "center";
		
		ctx.fillText("SPACE GAME", canvas.width / 2, canvas.height / 2);
		
		ctx.font = "24px Consolas";
		ctx.fillText("Move your mouse to look around", canvas.width / 2, canvas.height / 2 + 50);
		ctx.fillText("Hold left-click to fire your engines", canvas.width / 2, canvas.height / 2 + 70);
		ctx.fillText("Don't hit the asteroids", canvas.width / 2, canvas.height / 2 + 90);
		ctx.fillText("Death is inevitable", canvas.width / 2, canvas.height / 2 + 110);
		
		ctx.font = "36px Consolas";
		ctx.fillStyle = "#ff1493";
		ctx.fillText("PRESS ANY KEY TO BEGIN", canvas.width / 2, canvas.height - 20);
		
		ctx.textAlign = "left";	
		
	} else if(game.state == GAME_STATE.DEAD) {
	
		/* draw death text */
		ctx.globalAlpha = 1.0;
		ctx.font = "50px Consolas";
		ctx.fillStyle = "#ffff00";
		ctx.textAlign = "center";
		
		ctx.fillText("YOU DIED", canvas.width / 2, canvas.height / 2); 
		
		if(game.ticks >= game.highTicks) {
			ctx.font = "24px Consolas";
			game.highTicks = game.ticks;
			
			ctx.fillStyle = "#ff1493";
			ctx.fillText("New high score!", canvas.width / 2, canvas.height / 2 + 30);
		}
	
		ctx.font = "24px Consolas";
		ctx.fillText("High score: " + toTimeStr(game.highTicks), canvas.width / 2, canvas.height / 2 + 50);
		ctx.fillText("Just now: " + toTimeStr(game.ticks), canvas.width / 2, canvas.height / 2 + 70);
		
		ctx.fillText("Press any key to continue.", canvas.width / 2, canvas.height - 20);
		
		ctx.textAlign = "left";	
	}
	
	/* draw fuel meter */
	ctx.fillStyle = "rgb(" + ((100 - fuel) * 5.12) + "," + (fuel  * 2.56) + ", 0)";
	ctx.fillRect(492, 20, 10, fuel * 4.72);
	ctx.font = "10px Consolas"
	ctx.fillText(Math.floor(fuel) + "%", 486, fuel * 4.72 + 30)
	
};

let run = function() {
	draw();
	
	if(game.state == GAME_STATE.RUNNING) {
		step();
		game.ticks++;
	}
	
	requestAnimationFrame(run);
};

generatePlanets();
run();

window.addEventListener("mousemove", function(event) {
	let box = canvas.getBoundingClientRect();
	mouse.x = event.clientX - box.left;
	mouse.y = event.clientY - box.top;
});

window.addEventListener("keydown", function(event) {
	if(game.state == GAME_STATE.DEAD || game.state == GAME_STATE.CONTROLS) resetGame();
	else if(game.state == GAME_STATE.RUNNING && event.key == " ") game.state = GAME_STATE.PAUSED;
	else if(game.state == GAME_STATE.PAUSED && event.key == " ") game.state = GAME_STATE.RUNNING;
	if(event.key == "d") debug = !debug;
});

canvas.addEventListener("mousedown", function(event) {
	mouse.down = true;
});

canvas.addEventListener("mouseup", function(event) {
	mouse.down =  false;
});

