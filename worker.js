const colours = {
    red: { r: 254, g: 0, b: 0 },
    blue: {r:0, g:228, b:255},
    green: {r:36, g:254, b:0},
    bgColour: { r: 0, g: 0, b: 0 }
}

const maxDistance = 125;

let layout = {
    pixels: null,
    width: 0,
    height: 0,
    coordinatesToMatrixIndex: function(x, y){
        /* data[] array position for pixel [x,y]. Rembember to multiply by 4 if you are 
        dealing with a pixel array as made up of array entry for each RGBA value 
        */
        return y * this.width + x;
    },
    getImageData : function(x, y){
        let n =  this.coordinatesToMatrixIndex(x,y) * 4;
        return {
            data: [
                this.pixels.data[n],
                this.pixels.data[n+1],
                this.pixels.data[n+2],
                this.pixels.data[n+3]
            ]
        }
    }
}

let boundingBox = [];
let outputJSON = null;
let idx = 0;
let state = null;

self.onmessage = function(e) {
    switch(e.data.id){
        case "pixelData":
            state = e.data.payload.state;
            layout.pixels = e.data.payload.pixels;
            layout.width = e.data.payload.pixels.width;
            layout.height = e.data.payload.pixels.height
            postMessage ({id: "notification", payload: "data loaded"});
            processImage();
        break;
    }
};

function scanPixel(x, y, increment, pixelColour, target = "y") {
    let targetColourFound = false;
    let count = 0;
    
    while (!targetColourFound) {
        let pixel = target == "y" ? layout.getImageData(x, y + count).data : layout.getImageData(x + count, y).data;
        targetColourFound = (pixel[0] == pixelColour.r && pixel[1] == pixelColour.g && pixel[2] == pixelColour.b);
        if (count > maxDistance) return false;
        if (increment) count++;
        else count--;
    }
    return count;
}

function addToCollection(xMid, yMid, xLeft, xRight, yTop, yBottom ){
    let diameter =  xRight - xLeft;
    //Normalise the figure by diving x vars by the width, y vars by the height.  This will mean that we can use any width and height and just multiple x values by the new width and y values against the new height
    const customWidth = state.dimensions.type.toLowerCase() == "custom" ?  state.dimensions.width : 1;
    const customHeight = state.dimensions.type.toLowerCase() == "custom" ?  state.dimensions.height : 1;
    let normalisedCoords = {
        diameter: diameter,
        topLeft: {
            x: (xLeft / layout.width) * customWidth,
            y: (yTop / layout.height) * customHeight,
        },
        bottomRight: {
            x: (xRight / layout.width) * customWidth,
            y: (yBottom / layout.height) * customHeight,
        },
        mid: { x: (xMid / layout.width) * customWidth, y: (yMid / layout.height) * customHeight },
    };
    boundingBox.push({
        id: idx++,
        xMid: xMid,
        yMid: yMid,
        xLeft: xLeft,
        xRight: xRight,
        yTop: yTop,
        yBottom: yBottom,
        normalised: normalisedCoords,
    });
}

function createOutput(){
    //Create the JSON for the output
    outputJSON = JSON.stringify(
        boundingBox.map((obj) => {
            return obj.normalised;
        })
    );
    postMessage ({id: "result", type:"json", payload: outputJSON});
}

function processImage(){  
    boundingBox = [];
    //The target hole colour that we want to generate a coordinate for
    const target = colours[state.output.colour.toLowerCase()];
    console.log("target", target)
    for (let y = 0; y < layout.height; y++) {
        for (let x = 0; x < layout.width; x++) {
            //Have we found a black pixel?
            let pixel = layout.getImageData(x, y).data;
            if (pixel[0] == target.r && pixel[1] == target.g && pixel[2] == target.b) {
                let yTop = y;
                //Find the next bgColour pixel scanning down through the circle
                let count = scanPixel(x, y, true, colours.bgColour, "y");
                if (!count) continue;
                //found a bgColour pixel inside the circle
                let yBottom = yTop + count-1 ;
                //Move up to the middle of the circle along the y axis and count backwards along x until we hit background pixels
                let yMid = yBottom - (yBottom - yTop) / 2;
                yMid = parseInt(yMid.toFixed(0));
                count = scanPixel(x, yMid, true, colours.bgColour, "x");
            
                if (!count) continue;
                let xRight = x + count-2;
            
                //Now count forwards until we find the right hand edge of our circle
                count = scanPixel(xRight, yMid, false, colours.bgColour, "x");
                if (!count) continue;
                let xLeft = xRight + count+1;
                let xMid = xRight - (xRight - xLeft) / 2;
                xMid = parseInt(xMid.toFixed(0));

                //advance x outside hole
                x +=xRight;
                //We should now have the bounding box
                if (yBottom != layout.height) {
                    let len = boundingBox.length;
                    if (len == 0 || boundingBox.findIndex((b) => b.xMid == xMid && b.yMid == yMid) == -1) {
                        let inBounds = false;
                        for (let i = 0; i < len; i++) {
                            let bounds = boundingBox[i];
                            inBounds = xMid >= bounds.xLeft && xMid <= bounds.xRight && yMid >= bounds.yTop && yMid <= bounds.yBottom;

                            if (!inBounds) {
                                let xVal = xMid - bounds.xMid;
                                let yVal = yMid - bounds.yMid;
                                let distance = Math.sqrt(xVal * xVal + yVal * yVal);
                                if (Math.abs(distance) < 5) {
                                    inBounds = true;
                                }
                            }
                            if (inBounds) {
                                break;
                            }
                        }
                        if (!inBounds) {
                            addToCollection(xMid, yMid, xLeft, xRight, yTop, yBottom);
                        }
                    }
                }
            }

        }
    }
    console.log('finished.')
    createOutput();
}