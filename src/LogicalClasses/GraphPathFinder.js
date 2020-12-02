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
        let edgeFromSource = this.graph.get(this.source);
        
        let fringe = [this.source];
        let parent = new Map();
        let visited = new Set();

        parent.set(this.source, null);
        visited.add(this.source);

        let currNode = "";
        // source : [(target, residual, forward/backward )] 
        while(fringe.length !== 0) {
            
            // remove node from fringe depending on strategy
            if (this.strategy === "bfs") {
                currNode = fringe.unshift();
            }
            else {
                // dfs
                currNode = fringe.pop();
            }
            
            if (currNode === this.sink) {
                break;
            }

            let neighbors = this.graph.get(currNode);
            // console.log(neighbors);

            neighbors.forEach((edgeToNeighbor) => {
                console.log(edgeToNeighbor);
                let neighbor = edgeToNeighbor.target;
                console.log(neighbor);
                fringe.push(neighbor);
                parent.set(neighbor, currNode);
                visited.add(neighbor);
            })
        }

        if (currNode === this.sink) {
            let simplePath = [];
            while(currNode !== null) {
                // travel up to source
                console.log("travelling up");
                simplePath.unshift(currNode);
                currNode = parent.get(currNode);
            }
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
            return pathWithEdgeDefinition;
        }
        return "No path found from source to sink in augmented graph! Max Flow!";     
    }
    
}

export default GraphPathFinder;