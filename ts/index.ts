
// ref: https://macarthur.me/posts/animate-canvas-in-a-worker
document.addEventListener("DOMContentLoaded", function () {
    console.log("loaded");
    const canvas = <HTMLCanvasElement>document.getElementById('complex-canvas');

    const worker = new Worker("src/worker.js", { type: "module" });

    const offscreenCanvas = canvas.transferControlToOffscreen();
    worker.postMessage({ message: "start", canvas: offscreenCanvas }, [offscreenCanvas]);
    worker.postMessage({ message: "process" });

    console.log("worker started");

    // setTimeout(() => { worker.postMessage({ message: "stop" }) }, 4000);

    console.log("worker period ended");
});
