import React from "react";
import Node from "../LogicalClasses/Node";
import PathFinder from "../LogicalClasses/PathFinder";

import _ from "lodash";

import "../styles/Board.css"
class Board extends React.Component {
   
    constructor(props) {
        super(props);
        this.state = {
            height : props.height,
            width :  props.width,
            gridArray :  this.getInitializeGrid(),
            nodeType : "server",
            possibleNodeTypes : ["empty", "server", "connection", "connected-server"],
            networkDefinition: "Format: (x1,y1)->capacity->(x2,y2);"

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
        let countEmpty = 0;
        let countServer = 0;
        for (let row = 0; row < this.state.height + 1; row++) {
            let cells = []
            for (let col = 0; col < this.state.width + 1; col++) {
                // if col = 0, push row number to first item 
                if (col === 0 & row === 0) {
                    idKey= "header";
                    className = "board-rows header";
                    value = "Row/Col";
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
                    value = `${newNode.flow}/${newNode.capacity}`;
                    className = "board-columns";
                    if (newNode.type !== "empty") {
                        className += ` ${newNode.type}`;
                        countServer++; 
                    } else{
                        countEmpty++;
                    }
                }
               
                cells.push(<td key = {idKey} id= {idKey} className = {className}>{value}</td>);  
            }
            idKey = `r${row}`;
            className = "board-rows";
            value = cells;
            tableRows.push(<tr key ={idKey} id= {idKey} className = {className}>{value}</tr>); 
        }
        console.log("empty: " + countEmpty + " , server: " + countServer);

        return (
                <table className="board">
                    <tbody>{tableRows}</tbody>
                </table>
        );
    };

    // highlightCell = (nodeId) => {
    //     // get node's coordinate in the grid
    //     let currNode = document.getElementById(nodeId);
    //     let nodeCoord = nodeId.split("-");

    //     // split into array of class attributes
    //     let classArr = currNode.className.split(" ");
        
    //     let currNodeStatus = this.state.gridArray[nodeCoord[0]][nodeCoord[1]].type;
        
    //     // node type after update
    //     let finalNodeType = this.state.nodeType;

    //     if (finalNodeType!== currNodeStatus) {
    //         // if the node type is different, the node is changing class.
           
    //         // thus, we remove all special nodeStatus in the class attribute
    //         for (let i = 0; i < this.state.possibleNodeTypes.length; i++) {
    //             let index = classArr.indexOf(this.state.possibleNodeTypes[i]);
    //             if (index !== -1) {
    //                 classArr.splice(index,1);
    //             }
    //         } 
    //         // insert the new node type to the class attribute
    //         classArr.push(finalNodeType);
    //     } else {
    //         // else if we are clicking on same node, just clear
    //         let indexOfHighlighted = classArr.indexOf(finalNodeType);
    //         classArr.splice(indexOfHighlighted, 1);
    //         // finalNodeType is an "empty" node
    //         finalNodeType = this.state.possibleNodeTypes[0];
    
    //     }
    //     // set node's new class attribute
    //     currNode.className = classArr.join(" ");

    //     // deep copy to update array in state
    //     let gridArray_tmp = _.cloneDeep(this.state.gridArray);
    //     gridArray_tmp[nodeCoord[0]][nodeCoord[1]].type = finalNodeType;
    //     alert(gridArray_tmp[nodeCoord[0]][nodeCoord[1]])

    //     this.setState({
    //         nodeType : finalNodeType,
    //         gridArray: gridArray_tmp
    //     }, ()=> {
    //         console.log(this.state.gridArray[nodeCoord[0]][nodeCoord[1]]);
    //     })
        
    // }

    // setNodeType = (index) => {
    //     this.setState( {nodeType : this.state.possibleNodeTypes[index]});  
    // }

   
    networkDefinitionHandler = (event) => {
        this.setState({
            networkDefinition: event.target.value
        }, ()=> {
            console.log(this.state.networkDefinition);
        });
    }

    getGeneratedGrid = (event) => {
        // alert("Get executed");
        // alert(this.state.networkDefinition);
        let rawDefinition = this.state.networkDefinition.trim();
        // let edgeDefinitions = rawDefinition.split(";").filter(x=>x);
        // get deep copy of gridArray from state
        let gridArrGen = _.cloneDeep(this.state.gridArray);
        let pathFinder = new PathFinder(gridArrGen, rawDefinition, "bfs");

        let grid = pathFinder.getGridWithPaths();
        // // set server
        // edgeDefinitions.forEach(edgeDef => {
        //     let edgeDefArr = edgeDef.split("->").filter(x=>x);
        //     let serverA = edgeDefArr[0].trim();
        //     let capacity = +edgeDefArr[1].trim();
        //     let serverB = edgeDefArr[2].trim();
           
        //     gridArrGen[+serverA[1]][+serverA[3]] = new Node(this.state.possibleNodeTypes[1], 0, capacity)
        //     gridArrGen[+serverB[1]][+serverB[3]] = new Node(this.state.possibleNodeTypes[1], 0, capacity)
        // });
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
            
            this.setState({
                gridArray: generatedGrid
            }, () => {
                return this.drawBoard();
            }); 
        });

         
    }

    submitHandler = (event) => {
        // Form submission automattically rerender/refreshes the page
        // prevent this behavior to display board
        event.preventDefault();
        return this.generateBoard();

        

    }

    render() {
        let board = null
        return(
            <article className="max-flow-visualizer">
                <h1>MAX FLOW VISUALIZER BY KHAI LAI</h1>
                <div className="boardDiv">
                    <form id="network-form" onSubmit={(event) => {board = this.submitHandler(event)}}>
                        <label htmlFor="network-def"> Network Definition</label>
                        <textarea name="network-def" placeholder={this.state.networkDefinition} 
                                  onChange={this.networkDefinitionHandler} rows={10}>
                            </textarea>
                        <input type="submit" value="Submit"></input>
                    </form>
                    {board == null? this.drawBoard() : board}
                </div>
            </article>
        )
    }


}

export default Board;