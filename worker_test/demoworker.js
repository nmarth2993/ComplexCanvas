function drawHeart() {
	ctx.fillStyle = 'rgba(82, 255, 224, 1)';
	ctx.beginPath();
	ctx.moveTo(125, 50);
	ctx.bezierCurveTo(75, 0, 0, 75, 125, 175);
	ctx.bezierCurveTo(250, 75, 175, 0, 125, 50);
	ctx.fill();
}
function drawAndRotate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.translate(125, 125); // translate to center of the heart
	ctx.rotate(angle);
	ctx.translate(-125, -95); // adjust the position to center the heart
	drawHeart();
	ctx.restore();
	angle += Math.PI / 180;
	requestAnimationFrame(drawAndRotate);
}

let x = 0;

function drawAnimation() {
	ctx.fillStyle = 'rgba(82, 255, 224, 1)';
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillRect(10 + x, 10, 50, 50);
	x++;

	// setTimeout(() => { }, 100);
	requestAnimationFrame(drawAnimation);
}

let canvas;
let ctx;
onmessage = (event) => {
	console.log(`${JSON.stringify(event.data)}`);
	if (event.data.message == "start") {
		canvas = event.data.canvas;
		ctx = canvas.getContext('2d');
		console.log("got canvas");
	}
	else if (event.data.message == "process") {
		drawAnimation();
	}
	else if (event.data.message == "stop") {
		close();
	}

};