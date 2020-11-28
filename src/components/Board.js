import React from "react";
import Node from "../LogicalClasses/Node";

import "../styles/Board.css"
class Board extends React.Component {
   
    constructor(props) {
        super(props);
        this.state = {
            height : props.height,
            width :  props.width,
            board: null,
            gridArray :  [],
            nodeType : "server",
            possibleNodeTypes : ["empty", "server", "connection"]

        }   
    }

    // createInteractiveBoard = () => {
    //     this.createBoard();
    //     this.eventListeners();
    // }
    
    createBoard = () => {
        let tableRows = [];
        let gridArray_tmp = [];
        for (let row = 0; row < this.state.height; row++) {
            let cells = []
            let curr_row = []
            for (let col = 0; col < this.state.width; col++) {
                let nodeId = `${row}-${col}`;
                curr_row.push(new Node("empty", 0, 5))
                cells.push(<td id= {nodeId} className = "board-columns" onClick ={() => this.highlightCell(nodeId)}>
                    {`(${curr_row[col].flow},${curr_row[col].capacity})`}
                </td>);
            }
            tableRows.push(<tr id= {`r${row}`} className = "board-rows">{cells}</tr>); 
            gridArray_tmp.push(curr_row)
        }
        this.setState({
            gridArray : gridArray_tmp,
            board: (
                <table className="board">
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            ) 
        })
        // return tableRows;
    };

    highlightCell = (nodeId) => {
        // console.log("Clicked on " + nodeId);
        // get node's coordinate in the grid
        let currNode = document.getElementById(nodeId);
        let nodeCoord = nodeId.split("-");

        // split into array of class attributes
        let classArr = currNode.className.split(" ");
        
        let currNodeStatus = this.state.gridArray[nodeCoord[0]][nodeCoord[1]].type;
        
        // node type after update
        let finalNodeType = this.state.nodeType;

        if (finalNodeType!== currNodeStatus) {
            // if the node type is different, the node is changing class.
           
            // thus, we remove all special nodeStatus in the class attribute
            for (let i = 0; i < this.state.possibleNodeTypes.length; i++) {
                let index = classArr.indexOf(this.state.possibleNodeTypes[i]);
                if (index !== -1) {
                    classArr.splice(index,1);
                }
            } 
            // insert the new node type to the class attribute
            classArr.push(finalNodeType);
        } else {
            
            // else if we are clicking on same node, just clear
            let indexOfHighlighted = classArr.indexOf(finalNodeType);
            classArr.splice(indexOfHighlighted, 1);
            // finalNodeType is an "empty" node
            finalNodeType = this.state.possibleNodeTypes[0];
    
        }
        // set node's new class attribute
        currNode.className = classArr.join(" ");
        // change text content of current node to display its node status 
        currNode.textContent =  finalNodeType;

        // deep copy to update array in state
        let gridArray_tmp = JSON.parse(JSON.stringify(this.state.gridArray));
        gridArray_tmp[nodeCoord[0]][nodeCoord[1]].type = finalNodeType;

        this.setState({
            nodeType : finalNodeType,
            gridArray: gridArray_tmp
        }, ()=> {
            console.log(this.state.gridArray[nodeCoord[0]][nodeCoord[1]]);
        })
        
        // console.log(this.nodeType);
    }

    setNodeType = (index) => {
        this.setState( {
                nodeType : this.state.possibleNodeTypes[index]
            }
        );  
    }
    
    render() {
        return(
            <div className="boardDiv">
                <p>{this.state.nodeType}</p>
                <button onClick = {()=> this.setNodeType(1)}>Server Node</button>
                <button onClick = {()=> this.setNodeType(2)}>Connection Node</button>
                {this.state.board === null? this.createBoard(): this.state.board}
            </div>
        )
    }


}

export default Board;