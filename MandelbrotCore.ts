import { ColoredComplex } from "./ColoredComplex";
import { ComplexCoordinate } from "./ComplexCoordinate";

export class MandelbrotCore {
    // TODO: consider what might happen if the canvas is resized during a calculation

    // perhaps communicate between the html and JS so that I know what size the canvas is
    // canvas dimensions
    public static readonly HEIGHT = 500;
    public static readonly WIDTH = 500;

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
    private _pointList: Array<ColoredComplex>;

    private _xRange: number;
    private _yRange: number;

    private _colorMode: number; // color filter (B/W, invert, RGB)
    private _overlay: boolean; // overlay axes

    constructor(xyStart: ComplexCoordinate, xRange: number, yRange: number) {
        this._xyStart = xyStart;
        this._xRange = xRange;
        this._yRange = yRange;

        this._pointList = new Array<ColoredComplex>();
        this._colorMode = 1;
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

    get pointList(): Array<ColoredComplex> {
        return this._pointList;
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

    public nextColorMode() {
        this._colorMode++;
        if (this._colorMode > MandelbrotCore.NUM_COLORS) {
            this._colorMode;
        }
    }

    public maxColorValue() {
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
    public calculatePoints() {
        // can put the guard in mouseclick listeners, just make a simple hook
        //TODO: write this code
        let startTime = new Date().getTime();

        // iterate over the entire field
        for (let z = new ComplexCoordinate(this._xyStart.real + this._xRange / 2, this._xyStart.imag); this.nextPoint(z) != null; this.nextPoint(z)) {
            // let iter = ConvergenceTester.testConvergence();
            let iter = 1;

            let c = new ColoredComplex(z, { r: iter, g: iter, b: iter });
            this.pointList.push(c);
        }

        return;
    }

    public nextPoint(z: ComplexCoordinate) {
        if (z.real + this.realIncrement > this._xyStart.real + this._xRange) {
            return null;
        } else if (z.imag + this.imaginaryIncrement > this._xyStart.imag + this._yRange) {
            // the next point is on the next line, so move down one row
            return new ComplexCoordinate(z.real + this.realIncrement, this._xyStart.imag);
        } else {
            // the next point is on the same line, simply increment imaginary value
            return new ComplexCoordinate(z.real, z.imag + this.imaginaryIncrement);
        }
    }

}