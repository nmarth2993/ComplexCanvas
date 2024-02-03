"use strict";
// ref: https://macarthur.me/posts/animate-canvas-in-a-worker
document.addEventListener("DOMContentLoaded", function () {
    console.log("loaded");
    const canvas = document.getElementById('complex-canvas');
    let workerChannel = new MessageChannel();
    const animworker = new Worker("src/worker.js", { type: "module" });
    // add the event listeners to the DOM objects. the canvas is about to be transferred off screen
    // so adding event listeners in the worker will not help
    canvas.addEventListener("click", (event) => {
        animworker.postMessage({ message: "zoom", x: event.offsetX, y: event.offsetY });
    });
    canvas.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        animworker.postMessage({ message: "zoomout", x: event.offsetX, y: event.offsetY });
    });
    const offscreenCanvas = canvas.transferControlToOffscreen();
    animworker.postMessage({ message: "start", canvas: offscreenCanvas }, [offscreenCanvas, workerChannel.port1]);
    animworker.postMessage({ message: "process" });
    let mbworker = new Worker("src/mbworker.js", { type: "module" });
    mbworker.postMessage({ message: "start" }, [workerChannel.port2]);
});
