import { ColoredComplex } from "./ColoredComplex";
import { CoreParameters } from "./CoreParameters";

const HEIGHT = 1000;
const WIDTH = 1000;

let coreParameters: CoreParameters;

let mbPoints = new Set<ColoredComplex>();


let canvas: HTMLCanvasElement | null;
let context: CanvasRenderingContext2D | null;

function drawAnimation() {
	if (canvas == null || context == null) {
		console.log("[animworker] canvas or context is null");
		return;
	}


	const imageData = context.createImageData(WIDTH, HEIGHT);
	const data = imageData.data;


	console.log(`[animworker] pointList length: ${mbPoints.size}`)


	mbPoints.forEach(coloredCoordinate => {
		// using left-shift to coerce the number to an integer
		let xPixel = ((coloredCoordinate.getZ().real - coreParameters.xyStart.real) * (coreParameters.width / coreParameters.xRange)) << 0;
		let yPixel = ((coreParameters.xyStart.imag + coreParameters.yRange - coloredCoordinate.getZ().imag) * coreParameters.height / coreParameters.yRange) << 0;

		data[yPixel * (WIDTH * 4) + xPixel * 4] = coloredCoordinate.color.r;
		data[yPixel * (WIDTH * 4) + xPixel * 4 + 1] = coloredCoordinate.color.g;
		data[yPixel * (WIDTH * 4) + xPixel * 4 + 2] = coloredCoordinate.color.b;
		data[yPixel * (WIDTH * 4) + xPixel * 4 + 3] = 255; // default full opaque
	});

	context.putImageData(imageData, 0, 0);

	requestAnimationFrame(drawAnimation);
}


self.addEventListener('message', function (event) {


	// TODO: this is so easy, just make an event listener for a posted message and then that triggers the repaint
	// whenever a new row is available from the mbworker
	// this is so simpleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
	// so mbworker just works and passes the set back to this function that will then request an animation frame,
	// calling the function that draws the point data in the returned set


	// make a global set
	// listen for messages being passed
	// when a set is received, add that to the global set to be drawn

	console.log(`${JSON.stringify(event.data)}`);

	if (event.data.message == "start") {
		console.log("[animworker] got start message");
		canvas = event.data.canvas;
		if (canvas == null) {
			console.log("[animworker] no canvas passed to worker");
			return;
		}
		context = canvas.getContext("2d");
		this.requestAnimationFrame(() => { context?.strokeText("Canvas loaded, please wait", 50, 50); console.log("[animworker][text] load text drawn") });
		console.log("[animworker] got canvas and context");
	}
	else if (event.data.message == "process") {
		console.log("[animworker] starting calculation");

		this.requestAnimationFrame(() => { context?.strokeText("Please wait, fractal loading", 50, 50); console.log("[animworker][text] fractal text drawn") });
		// TODO: send the message to calculate points here
		let mbworker = new Worker("src/mbworker.js", { type: "module" });

		mbworker.postMessage({ message: "start" });
		drawAnimation();
	}
	else if (event.data.message == "stop") {
		console.log("[animworker] got stop message")
		close();
	}
	else if (event.data.message == "coreready") {
		// retrieve necessary data from the core to be able to plot the points
		// (xyStart, xRange, yRange, width, height)
		coreParameters = event.data.parameters;
	}
	else if (event.data.message == "coreupdate") {
		let updateSet: Set<ColoredComplex> = event.data.updateSet;
		updateSet.forEach(coloredCoordinate => {
			mbPoints.add(coloredCoordinate);
		});
		console.log("[animworker] updated points set");
	}
	else {
		console.log("[animworker] got some other message (unknown)");
	}
}, false);