import React from "react";
import Node from "../LogicalClasses/Node";

import "../styles/Board.css"
class Board extends React.Component {
   
    constructor(props) {
        super(props);
        this.height = props.height;
        this.width =  props.width;
        this.gridArray =  [];
        this.nodeType = "server"; 
        this.possibleNodeTypes = ["empty", "server", "connection"];
    }

    createInteractiveBoard = () => {
        this.createBoard();
        this.eventListeners();
    }
    
    createBoard = () => {
        let tableRows = [];
        for (let row = 0; row < this.height; row++) {
            let cells = []
            let curr_row = []
            for (let col = 0; col < this.width; col++) {
                let nodeId = `${row}-${col}`;
                curr_row.push(new Node("empty", 0, 5))
                cells.push(<td id= {nodeId} className = "board-columns" onClick ={() => this.highlightCell(nodeId)}>
                    {`(${curr_row[col].flow},${curr_row[col].capacity})`}
                </td>);
            }
            tableRows.push(<tr id= {`r${row}`} className = "board-rows">{cells}</tr>); 
            this.gridArray.push(curr_row)
        }
        return tableRows;
    };

    highlightCell = (nodeId) => {
        // console.log("Clicked on " + nodeId);
        let currNode = document.getElementById(nodeId);
        let nodeCoord = nodeId.split("-");
        let classArr = currNode.className.split(" ");
        
        
        let currNodeStatus = this.gridArray[nodeCoord[0]][nodeCoord[1]].type;
        // console.log("currNodeStatus = " + currNodeStatus);
        // console.log("this.nodeType = " + this.nodeType);
        
        if (this.nodeType !== currNodeStatus) {
            // if the node type is different, the node is changing class
            // // remove all special nodeStatus in the className HTML attribute
            for (let i = 0; i < this.possibleNodeTypes.length; i++) {
                let index = classArr.indexOf(this.possibleNodeTypes[i]);
                if (index !== -1) {
                    classArr.splice(index,1);
                }
            } 
            classArr.push(this.nodeType);
            // console.log("change class");
            this.gridArray[nodeCoord[0]][nodeCoord[1]].type = this.nodeType;
            currNode.textContent = this.nodeType;
        } else {
            // else if we are clicking on same node, just clear
            let indexOfHighlighted = classArr.indexOf(this.nodeType);
            classArr.splice(indexOfHighlighted, 1);
            this.gridArray[nodeCoord[0]][nodeCoord[1]].type = this.possibleNodeTypes[0];
            currNode.textContent =  this.possibleNodeTypes[0];
        }
        currNode.className = classArr.join(" ");
        // console.log(this.nodeType);
    }

    setNodeType = (index) => {
        this.nodeType = this.possibleNodeTypes[index];
    }
    
    render() {
        return(
            <div className="boardDiv">
                <p>{this.nodeType}</p>
                <button onClick = {()=> this.setNodeType(1)}>Server Node</button>
                <button onClick = {()=> this.setNodeType(2)}>Connection Node</button>
                <table className = "board">
                    <tbody>   
                        {this.createBoard()}
                    </tbody>
                </table>
            </div>
        )
    }


}

export default Board;