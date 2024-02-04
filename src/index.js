"use strict";
// ref: https://macarthur.me/posts/animate-canvas-in-a-worker
document.addEventListener("DOMContentLoaded", function () {
    console.log("loaded");
    const loadingText = document.getElementById("loading-text");
    // the status channel is used to communicate state (such as loading/done) to index.js
    // so that appropriate DOM elements can be modified
    let statusChannel = new MessageChannel();
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
        animworker.postMessage({ message: "zoomOut", x: event.offsetX, y: event.offsetY });
    });
    // add the message listener for the status port in the animation worker
    // I need to set this on port2, I don't know why but it works so I don't ask questions
    statusChannel.port2.onmessage = function (event) {
        if (event.data.message == "loading") {
            loadingText.textContent = "Loading...";
            console.log("set text to loading...");
        }
        else if (event.data.message == "doneloading") {
            loadingText.textContent = "Done.";
            console.log("set text to done.");
        }
    };
    const offscreenCanvas = canvas.transferControlToOffscreen();
    animworker.postMessage({ message: "start", canvas: offscreenCanvas }, [offscreenCanvas, workerChannel.port1, statusChannel.port1]);
    animworker.postMessage({ message: "process" });
    let mbworker = new Worker("src/mbworker.js", { type: "module" });
    mbworker.postMessage({ message: "start" }, [workerChannel.port2]);
});
