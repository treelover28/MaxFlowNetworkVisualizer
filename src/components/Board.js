import React from "react";
import Node from "../LogicalClasses/Node";
import GridPathFinder from "../LogicalClasses/GridPathFinder";
import NetworkFlow from "../LogicalClasses/NetworkFlow";
import Instruction from "./Instruction";
import {nodeParser, nodeEqual} from "../LogicalClasses/Misc";

import _ from "lodash";
import "../styles/Board.css"
class Board extends React.Component {
    // TODO : INCREMENTAL IMPROVEMENT OF NETWORK
        // - Implement next button
        // - highlight augmenting path 
        // - remove node value from previous augmenting path
        // - fix the infinite loop error somewhere
   
    constructor(props) {
        super(props);
        this.state = {
            height : props.height,
            width :  props.width,
            gridArray :  this.getInitializeGrid(),
            nodeType : "server",
            possibleNodeTypes : ["empty", "server", "connection", "connected-server"],
            networkDefinition: "Format: (x1,y1)->capacity->(x2,y2);",
            paths: [], 
            source: "null",
            sink: "null",
            hasNetworkBoard : false,
            strategy: "None",
            maxFlowReached : false,
            currentFlow: 0
        } 
    }

    getInitializeGrid = () => {
        let gridArr = []
        for (let row = 0; row < this.props.height; row++) {
            let currRow = []
            for (let col = 0; col < this.props.width; col++) {
                console.log("initialized with empty");
                currRow.push(new Node("empty", 0, 0));
            }
            gridArr.push(currRow);
        }

        return gridArr;
    }
    
    drawBoard = () => {
        // draw board from grid
        let tableRows = [];
        let idKey;
        let className;
        let value;
        
        for (let row = 0; row < this.state.height + 1; row++) {
            let cells = []
            for (let col = 0; col < this.state.width + 1; col++) {
                let style = {};
                // if col = 0, push row number to first item 
                if (col === 0 & row === 0) {
                    idKey= "header";
                    className = "board-rows header";
                    value = "X / Y";
                }
                else if (col === 0) {
                    // at column 0, but a non-zero row, fill in row number
                    idKey = `rheader-${row}`;
                    className = "board-rows rheader";
                    value = row - 1;
                }
                else if (row === 0) {
                    idKey = `cheader-${col}`;
                    className =  "board-rows cheader";
                    value = col - 1;
                }
                else {
                    // push node object into GridArray
                    let newNode = this.state.gridArray[row-1][col-1];
                    idKey = `${row - 1}-${col-1}`;
                    value = " ";
                    className = "board-columns";
                    
                    if (newNode.type !== "empty") {
                        className += ` ${newNode.type}`;
                        
                        if (newNode.type === "connection") {
                            style = {backgroundColor: newNode.color};
                            value = `${newNode.flow}/${newNode.capacity}`;
                        }
                        if(newNode.type === "connected-server") {
                            style = {backgroundColor: newNode.color};
                            value = "server";
                        }
                        if (newNode.isSource) {
                            value = "SOURCE";
                        } else if (newNode.isSink) {
                            value = "SINK";
                        }
                    }

                    if (newNode.inAugmentedPath) {
                        // className += " inPath";
                        style.border = "8px solid coral";
                    }
                }
               
                cells.push(<td key = {idKey} id= {idKey} className = {className} style = {style}>{value}</td>);  
            }
            idKey = `r${row}`;
            className = "board-rows";
            value = cells;
            tableRows.push(<tr key ={idKey} id= {idKey} className = {className}>{value}</tr>); 
        }
        return (
                <table className="board">
                    <tbody>{tableRows}</tbody>
                </table>
        );
    };

    
    networkDefinitionHandler = (event) => {
        this.setState({
            networkDefinition: event.target.value
        }, ()=> {
            console.log(this.state.networkDefinition);
        });
    }
    
    sinkHandler = (event) => {
        this.setState({
            sink : event.target.value.trim()
        }, () => {console.log(this.state.sink)});
    }

    sourceHandler = (event) => {
        this.setState({
            source : event.target.value.trim()
        }, () => {console.log(this.state.source)});
    }

    getGeneratedGrid = (event) => {
        let rawDefinition = this.state.networkDefinition.trim();
        // get deep copy of gridArray from state
        let gridArrGen = _.cloneDeep(this.state.gridArray);
        let pathFinder = new GridPathFinder(gridArrGen, this.state.source, this.state.sink, rawDefinition, "bfs");

        let gridPaths  = pathFinder.getGridWithPaths();
        if (typeof gridPaths === "string") {
            alert(gridPaths);
            return gridPaths;
        }

        let grid = gridPaths[0];
        let paths = gridPaths[1];
        
        this.setState({
            paths: paths
        });
    
        return grid;  
    }

    generateBoard = (event) => {
        // clear board first
        let initializedGrid = this.getInitializeGrid();
        this.setState({
            gridArray : initializedGrid
        }, ()=> {
            // call back hell lol
            // will fix later
            // change to grid with user's network definition
            let generatedGrid = this.getGeneratedGrid();
            if (typeof generatedGrid != "string") {
                this.setState({
                    gridArray: generatedGrid
                }, () => {
                    this.setState({
                        hasNetworkBoard : true
                    });
                    return this.drawBoard();
                }); 
            }
            
            
        });
    }

    maxFlowBoard = (strategy) => {
        let searchType = "dfs";
        if (strategy === "Edmonds-Karp") {
            searchType = "bfs";
        }
            
        let networkFlow = new NetworkFlow(this.state.gridArray, this.state.paths, this.state.source, this.state.sink, searchType);
        let augmentingPath = networkFlow.getAugmentingPath();
        
        // if no more path, max flow reach
        if (typeof augmentingPath === "string") {
            alert(augmentingPath);
            return augmentingPath;
        }
    
        // get deep copy of this.state.gridArray;
        let improvedGridArray = _.cloneDeep(this.state.gridArray);
        
        if (this.state.currentFlow !== 0) {
            // unhighlight previous path
            for (let r = 0; r < this.state.height; r++) {
                for (let c = 0; c < this.state.width; c++) {
                    improvedGridArray[r][c].inAugmentedPath = false;
                }
            }
        }
        
        console.log(augmentingPath);
        let curr = this.state.source;
        // let parsedCurr = nodeParser(this.state.source, this.state.gridArray.length, this.state.gridArray[0].length);
        let next = null;
        let pathsFromCurr = null;
        let paths = this.state.paths;

        let minResidual = Infinity;

        let forwardEdgesInAugmentingPath = [];
        let backwardEdgesInAugmentingPath = [];

        let edgeType = null;
        augmentingPath.forEach((edge)=> {
            edgeType = edge.edgeType;
            next = edge.target;

            if (edgeType === "backward") {
                // swap curr and next 
                // since pathsFromCurr only store paths corresponding to forward edges in an augmented graph 
                let tmp = next;
                next = curr;
                curr = tmp;
            }
            // parse node "next" into coordinate representation since nodes stored in paths are in coordinate form
            // allow easier comparison using helper function nodeEqual
            let parsedNext = nodeParser(next, this.state.gridArray.length, this.state.gridArray[0].length);

            // allowed augmentation in a flow network at any time 
            // depends on the edge with the smallest flow in the augmenting path of
            // that respective time's residual network
            minResidual = Math.min(minResidual, edge.residual);
            // get all paths from current node
            pathsFromCurr = paths.get(curr);
            // find path from current node to target node in grid
            let path_idx = 0;
            let foundPath = false;
            let path = null;
            while(path_idx < pathsFromCurr.length && !foundPath) {
                path = pathsFromCurr[path_idx];

                if (nodeEqual(parsedNext, path[path.length - 1])) {
                    foundPath = true; 
                }
                path_idx++;
            }
            if (edgeType === "backward") {
                // switch back to take on next edge in augmenting path
                let tmp = next;
                next = curr;
                curr = tmp;
                // since backward edges DECREASES the flow along that edge in the real graph
                // must store them separately to handle flow decrease.
                backwardEdgesInAugmentingPath = backwardEdgesInAugmentingPath.concat(path);
            } else {
                forwardEdgesInAugmentingPath = forwardEdgesInAugmentingPath.concat(path);
            }
            // advance curr to target 
            curr = next;
        })

        forwardEdgesInAugmentingPath.forEach((node) => {
            // increase flow of forward edges
            improvedGridArray[node[0]][node[1]].flow += minResidual;
            improvedGridArray[node[0]][node[1]].inAugmentedPath = true;
        });

        backwardEdgesInAugmentingPath.forEach((node) => {
            // decrease flow of backward edges
            improvedGridArray[node[0]][node[1]].flow -= minResidual;
            improvedGridArray[node[0]][node[1]].inAugmentedPath = true;
        });


        return improvedGridArray;   
    }

    runMaxFlowAlgorithm = (strategy) => {
        this.setState({
            strategy: strategy
        }, ()=> {
            let grid = this.maxFlowBoard(strategy);
            if (typeof grid !== "string") {
                let parsedSink = nodeParser(this.state.source, grid.height, grid[0].height);
                let currFlow = grid[parsedSink[0]][parsedSink[1]].flow;

                this.setState({
                    gridArray : grid,
                    currentFlow: currFlow
                }, ()=> {
                    return this.drawBoard();
                }); 
            }
            else {
                this.setState({
                    maxFlowReached : true
                })
            }
        })
    }

    submitHandler = (event) => {
        // Form submission automattically rerender/refreshes the page
        // prevent this behavior to display board
        event.preventDefault();
        this.setState({
            currentFlow : 0,
            maxFlowReached : false,
            strategy: "None"
        }, () => {
            return this.generateBoard();
        });
    }

    render() {
        let board = null;
        let algoChooser = (
            <div id="algo-chooser">
                <h2>The flow through your network may still be improved!</h2>
                <h3>Keep clicking the algorithm buttons to incrementally improve the flow through your network.</h3>
                <div className = "algo-board">
                    <div id="ford-fulkerson">
                        <button onClick={()=> {board = this.runMaxFlowAlgorithm("Ford-Fulkerson")}}>Ford-Fulkerson</button>
                        <p>Ford Fulkerson finds any arbitary path in the Residual Network and uses such path to augment the flow. It keeps
                            doing so until there is absolutely no more augmenting path possible! 
                            
                        </p> 
                        <p>My implementation of 
                            Ford-Fulkerson employs the standard Depth First Search to find the augmenting path.Due to this strategy,
                            certain network architecture may causes Ford-Fulkerson to runs in exponential time! 
                        </p>
                        </div>
                    <div id="edmonds-karp">
                        <button onClick={()=> {board = this.runMaxFlowAlgorithm("Edmonds-Karp")}}>Edmonds-Karp</button>
                        <p>Edmonds-Karp improves upon Ford-Fulkerson by not finding any arbitary augmenting path,
                            but rather the shortest augmenting path in term of the number of nodes it has to travel.
                        </p> 
                        <p> Thus, Edmonds-Karps uses Breadth First Search to find the augmenting path. The running time 
                            is polynomial in term of the number of nodes and vertices in the network. 
                        </p>
                    </div>   
                </div>
                
                {this.state.strategy !== "None"? (
                    <div>
                        <p> You chose {this.state.strategy}</p>
                    </div>
                    ): null}
            </div>
        );

        let currentFlowReport = (
            <div id="flow-report">
                <h2>Current flow through this graph is: </h2>
                <h1 id="flow-value">{this.state.currentFlow}</h1>
            </div>
        );

        let boardReadingGuide = (
            <div>
                <h4>Note: Paths from the same origin/node will have the same color! This is to indicate where the edge is coming from!</h4>
                <h4>After running either of the max-flow algorithm, the augmenting path through the network will be highlighted!</h4>
            </div>
        )

        return(
            <article className="max-flow-visualizer">
                <Instruction></Instruction>
                <div className="board-div">
                    <form id="network-form" onSubmit={(event) => {board = this.submitHandler(event)}}>
                        <label htmlFor="network-def"> Network Definition</label>
                        <input placeholder="Type coordinate of source node using format (x,y)" onChange={this.sourceHandler}></input>
                        <input placeholder="Type coordinate of sink node using format (x,y)" onChange={this.sinkHandler}></input>
                        <textarea name="network-def" placeholder={this.state.networkDefinition} 
                                  onChange={this.networkDefinitionHandler} rows={10}>
                            </textarea>
                        <input type="submit" value="Submit"></input>
                    </form>
                    {/* Only display algorithm choosing panel while max flow has not been reached */}
                    {this.state.hasNetworkBoard && !this.state.maxFlowReached? algoChooser: null}
                    
                </div>
                <div className="boardReadingGuide">
                    {this.state.hasNetworkBoard? currentFlowReport: null}
                    {this.state.hasNetworkBoard? boardReadingGuide: null}
                </div>
                <div>{board == null? this.drawBoard() : board}</div>
                
            </article>
        )
    }


}

export default Board;