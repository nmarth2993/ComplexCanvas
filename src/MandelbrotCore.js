"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MandelbrotCore = void 0;
const ColoredComplex_js_1 = require("./ColoredComplex.js");
const ComplexCoordinate_js_1 = require("./ComplexCoordinate.js");
const ConvergenceTester_js_1 = require("./ConvergenceTester.js");
class MandelbrotCore {
    constructor(xyStart, xRange, yRange) {
        this._xyStart = xyStart;
        this._xRange = xRange;
        this._yRange = yRange;
        this._pointList = new Array();
        this._overlay = false;
        this._colorMode = 1;
    }
    get xyStart() {
        return this._xyStart;
    }
    get xRange() {
        return this._xRange;
    }
    get yRange() {
        return this._yRange;
    }
    get pointList() {
        return this._pointList;
    }
    get realIncrement() {
        return (this._xRange / MandelbrotCore.WIDTH) * (1 / MandelbrotCore.DENSITY);
    }
    get imaginaryIncrement() {
        return (this._yRange / MandelbrotCore.HEIGHT) * (1 / MandelbrotCore.DENSITY);
    }
    get overlay() {
        return this._overlay;
    }
    set overlay(overlay) {
        this._overlay = overlay;
    }
    get colorMode() {
        return this._colorMode;
    }
    nextColorMode() {
        this._colorMode++;
        if (this._colorMode > MandelbrotCore.NUM_COLORS) {
            this._colorMode;
        }
    }
    maxColorValue() {
        let maxValue = 0;
        this._pointList.forEach(z => {
            if (z.color.red > maxValue) {
                maxValue = z.color.red;
            }
        });
        return maxValue;
    }
    /**
     * calculatePoints
     */
    calculatePoints() {
        // can put the guard in mouseclick listeners, just make a simple hook
        //TODO: write this code
        let startTime = new Date().getTime();
        let iterCount = 0;
        // iterate over the entire field
        for (let z = new ComplexCoordinate_js_1.ComplexCoordinate(this._xyStart.real, this._xyStart.imag); this.nextPoint(z) != null; z = this.nextPoint(z)) {
            // let iter = ConvergenceTester.testConvergence();
            iterCount++;
            let iter = ConvergenceTester_js_1.ConvergenceTester.testConvergence(z, 255);
            let c = new ColoredComplex_js_1.ColoredComplex(z, { r: iter, g: iter, b: iter });
            this.pointList.push(c);
        }
        // console.log(`iterCount: ${iterCount}`);
        return;
    }
    nextPoint(z) {
        if (z.real + this.realIncrement > this._xyStart.real + this._xRange) {
            return null;
        }
        else if (z.imag + this.imaginaryIncrement >= this._xyStart.imag + this._yRange) {
            // the next point is on the next line, so move down one row
            // console.log("line down");
            return new ComplexCoordinate_js_1.ComplexCoordinate(z.real + this.realIncrement, this._xyStart.imag);
        }
        else {
            // the next point is on the same line, simply increment imaginary value
            return new ComplexCoordinate_js_1.ComplexCoordinate(z.real, z.imag + this.imaginaryIncrement);
        }
    }
}
exports.MandelbrotCore = MandelbrotCore;
// TODO: consider what might happen if the canvas is resized during a calculation
// perhaps communicate between the html and JS so that I know what size the canvas is
// canvas dimensions
MandelbrotCore.HEIGHT = 1000;
MandelbrotCore.WIDTH = 1000;
// color constants
MandelbrotCore.NUM_COLORS = 3;
MandelbrotCore.CMODE_BLACK_WHITE = 1;
MandelbrotCore.CMODE_INVERT = 2;
MandelbrotCore.CMODE_RGB = 3;
// (0 < density <= 1) where 1 represents 100% density (all points plotted)
MandelbrotCore.DENSITY = 1;
// maximum iterations to determine convergence
MandelbrotCore.maxIter = 255;
