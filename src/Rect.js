export class Rect {
    constructor(x, y, width, height) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    intersects(x, y) {
        return x >= this._x && x <= this._x + this._width && y <= this._y + this._height && y >= this._y;
    }
}
