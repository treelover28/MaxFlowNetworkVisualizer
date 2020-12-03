import React from "react";

import "../styles/Instruction.css";

class Instruction extends React.Component {
    constructor(props) {
        super(props);
        this.state =  {
            sampleProgram1 :
                `
                source: (4,0) 
                sink: (5,19) 
                ------------------ 
                (4,0)->8->(4,6); 
                (4,0)->10->(0,2);
                (0,2)->9->(4,6);
                (4,0)->8->(9,2);
                (9,2)->10->(5,19);
                (4,6)->9->(5,19);
                `,
            sampleProgram2 :  
                `
                source: (5,0) 
                sink: (6,19)
                -----------------
                (5,0)->10->(1,4);
                (5,0)->9->(5,4);
                (5,0)->8->(9,4);
                (1,4)->5->(0,6);
                (1,4)->8->(2,6);
                (5,4)->4->(3,7);
                (5,4)->8->(5,7);
                (7,7)->10->(5,7);
                (5,4)->9->(7,7);
                (5,7)->6->(5,10);
                (3,7)->5->(5,10);
                (5,10)->6->(7,10);
                (12,7)->5->(7,7);
                (9,4)->5->(12,7);
                (0,6)->8->(0,13);
                (2,6)->5->(0,6);
                (7,10)->8->(6,19);
                (0,13)->10->(6,19);
                (12,7)->6->(7,10);`
        }
    };


    render = () => {
        return (
            <div className="instruction">
                <div className="guide">
                <h2>Hi! Welcome to my Network Max Flow Visualizer! </h2>
                <h4>To start, you will need to define your network! Follow the following steps</h4>
                <ol>
                    <li>{"Type in where you SOURCE node is using the format (x,y)"}</li>
                    <li>{"Type in where your SINK node is using the format (x,y)"}</li>
                    <li>Define your network architecture, by specifying the edges connecting the nodes 
                        in your network! Here are the steps:
                        <ul>
                            <li>Type in the coordinate of your first node using the same (x,y) format. 
                                <strong>Make sure there is no space between the characters</strong></li>
                            <li>Follow by typing in a right arrow {"->"}, then type in the edge capacity</li>
                            <li>Type in another right arrow {"->"} </li>
                            <li>Type in the coordinate of the node to which the edge is connecting to, using (x,y) format</li>
                            <li> Finally terminate the current edge specification using a semi-colon {";"}</li>
                            <li>The format is like this: {"(x,y)->edge capacity->(x2,y2);"}</li>
                        </ul>
                    </li>
                    <li>You only need to specify which edge connects which two nodes. The visualizers will handle drawing the 
                        path representative of such edge in the grid-world! 
                    </li>     
                </ol>
                </div>
                <div>
                    <p>Here are some sample networks you can try out! Just copy and paste them to the appropriate places!</p>
                    <p>Note: for the source and sink, please only copy and paste the coordinates (x,y)</p>
                    <div className = "sampleNetworks">
                        <pre className = "sample">{this.state.sampleProgram1}</pre>
                        <pre className = "sample">{this.state.sampleProgram2}</pre>
                    </div>
                </div>
            </div>
        );
    }
}

export default Instruction;