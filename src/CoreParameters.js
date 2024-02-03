export class CoreParameters {
    constructor(xyStart, xRange, yRange, width, height) {
        this._xyStart = xyStart;
        this._xRange = xRange;
        this._yRange = yRange;
        this._width = width;
        this._height = height;
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
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
}
