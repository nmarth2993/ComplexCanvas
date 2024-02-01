document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById('canvas');
  const button = document.getElementById('button');

  /*
  button.addEventListener('click', () => {
    button.innerText = 'Blocked!';
    button.disabled = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const start = Date.now();
        while (Date.now() - start < 3000) { };
        button.innerText = 'Block for Three Seconds';
      });
    });
  });
  */



  // const blob = new Blob([workerScript], { type: 'text/javascipt' });
  // const worker = new Worker(window.URL.createObjectURL(blob));

  const worker = new Worker("demoworker.js");

  const offscreenCanvas = canvas.transferControlToOffscreen();
  worker.postMessage({ message: "start", canvas: offscreenCanvas }, [offscreenCanvas]);
  worker.postMessage({ message: "process" });


  setTimeout(() => { worker.postMessage({ message: "stop" }) }, 4000);
});