"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColoredComplex = void 0;
const ComplexCoordinate_js_1 = require("./ComplexCoordinate.js");
class ColoredComplex extends ComplexCoordinate_js_1.ComplexCoordinate {
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
    getZ() {
        return this;
    }
}
exports.ColoredComplex = ColoredComplex;
