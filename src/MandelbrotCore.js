import { ColoredComplex } from "./ColoredComplex.js";
import { ComplexCoordinate } from "./ComplexCoordinate.js";
import { ConvergenceTester } from "./ConvergenceTester.js";
export class MandelbrotCore {
    constructor(xyStart, xRange, yRange) {
        this._xyStart = xyStart;
        this._xRange = xRange;
        this._yRange = yRange;
        this._pointSet = new Set();
        this._overlay = false;
        this._colorMode = 1;
        this._isReady = false;
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
    get pointSet() {
        return this._pointSet;
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
    get isReady() {
        return this._isReady;
    }
    nextColorMode() {
        this._colorMode++;
        if (this._colorMode > MandelbrotCore.NUM_COLORS) {
            this._colorMode = 1;
        }
    }
    maxColorValue() {
        let maxValue = 0;
        this._pointSet.forEach(z => {
            if (z.color.red > maxValue) {
                maxValue = z.color.red;
            }
        });
        return maxValue;
    }
    // TODO: I think I just have to make another worker and use message passing to send incremental data
    // just calculate how many points should be in 1 row and then send a message each row to trigger a repaint
    // may be able to not event send a message since the worker should be able to infinitely repaint... but then it would be a different
    // instance of core that wouldn't be shared... can I make this a shared object? if it is shared then it's so easy, make a worker to repaint
    // and then spawn another worker to just perform the calculation and it will just work.
    /**
     * calculatePoints
     */
    calculatePoints() {
        // can put the guard in mouseclick listeners, just make a simple hook
        // TODO: put this logic in a worker and have another worker control the canvas
        // using offScreenControl
        // z: any here to pacify the type checker complaining that z = this.nextPoint(z) has a type mismatch
        // more logic can be used to avoid this, but the for loop is more straightforward
        // for (let z: any = new ComplexCoordinate(this._xyStart.real, this._xyStart.imag); this.nextPoint(z) != null; z = this.nextPoint(z)) {
        for (let z = new ComplexCoordinate(this._xyStart.real, this._xyStart.imag); this.nextPoint(z) != null; z = this.nextPoint(z)) {
            // NOTE: kinda hardcoded the max here, not a huge deal because different color functions can use a different convergence test
            // the information represented in the convergence is directly related to what kinds of colors can be produced and how
            let iter = 255 - ConvergenceTester.testConvergence(z, 255);
            let c = new ColoredComplex(z, { r: iter, g: iter, b: iter });
            this.pointSet.add(c);
        }
    }
    nextPoint(z) {
        if (z.real + this.realIncrement > this._xyStart.real + this._xRange) {
            return null;
        }
        else if (z.imag + this.imaginaryIncrement > this._xyStart.imag + this._yRange) {
            // the next point is on the next line, so move down one row
            // console.log("line down");
            return new ComplexCoordinate(z.real + this.realIncrement, this._xyStart.imag);
        }
        else {
            // the next point is on the same line, simply increment imaginary value
            return new ComplexCoordinate(z.real, z.imag + this.imaginaryIncrement);
        }
    }
    // below functions provide the interface to be able to calculate single rows at a time
    // a new nextpoint function is also required to stop iteration when one row finishes
    calculateRow(rowStart) {
        this._isReady = false;
        let rowPointSet = new Set();
        for (let z = new ComplexCoordinate(rowStart.real, rowStart.imag); this.nextPointInRow(z) != null; z = this.nextPointInRow(z)) {
            let iter = 255 - ConvergenceTester.testConvergence(z, 255);
            let c = new ColoredComplex(z, { r: iter, g: iter, b: iter });
            rowPointSet.add(c);
        }
        // setTimeout(() => { }, 1000);
        // console.log(`[mbworker] returning row points set with size ${rowPointSet.size}`)
        return rowPointSet;
    }
    nextPointInRow(z) {
        /*
        if (z.real + this.realIncrement > this._xyStart.real + this._xRange) {
            return null;
        } else if (z.imag + this.imaginaryIncrement > this._xyStart.imag + this._yRange) {
            // the next point is on the next line
            return null;
        } else {
            // the next point is on the same line, simply increment imaginary value
            return new ComplexCoordinate(z.real, z.imag + this.imaginaryIncrement);
        }
        */
        if (z.real + this.realIncrement <= this._xyStart.real + this._xRange && z.imag + this.imaginaryIncrement <= this._xyStart.imag + this._yRange) {
            return new ComplexCoordinate(z.real, z.imag + this.imaginaryIncrement);
        }
        else {
            // the next point is on the next line, stop iteration
            return null;
        }
    }
    nextRowStart(rowStart) {
        // ensure that rowstart is inside of the boundary to be drawn
        if (rowStart.real > this._xyStart.real + this._xRange || rowStart.imag > this._xyStart.imag + this._yRange) {
            // the sentinel value for the outer loop that this returns to is an empty set
            // setting this value will cause the worker to drop out of the processing loop
            // the next complex coordinate is still returned to comply with typing
            this._isReady = true;
        }
        return new ComplexCoordinate(rowStart.real + this.realIncrement, rowStart.imag);
    }
}
// TODO: consider what might happen if the canvas is resized during a calculation
// perhaps communicate between the html and JS so that I know what size the canvas is
// canvas dimensions
MandelbrotCore.HEIGHT = 900;
MandelbrotCore.WIDTH = 900;
// color constants
MandelbrotCore.NUM_COLORS = 3;
MandelbrotCore.CMODE_BLACK_WHITE = 1;
MandelbrotCore.CMODE_INVERT = 2;
MandelbrotCore.CMODE_RGB = 3;
// (0 < density <= 1) where 1 represents 100% density (all points plotted)
MandelbrotCore.DENSITY = 1;
// maximum iterations to determine convergence
MandelbrotCore.maxIter = 255;
