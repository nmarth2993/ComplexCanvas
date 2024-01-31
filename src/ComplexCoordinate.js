"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplexCoordinate = void 0;
class ComplexCoordinate {
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }
    get real() {
        return this.re;
    }
    get imag() {
        return this.im;
    }
    /**
     * mod
     */
    mod() {
        return Math.hypot(this.re, this.im);
    }
    /**
     * plus
     */
    plus(c) {
        return new ComplexCoordinate(this.re + c.real, this.im + c.imag);
    }
    /**
     * multiply
     */
    multiply(c) {
        return new ComplexCoordinate(this.re * c.re - (this.im * c.imag), this.re * c.imag + c.real * this.im);
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
        if (this.re == 0 && this.im == 0) {
            return "0";
        }
        // if either term is 0, skip that term entirely
        // if imaginary term is negative, do not print the + sign
        // (the negative will show up as part of the negative number)
        return (this.re != 0 ? this.re : "") + (this.im > 0 && this.re != 0 ? "+" : "") + (this.im != 0 ? (this.im + "i") : "");
    }
}
exports.ComplexCoordinate = ComplexCoordinate;
