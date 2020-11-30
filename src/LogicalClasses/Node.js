class Node {
  
    constructor(type, flow, capacity, color = "lightgreen") { 
        this.type = type;
        this.flow = flow;
        this.capacity = capacity;
        this.color = color;
        
    }

}

export default Node;