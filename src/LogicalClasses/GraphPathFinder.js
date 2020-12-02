class GraphPathFinder {
    constructor(graph, source, sink, strategy) {
        this.graph = graph;
        this.source = source;
        this.sink = sink;
        this.strategy = strategy;
        this.allowedStrategy = ["dfs", "bfs"];
    }
    
    findPath = ()=> {
        if (this.allowedStrategy.includes(this.strategy)) {
            return this.findPathHelper();
        } else {
            return "Unknown Pathfinding strategy";
        }
    }


    findPathHelper = () => {
        let fringe = [this.source];
        let parent = new Map();
        let visited = new Set();

        parent.set(this.source, null);
        visited.add(this.source);

        let currNode = "";
        // source : [(target, residual, forward/backward )] 
        while(fringe.length !== 0) {
            console.log(this.strategy);
            // remove node from fringe depending on strategy
            if (this.strategy === "bfs") {
                currNode = fringe.shift();
            }
            else {
                // dfs
                currNode = fringe.pop();
            }
            
            if (currNode === this.sink) {
                break;
            }

            console.log("curNode " + currNode);
            let neighbors = this.graph.get(currNode);
            console.log("neighbors of currNode");
            console.log(neighbors);

            neighbors.forEach((edgeToNeighbor) => {
               
                console.log("edgeToNeighbor");
                console.log(edgeToNeighbor);
                let neighbor = edgeToNeighbor.target;
                if (!visited.has(neighbor)) {
                    // if we already check this neighbor, dont check again
                    // prevent cycles during path searching
                    console.log(neighbor);
                    fringe.push(neighbor);
                    parent.set(neighbor, currNode);
                    visited.add(neighbor);
                }
                
            });
        }

        console.log(parent);

        if (currNode === this.sink) {
            let simplePath = [];
            while(currNode !== this.source) {
                // travel up to source
                alert(currNode);
                console.log("travelling up in findPathHelper");
                simplePath.unshift(currNode);
                currNode = parent.get(currNode);
            }
            simplePath.unshift(this.source);

            console.log("simple path");
            console.log(simplePath);
            let pathWithEdgeDefinition = [];
            // if there are n nodes, there are n-1 edges
            for (let i = 0; i < simplePath.length - 1; i++) {
                let current = simplePath[i];
                let target = simplePath[i+1];

                let edgesFromCurrent = this.graph.get(current); 
                
                let edgeIdx = 0;
                let edgeNotFound = true;
                while(edgeIdx < edgesFromCurrent.length && edgeNotFound) {
                    let currEdge = edgesFromCurrent[edgeIdx];
                    console.log("currEdge");
                    console.log(currEdge);
                    if (currEdge.target === target) {
                        pathWithEdgeDefinition.push(currEdge);
                        edgeNotFound = false;
                    }
                    else {
                        edgeIdx++;
                    }
                }
            }
            console.log("path with edge def");
            console.log(pathWithEdgeDefinition);

            return pathWithEdgeDefinition;
        }
        return "No path found from source to sink in augmented graph! Max Flow!";     
    }
    
}

export default GraphPathFinder;