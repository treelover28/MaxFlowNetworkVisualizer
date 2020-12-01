import Node from "./Node";
import {getRandomColor} from "./Misc";
import _ from "lodash";


class GridPathFinder {
    constructor(gridArray,networkDefinition,strategy) {
        this.gridArray = gridArray;
        this.networkDefinition = networkDefinition;
        this.strategy = strategy.trim().toLowerCase();
        this.allowedStrategies = ["bfs", "dfs"];
    }

    getGridWithPaths = () => {
        // process network definition to get sourceTargetDict
        let sourceTargetVector = this.processNetworkDefinition();
        // depending on this.strategy, dispatch to different function 
        if (this.allowedStrategies.includes(this.strategy)) {
            return this.findPathsOnGrid(this.gridArray, sourceTargetVector, this.strategy);
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

    findPathsOnGrid = (gridArray, sourceTargetDict, strategy) => {
        let currNodeCoord = null;
        let currNode = null;
        
        // keeps track of paths from different sources to their destinations
        let sourcesPathsList = new Map();

        for (const [source, targets] of sourceTargetDict) {
            let parsedSource = this.nodeParser(source);
            
            // add parseSource to sourcesPathsList with an empty list of paths at first
            sourcesPathsList.set(parsedSource, []);

            let randomColor = getRandomColor();
            targets.forEach(target => {

                let targetNode = target[0];
                let parsedTargetNode = this.nodeParser(targetNode);
                let capacity = +target[1];
                let foundPath = this.pathFinderHelper(gridArray, source, targetNode, strategy);
                if (foundPath === "No Path found") {
                    alert("No path found between " + source + " and " + targetNode);
                    return "Please redefine your network by spreading the nodes out further";
                }

                // add new paths to map
                let currPathsFromSourceList = sourcesPathsList.get(parsedSource);
                currPathsFromSourceList.push(_.cloneDeep(foundPath));
                sourcesPathsList.set(parsedSource, currPathsFromSourceList);

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
                    // nodes from the same source gets the same color including the source itself but not the destination
                    if (i === 0){
                        currNode.color = randomColor;
                    }
                    i++; 
                }
            })  
        }
        this.gridArray = gridArray;
        
        return [gridArray, sourcesPathsList]; 
    }

    nodeParser = (coordString) => {
        return coordString.split(/,|\)|\(/).filter(x=>x);
    }

    nodeEqual = (nodeA, nodeB) => {
        console.log(`${nodeA[0]} and ${nodeA[1]}`);
        return +nodeA[0] === +nodeB[0] && +nodeA[1] === +nodeB[1]; 
    }

    pathFinderHelper(gridArray, source, target, strategy) { 
        let fringe = [source] 
        // parse string representation of a Node to an object
        let parsedSource = this.nodeParser(source);

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
            if (strategy === "bfs"){
                // BFS
                currNode = fringe.shift();
            }
            else {
                // DFS 
                currNode = fringe.pop();
            }
            
            let parsedNode = this.nodeParser(currNode);
            
            currX = +parsedNode[0];
            currY = +parsedNode[1];
            
            if (currNode === target) {
                break;
            }
            
            let rightNode = "(" + (currX + 1) + "," + currY +")";
            let leftNode = "(" + (currX  - 1) + "," + currY +")";
            let topNode = "(" + (currX) + "," + (currY + 1) +")";
            let botNode = "(" + (currX) + "," + (currY - 1) +")";

            if ((currX+1) < gridArray.length && !visitedNodes.has(rightNode) && (gridArray[currX + 1][currY].type === "empty" || rightNode === target)) {
                fringe.push(rightNode);
                parent.set(rightNode, currNode);
                visitedNodes.add(rightNode);
            }
            if ((currX-1) >= 0 && !visitedNodes.has(leftNode) && (gridArray[currX - 1][currY].type === "empty"  || leftNode === target)) {
                fringe.push(leftNode);
                parent.set(leftNode, currNode);
                visitedNodes.add(leftNode);
            }
            if ((currY + 1) < gridArray[0].length && !visitedNodes.has(topNode) && (gridArray[currX][currY + 1].type === "empty"  || topNode === target)) {
                fringe.push(topNode);
                parent.set(topNode, currNode);
                visitedNodes.add(topNode);
            }
            if ((currY - 1) >= 0 && !visitedNodes.has(botNode) && (gridArray[currX][currY - 1].type === "empty"  || botNode === target) ) {
                fringe.push(botNode);
                parent.set(botNode, currNode);
                visitedNodes.add(botNode);

            }    
        }

        if (currNode === target) {
            let path = []
            // change currNode back from object to its string representation
            while(currNode !== null) {
                console.log("travelling up!");
                path.unshift(this.nodeParser(currNode));
                currNode = parent.get(currNode);
            }
            return path;
        }
        return "No Path found";
    }
}

export default GridPathFinder;