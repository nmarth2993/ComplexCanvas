export var ConvergenceTester;
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
})(ConvergenceTester || (ConvergenceTester = {}));
