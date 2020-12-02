import Node from "./Node";
import {getRandomColor, nodeParser, nodeEqual} from "./Misc";
import _ from "lodash";


class GridPathFinder {
    constructor(gridArray,source, sink, networkDefinition,strategy) {
        this.gridArray = gridArray;
        this.gridMaxX = gridArray.length;
        this.gridMaxY = gridArray[0].length;
        this.source = source;
        this.sink = sink
        this.networkDefinition = networkDefinition;
        this.strategy = strategy.trim().toLowerCase();
        this.allowedStrategies = ["bfs", "dfs"];
    }

    getGridWithPaths = () => {
        // process network definition to get sourceTargetDict
        let graph = this.processNetworkDefinition();
        console.log(graph);
        // depending on this.strategy, dispatch to different function 
        if (this.allowedStrategies.includes(this.strategy)) {
            return this.findPathsOnGrid(this.gridArray, graph, this.strategy);
        } else {
            return "Unknown Pathfinding strategy";
        }

    }

    processNetworkDefinition = () => {
        let networkDef = this.networkDefinition;

        let parsedSource = nodeParser(this.source, this.gridMaxX, this.gridMaxY);
        let parsedSink = nodeParser(this.sink, this.gridMaxX, this.gridMaxY); 

        // if source and sink are not specified, or is in invalid format, return error message
        if (typeof parsedSource === "string" || typeof parsedSink === "string") {
            return "Error: Invalid Source or Sink node format. Check if your coordinates are in correct format and they are within the dimension of the grid.";
        }

        let edgeDefinitions = networkDef.split(";").filter(x=>x);
        // map to keep track of {NodeA : [(NodeB, capacity), (NodeC, capacity) ...]}
        let graph = new Map();
        
        let notHasSource = true;
        let notHasSink = true;

        edgeDefinitions.forEach(edgeDef => {
            let edgeDefArr = edgeDef.split("->").filter(x=>x);
            let serverA = edgeDefArr[0].trim();
            let capacity = +edgeDefArr[1].trim();
            let serverB = edgeDefArr[2].trim();

            let parsedA = nodeParser(serverA, this.gridMaxX, this.gridMaxY);
            let parsedB = nodeParser(serverB, this.gridMaxX, this.gridMaxY);

            if (typeof parsedA === "string" || typeof parsedB === "string") {
                let err = "Error: Invalid network node format. Check if your coordinates are in correct format and they are within the dimension of the grid.";
                alert(err);
                return err;
            }
            
            // if network doesn't have a source nor a sink, it trivially has a flow of 0! 
            if (serverA === this.source || serverB === this.source) {
                notHasSource = false;
            }
            if (serverA === this.sink || serverB === this.sink) {
                notHasSink = false;
            }
            
            let edge = [serverB, capacity];
            let currentEdgeList = graph.get(serverA);
            if (currentEdgeList === undefined) {  
                currentEdgeList = [edge];
            } else {
                currentEdgeList.push(edge);
            }
            graph.set(serverA, currentEdgeList);
        })

        if (notHasSource || notHasSink) {
            let err = "Error: Network doesn't have well-defined source or sink. This network trivially has a flow of 0";
            alert(err);
            return err;
        }
        return graph;
    }

    findPathsOnGrid = (gridArray, graph, strategy) => {
        let currNodeCoord = null;
        let currNode = null;

        if (typeof graph == "string") {
            let err = "Error! Not a valid network!";
            alert(err);
            return err;
        }
        
        // keeps track of paths from different sources to their destinations
        let sourcesPathsList = new Map();

        let parsedSource = nodeParser(this.source,this.gridMaxX,this.gridMaxY);
        let parsedSink = nodeParser(this.sink,this.gridMaxX, this.gridMaxY);

        for (const [curr, targets] of graph) {
            let parsedCurr = nodeParser(curr, this.gridMaxX, this.gridMaxY);
            
            // add parseCurr to sourcesPathsList with an empty list of paths at first
            sourcesPathsList.set(parsedCurr, []);

            let randomColor = getRandomColor();
            targets.forEach(target => {

                let targetNode = target[0];
                let parsedTargetNode = nodeParser(targetNode, this.gridMaxX, this.gridMaxY);
                let capacity = +target[1];
                let foundPath = this.pathFinderHelper(gridArray, curr, targetNode, strategy);
                if (foundPath === "No Path found") {
                    alert("No path found between " + curr + " and " + targetNode);
                    return "Please redefine your network by spreading the nodes out further";
                }

                // add new paths to map
                let currPathsFromSourceList = sourcesPathsList.get(parsedCurr);
                currPathsFromSourceList.push(_.cloneDeep(foundPath));
                sourcesPathsList.set(parsedCurr, currPathsFromSourceList);

                let i = 0;
                while (foundPath.length !== 0) {
                    currNodeCoord = foundPath.shift();
                    currNode = gridArray[+currNodeCoord[0]][+currNodeCoord[1]]; 
                    // check if currNode is a source or a sink or none
                    if (nodeEqual(currNodeCoord,parsedSource)) {
                        currNode.isSource = true;
                    } else if (nodeEqual(currNodeCoord,parsedSink)) {
                        currNode.isSink = true;
                    }

                    if (currNode.type === "connected-server" || nodeEqual(currNodeCoord, parsedTargetNode) || nodeEqual(currNodeCoord, parsedCurr)) {
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



    pathFinderHelper(gridArray, source, target, strategy) { 
        let fringe = [source] 
        // parse string representation of a Node to an object
        let parsedSource = nodeParser(source, this.gridMaxX, this.gridMaxY);

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
            
            let parsedNode = nodeParser(currNode, this.gridMaxX, this.gridMaxY);
            
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
                path.unshift(nodeParser(currNode, this.gridMaxX, this.gridMaxY));
                currNode = parent.get(currNode);
            }
            return path;
        }
        return "No Path found";
    }
}

export default GridPathFinder;