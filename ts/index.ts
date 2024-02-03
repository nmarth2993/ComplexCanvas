
// ref: https://macarthur.me/posts/animate-canvas-in-a-worker
document.addEventListener("DOMContentLoaded", function () {
    console.log("loaded");
    const canvas = <HTMLCanvasElement>document.getElementById('complex-canvas');

    let workerChannel = new MessageChannel();
    const animworker = new Worker("src/worker.js", { type: "module" });

    const offscreenCanvas = canvas.transferControlToOffscreen();
    animworker.postMessage({ message: "start", canvas: offscreenCanvas }, [offscreenCanvas, workerChannel.port1]);
    animworker.postMessage({ message: "process" });

    let mbworker = new Worker("src/mbworker.js", { type: "module" });
    mbworker.postMessage({ message: "start" }, [workerChannel.port2]);

    // setTimeout(() => { worker.postMessage({ message: "stop" }) }, 4000);
});
