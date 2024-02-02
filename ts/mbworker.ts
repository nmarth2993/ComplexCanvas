import { ComplexCoordinate } from "./ComplexCoordinate.js";
import { CoreParameters } from "./CoreParameters.js";
import { MandelbrotCore } from "./MandelbrotCore.js";

const core = new MandelbrotCore(new ComplexCoordinate(-2, -1.5), 3, 3);

console.log("[mbworker] got core");
console.log(`[mbworker] x: ${core.xyStart.real}; inc: ${core.realIncrement}; range: ${core.xRange}`);
console.log(`[mbworker] y: ${core.xyStart.imag}; inc: ${core.imaginaryIncrement}; range: ${core.yRange}`);

self.addEventListener('message', function (event) {
	if (event.data.message == "start") {
		// send back core parameters
		const coreParams = new CoreParameters(core.xyStart, core.xRange, core.yRange, MandelbrotCore.WIDTH, MandelbrotCore.HEIGHT);

		this.postMessage({ message: "yes", parameters: coreParams });
		this.postMessage({ message: "coreready", parameters: coreParams });

		console.log("[mbworker] sent core parameters");

		console.log("[mbworker] starting calculations");

		// need to somehow incrementally send the points that are calculated
		// currently no way of doing that since the for loop calculates all points row by row

		// make an interface in MandelbrotCore.ts to be able to handle this
		let rowStart = core.xyStart;
		while (!core.isReady) {
			// calculate the row
			let updateSet = core.calculateRow(rowStart);

			// post the updated set to the parent worker
			this.postMessage({ message: "coreupdate", updateSet: updateSet })

			// calculate the new rowstart based on the previous rowstart
			rowStart = core.nextRowStart(rowStart);

		}
	} else if (event.data.message == "stop") {
		console.log("[mbworker] got stop message");
		this.close();
	}
}, false);