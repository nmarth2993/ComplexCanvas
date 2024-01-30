import { ComplexCoordinate } from "./ComplexCoordinate";

export class ColoredComplex extends ComplexCoordinate {
    private _color;
    constructor(z: ComplexCoordinate, color) {
        super(z.real, z.imag);
        this._color = color;
    }

    public get color() {
        return this._color;
    }

    public set color(color) {
        this._color = color;
    }

    public getZ(): ComplexCoordinate {
        return this;
    }
}