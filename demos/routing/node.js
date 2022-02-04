// node logic

const consumeLinks = (node, links) => {

    

};

const processMessage = (node, message) => {

    if(message.type === "link-state-advertisement") {
        
        // ignore messages with a lower 'sequence number'
        if(node.sequenceNumbers.get(message.source.id) < message.sequenceNumber) {
            
            // save increased seq. number
            node.sequenceNumbers.set(message.source.id, message.sequenceNumber);

            // broadcast to peers
            for(const link of node.links.values()) {
                send(message, link);
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
    const message = {source: node, links};
    for(const link of node.links.values()) {
        send(message, link);
    }

};