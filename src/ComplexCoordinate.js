export class ComplexCoordinate {
    constructor(re, im) {
        this._real = re;
        this._imag = im;
    }
    get real() {
        return this._real;
    }
    get imag() {
        return this._imag;
    }
    /**
     * mod
     */
    mod() {
        return Math.hypot(this._real, this._imag);
    }
    /**
     * plus
     */
    plus(c) {
        return new ComplexCoordinate(this._real + c.real, this._imag + c.imag);
    }
    /**
     * multiply
     */
    multiply(c) {
        return new ComplexCoordinate(this._real * c._real - (this._imag * c.imag), this._real * c.imag + c.real * this._imag);
    }
    /**
     * square
     */
    square() {
        return this.multiply(this);
    }
    /**
     * toString
     */
    toString() {
        if (this._real == 0 && this._imag == 0) {
            return "0";
        }
        // if either term is 0, skip that term entirely
        // if imaginary term is negative, do not print the + sign
        // (the negative will show up as part of the negative number)
        return (this._real != 0 ? this._real : "") + (this._imag > 0 && this._real != 0 ? "+" : "") + (this._imag != 0 ? (this._imag + "i") : "");
    }
}
