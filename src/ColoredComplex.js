import { ComplexCoordinate } from "./ComplexCoordinate.js";
export class ColoredComplex extends ComplexCoordinate {
    _color;
    constructor(z, color) {
        super(z.real, z.imag);
        this._color = color;
    }
    get color() {
        return this._color;
    }
    set color(color) {
        this._color = color;
    }
}
