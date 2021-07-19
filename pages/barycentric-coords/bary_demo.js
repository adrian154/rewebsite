// Points of the triangle
const points = [];
const mousePos = [0, 0];

const outCanvas = document.getElementById("output");
const outCtx = outCanvas.getContext("2d");
outCtx.font = "12px Consolas";

const dot = (vec0, vec1) => vec0[0] * vec1[0] + vec0[1] * vec1[1];

const calcBaryCoords = function(point, vert0, vert1, vert2) {

    // Make P into Q
    let Q = [point[0] - vert0[0], point[1] - vert0[1]];

    let v1 = [vert1[0] - vert0[0], vert1[1] - vert0[1]];
    let v2 = [vert2[0] - vert0[0], vert2[1] - vert0[1]];

    // Precalculate dot products to make things easier
    let A = dot(Q, v1);
    let B = dot(Q, v2);
    let c = dot(v1, v1);
    let d = dot(v1, v2);
    let e = dot(v2, v2);

    let u = (B * d - A * e) / (d * d - c * e);
    let v = (A - u * c) / d;

    return [u, v];

};

const animate = function() {

    outCtx.clearRect(0, 0, outCanvas.width, outCanvas.height)

    let topText = "";
    if(points.length == 3) {

        let coords = calcBaryCoords(mousePos, points[0], points[1], points[2]);
        let inTriangle = coords[0] > 0 && coords[1] > 0  && coords[0] + coords[1] < 1;
        topText = `u = ${coords[0].toFixed(2)}, v = ${coords[1].toFixed(2)}`;

        outCtx.beginPath();
        outCtx.moveTo(points[0][0], points[0][1]);
        outCtx.lineTo(points[1][0], points[1][1]);
        outCtx.lineTo(points[2][0], points[2][1]);
        outCtx.closePath();

        outCtx.globalAlpha = 0.25;
        outCtx.fillStyle = inTriangle ? "#00ff00" : "#ff0000";
        outCtx.fill();

        outCtx.strokeStyle = "#000000";
        outCtx.globalAlpha = 1.0;
        outCtx.stroke();

        // Draw u/v lines
        outCtx.strokeStyle = "#0000ff";

        let uNorm = [points[1][0] - points[0][0], points[1][1] - points[0][1]];
        let uLen = Math.sqrt(uNorm[0] * uNorm[0] + uNorm[1] * uNorm[1]);
        uNorm[0] /= uLen; uNorm[1] /= uLen;

        let vNorm = [points[2][0] - points[0][0], points[2][1] - points[0][1]];
        let vLen = Math.sqrt(vNorm[0] * vNorm[0] + vNorm[1] * vNorm[1]);
        vNorm[0] /= vLen; vNorm[1] /= vLen;

        outCtx.lineWidth = 5;
        outCtx.beginPath();
        let x = points[0][0];
        let y = points[0][1];
        outCtx.moveTo(x, y);
        x += uNorm[0] * uLen * coords[0];
        y += uNorm[1] * uLen * coords[0];
        outCtx.lineTo(x, y);
        outCtx.closePath();
        outCtx.stroke();

        outCtx.beginPath();
        x = points[0][0];
        y = points[0][1];
        outCtx.moveTo(x, y);
        x += vNorm[0] * vLen * coords[1];
        y += vNorm[1] * vLen * coords[1];
        outCtx.lineTo(x, y);
        outCtx.closePath();
        outCtx.stroke();

        outCtx.lineWidth = 1;

        // Draw BIG RED LINE!
        outCtx.strokeStyle = "#ff0000";
        outCtx.beginPath();
        outCtx.moveTo(points[0][0], points[0][1]);
        outCtx.lineTo(mousePos[0], mousePos[1]);
        outCtx.closePath();
        outCtx.stroke();

    } else {
        topText = `Click to add points (${3 - points.length} to go)`;
    }

    outCtx.fillStyle = "#000000";
    outCtx.fillText(topText, 20, 20);

    // Always draw points on top
    for(let point of points) {
        outCtx.beginPath();
        outCtx.arc(point[0], point[1], 5, 0, 2 * Math.PI, false);
        outCtx.closePath();
        outCtx.fill();
    }

    requestAnimationFrame(animate);

};

outCanvas.addEventListener("click", event => {

    let rect = outCanvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    if(points.length < 3) points.push([x, y]);

});

outCanvas.addEventListener("mousemove", event => {
    
    let rect = outCanvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    mousePos[0] = x;
    mousePos[1] = y;

});

animate();