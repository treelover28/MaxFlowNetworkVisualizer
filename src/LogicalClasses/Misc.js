
export const randInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
}
    
export const getRandomColor = () => {        
    return `rgb(${randInt(0,255)},${randInt(0,255)},${randInt(200,220)})`;
}





