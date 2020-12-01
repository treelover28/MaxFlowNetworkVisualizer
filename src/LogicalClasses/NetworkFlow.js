import Node from "./Node";
import GraphPathFinder from "./GraphPathFinder";
class NetworkFlow {

    constructor(gridArray, dictOfPath, source, sink) {
        this.gridArray = gridArray;
        this.dictOfPath = dictOfPath;
        this.source = source;
        this.sink = sink;
    }

    
    generateAugmentedGraph = () => {
        // created adjacency list 
        // source : [(target, residual, forward/backward )] 
        augmentedGraph = new Map();
        for (const [source, targetsPaths] of this.dictOfPath) {
            if (!augmentedGraph.has(source)) {
                augmentedGraph.set(source, []);
            }

            targetsPaths.forEach(targetPath => {
                // target node is the last node in the path
                let targetNode = targetPath[targetPath.length -1];
                let arbitraryPathNode = targetPath[targetPath.length - 2];
                let x = arbitraryPathNode[0];
                let y = arbitraryPathNode[1];

                let flow = this.gridArray[x][y].flow;
                let capacity =  this.gridArray[x][y].capacity;
                if (flow < capacity) {
                    // calculate residual flow for forward edge if current edge in G is not fully saturated
                    // forwardResidual how much flow can still be increased
                    let forwardResidual = capacity - flow; 
                    let targetResidual = [targetNode, forwardResidual, "forward"];
                    let currResidualsFromSource = augmentedGraph.get(source);
                    currResidualsFromSource.push(targetResidual)
                    augmentedGraph.set(source, currResidualsFromSource);
                }
                // backward edge has current flow (how much you can still decrease)
                // backward edge is still well defined in augmented graph even if original edge in G
                // has been fully saturated.
                if (!augmentedGraph.has(targetNode)) {
                    augmentedGraph.set(targetNode, []);
                }
                let backwardResidualsFromTarget = augmentedGraph.get(targetNode);
                backwardResidualsFromTarget.push([source, flow, "backward"]);
                augmentedGraph.set(targetNode, backwardResidualsFromTarget);
            })
        }
        return augmentedGraph;
    }

    getPathInAugmentedGraph = () => {
        let augmentedGraph = this.generateAugmentedGraph();
        let graphPathFinder = new GraphPathFinder(augmentedGraph,this.source, this.sink, this.strategy);
        return graphPathFinder.findPath();
    }

    // TODO: Implement taking in a source and sink 
    // TODO: Find way to incrementally show improved network

}