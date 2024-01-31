import { ComplexCoordinate } from "./ComplexCoordinate.js";
import { MandelbrotCore } from "./MandelbrotCore.js";

const core = new MandelbrotCore(new ComplexCoordinate(-2, -1.5), 3, 3);

console.log("got core");
console.log(`x: ${core.xyStart.real}; inc: ${core.realIncrement}; range: ${core.xRange}`)
console.log(`y: ${core.xyStart.imag}; inc: ${core.imaginaryIncrement}; range: ${core.yRange}`)

const HEIGHT = 1000;
const WIDTH = 1000;

document.addEventListener("DOMContentLoaded", function () {
    const canvas = <HTMLCanvasElement>document.getElementById("drawingCanvas");
    const context = canvas.getContext("2d");

    // canvas.addEventListener("click", clickHandler);

    context?.strokeText("Please wait, fractal loading", WIDTH / 4, HEIGHT / 4);

    function clickHandler(ev: MouseEvent) {
        draw(0, 0);
    }

    function draw(x: number, y: number) {
        console.log(`clicked`);
        if (context == null) {
            console.log("context is null");
            return;
        }
        const imageData = context.createImageData(WIDTH, HEIGHT);
        const data = imageData.data;


        // now the list should be populated
        console.log(`pointList length: ${core.pointSet.size}`)


        core.pointSet.forEach(coloredCoordinate => {
            // using left-shift to coerce the number to an integer
            let xPixel = ((coloredCoordinate.getZ().real - core.xyStart.real) * (MandelbrotCore.WIDTH / core.xRange)) << 0;
            let yPixel = ((core.xyStart.imag + core.yRange - coloredCoordinate.getZ().imag) * MandelbrotCore.HEIGHT / core.yRange) << 0;

            data[yPixel * (WIDTH * 4) + xPixel * 4] = coloredCoordinate.color.r;
            data[yPixel * (WIDTH * 4) + xPixel * 4 + 1] = coloredCoordinate.color.g;
            data[yPixel * (WIDTH * 4) + xPixel * 4 + 2] = coloredCoordinate.color.b;
            data[yPixel * (WIDTH * 4) + xPixel * 4 + 3] = 255; // default full opaque
        });

        context.putImageData(imageData, 0, 0);
        // requestAnimationFrame(() => draw(0, 0));
        // requestAnimationFrame(() => randomizeRect(x, y, WIDTH, HEIGHT));
    }
    console.log("before async");
    let startTime = new Date().getTime();
    console.log(`start: ${startTime}`);
    core.calculatePoints().then(() => draw(0, 0));
    let endTime = new Date().getTime();
    console.log(`end: ${endTime}`);
    console.log(`${endTime - startTime}ms elapsed`);

    console.log("after async");
});
