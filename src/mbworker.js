import { ComplexCoordinate } from "./ComplexCoordinate.js";
import { CoreParameters } from "./CoreParameters.js";
import { MandelbrotCore } from "./MandelbrotCore.js";
const core = new MandelbrotCore(new ComplexCoordinate(-2, -1.5), 3, 3);
console.log("[mbworker] got core");
console.log(`[mbworker] x: ${core.xyStart.real}; inc: ${core.realIncrement}; range: ${core.xRange}`);
console.log(`[mbworker] y: ${core.xyStart.imag}; inc: ${core.imaginaryIncrement}; range: ${core.yRange}`);
let animatorChannel;
self.addEventListener('message', function (event) {
    console.log("[mbworker] read message");
    if (event.data.message == "start") {
        // set the animation worker
        animatorChannel = event.ports[0];
        // send back core parameters
        const coreParams = new CoreParameters(core.xyStart, core.xRange, core.yRange, MandelbrotCore.WIDTH, MandelbrotCore.HEIGHT);
        animatorChannel.postMessage({ message: "coreready", parameters: coreParams });
        console.log("[mbworker] sent core parameters");
        console.log("[mbworker] starting calculations");
        let rowStart = core.xyStart;
        console.log("[mbworker] calculating row");
        while (!core.isReady) {
            let updateSet = core.calculateRow(rowStart);
            // console.log(`[mbworker] sending coreupdate with ${updateSet.size} points`);
            animatorChannel.postMessage({ message: "coreupdate", updateSet: updateSet });
            rowStart = core.nextRowStart(rowStart);
        }
        console.log("[mbworker] loop done");
    }
    else if (event.data.message == "stop") {
        console.log("[mbworker] got stop message");
        this.close();
    }
    else {
        console.log(`[mbworker] got message ${event.data.message}`);
    }
}, false);
