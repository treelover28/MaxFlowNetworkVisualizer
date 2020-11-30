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

    getGeneratedGrid = (event) => {
        let rawDefinition = this.state.networkDefinition.trim();
        // get deep copy of gridArray from state
        let gridArrGen = _.cloneDeep(this.state.gridArray);
        let pathFinder = new PathFinder(gridArrGen, rawDefinition, "bfs");

        let grid = pathFinder.getGridWithPaths();
    
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