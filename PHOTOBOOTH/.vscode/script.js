const video = document.getElementById("video");
const captureBtn = document.getElementById("capture-btn");
const photosContainer = document.getElementById("photos");
const timerInput = document.getElementById("timer");
const countdownOverlay = document.getElementById("countdown-overlay");
const templateSelect = document.getElementById("template-select");
const downloadContainer = document.getElementById("download-container");

let capturedImages = [];

navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    video.srcObject = stream;
});

captureBtn.addEventListener("click", () => {
    const interval = parseInt(timerInput.value) || 1;
    capturedImages = [];
    photosContainer.innerHTML = "";
    downloadContainer.innerHTML = "";

    captureBtn.disabled = true;
    captureBtn.textContent = "Capturing...";

    let count = 0;

    const autoCapture = setInterval(() => {
        showCountdown(interval, () => {
            capturePhoto();
            count++;
            if (count === 3) {
                clearInterval(autoCapture);
                captureBtn.disabled = false;
                captureBtn.textContent = "Capture";
                triggerConfetti();
            }
        });
    }, (interval + 1) * 1000);
});

function showCountdown(seconds, callback) {
    let count = seconds;
    countdownOverlay.style.visibility = "visible";
    countdownOverlay.textContent = count;

    const countdown = setInterval(() => {
        count--;
        if (count > 0) {
            countdownOverlay.textContent = count;
        } else {
            clearInterval(countdown);
            countdownOverlay.style.visibility = "hidden";
            callback();
        }
    }, 1000);
}

function capturePhoto() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL("image/png");
    capturedImages.push(dataURL);

    updateStrip();
}

function updateStrip() {
    photosContainer.innerHTML = "";
    const stripDiv = document.createElement("div");
    stripDiv.classList.add("strip");

    const selectedTemplate = templateSelect.value;
    stripDiv.classList.add(selectedTemplate);

    const topSpacer = document.createElement("div");
    topSpacer.style.height = "40px";
    stripDiv.appendChild(topSpacer);

    capturedImages.forEach((imgSrc) => {
        const img = document.createElement("img");
        img.src = imgSrc;
        stripDiv.appendChild(img);
    });

    photosContainer.appendChild(stripDiv);

    downloadContainer.innerHTML = "";

    if (capturedImages.length === 3) {
        const button = document.createElement("button");
        button.textContent = "Download";
        button.style.marginTop = "10px";
        button.addEventListener("click", () => {
            downloadStrip(stripDiv);
        });
        downloadContainer.appendChild(button);
    }
}

function downloadStrip(stripElement) {
    const imgWidth = 300;
    const imgHeight = 660;

    const stripCanvas = document.createElement("canvas");
    stripCanvas.width = imgWidth;
    stripCanvas.height = imgHeight;

    const ctx = stripCanvas.getContext("2d");

    const images = Array.from(stripElement.querySelectorAll("img"));
    const templateName = templateSelect.value;

    const templateImageMap = {
        "template1": "template1.png",
        "template2": "template2.png",
        "template3": "template3.png",
    };

    const templateSrc = templateImageMap[templateName];
    const templateImg = new Image();
    templateImg.src = templateSrc;

    templateImg.onload = () => {
        ctx.drawImage(templateImg, 0, 0, imgWidth, imgHeight);

        const framePositions = [
            { x: 35, y: 100, width: 230, height: 140 }, // Adjusted position and size for first frame
            { x: 35, y: 250, width: 230, height: 140 }, // Adjusted position and size for second frame
            { x: 35, y: 400, width: 230, height: 140 }, // Adjusted position and size for third frame
        ];

        let loadedCount = 0;
        images.forEach((img, index) => {
            const userImg = new Image();
            userImg.src = img.src;

            userImg.onload = () => {
                const frame = framePositions[index];
                ctx.drawImage(userImg, frame.x, frame.y, frame.width, frame.height);

                loadedCount++;
                if (loadedCount === images.length) {
                    const link = document.createElement("a");
                    link.download = "photo-strip.png";
                    link.href = stripCanvas.toDataURL();
                    link.click();

                    capturedImages = [];
                    photosContainer.innerHTML = "";
                    downloadContainer.innerHTML = "";
                }
            };
        });
    };
}

function triggerConfetti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
    });
}
