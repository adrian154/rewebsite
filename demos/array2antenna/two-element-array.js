const canvas = document.getElementById("plot"),
      ctx = canvas.getContext("2d");

const slider = document.getElementById("baseline");
const datalist = document.getElementById("steplist");

const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.width * devicePixelRatio;
    plot();
};

window.addEventListener("resize", resizeCanvas);
document.addEventListener("readystatechange", resizeCanvas);

// angular resolution of plot
const numPoints = 1000;

// distance between sources, over wavelength
let dRel = 0.25;

// populate datalist
for(let i = 0; i <= 8; i++) {
    const option = document.createElement("option");
    option.value = i / 8;
    option.textContent = `${i*2/8}\u03bb`;
    datalist.append(option);
}

const plot = () => {
        
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxRadius = 0.9 * canvas.width/2;

    // plot grid circles
    ctx.strokeStyle = "#00000020"
    for(let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, maxRadius * i/3, 0, 2 * Math.PI);
        ctx.stroke();
    }

    // plot grid lines
    ctx.textAlign = "center";
    ctx.font = "15px sans-serif";
    ctx.fillStyle = "#000000ba"
    ctx.textBaseline = "middle";
    for(let deg = 0; deg < 360; deg += 30) {
        const angle = deg*Math.PI/180;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.lineTo(canvas.width / 2 + cosAngle * maxRadius, canvas.height / 2 + sinAngle * maxRadius);
        ctx.stroke();
        ctx.fillText(`${deg}\xb0`, canvas.width/2 + cosAngle*(maxRadius + 23), canvas.height/2 + sinAngle*(maxRadius + 23));
    }

    // plot radiation pattern
    ctx.strokeStyle = "#3895ffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for(let i = 0; i < numPoints; i++) {
        
        const angle = i / numPoints * 2 * Math.PI;
        const phase = 2*Math.PI*Math.cos(angle)*dRel;
        const power = Math.cos(phase);

        const x = Math.cos(angle) * power * maxRadius + canvas.width/2;
        const y = Math.sin(angle) * power * maxRadius + canvas.height/2;

        if(i == 0)
            ctx.moveTo(x, y);
        else
            ctx.lineTo(x, y);

    }
    ctx.closePath();
    ctx.stroke();

};

slider.addEventListener("input", () => {
    dRel = slider.value / slider.max * 2;
    plot();
});