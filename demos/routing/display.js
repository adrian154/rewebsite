// --- state
const modeText = document.getElementById("mode");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const NODE_RADIUS = 20;

// update the size of the canvas
const rect = canvas.getBoundingClientRect();
canvas.width = rect.width;
canvas.height = rect.height;

// --- functions
const updateModeText = () => {
    modeText.textContent = MODES[simulation.modeIndex];
};

const drawNodes = (simulation) => {
    
    for(const node of simulation.nodes) {
        
        // draw basic node
        const selected = node == simulation.selectedNode;
        ctx.fillStyle = selected ? "#00aeff" : "#2c6a99";
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        // label
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = selected ? "bold 20px Arial" : "20px Arial";
        ctx.fillText(node.id, node.x, node.y + 7);

    }

};

const drawGraph = (simulation) => {

    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#fff";

    for(const node of simulation.nodes) {
        for(const neighbor of node.links.keys()) {
            if(neighbor.id > node.id) {
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(neighbor.x, neighbor.y);
                ctx.closePath();
                ctx.stroke();
            }
        }
    }

    ctx.globalAlpha = 1.0;

};

const draw = () => {

    // background
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // draw connection
    if(MODES[simulation.modeIndex] == MODE.BUILDING && simulation.selectedNode) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(simulation.selectedNode.x, simulation.selectedNode.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.closePath();
        ctx.stroke();
    }

    drawGraph(simulation);
    drawNodes(simulation);
    requestAnimationFrame(draw);

};

updateModeText();
draw();