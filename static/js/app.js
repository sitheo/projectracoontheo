const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

const detectedText = document.getElementById("detected");
const confidenceText = document.getElementById("confidence");
const fpsText = document.getElementById("fps");
const statusText = document.getElementById("status");

let processing = false;
let running = false;
let lastTime = performance.now();

async function startCamera() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480,
                facingMode: "environment"
            }
        });

        video.srcObject = stream;

        await video.play();

        resizeCanvas();

        running = true;

        statusText.innerHTML =
            '<span class="badge bg-success">Running</span>';

        requestAnimationFrame(loop);

    } catch (err) {

        console.error(err);

        statusText.innerHTML =
            '<span class="badge bg-danger">Camera Error</span>';

    }

}

function stopCamera() {

    running = false;

    const stream = video.srcObject;

    if (stream) {

        stream.getTracks().forEach(track => track.stop());

    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    statusText.innerHTML =
        '<span class="badge bg-secondary">Stopped</span>';

}

function resizeCanvas() {

    const rect = video.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

}

window.addEventListener("resize", resizeCanvas);

video.addEventListener("loadedmetadata", resizeCanvas);

async function loop() {

    if (!running) return;

    if (!processing) {

        processing = true;

        await detect();

        processing = false;

    }

    requestAnimationFrame(loop);

}

async function detect() {

    const captureCanvas = document.createElement("canvas");

    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;

    const captureCtx = captureCanvas.getContext("2d");

    captureCtx.drawImage(
        video,
        0,
        0,
        captureCanvas.width,
        captureCanvas.height
    );

    const blob = await new Promise(resolve =>
        captureCanvas.toBlob(resolve, "image/jpeg", 0.8)
    );

    const formData = new FormData();

    formData.append(
        "image",
        blob,
        "frame.jpg"
    );

    const response = await fetch("/predict", {

        method: "POST",

        body: formData

    });

    const data = await response.json();

    drawBoxes(data.detections);

    const now = performance.now();

    fpsText.innerText =
        (1000 / (now - lastTime)).toFixed(1);

    lastTime = now;

}

function drawBoxes(detections) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

    detectedText.innerText = detections.length;

    if (detections.length > 0) {

        confidenceText.innerText =
            (detections[0].confidence * 100).toFixed(1) + "%";

    } else {

        confidenceText.innerText = "0%";

    }

    detections.forEach(det => {

        const [x1, y1, x2, y2] = det.bbox;

        ctx.strokeStyle = "#00ff00";

        ctx.lineWidth = 3;

        ctx.strokeRect(

            x1 * scaleX,

            y1 * scaleY,

            (x2 - x1) * scaleX,

            (y2 - y1) * scaleY

        );

        ctx.fillStyle = "#00ff00";

        ctx.font = "18px Arial";

        ctx.fillText(

            `${det.class} ${(det.confidence * 100).toFixed(1)}%`,

            x1 * scaleX,

            y1 * scaleY - 8

        );

    });

}

window.onload = () => {

    startCamera();

};