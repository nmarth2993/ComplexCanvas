export class CoreParameters {
    _xyStart;
    _xRange;
    _yRange;
    _width;
    _height;
    _realIncrement;
    _imaginaryIncrement;
    constructor(xyStart, xRange, yRange, width, height, realIncrement, imaginaryIncrement) {
        this._xyStart = xyStart;
        this._xRange = xRange;
        this._yRange = yRange;
        this._width = width;
        this._height = height;
        this._realIncrement = realIncrement;
        this._imaginaryIncrement = imaginaryIncrement;
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
    get realIncrement() {
        return this._realIncrement;
    }
    get imaginaryIncrement() {
        return this._imaginaryIncrement;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
}
