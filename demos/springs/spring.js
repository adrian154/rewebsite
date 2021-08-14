const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Constants
const POINT_RADIUS = 5;
const POINT_MASS = 1;
const SPRING_CONST = 2000;
const SPRING_LENGTH = 10;
let TIMESTEP = 1 / 60;
const GRAVITY = 900;
let DRAG_COEFF = 0.005;

// Global state
const points = [];

let paused = false;

// Run funcs
const addPoints = function() {

    for(let i = 0; i < 30; i++) {
        points.push({
            x: i * 20 + 300,
            y: canvas.height / 2,
            dx: 0,
            dy: 0,
            fx: 0,
            fy: 0,
            fixed: false
        });
    }

    points[0].fixed = true;
    //points[points.length - 1].fixed = true;

};

const draw = function() {
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(let i = 0; i < points.length; i++) {

        let point = points[i];

        if(point.fixed)
            ctx.fillStyle = "#ff0000";
        else
            ctx.fillStyle = "#000000";

        ctx.beginPath();
        ctx.arc(point.x, point.y, POINT_RADIUS, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
         
        // Draw connection to next point
        if(i < points.length - 1) {
            
            let nextPoint = points[i + 1];
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(nextPoint.x, nextPoint.y);
            ctx.closePath();
            ctx.stroke();

        }

    }

};

const springForce = function(length) {
    return length > SPRING_LENGTH ? SPRING_CONST * (length - SPRING_LENGTH) : 0;
};

const step = function() {

    for(let i = 0; i < points.length - 1; i++) {

        let point0 = points[i];
        let point1 = points[i + 1];

        let dx = point1.x - point0.x;
        let dy = point1.y - point0.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        let force = springForce(dist);

        point0.fx += force * dx / dist;
        point0.fy += force * dy / dist;
        
        point1.fx -= force * dx / dist;
        point1.fy -= force * dy / dist;

    }

    for(let point of points) {

        if(!point.fixed) {

            // drag
            let v = Math.sqrt(point.dx * point.dx + point.dy * point.dy);
            let drag = DRAG_COEFF * v * v;
            if(v > 0.01) {
                point.fx -= drag * point.dx / v;
                point.fy -= drag * point.dy / v;
            }

            point.dx += point.fx / POINT_MASS * TIMESTEP;
            point.dy += (point.fy / POINT_MASS + GRAVITY) * TIMESTEP;

            point.x += point.dx * TIMESTEP;
            point.y += point.dy * TIMESTEP;

        }

        point.fx = 0;
        point.fy = 0;

    }

};

const run = function() {
    draw();
	if(!paused)
		step();
    requestAnimationFrame(run);
};

const start = function() {

    // Add event listeners
    let selectedPoint;
	let ctrlHeld;
	
	window.addEventListener("keyup", (event) =>  {if(event.key === "Control") ctrlHeld = false});
	window.addEventListener("keydown", (event) => {if(event.key === "Control") ctrlHeld = true; if(event.key === " ") paused = !paused});

    window.addEventListener("mousedown", (event) => {
        
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        for(let point of points) {
            let dx = x - point.x;
            let dy = y - point.y;
            if(dx * dx + dy * dy < POINT_RADIUS * POINT_RADIUS) {
                selectedPoint = point;
                selectedPoint.wasFixed = ctrlHeld ? !selectedPoint.fixed : selectedPoint.fixed;
                selectedPoint.fixed = true;
            }
        }

    });

    window.addEventListener("mouseup", (event) => {
        if(selectedPoint) {
            selectedPoint.fixed = selectedPoint.wasFixed;
            selectedPoint = null;
        }
    });

    window.addEventListener("mousemove", (event) => {
        if(selectedPoint) {
            selectedPoint.x += event.movementX;
            selectedPoint.y += event.movementY;
        }
    });

    // Get this show on the road!
    addPoints();
    run();

};

// Start the simulation
start();