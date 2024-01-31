"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvergenceTester = void 0;
var ConvergenceTester;
(function (ConvergenceTester) {
    function testConvergence(z0, max) {
        let z = z0;
        for (let i = 0; i < max; i++) {
            if (z.mod() > 2.0) {
                return i;
            }
            z = z.square().plus(z0);
        }
        return max;
    }
    ConvergenceTester.testConvergence = testConvergence;
    // TODO: potentially add coloring filter for smooth gradient display
})(ConvergenceTester = exports.ConvergenceTester || (exports.ConvergenceTester = {}));
