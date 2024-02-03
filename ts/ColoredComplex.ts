import { ComplexCoordinate } from "./ComplexCoordinate.js";

export class ColoredComplex extends ComplexCoordinate {
    public _color;
    constructor(z: ComplexCoordinate, color: any) {
        super(z.real, z.imag);
        this._color = color;
    }

    public get color() {
        return this._color;
    }

    public set color(color) {
        this._color = color;
    }

}