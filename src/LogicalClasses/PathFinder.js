import Node from "./Node";

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
        alert("processed definition");
        return sourceTargetDict;
    }

    BFS = (gridArray, sourceTargetDict) => {
        let currNodeCoord = null;
        let currNode = null;
        for (const [source, targets] of sourceTargetDict) {
            console.log(source);
            console.log(targets);
            targets.forEach(target => {
                console.log("enter target;s foreach")
                let targetNode = target[0];
                let capacity = +target[1];
                let foundPath = this.BFSHelper(gridArray, source, targetNode);
                console.log("get out bfs helper");
                if (foundPath === "No Path found") {
                    alert("No path found between " + source + " and " + targetNode);
                    return "Please redefine your network by spreading the nodes out further";
                }

                let i = 0;
                while (foundPath.length !== 0) {
                    console.log("enter while(found path) at iteration i = " + i);
                    currNodeCoord = foundPath.shift();
                    currNode = gridArray[+currNodeCoord[1]][+currNodeCoord[3]]; 
                    if (currNode.type === "connected-server" || currNodeCoord === source || currNodeCoord === targetNode) {
                        currNode.type = "connected-server";
                    }
                    else {
                        currNode.type = "connection";
                        currNode.capacity = capacity;
                    }
                    i++;
                }
            }
            )  
        }
        this.gridArray = gridArray;
        
        return gridArray; 
    }

    BFSHelper(gridArray, source, target) { 
        let fringe = [source]
        let currX = +source[1];
        let currY = +source[3];
        let visitedNode = new Set();
        let currNode;
        let parent = new Map();
        parent.set(source, null);
        visitedNode.add(source);
        while (fringe.length !== 0) {
            currNode = fringe.shift();
        
            currX = +currNode[1];
            currY = +currNode[3];

            if (currNode === target) {

                break;
            }
            
            // visitedNode.add(currNode);
            // console.log("enter bfs-helper while");
            let rightNode = "(" + (currX + 1) + "," + currY +")";
            let leftNode = "(" + (currX  - 1) + "," + currY +")";
            let topNode = "(" + (currX) + "," + (currY + 1) +")";
            let botNode = "(" + (currX) + "," + (currY - 1) +")";

            if ((currX+1)< gridArray.length && !visitedNode.has(rightNode) && (gridArray[currX + 1][currY].type === "empty" || rightNode === target)) {
                fringe.push(rightNode);
                // console.log("added node " + rightNode);
                parent.set(rightNode, currNode);
                visitedNode.add(rightNode);
            }
            if ((currX-1) >= 0 && !visitedNode.has(leftNode) && (gridArray[currX - 1][currY].type === "empty"  || leftNode === target)) {
                fringe.push(leftNode);
                // console.log("added node " + leftNode);
                parent.set(leftNode, currNode);
                visitedNode.add(leftNode);
            }
            if ((currY + 1) < gridArray[0].length && !visitedNode.has(topNode) && (gridArray[currX][currY + 1].type === "empty"  || topNode === target)) {
                fringe.push(topNode);
                parent.set(topNode, currNode);
                // console.log("added node " + topNode);
                visitedNode.add(topNode);
            }
            if ((currY - 1)>= 0 && !visitedNode.has(botNode) && (gridArray[currX][currY - 1].type === "empty"  || botNode === target) ) {
                fringe.push(botNode);
                parent.set(botNode, currNode);
                // console.log("added node " + botNode);
                visitedNode.add(botNode);

            }    
        }

        // console.log("finished BFS-helper");
        if (currNode === target) {
            // console.log("got in if curr == target");
            let path = []
            while(parent.get(currNode) !== null) {
                // console.log("travelling up!");
                path.unshift(currNode);
                currNode = parent.get(currNode);
            }
            path.unshift(source);

            console.log(path);
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