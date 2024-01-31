import { ComplexCoordinate } from "./ComplexCoordinate.js";

export namespace ConvergenceTester {
    export function testConvergence(z0: ComplexCoordinate, max: number): number {
        let z = z0;

        for (let i = 0; i < max; i++) {
            if (z.mod() > 2.0) {
                return i;
            }
            z = z.square().plus(z0);
        }

        return max;
    }

    // TODO: potentially add coloring filter for smooth gradient display
}