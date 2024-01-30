import { ComplexCoordinate } from "./ComplexCoordinate";
import { MandelbrotCore } from "./MandelbrotCore";

const core = new MandelbrotCore(new ComplexCoordinate(-2, -1.5), 3, 3);

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("drawingCanvas");
    const context = canvas?.getContext("2d");
    let isDrawing = false;
    let isAnimated = false;

    canvas?.addEventListener("click", draw);

    // first, calculate points
    core.calculatePoints();

    function draw(x, y) {
        console.log(`clicked`)
        const HEIGHT = 500;
        const WIDTH = 500;
        const imageData = context.createImageData(WIDTH, HEIGHT);
        const data = imageData.data;


        // now the list should be populated
        console.log(`pointList length: ${core.pointList.length}`)

        for (let i = 0; i < HEIGHT; i++) {
            for (let j = 0; j < WIDTH; j++) {

                let color = core.pointList[i * HEIGHT + j].color;

                let r = color.r;
                let g = color.g;
                let b = color.b;
                data[i * (WIDTH * 4) + j * 4] = r;
                data[i * (WIDTH * 4) + j * 4 + 1] = g;
                data[i * (WIDTH * 4) + j * 4 + 2] = b;
                data[i * (WIDTH * 4) + j * 4 + 3] = 255; // default full opaque
            }
        }
        context.putImageData(imageData, x, y);
        requestAnimationFrame(() => draw(x, y));
        // requestAnimationFrame(() => randomizeRect(x, y, WIDTH, HEIGHT));
    }
});