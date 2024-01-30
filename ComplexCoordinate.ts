class ComplexCoordinate {
	private re: number;
	private im: number;

	constructor(re: number, im: number) {
		this.re = re;
		this.im = im;
	}

	get real(): number {
		return this.re;
	}

	get imag(): number {
		return this.im;
	}

	/**
	 * mod
	 */
	public mod(): number {
		return Math.hypot(this.re, this.im);
	}

	/**
	 * plus
	 */
	public plus(c: ComplexCoordinate): ComplexCoordinate {
		return new ComplexCoordinate(this.re + c.real, this.im + c.imag);
	}

	/**
	 * multiply
	 */
	public multiply(c: ComplexCoordinate): ComplexCoordinate {
		return new ComplexCoordinate(this.re * c.re - (this.im * c.imag), this.re * c.imag + c.real * this.im);
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
		if (this.re == 0 && this.im == 0) {
			return "0";
		}

		// if either term is 0, skip that term entirely
		// if imaginary term is negative, do not print the + sign
		// (the negative will show up as part of the negative number)
		return (this.re != 0 ? this.re : "") + (this.im > 0 && this.re != 0 ? "+" : "") + (this.im != 0 ? (this.im + "i") : "");
	}

}