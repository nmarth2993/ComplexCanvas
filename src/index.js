"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ComplexCoordinate_js_1 = require("./ComplexCoordinate.js");
const MandelbrotCore_js_1 = require("./MandelbrotCore.js");
const core = new MandelbrotCore_js_1.MandelbrotCore(new ComplexCoordinate_js_1.ComplexCoordinate(-2, -1.5), 3, 3);
console.log("got core");
console.log(`x: ${core.xyStart.real}; inc: ${core.realIncrement}; range: ${core.xRange}`);
console.log(`y: ${core.xyStart.imag}; inc: ${core.imaginaryIncrement}; range: ${core.yRange}`);
document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("drawingCanvas");
    const context = canvas.getContext("2d");
    canvas.addEventListener("click", clickHandler);
    // first, calculate points
    core.calculatePoints();
    function clickHandler(ev) {
        draw(0, 0);
    }
    function draw(x, y) {
        console.log(`clicked`);
        if (context == null) {
            console.log("context is null");
            return;
        }
        const HEIGHT = 1000;
        const WIDTH = 1000;
        const imageData = context.createImageData(WIDTH, HEIGHT);
        const data = imageData.data;
        // now the list should be populated
        console.log(`pointList length: ${core.pointList.length}`);
        for (let i = 0; i < HEIGHT; i++) {
            for (let j = 0; j < WIDTH; j++) {
                // FIXME: apply fix for when density is less than 1
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
        context.putImageData(imageData, 0, 0);
        // requestAnimationFrame(() => draw(0, 0));
        // requestAnimationFrame(() => randomizeRect(x, y, WIDTH, HEIGHT));
    }
});
