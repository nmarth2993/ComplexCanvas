import { ColoredComplex } from "./ColoredComplex.js";
import { ComplexCoordinate } from "./ComplexCoordinate.js";
import { ConvergenceTester } from "./ConvergenceTester.js";


export class MandelbrotCore {
    // TODO: consider what might happen if the canvas is resized during a calculation

    // perhaps communicate between the html and JS so that I know what size the canvas is
    // canvas dimensions
    public static readonly HEIGHT = 900;
    public static readonly WIDTH = 900;

    // color constants
    public static readonly NUM_COLORS = 3;
    public static readonly CMODE_BLACK_WHITE = 1;
    public static readonly CMODE_INVERT = 2;
    public static readonly CMODE_RGB = 3;

    // (0 < density <= 1) where 1 represents 100% density (all points plotted)
    public static readonly DENSITY = 1;

    // maximum iterations to determine convergence
    public static readonly maxIter = 255;


    private _xyStart: ComplexCoordinate;

    // sets are faster when adding elements, and order is not required here
    private _pointSet: Set<ColoredComplex>;

    private _xRange: number;
    private _yRange: number;

    private _colorMode: number; // color filter (B/W, invert, RGB)
    private _overlay: boolean; // overlay axes

    private _isReady: boolean;

    constructor(xyStart: ComplexCoordinate, xRange: number, yRange: number) {
        this._xyStart = xyStart;
        this._xRange = xRange;
        this._yRange = yRange;

        this._pointSet = new Set<ColoredComplex>();

        this._overlay = false;
        this._colorMode = 1;

        this._isReady = false;
    }

    get xyStart(): ComplexCoordinate {
        return this._xyStart;
    }

    get xRange(): number {
        return this._xRange;
    }

    get yRange(): number {
        return this._yRange;
    }

    get pointSet(): Set<ColoredComplex> {
        return this._pointSet;
    }

    get realIncrement(): number {
        return (this._xRange / MandelbrotCore.WIDTH) * (1 / MandelbrotCore.DENSITY);
    }

    get imaginaryIncrement(): number {
        return (this._yRange / MandelbrotCore.HEIGHT) * (1 / MandelbrotCore.DENSITY);
    }

    get overlay(): boolean {
        return this._overlay;
    }

    set overlay(overlay: boolean) {
        this._overlay = overlay;
    }

    get colorMode(): number {
        return this._colorMode;
    }

    get isReady(): boolean {
        return this._isReady;
    }

    public nextColorMode() {
        this._colorMode++;
        if (this._colorMode > MandelbrotCore.NUM_COLORS) {
            this._colorMode = 1;
        }
    }

    public maxColorValue() {
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
    public calculatePoints() {
        // can put the guard in mouseclick listeners, just make a simple hook

        // TODO: put this logic in a worker and have another worker control the canvas
        // using offScreenControl

        // z: any here to pacify the type checker complaining that z = this.nextPoint(z) has a type mismatch
        // more logic can be used to avoid this, but the for loop is more straightforward
        // for (let z: any = new ComplexCoordinate(this._xyStart.real, this._xyStart.imag); this.nextPoint(z) != null; z = this.nextPoint(z)) {
        for (let z: any = new ComplexCoordinate(this._xyStart.real, this._xyStart.imag); this.nextPoint(z) != null; z = this.nextPoint(z)) {

            // NOTE: kinda hardcoded the max here, not a huge deal because different color functions can use a different convergence test
            // the information represented in the convergence is directly related to what kinds of colors can be produced and how
            let iter = 255 - ConvergenceTester.testConvergence(z, 255);
            let c = new ColoredComplex(z, { r: iter, g: iter, b: iter });
            this.pointSet.add(c);
        }
    }

    public nextPoint(z: ComplexCoordinate) {
        if (z.real + this.realIncrement > this._xyStart.real + this._xRange) {
            return null;
        } else if (z.imag + this.imaginaryIncrement > this._xyStart.imag + this._yRange) {
            // the next point is on the next line, so move down one row
            // console.log("line down");
            return new ComplexCoordinate(z.real + this.realIncrement, this._xyStart.imag);
        } else {
            // the next point is on the same line, simply increment imaginary value
            return new ComplexCoordinate(z.real, z.imag + this.imaginaryIncrement);
        }
    }

    // below functions provide the interface to be able to calculate single rows at a time
    // a new nextpoint function is also required to stop iteration when one row finishes

    public calculateRow(rowStart: ComplexCoordinate) {
        this._isReady = false;
        let rowPointSet = new Set<ColoredComplex>();

        for (let z: any = new ComplexCoordinate(rowStart.real, rowStart.imag); this.nextPointInRow(z) != null; z = this.nextPointInRow(z)) {
            let iter = 255 - ConvergenceTester.testConvergence(z, 255);
            let c = new ColoredComplex(z, { r: iter, g: iter, b: iter });
            rowPointSet.add(c);
        }
        // setTimeout(() => { }, 1000);
        // console.log(`[mbworker] returning row points set with size ${rowPointSet.size}`)
        return rowPointSet;
    }

    public nextPointInRow(z: ComplexCoordinate) {

        if (z.real + this.realIncrement <= this._xyStart.real + this._xRange && z.imag + this.imaginaryIncrement <= this._xyStart.imag + this._yRange) {
            return new ComplexCoordinate(z.real, z.imag + this.imaginaryIncrement);
        } else {
            // the next point is on the next line, stop iteration
            return null;
        }
    }

    public nextRowStart(rowStart: ComplexCoordinate) {

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