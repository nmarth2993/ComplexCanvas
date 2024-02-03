import { ColoredComplex } from "./ColoredComplex";
import { CoreParameters } from "./CoreParameters";

const HEIGHT = 1000;
const WIDTH = 1000;

let coreParameters: CoreParameters;

let mbPoints = new Set<ColoredComplex>();

let channelPort: MessagePort;

let canvas: HTMLCanvasElement | null;
let context: CanvasRenderingContext2D | null;

function drawAnimation() {
	if (canvas == null || context == null || coreParameters == null) {
		// console.warn("[animworker] skipping canvas update; missing required oneOf{canvas, context, coreParameters}");

		// probably should synchronize this correctly with mbworker by sending two separate messages
		// but for now, coreParameters will be set shortly so just retry
		// FIXME: in fact, I have to have coreParameters first if I want to display progress
		setTimeout(() => { requestAnimationFrame(drawAnimation); }, 100);
		return;
	}

	const imageData = context.createImageData(WIDTH, HEIGHT);
	const data = imageData.data;

	// console.log(`[animworker] pointList length: ${mbPoints.size}`)
	// console.log(`[animworker] coreParameters: ${JSON.stringify(coreParameters)}`);

	// console.log(`[animworker] drawing ${mbPoints.size} points`);

	mbPoints.forEach(coloredCoordinate => {
		// console.log(`drawing ${JSON.stringify(coloredCoordinate)}`);
		// using left-shift to coerce the number to an integer

		let xPixel = ((coloredCoordinate._real - coreParameters._xyStart._real) * (coreParameters._width / coreParameters._xRange)) << 0;
		let yPixel = ((coreParameters._xyStart._imag + coreParameters._yRange - coloredCoordinate._imag) * coreParameters._height / coreParameters._yRange) << 0;

		data[yPixel * (WIDTH * 4) + xPixel * 4] = coloredCoordinate._color.r;
		data[yPixel * (WIDTH * 4) + xPixel * 4 + 1] = coloredCoordinate._color.g;
		data[yPixel * (WIDTH * 4) + xPixel * 4 + 2] = coloredCoordinate._color.b;
		data[yPixel * (WIDTH * 4) + xPixel * 4 + 3] = 255; // default full opaque
	});

	context.putImageData(imageData, 0, 0);
	// console.log(`[animworker] done drawing frame`);

	/*
	let r = Math.random() * 256;
	let g = Math.random() * 256;
	let b = Math.random() * 256;

	let xr = Math.random() * 40;
	let yr = Math.random() * 40;

	console.log(`rgb(${r}, ${g}, ${b})`);

	context.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + "255)";
	context.font = "48px sans-serif";
	context.clearRect(50, 300, 350, 250);
	context.strokeText("Testing123", 50 + xr, 450 + yr);
	*/

	setTimeout(() => { requestAnimationFrame(drawAnimation); }, 100);

}

self.addEventListener('message', function (event) {

	// make a global set
	// listen for messages being passed
	// when a set is received, add that to the global set to be drawn

	console.log(`${JSON.stringify(event.data)}`);

	if (event.data.message == "start") {
		console.log("[animworker] got start message");
		canvas = event.data.canvas;

		if (canvas == null) {
			console.error("[animworker] no canvas passed to worker");
			return;
		}
		if (event.ports[0] == null) {
			console.error("[animworker] did not find the required channel port");
			return;
		}

		channelPort = event.ports[0];

		// the communication between the animator and the core is handled through the MessagePort
		// which means the MessagePort itself needs the onmessage handler
		channelPort.onmessage = function (event) {
			if (event.data.message == "coreready") {
				// retrieve necessary data from the core to be able to plot the points
				// (xyStart, xRange, yRange, width, height)
				coreParameters = event.data.parameters;
				console.log(`[animworker] got coreParameters: ${JSON.stringify(coreParameters)}`);
			}
			else if (event.data.message == "coreupdate") {
				let updateSet: Set<ColoredComplex> = event.data.updateSet;
				// console.log(`[animworker] read updateSet with ${updateSet.size} points`);
				updateSet.forEach(coloredCoordinate => {
					mbPoints.add(coloredCoordinate);
				});
				// console.log(`[animworker] updated points set, mbpoints is now size ${mbPoints.size}`);
			}
		}

		// draw the waiting text
		context = canvas.getContext("2d");
		this.requestAnimationFrame(() => { context?.strokeText("Canvas loaded, please wait", 50, 50); console.log("[animworker][text] load text drawn") });
		console.log("[animworker] got canvas and context");
	}
	else if (event.data.message == "process") {
		this.requestAnimationFrame(() => { context?.strokeText("Please wait, fractal loading", 50, 250); console.log("[animworker][text] fractal text drawn") });
		this.requestAnimationFrame(drawAnimation);
	}
	else if (event.data.message == "stop") {
		console.log("[animworker] got stop message")
		this.close();
	}
	else {
		console.log("[animworker] got some other message (unknown)");
	}
}, false);