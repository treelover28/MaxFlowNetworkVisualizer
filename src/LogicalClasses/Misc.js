
export const randInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
}
    
export const getRandomColor = () => {        
    return `rgb(${randInt(0,255)},${randInt(0,255)},${randInt(200,220)})`;
}


export const nodeParser = (coordString, maxX, maxY) => {
    try {
        let coordinate = coordString.split(/,|\)|\(/).filter(x=>x);
        console.log(`maxX: ${maxX}, maxY: ${maxY}`)
        if (coordinate[0] >= maxX || coordinate[0] < 0 || coordinate[1] >= maxY || coordinate[1] < 0) {
            return "Invalid Node Coordinate";
        } 
        return coordinate
    } catch(error) {
        return "Invalid Node Format";
    }
}

export const nodeEqual = (nodeA, nodeB) => {
    console.log(`${nodeA[0]} and ${nodeA[1]}`);
    return +nodeA[0] === +nodeB[0] && +nodeA[1] === +nodeB[1]; 
}

