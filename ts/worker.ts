import { ColoredComplex } from "./ColoredComplex.js";
import { ComplexCoordinate } from "./ComplexCoordinate.js";
import { CoreParameters } from "./CoreParameters.js";
import { Rect } from "./Rect.js";

// these are the dimensions of the canvas
// 840 is highly composite
const HEIGHT = 840;
const WIDTH = 840;

const ZOOM_RECT_WIDTH = 100;
const ZOOM_RECT_HEIGHT = 100;

let coreDone = false;
let finishedImageData: ImageData | null;

let coreParameters: CoreParameters | undefined;

let mbPoints = new Set<ColoredComplex>();

let coreWorkerPort: MessagePort;
let statusPort: MessagePort;

let canvas: HTMLCanvasElement | null;
let context: CanvasRenderingContext2D | null;

let zoomRect: Rect | null;

// TODO: in addition to storing previous zooms, imagedata should also be stored in a stack
// to support instant zoom-outs. add a checkbox for [ ] save previous zoom images (uses more memory but speeds up zooming out and lowers CPU usage when zooming out)
let zoomStack = Array<CoreParameters>();

function drawAnimation() {
	if (canvas == null || context == null || coreParameters == null) {
		// console.warn("[animworker] skipping canvas update; missing required oneOf{canvas, context, coreParameters}");
		setTimeout(() => { requestAnimationFrame(drawAnimation); }, 150);
		return;
	}

	if (finishedImageData != null) {
		// NOTE: there is a cleaner way to to this, revisit and refactor
		context.putImageData(finishedImageData, 0, 0);

		if (zoomRect != null) {
			context.strokeStyle = "rgb(0, 255, 255)";
			context.strokeRect(zoomRect.x, zoomRect.y, zoomRect.width, zoomRect.height);
		}

		setTimeout(() => { requestAnimationFrame(drawAnimation); }, 50);
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
		let xPixel = ((coloredCoordinate._real - coreParameters!._xyStart._real) * (coreParameters!._width / coreParameters!._xRange)) << 0;
		let yPixel = ((coreParameters!._xyStart._imag + coreParameters!._yRange - coloredCoordinate._imag) * coreParameters!._height / coreParameters!._yRange) << 0;

		data[yPixel * (WIDTH * 4) + xPixel * 4] = coloredCoordinate._color.r;
		data[yPixel * (WIDTH * 4) + xPixel * 4 + 1] = coloredCoordinate._color.g;
		data[yPixel * (WIDTH * 4) + xPixel * 4 + 2] = coloredCoordinate._color.b;
		data[yPixel * (WIDTH * 4) + xPixel * 4 + 3] = 255; // default full opaque
	});

	if (coreDone) {
		finishedImageData = imageData;
	}

	context.putImageData(imageData, 0, 0);

	if (zoomRect != null) {
		console.log("[animworker] drawing zoomRect");
		context.strokeStyle = "rgb(0, 255, 255)";
		context.strokeRect(zoomRect.x, zoomRect.y, zoomRect.width, zoomRect.height);
	}

	setTimeout(() => { requestAnimationFrame(drawAnimation); }, 50);

}

function calculateIncrement(range: number, dimension: number): number {
	// XXX: temporary and hacky fix for updating the core's increments
	// not sure if a message passing solution would work here, and in the interest of time
	// I will settle for potentially breaking the density function
	// (density isn't critial functionality so we can ignore it for now)
	// could also just pass density and include it in the calculation here...
	// lots of duplicate functions though, which is not great...
	return range / dimension;
}

function calculateZoomXYStart(): ComplexCoordinate {
	let xPoint = coreParameters!._xyStart._real + ((zoomRect!.x * coreParameters!._xRange) / coreParameters!._width);
	let yPoint = coreParameters!._xyStart._imag + coreParameters!._yRange - (((zoomRect!.y + zoomRect!.height) * coreParameters!._yRange) / coreParameters!._height);
	return new ComplexCoordinate(xPoint, yPoint);
	/*
		double xPoint = core.xyStart().real() + ((getZRect().getMinX() * core.xRange()) / MandelbrotCore.WIDTH);
		double yPoint = core.xyStart().imaginary() + core.yRange() - ((getZRect().getMaxY() * core.yRange()) / MandelbrotCore.HEIGHT);
	return new ComplexCoordinate(xPoint, yPoint);
	*/
}

function calculateZoomXRange() {
	// using the ACTUAL realIncrement, not the previous one from coreParameters here
	let xIncrement = calculateIncrement(coreParameters!._xRange, coreParameters!._width);
	return xIncrement * (zoomRect!.x + zoomRect!.width) - xIncrement * zoomRect!.x;
	// return xIncrement * zoomRect!.width;

	// return coreParameters!._realIncrement * (zoomRect!.x + zoomRect!.width) - coreParameters!._realIncrement * zoomRect!.x;
	// return core.realIncrement() * getZRect().getMaxX() - core.realIncrement() * getZRect().getMinX();
}

function calculateZoomYRange() {
	// using the ACTUAL realIncrement, not the previous one from coreParameters here
	let yIncrement = calculateIncrement(coreParameters!._yRange, coreParameters!._height);
	return yIncrement * (zoomRect!.y + zoomRect!.height) - yIncrement * zoomRect!.y;
	// return yIncrement * zoomRect!.height;

	// return coreParameters!._imaginaryIncrement * (zoomRect!.y + zoomRect!.height) - coreParameters!._imaginaryIncrement * zoomRect!.y;
	// return core.imaginaryIncrement() * getZRect().getMaxY() - core.imaginaryIncrement() * getZRect().getMinY();
}


self.addEventListener('message', function (event) {

	// make a global set
	// listen for messages being passed
	// when a set is received, add that to the global set to be drawn

	// console.log(`${JSON.stringify(event.data)}`);

	if (event.data.message == "start") {
		canvas = event.data.canvas;

		if (canvas == null) {
			console.error("[animworker] no canvas passed to worker");
			return;
		}
		if (event.ports[0] == null) {
			console.error("[animworker] did not find the required channel port");
			return;
		}
		if (event.ports[1] == null) {
			console.error("[animworker] did not find the required status port");
			return;
		}

		coreWorkerPort = event.ports[0];

		// the communication between the animator and the core is handled through the MessagePort
		// which means the MessagePort itself needs the onmessage handler
		coreWorkerPort.onmessage = function (event) {
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
			else if (event.data.message == "coredone") {
				coreDone = true;
				statusPort.postMessage({ message: "doneloading" });
			}
		}



		statusPort = event.ports[1];


		// draw the waiting text
		context = canvas.getContext("2d");
		// this.requestAnimationFrame(() => { context?.strokeText("Canvas loaded, please wait", 50, 50); console.log("[animworker][text] load text drawn") });
		console.log("[animworker] got canvas and context");
	}
	else if (event.data.message == "process") {
		// this.requestAnimationFrame(() => { context?.strokeText("Please wait, fractal loading", 50, 50); console.log("[animworker][text] fractal text drawn") });
		coreWorkerPort.postMessage({ message: "calcPoints" });
		this.requestAnimationFrame(drawAnimation);
	}
	else if (event.data.message == "stop") {
		console.log("[animworker] got stop message")
		this.close();
	}
	else if (event.data.message == "zoom") {
		if (!coreDone) {
			return;
		}
		let offsetX = event.data.x;
		let offsetY = event.data.y;

		if (zoomRect == null || !zoomRect.intersects(offsetX, offsetY)) {
			zoomRect = new Rect(offsetX - ZOOM_RECT_WIDTH / 2, offsetY - ZOOM_RECT_HEIGHT / 2, ZOOM_RECT_WIDTH, ZOOM_RECT_HEIGHT);
			return;
		}

		// perform zoom operation
		// this may take some more development on the message passing between the core and the animator

		// first, throw away the points in the set and mark the states that need to be recomputed
		mbPoints.clear();
		coreDone = false;
		finishedImageData = null;
		statusPort.postMessage({ message: "loading" });


		// push CoreParameters object onto stack
		zoomStack.push(structuredClone(coreParameters!));

		let zoomXYStart = calculateZoomXYStart();
		let zoomXRange = calculateZoomXRange();
		let zoomYRange = calculateZoomYRange();

		coreParameters!._xyStart = zoomXYStart;
		coreParameters!._xRange = zoomXRange;
		coreParameters!._yRange = zoomYRange;

		let zoomParams = { xyStart: zoomXYStart, xRange: zoomXRange, yRange: zoomYRange };
		console.log(`[animworker][zoom] zoomParams: ${JSON.stringify(zoomParams)}`)

		coreWorkerPort.postMessage({ message: "setZoom", zoomParameters: zoomParams });



		// null the zoomRect again to reset it
		// null this after the calculateZoom methods because it is used to compute the new ranges
		zoomRect = null;

		if (coreParameters == null) {
			return;
		}

		coreWorkerPort.postMessage({ message: "calcPoints" });
	}
	else if (event.data.message == "zoomOut") {
		// for the lazy zoom out, consider whether it is necessary to even call calculatePoints() for that zoom level
		console.log("[animworker] zoomOut event");
		if (!coreDone) {
			console.log("[animworker] working; ignoring zoom out");
			return;
		}

		zoomRect = null;

		if (zoomStack.length == 0) {
			console.log("[animworker] zoom stack empty");
			return;
		}

		// zoom out using the top CoreParameter object on the stack
		coreParameters = zoomStack.pop();
		console.log("[animworker] popped zoom stack");

		// for now, just recalculate
		// NOTE: this part will have to change if using the lazy redraw

		// need to set the zoom back to previous to be able to recalculate the image
		let zoomParams = { xyStart: coreParameters!._xyStart, xRange: coreParameters!._xRange, yRange: coreParameters!._yRange };
		console.log(`[animworker][zoomout] zoomParams: ${JSON.stringify(zoomParams)}`);
		coreWorkerPort.postMessage({ message: "setZoom", zoomParameters: zoomParams });

		context?.clearRect(0, 0, WIDTH, HEIGHT);
		mbPoints.clear();

		// XXX: using this for now to get some testing done
		coreDone = false;
		finishedImageData = null;
		statusPort.postMessage({ message: "loading" });

		coreWorkerPort.postMessage({ message: "calcPoints" });
	}
	else {
		console.log(`[animworker] ignoring unknown message ${event.data.message}`);
	}
}, false);