import { ComplexCoordinate } from "./ComplexCoordinate";

export class CoreParameters {

	private _xyStart: ComplexCoordinate;
	private _xRange: number;
	private _yRange: number;

	private _width: number;
	private _height: number;

	constructor(xyStart: ComplexCoordinate, xRange: number, yRange: number, width: number, height: number) {
		this._xyStart = xyStart;
		this._xRange = xRange;
		this._yRange = yRange;
		this._width = width;
		this._height = height;
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

	public get width(): number {
		return this._width;
	}

	public get height(): number {
		return this._height;
	}

}