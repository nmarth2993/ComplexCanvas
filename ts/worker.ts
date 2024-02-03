import { ColoredComplex } from "./ColoredComplex.js";
import { CoreParameters } from "./CoreParameters.js";
import { Rect } from "./Rect.js";

const HEIGHT = 1000;
const WIDTH = 1000;

const ZOOM_RECT_WIDTH = 100;
const ZOOM_RECT_HEIGHT = 100;

let coreParameters: CoreParameters | undefined;

let mbPoints = new Set<ColoredComplex>();

let channelPort: MessagePort;

let canvas: HTMLCanvasElement | null;
let context: CanvasRenderingContext2D | null;

let zoomRect: Rect | null;

let zoomStack = Array<CoreParameters>();

function drawAnimation() {
	if (canvas == null || context == null || coreParameters == null) {
		// console.warn("[animworker] skipping canvas update; missing required oneOf{canvas, context, coreParameters}");

		// probably should synchronize this correctly with mbworker by sending two separate messages
		// but for now, coreParameters will be set shortly so just retry

		// FIXME: in fact, I have to have coreParameters first if I want to display progress
		// it seems like that is not quite the case, but I should still add another message to tell core when to start calculating
		setTimeout(() => { requestAnimationFrame(drawAnimation); }, 150);
		return;
	}

	const imageData = context.createImageData(WIDTH, HEIGHT);
	const data = imageData.data;

	// TODO: avoid calculating the imagedata every time if the calculation has finished with a complete image
	// store the imagedata once and update using that. most challenging part of this will be detecting when the image is ready
	// probably create a new onmessage command for "coredone" and update a boolean based on the events
	mbPoints.forEach(coloredCoordinate => {

		// XXX: not sure why I have to access these private fields for them to appear, look into this later

		// using left-shift to coerce the number to an integer
		let xPixel = ((coloredCoordinate._real - coreParameters._xyStart._real) * (coreParameters._width / coreParameters._xRange)) << 0;
		let yPixel = ((coreParameters._xyStart._imag + coreParameters._yRange - coloredCoordinate._imag) * coreParameters._height / coreParameters._yRange) << 0;

		data[yPixel * (WIDTH * 4) + xPixel * 4] = coloredCoordinate._color.r;
		data[yPixel * (WIDTH * 4) + xPixel * 4 + 1] = coloredCoordinate._color.g;
		data[yPixel * (WIDTH * 4) + xPixel * 4 + 2] = coloredCoordinate._color.b;
		data[yPixel * (WIDTH * 4) + xPixel * 4 + 3] = 255; // default full opaque
	});

	context.putImageData(imageData, 0, 0);

	if (zoomRect != null) {
		console.log("[animworker] drawing zoomRect");
		context.strokeStyle = "yellow";
		context.strokeRect(zoomRect.x, zoomRect.y, zoomRect.width, zoomRect.height);
	}

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
				updateSet.forEach(coloredCoordinate => {
					mbPoints.add(coloredCoordinate);
				});
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
	else if (event.data.message == "zoom") {
		let offsetX = event.data.x;
		let offsetY = event.data.y;

		console.log("[animworker] canvas clicked");
		if (zoomRect == null || !zoomRect.intersects(offsetX, offsetY)) {
			zoomRect = new Rect(offsetX - ZOOM_RECT_WIDTH / 2, offsetY - ZOOM_RECT_HEIGHT / 2, ZOOM_RECT_WIDTH, ZOOM_RECT_HEIGHT);
			return;
		}

		// perform zoom operation
		// this may take some more development on the message passing between the core and the animator
		console.log("zooming in...");

		// null the zoomRect again to reset it
		zoomRect = null;

		if (coreParameters == null) {
			return;
		}
		// push CoreParameters object onto stack
		zoomStack.push(coreParameters);

	}
	else if (event.data.message == "zoomout") {
		// FIXME: use the lock boolean to ensure the zoom level doesn't change during calculation
		console.log("[animworker] canvas rightclicked");

		zoomRect = null;

		if (zoomStack.length == 0) {
			return;
		}
		// zoom out using the top CoreParameter object on the stack
		coreParameters = zoomStack.pop();
	}
	else {
		console.log("[animworker] got some other message (unknown)");
	}
}, false);