// --- constants
const MODE = {
    BUILDING: "Building",
    TESTING: "Testing",
    VIEWING: "Viewing"
};

const MODES = [MODE.BUILDING, MODE.TESTING, MODE.VIEWING];
const MESSAGE_SPEED = 10;

// --- state
const simulation = {
    modeIndex: 0,
    mode: MODES[0],
    nodes: new Set(),
    selectedNode: null,
    nextID: 0
};

const newNode = (x, y) => ({
    x, y,
    id: simulation.nextID++,
    links: new Map(), // links to neighbors
    queuedMessages: [], // messages to be processed next update
    sequenceNumbers: new Map(),
    sequenceNUmber: 0
});

const deleteNode = (simulation, node) => {
    node.links.forEach((_, neighbor) => neighbor.links.delete(node));
    simulation.nodes.delete(node);
};

const calculateDistance = (nodeA, nodeB) => Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);

const connect = (nodeA, nodeB) => {
    const distance = calculateDistance(nodeA, nodeB);
    nodeA.links.set(nodeB, {distance, messages: new Set()});
    nodeB.links.set(nodeA, {distance, messages: new Set()});
};

const moveNode = (node, x, y) => {
    node.x = x;
    node.y = y;
    node.links.forEach((link, neighbor) => {
        const neighborLink = neighbor.links.get(node);
        const distance = calculateDistance(node, neighbor);
        link.distance = distance;
        neighborLink.distance = distance;
    });
};

const disconnect = (nodeA, nodeB) => {
    nodeA.links.delete(nodeB);
    nodeB.links.delete(nodeA);
};

const send = (payload, link) => link.messages.add({payload, position: 0});

const updateNode = (node) => {
    
    // consume messages
    while(node.queuedMessages.length > 0) {
        const message = node.queuedMessages.pop();
        processMessage(node, message.payload);
    }

};

const updateMessages = (node) => {
    for(const [neighbor, link] of node.links) {
        for(const message of link.messages) {
            message.position += MESSAGE_SPEED;
            if(message.position > link.distance) {
                neighbor.queuedMessages.push(message);
                link.messages.delete(message);
            }
        }
    }
};

// make sure all nodes receive new messages at the same time by updating the simulation in two phases
const update = () => {
  
    for(const node of simulation.nodes) {
        updateNode(node);
    }

    for(const node of simulation.nodes) {
        updateMessages(node);
    }

};

setInterval(update, 1000 / 30);