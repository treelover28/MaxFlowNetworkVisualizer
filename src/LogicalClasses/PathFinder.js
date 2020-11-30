import Node from "./Node";
import {getRandomColor} from "./Misc";


class PathFinder {
    constructor(gridArray,networkDefinition,strategy) {
        this.gridArray = gridArray;
        this.networkDefinition = networkDefinition;
        this.strategy = strategy.trim().toLowerCase();
    }

    getGridWithPaths = () => {
        // process network definition to get sourceTargetDict
        let sourceTargetVector = this.processNetworkDefinition();
        // depending on this.strategy, dispatch to different function 
        if (this.strategy === 'bfs') {
            return this.BFS(this.gridArray, sourceTargetVector);
        } else if (this.strategy === 'dfs') {
            return this.DFS(this.gridArray, sourceTargetVector);
        } else {
            return "Unknown Pathfinding strategy";
        }

    }

    processNetworkDefinition = () => {
        let networkDef = this.networkDefinition;
        let edgeDefinitions = networkDef.split(";").filter(x=>x);

        // map to keep track of {NodeA : [(NodeB, capacity), (NodeC, capacity) ...]}
        let sourceTargetDict = new Map();
        
        edgeDefinitions.forEach(edgeDef => {
            let edgeDefArr = edgeDef.split("->").filter(x=>x);
            let serverA = edgeDefArr[0].trim();
            let capacity = +edgeDefArr[1].trim();
            let serverB = edgeDefArr[2].trim();

            let edge = [serverB, capacity];
            let currentEdgeList = sourceTargetDict.get(serverA);
            if (currentEdgeList === undefined) {  
                currentEdgeList = [edge];
            } else {
                currentEdgeList.push(edge);
            }
            sourceTargetDict.set(serverA, currentEdgeList);
        })
        return sourceTargetDict;
    }

    BFS = (gridArray, sourceTargetDict) => {
        let currNodeCoord = null;
        let currNode = null;
        for (const [source, targets] of sourceTargetDict) {
            let parsedSource = this.nodeParser(source);
            let randomColor = getRandomColor();
            targets.forEach(target => {

                let targetNode = target[0];
                let parsedTargetNode = this.nodeParser(targetNode);
                let capacity = +target[1];
                let foundPath = this.BFSHelper(gridArray, source, targetNode);
                if (foundPath === "No Path found") {
                    alert("No path found between " + source + " and " + targetNode);
                    return "Please redefine your network by spreading the nodes out further";
                }

                let i = 0;
                while (foundPath.length !== 0) {
                    currNodeCoord = foundPath.shift();
                    currNode = gridArray[+currNodeCoord[0]][+currNodeCoord[1]]; 
                    if (currNode.type === "connected-server" || this.nodeEqual(currNodeCoord, parsedTargetNode) || this.nodeEqual(currNodeCoord, parsedSource)) {
                        currNode.type = "connected-server";
                    }
                    else {
                        currNode.type = "connection";
                        currNode.capacity = capacity;  
                        currNode.color = randomColor;
                    }
                    // nodes from the same source gets the same color
                    if (i === 0){
                        currNode.color = randomColor;
                    }
                    i++; 
                }
            })  
        }
        this.gridArray = gridArray;
        
        return gridArray; 
    }

    nodeParser = (coordString) => {
        return coordString.split(/,|\)|\(/).filter(x=>x);
    }

    nodeEqual = (nodeA, nodeB) => {
        console.log(`${nodeA[0]} and ${nodeA[1]}`);
        return +nodeA[0] === +nodeB[0] && +nodeA[1] === +nodeB[1]; 
    }

    BFSHelper(gridArray, source, target) { 
        let fringe = [source] 
        // parse string representation of a Node to an object
        let parsedSource = this.nodeParser(source);
        let parsedTarget = this.nodeParser(target);

        let currX = +parsedSource[0];
        let currY = +parsedSource[1];

        // keep track of nodes we already visited
        let visitedNodes = new Set();

        let currNode;
        // dictionary to keep track of BFS shortest path tree
        let parent = new Map();

        parent.set(source, null);
        visitedNodes.add(source);

        while (fringe.length !== 0) {
            currNode = fringe.shift();
            let parsedNode = this.nodeParser(currNode);
            console.log("currNode: " + currNode);
            // console.log(typeof currNode);
            currX = +parsedNode[0];
            currY = +parsedNode[1];
            // console.log(`<${currX},${currY}>`);
            
            if (currNode === target) {
                break;
            }
            
            // visitedNode.add(currNode);
            // console.log("enter bfs-helper while");
            let rightNode = "(" + (currX + 1) + "," + currY +")";
            let leftNode = "(" + (currX  - 1) + "," + currY +")";
            let topNode = "(" + (currX) + "," + (currY + 1) +")";
            let botNode = "(" + (currX) + "," + (currY - 1) +")";

            if ((currX+1) < gridArray.length && !visitedNodes.has(rightNode) && (gridArray[currX + 1][currY].type === "empty" || rightNode === target)) {
                fringe.push(rightNode);
                // console.log("added node " + rightNode);
                parent.set(rightNode, currNode);
                visitedNodes.add(rightNode);
            }
            if ((currX-1) >= 0 && !visitedNodes.has(leftNode) && (gridArray[currX - 1][currY].type === "empty"  || leftNode === target)) {
                fringe.push(leftNode);
                // console.log("added node " + leftNode);
                parent.set(leftNode, currNode);
                visitedNodes.add(leftNode);
            }
            if ((currY + 1) < gridArray[0].length && !visitedNodes.has(topNode) && (gridArray[currX][currY + 1].type === "empty"  || topNode === target)) {
                fringe.push(topNode);
                parent.set(topNode, currNode);
                // console.log("added node " + topNode);
                visitedNodes.add(topNode);
            }
            if ((currY - 1) >= 0 && !visitedNodes.has(botNode) && (gridArray[currX][currY - 1].type === "empty"  || botNode === target) ) {
                fringe.push(botNode);
                parent.set(botNode, currNode);
                // console.log("added node " + botNode);
                visitedNodes.add(botNode);

            }    
        }

        // console.log("finished BFS-helper");
        if (currNode === target) {
            let path = []
            // change currNode back from object to its string representation
            // currNode = `(${currNode[0]},${currNode[1]})`;
            while(parent.get(currNode) !== null) {
                console.log("travelling up!");
                path.unshift(this.nodeParser(currNode));
                currNode = parent.get(currNode);
            }
            path.unshift(parsedSource);
            console.log("path: " + path);
            return path;
        }
        console.log("no path found");
        return "No Path found";
    }

    DFS = (gridArray, sourceTargetDict) => {
        return null;
    }

}

export default PathFinder;