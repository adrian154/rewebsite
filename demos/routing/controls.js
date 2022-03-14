// --- constants
const MIN_DRAG = 6;

// --- state
const mouse = {x: 0, y: 0};
let ctrlDown = false;

// --- helpers
const getNode = (simulation, x, y) => {
    for(const node of simulation.nodes) {
        if((node.x - x) ** 2 + (node.y - y) ** 2 < NODE_RADIUS ** 2) {
            return node;
        }
    }
};

// --- event listeners
const handleNodeClick = (simulation) => {
    console.log("other node clicked");
    if(simulation.mode == MODE.BUILDING) {
        if(simulation.clickedNode.links.has(simulation.selectedNode)) {
            disconnect(simulation.clickedNode, simulation.selectedNode);
        } else {
            connect(simulation.clickedNode, simulation.selectedNode);
        }
    } else if(simulation.mode == MODE.TESTING) {
        const link = simulation.selectedNode.links.get(simulation.clickedNode);
        if(link) {
            send("test", link);
            console.log("sent");
        }
    } else if (simulation.mode == MODE.VIEWING) {

    }
};

const handleSpaceClick = (simulation, x, y) => {
    console.log("empty space clicked");
    if(MODES[simulation.modeIndex] == MODE.BUILDING && !simulation.selectedNode) {
        simulation.nodes.add(newNode(x, y));   
    }
};

window.addEventListener("keydown", (event) => {
    if(event.key === "g" || event.key === "G") {
        simulation.modeIndex = (simulation.modeIndex + 1) % MODES.length;
        simulation.mode = MODES[simulation.modeIndex];
        updateModeText();
    } else if(event.key === "Delete" && simulation.selectedNode) {
        deleteNode(simulation, simulation.selectedNode);
        simulation.selectedNode = null;
    } else if(event.key === "Control") {
        ctrlDown = true;
    }
});

window.addEventListener("keyup", (event) => {
    if(event.key === "Control") {
        ctrlDown = false;
    }
})

canvas.addEventListener("mousedown", (event) => {

    mouse.down = true;

    // check if the click landed on a node
    const clickedNode = getNode(simulation, event.offsetX, event.offsetY);
    
    // if no node was selected, select the clicked node
    if(clickedNode && !simulation.selectedNode) {
        simulation.selectedNode = clickedNode;
    }

    if(simulation.selectedNode) {
        mouse.dragging = ctrlDown;
    }

    // save clicked node
    simulation.clickedNode = clickedNode;

});

canvas.addEventListener("mouseup", (event) => {

    mouse.down = false;

    // handle drag events
    if(mouse.dragging) {
        simulation.selectedNode = null;
        mouse.dragging = false;
    } else {

        // handle click
        if(simulation.clickedNode) {
            if(simulation.clickedNode != simulation.selectedNode) {
                handleNodeClick(simulation);
                simulation.selectedNode = null;
            } 
        } else {
            handleSpaceClick(simulation, event.offsetX, event.offsetY);
            simulation.selectedNode = null;
        }
        
    }

});

window.addEventListener("mousemove", (event) => {
    mouse.x = event.offsetX;
    mouse.y = event.offsetY;
    if(mouse.dragging && simulation.selectedNode) {
        moveNode(simulation.selectedNode, event.offsetX, event.offsetY);
    }
});