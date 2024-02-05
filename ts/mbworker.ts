import { ComplexCoordinate } from "./ComplexCoordinate.js";
import { CoreParameters } from "./CoreParameters.js";
import { MandelbrotCore } from "./MandelbrotCore.js";

const core = new MandelbrotCore(new ComplexCoordinate(-2, -1.5), 3, 3);

console.log("[mbworker] initialized core");
console.log(`[mbworker] x: ${core.xyStart.real}; inc: ${core.realIncrement}; range: ${core.xRange}`);
console.log(`[mbworker] y: ${core.xyStart.imag}; inc: ${core.imaginaryIncrement}; range: ${core.yRange}`);

let animatorChannel: MessagePort;

self.addEventListener('message', function (event) {
	if (event.data.message == "start") {

		// set the animation worker
		animatorChannel = event.ports[0];

		// send back core parameters
		const coreParams = new CoreParameters(core.xyStart, core.xRange, core.yRange, MandelbrotCore.WIDTH, MandelbrotCore.HEIGHT, core.realIncrement, core.imaginaryIncrement);

		animatorChannel.postMessage({ message: "coreready", parameters: coreParams });

		console.log("[mbworker] sent core parameters; ready for calculation");

		animatorChannel.onmessage = function (event) {
			if (event.data.message == "calcPoints") {
				console.log("[mbworker] starting calculations");

				let rowStart = core.xyStart;

				while (!core.isReady) {
					let updateSet = core.calculateRow(rowStart);
					animatorChannel.postMessage({ message: "coreupdate", updateSet: updateSet });
					rowStart = core.nextRowStart(rowStart);
				}

				console.log("[mbworker] calculations done");
				animatorChannel.postMessage({ message: "coredone" });
			}
			else if (event.data.message == "setZoom") {
				let zoomParams = event.data.zoomParameters;
				let zoomXYStart = zoomParams.xyStart;
				let zoomXRange = zoomParams.xRange;
				let zoomYRange = zoomParams.yRange;

				console.log(`[mbworker][zoom] zoomParams: ${JSON.stringify(zoomParams)}`)

				core.setZoom(zoomXYStart, zoomXRange, zoomYRange);


				console.log(`[mbworker][zoom] x: ${core.xyStart._real}; inc: ${core.realIncrement}; range: ${core.xRange}`);
				console.log(`[mbworker][zoom] y: ${core.xyStart._imag}; inc: ${core.imaginaryIncrement}; range: ${core.yRange}`);
			}
		}

	} else if (event.data.message == "stop") {
		console.log("[mbworker] got stop message");
		this.close();
	} else {
		console.log(`[mbworker] ignoring message ${event.data.message}`);
	}
}, false);