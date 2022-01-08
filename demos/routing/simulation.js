// --- constants
const MODE = {
    BUILDING: "Building",
    TESTING: "Testing",
    VIEWING: "Viewing"
};

const MODES = [MODE.BUILDING, MODE.TESTING, MODE.VIEWING];

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
    links: new Map()
});

const deleteNode = (simulation, node) => {
    node.links.forEach((_, neighbor) => neighbor.links.delete(node));
    simulation.nodes.delete(node);
};

const calculateDistance = (nodeA, nodeB) => Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);

const connect = (nodeA, nodeB) => {
    const distance = calculateDistance(nodeA, nodeB);
    simulation.selectedNode.links.set(simulation.clickedNode, {distance, queue: new Set()});
    simulation.clickedNode.links.set(simulation.selectedNode, {distance, queue: new Set()});
};

const moveNode = (node, x, y) => {
    node.links.forEach((link, neighbor) => {
        const neighborLink = neighbor.links.get(node);
        const distance = calculateDistance(node, neighbor);
        link.distance = distance;
        neighborLink.distance = distance;
    });
};

const disconnect = (nodeA, nodeB) => {
    simulation.selectedNode.links.delete(simulation.clickedNode);
    simulation.clickedNode.links.delete(simulation.selectedNode);
};