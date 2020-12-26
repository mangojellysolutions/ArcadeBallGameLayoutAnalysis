let boundingBox = [];
let outputJSON = null;
let idx = 0;

function scanPixel(ctx, x, y, increment, pixelColour, target = "y") {
    let targetColourFound = false;
    let count = 0;
    
    while (!targetColourFound) {
        let pixel = target == "y" ? ctx.getImageData(x, y + count, 1, 1).data : ctx.getImageData(x + count, y, 1, 1).data;
        targetColourFound = (pixel[0] == pixelColour.r && pixel[1] == pixelColour.g && pixel[2] == pixelColour.b);
        if (count > maxDistance) return false;
        if (increment) count++;
        else count--;
    }
    return count;
}

function addToCollection(canvas, xMid, yMid, xLeft, xRight, yTop, yBottom ){
    let diameter =  xRight - xLeft;
    //Normalise the figure by diving x vars by the width, y vars by the height.  This will mean that we can use any width and height and just multiple x values by the new width and y values against the new height
    let normalisedCoords = {
        diameter: diameter,
        topLeft: {
            x: xLeft / canvas.width,
            y: yTop / canvas.height,
        },
        bottomRight: {
            x: xRight / canvas.width,
            y: yBottom / canvas.height,
        },
        mid: { x: xMid / canvas.width, y: yMid / canvas.height },
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
}

function processImage(canvas, ctx, img){  
    canvas.width = img.width; 
	canvas.height = img.height; 
    ctx.drawImage(img, 0, 0);
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
        
            //Have we found a black pixel
            let pixel = ctx.getImageData(x, y, 1, 1).data;
            //console.log(pixel[0], pixel[1], pixel[2],pixel[3]);
            if (pixel[0] == config.target.r && pixel[1] == config.target.g && pixel[2] == config.target.b) {
                let yTop = y;

                //Find the next bgColour pixel scanning down through the circle
                let count = scanPixel(ctx, x, y, true, config.bgColour, "y");
                if (!count) continue;
                //found a bgColour pixel inside the circle
                let yBottom = yTop + count-1 ;
                //Move up to the middle of the circle along the y axis and count backwards along x until we hit background pixels
                let yMid = yBottom - (yBottom - yTop) / 2;
                yMid = parseInt(yMid.toFixed(0));
                count = scanPixel(ctx, x, yMid, true, config.bgColour, "x");
            
                if (!count) continue;
                let xRight = x + count-2;
            
                //Now count forwards until we find the right hand edge of our circle
                count = scanPixel(ctx, xRight, yMid, false, config.bgColour, "x");
                if (!count) continue;
                let xLeft = xRight + count+1;
                let xMid = xRight - (xRight - xLeft) / 2;
                xMid = parseInt(xMid.toFixed(0));

                //advance x outside hole
                x +=xRight;
                //We should now have the bounding box
                if (yBottom != canvas.height) {
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
                            addToCollection(canvas, xMid, yMid, xLeft, xRight, yTop, yBottom);
                        }
                    }
                }
            }

        }
    }
    createOutput();
}