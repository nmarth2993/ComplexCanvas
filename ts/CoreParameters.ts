import { ComplexCoordinate } from "./ComplexCoordinate";

export class CoreParameters {

	public _xyStart: ComplexCoordinate;
	public _xRange: number;
	public _yRange: number;

	public _width: number;
	public _height: number;

	public _realIncrement: number;
	public _imaginaryIncrement: number;

	constructor(xyStart: ComplexCoordinate, xRange: number, yRange: number, width: number, height: number, realIncrement: number, imaginaryIncrement: number) {
		this._xyStart = xyStart;
		this._xRange = xRange;
		this._yRange = yRange;
		this._width = width;
		this._height = height;
		this._realIncrement = realIncrement;
		this._imaginaryIncrement = imaginaryIncrement;
	}

	public get xyStart(): ComplexCoordinate {
		return this._xyStart;
	}

	public get xRange(): number {
		return this._xRange;
	}

	public get yRange(): number {
		return this._yRange;
	}

	public get realIncrement(): number {
		return this._realIncrement;
	}

	public get imaginaryIncrement(): number {
		return this._imaginaryIncrement;
	}

	public get width(): number {
		return this._width;
	}

	public get height(): number {
		return this._height;
	}

}