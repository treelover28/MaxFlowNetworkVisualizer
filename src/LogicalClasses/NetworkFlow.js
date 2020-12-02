import Node from "./Node";
import GraphPathFinder from "./GraphPathFinder";
import {nodeToString} from "../LogicalClasses/Misc";
class NetworkFlow {

    constructor(gridArray, dictOfPath, source, sink, strategy) {
        this.gridArray = gridArray;
        this.dictOfPath = dictOfPath;
        this.source = source;
        this.sink = sink;
        this.strategy = strategy;
    }

    
    generateAugmentedGraph = () => {
        // created adjacency list 
        // source : [(target, residual, forward/backward )] 
        let augmentedGraph = new Map();
        // dictOfPath format {sourceString: [[paths...], [paths]]}
        for (const [source, targetsPaths] of this.dictOfPath) {
            if (!augmentedGraph.has(source)) {
                augmentedGraph.set(source, []);
            }

            targetsPaths.forEach(targetPath => {
                // target node is the last node in the path
                let targetNode = targetPath[targetPath.length -1];
                console.log(`targetNode: ${targetNode}`);
                let targetNodeString = nodeToString(targetNode);
                let arbitraryPathNode = targetPath[targetPath.length - 2];
                let x = arbitraryPathNode[0];
                let y = arbitraryPathNode[1];

                let flow = this.gridArray[x][y].flow;
                let capacity =  this.gridArray[x][y].capacity;
                if (flow < capacity) {
                    // calculate residual flow for forward edge if current edge in G is not fully saturated
                    // forwardResidual how much flow can still be increased
                    let forwardResidual = capacity - flow; 
                    let targetResidual = {target: targetNodeString, residual: forwardResidual, edgeType: "forward"};
                    let currResidualsFromSource = augmentedGraph.get(source);
                    
                    currResidualsFromSource.push(targetResidual)
                    augmentedGraph.set(source, currResidualsFromSource);
                    // {sourceString : [targetParsedNode, forwardResidual, "forward"/"backward"]}
                }

                // backward edge has current flow (how much you can still decrease)
                // backward edge is still well defined in augmented graph even if original edge in G
                // has been fully saturated.
                if (!augmentedGraph.has(targetNodeString)) {
                    augmentedGraph.set(targetNodeString, []);
                }
                let backwardResidualsFromTarget = augmentedGraph.get(targetNodeString);
                backwardResidualsFromTarget.push({target: source, residual: flow, edgeType: "backward"});
                augmentedGraph.set(targetNodeString, backwardResidualsFromTarget);
            })
        }
        return augmentedGraph;
    }

    getPathInAugmentedGraph = (augmentedGraph) => {
        
        let graphPathFinder = new GraphPathFinder(augmentedGraph, this.source, this.sink, this.strategy);
        // call graphPathFinder to find path in current augmented graph
        return graphPathFinder.findPath();
    }

    
    getAugmentingPath = () => {
        // this method may get repeatedly called on Board.js to iteratively show improved network
        let augmentedGraph = this.generateAugmentedGraph();
        let pathEdgeDef = this.getPathInAugmentedGraph(augmentedGraph);
        return pathEdgeDef;
    }

}

export default NetworkFlow;