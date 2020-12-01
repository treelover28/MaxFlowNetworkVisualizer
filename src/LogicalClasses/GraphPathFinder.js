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

        parent.set(source, null);
        visited.add(source);

        let currEdge;
        let currNode;
        // source : [(target, residual, forward/backward )] 
        while(fringe.length != 0) {
            // remove node from fringe depending on strategy
            if (this.strategy === "bfs") {
                currEdge = fringe.unshift();
            }
            else {
                // dfs
                currEdge = fringe.pop();
            }
            currNode = currEdge[0];

            if (currNode === this.sink) {
                break;
            }
            let neighbors = this.grid.get(currNode);
            
            neighbors.forEach(edgeToNeighbor => {
                let neighbor = edgeToNeighbor[0];
                fringe.push(edgeToNeighbor);
                parent.set(neighbor, currNode);
                visitedNodes.add(neighbor);
            })
        }

        if (currNode === this.sink) {
            let simplePath = [];
            while(currNode !== null) {
                // travel up to source
                simplePath.unshift(currNode);
                currNode = parent.get(currNode);
            }
 
            let pathWithEdgeDefinition = [];
            // if there are n nodes, there are n-1 edges
            for (let i = 0; i < simplePath.length - 1; i++) {
                let current = simplePath[i];
                let target = simplePath[i+1];

                let edgesFromCurrent = this.grid.get(current); 
                
                let edgeIdx = 0;
                let edgeNotFound = true;
                while(edgeIdx < edgesFromCurrent.length && edgeNotFound) {
                    let currEdge = edgesFromCurrent[edgeIdx];
                    if (currEdge[0] === target) {
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