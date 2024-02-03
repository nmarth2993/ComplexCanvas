export class ComplexCoordinate {
	private _real: number;
	private _imag: number;

	constructor(re: number, im: number) {
		this._real = re;
		this._imag = im;
	}

	public get real(): number {
		return this._real;
	}

	public get imag(): number {
		return this._imag;
	}

	/**
	 * mod
	 */
	public mod(): number {
		return Math.hypot(this._real, this._imag);
	}

	/**
	 * plus
	 */
	public plus(c: ComplexCoordinate): ComplexCoordinate {
		return new ComplexCoordinate(this._real + c.real, this._imag + c.imag);
	}

	/**
	 * multiply
	 */
	public multiply(c: ComplexCoordinate): ComplexCoordinate {
		return new ComplexCoordinate(this._real * c._real - (this._imag * c.imag), this._real * c.imag + c.real * this._imag);
	}

	/**
	 * square
	 */
	public square(): ComplexCoordinate {
		return this.multiply(this);
	}

	/**
	 * toString
	 */
	public toString(): string {
		if (this._real == 0 && this._imag == 0) {
			return "0";
		}

		// if either term is 0, skip that term entirely
		// if imaginary term is negative, do not print the + sign
		// (the negative will show up as part of the negative number)
		return (this._real != 0 ? this._real : "") + (this._imag > 0 && this._real != 0 ? "+" : "") + (this._imag != 0 ? (this._imag + "i") : "");
	}

}