// node logic

const newNode = (x, y) => ({
    x, y,
    id: simulation.nextID++,
    links: new Map(), // links to neighbors
    queuedMessages: [], // messages to be processed next update
    sequenceNumbers: new Map(),
    sequenceNumber: 0
});


// routing update
const consumeLinks = (node, links) => {

    

};

const processMessage = (node, link, message) => {

    if(message.type === "link state advertisement") {
        
        // ignore messages with a lower 'sequence number'
        if(!node.sequenceNumbers.has(message.source) || node.sequenceNumbers.get(message.source) < message.sequenceNumber) {
            
            // save increased seq. number
            node.sequenceNumbers.set(message.source, message.sequenceNumber);

            // broadcast to peers, but don't send the advertisement back to its originator or whoever just relayed it to us
            for(const [peer, link] of node.links) {
                if(peer.id != message.source && peer) {
                    send(message, link);
                }
            }

            // update routing
            consumeLinks(message.links);

        }
        
    }

};

const advertiseLinkStates = (node) => {
    
    // gather links
    const links = [];
    for(const [neighbor, link] of node.links) {
        links.push({node1: node.id, node2: neighbor.id, cost: link.distance});
    }

    // send
    const message = {
        type: "link state advertisement",
        source: node.id,
        sequenceNumber: node.sequenceNumber++,
        links
    };

    for(const link of node.links.values()) {
        send(message, link);
    }

};