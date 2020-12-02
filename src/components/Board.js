import React from "react";
import Node from "../LogicalClasses/Node";
import GridPathFinder from "../LogicalClasses/GridPathFinder";
import NetworkFlow from "../LogicalClasses/NetworkFlow";
import {nodeParser, nodeEqual} from "../LogicalClasses/Misc";

import _ from "lodash";
import "../styles/Board.css"
class Board extends React.Component {
    // TODO : MAKES IT WORKS WITH BACKWARD EDGES
    // TODO : INCREMENTAL IMPROVEMENT OF NETWORK
   
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
            strategy: "None"
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
            sink : event.target.value
        }, () => {console.log(this.state.sink)});
    }

    sourceHandler = (event) => {
        this.setState({
            source : event.target.value
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
        
        console.log(augmentingPath);
        let curr = this.state.source;
        // let parsedCurr = nodeParser(this.state.source, this.state.gridArray.length, this.state.gridArray[0].length);
        let next = null;
        let pathsFromCurr = null;
        let paths = this.state.paths;

        let minResidual = Infinity;

        let augmentingPathInGrid = [];
        augmentingPath.forEach((edge)=> {
            next = edge.target;
            let parsedNext = nodeParser(next, this.state.gridArray.length, this.state.gridArray[0].length);
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
            augmentingPathInGrid = augmentingPathInGrid.concat(path);
            // advance curr to target 
            curr = next;
        })

        augmentingPathInGrid.forEach((node) => {
            improvedGridArray[node[0]][node[1]].flow = minResidual;
        })
        return improvedGridArray;   
    }

    setStrategy = (strategy) => {
        this.setState({
            strategy: strategy
        }, ()=> {
            let grid = this.maxFlowBoard(strategy);
            this.setState({
                gridArray : grid
            }, ()=> {
                return this.drawBoard();
            }); 
        })
    }

    submitHandler = (event) => {
        // Form submission automattically rerender/refreshes the page
        // prevent this behavior to display board
        event.preventDefault();
        return this.generateBoard();
    }

    render() {
        let board = null;

        let algoChooser = (
            <div id="hyperparam">
                <h2>Please choose which max flow algorithm you wish to use:</h2>
                <button onClick={()=> {board = this.setStrategy("Ford-Fulkerson")}}>Ford-Fulkerson</button>
                <p>Description of Ford-Fulkerson... blah blah</p>
                <button onClick={()=> {board = this.setStrategy("Edmonds-Karp")}}>Edmonds-Karp</button>
                <p>Description of Edmonds-Karp... blah blah</p>
                {this.state.strategy !== "None"? (
                    <div>
                        <p> You chose {this.state.strategy}</p>
                    </div>
                    ): null}
            </div>
        );


        return(
            <article className="max-flow-visualizer">
                <div className="boardDiv">
                    <form id="network-form" onSubmit={(event) => {board = this.submitHandler(event)}}>
                        <label htmlFor="network-def"> Network Definition</label>
                        <input placeholder="Type coordinate of source node using format (x,y)" onChange={this.sourceHandler}></input>
                        <input placeholder="Type coordinate of sink node using format (x,y)" onChange={this.sinkHandler}></input>
                        <textarea name="network-def" placeholder={this.state.networkDefinition} 
                                  onChange={this.networkDefinitionHandler} rows={10}>
                            </textarea>
                        <input type="submit" value="Submit"></input>
                    </form>
                    {this.state.hasNetworkBoard? algoChooser: null}
                    {board == null? this.drawBoard() : board}
                </div>
            </article>
        )
    }


}

export default Board;