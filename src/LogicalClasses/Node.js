class Node {
  
    constructor(type, flow, capacity, color = "lightgreen") { 
        this.type = type;
        this.flow = flow;
        this.capacity = capacity;
        this.color = color;
        this.isSource = false;
        this.isSink = false;
        this.inAugmentedPath = false;
        
    }

}

export default Node;