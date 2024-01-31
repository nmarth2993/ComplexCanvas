import { ComplexCoordinate } from "./ComplexCoordinate.js";
import { MandelbrotCore } from "./MandelbrotCore.js";
import { Rect } from "./Rect.js";

const core = new MandelbrotCore(new ComplexCoordinate(-2, -1.5), 3, 3);

console.log("got core");
console.log(`x: ${core.xyStart.real}; inc: ${core.realIncrement}; range: ${core.xRange}`)
console.log(`y: ${core.xyStart.imag}; inc: ${core.imaginaryIncrement}; range: ${core.yRange}`)

const HEIGHT = 1000;
const WIDTH = 1000;

const ZOOM_RECT_WIDTH = 100;
const ZOOM_RECT_HEIGHT = 100;
let zoomRect: Rect | null = null;

let startTime = new Date().getTime();
console.log(`start: ${startTime}`);
console.log("skipping point calculation");
// core.calculatePoints();
let endTime = new Date().getTime();
console.log(`end: ${endTime}`);
console.log(`${endTime - startTime}ms elapsed`);


document.addEventListener("DOMContentLoaded", function () {
    const canvas = <HTMLCanvasElement>document.getElementById("drawingCanvas");
    const context = canvas.getContext("2d");


    canvas.addEventListener("click", clickHandler);

    context?.strokeText("Please wait, fractal loading", WIDTH / 4, HEIGHT / 4);

    function clickHandler(ev: MouseEvent) {
        // TODO: look into global composite property
        // 'destination-out' vs 'source-over'
        console.log(`click at (${ev.offsetX}, ${ev.offsetY})`);
        if (zoomRect == null || !zoomRect.intersects(ev.offsetX, ev.offsetY)) {

            // calculate new zoomrect first
            zoomRect = new Rect(ev.offsetX - ZOOM_RECT_WIDTH / 2, ev.offsetY - ZOOM_RECT_HEIGHT / 2, ZOOM_RECT_WIDTH, ZOOM_RECT_HEIGHT);

            // draw the rectangle
            context!.strokeStyle = "yellow";
            context?.strokeRect(zoomRect.x, zoomRect.y, zoomRect.width, zoomRect.height);
        } else {
            console.log("zoom in");
        }
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
});
