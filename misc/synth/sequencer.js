const canvas = document.getElementById("sequencer"),
      ctx = canvas.getContext("2d");

const notes = new Array(1000);

const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    draw();
};

let horizScroll = 0;

const draw = () => {

    // draw background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw notes
    

};

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
draw();