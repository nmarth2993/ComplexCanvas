import { ColoredComplex } from "./ColoredComplex.js";
import { ComplexCoordinate } from "./ComplexCoordinate.js";
import { ConvergenceTester } from "./ConvergenceTester.js";


export class MandelbrotCore {
    // perhaps communicate between the html and JS so that I know what size the canvas is
    // this would require some more message passing, but worth looking into

    // canvas dimensions
    // 840 is a highly composite number
    public static readonly HEIGHT = 840;
    public static readonly WIDTH = 840;

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

    public setZoom(xyStart: ComplexCoordinate, xRange: number, yRange: number) {
        // reset the ready flag, prepare for a recalculation
        this._isReady = false;

        // update the zoom parameters
        this._xyStart = xyStart;
        this._xRange = xRange;
        this._yRange = yRange;
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

        return rowPointSet;
    }

    public nextPointInRow(z: ComplexCoordinate) {

        if (z._real + this.realIncrement <= this._xyStart._real + this._xRange && z._imag + this.imaginaryIncrement <= this._xyStart._imag + this._yRange) {
            return new ComplexCoordinate(z._real, z._imag + this.imaginaryIncrement);
        } else {
            // the next point is on the next line, stop iteration
            return null;
        }
    }

    public nextRowStart(rowStart: ComplexCoordinate) {

        // ensure that rowstart is inside of the boundary to be drawn
        if (rowStart._real > this._xyStart._real + this._xRange || rowStart._imag > this._xyStart._imag + this._yRange) {
            // the sentinel value for the outer loop that this returns to is an empty set

            // setting this value will cause the worker to drop out of the processing loop
            // the next complex coordinate is still returned to comply with typing
            this._isReady = true;
        }
        return new ComplexCoordinate(rowStart._real + this.realIncrement, rowStart._imag);
    }
}