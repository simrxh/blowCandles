document.addEventListener("DOMContentLoaded", function () {
    const NUM_CANDLES = 21;
    const BLOW_THRESHOLD = 50; // Increased sensitivity from 40 for a light blow
    const statusMessage = document.getElementById("statusMessage");
    const candleHolder = document.getElementById("candle-holder");

    let candles = [];
    let audioContext;
    let analyser;
    let microphone;

    // --- 1. Generate Fixed Candles ---
    function generateFixedCandles() {
        for (let i = 0; i < NUM_CANDLES; i++) {
            const candle = document.createElement("div");
            candle.className = "candle";

            const flame = document.createElement("div");
            flame.className = "flame";
            candle.appendChild(flame);

            candleHolder.appendChild(candle);
            candles.push(candle);
        }
    }

    // --- 2. Check for a Blow ---
    function isBlowing() {
        if (!analyser) return false;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        let average = sum / bufferLength;

        // Check if the average volume exceeds the threshold
        return average > BLOW_THRESHOLD;
    }

    // --- 3. Extinguish Candles ---
    function blowOutCandles() {
        const remainingCandles = candles.filter((candle) => !candle.classList.contains("out"));

        if (remainingCandles.length === 0) {
            clearInterval(blowCheckInterval); // Stop checking if all are out
            statusMessage.textContent = "HAPPY BIRTHDAY A !!!";
            return;
        }

        if (isBlowing()) {
            // Blow out all remaining candles at once (or just a few with Math.random() > 0.8)
            remainingCandles.forEach((candle) => {
                // Here, we extinguish ALL remaining candles on a strong blow
                candle.classList.add("out");
            });
            statusMessage.textContent = `Phew! ${remainingCandles.length} candles blown out!`;

            // Immediately check if all are out to update the final message
            if (candles.every(candle => candle.classList.contains("out"))) {
                statusMessage.textContent = "HAPPY BIRTHDAY A !!!";
                clearInterval(blowCheckInterval);
            }
        }
    }

    let blowCheckInterval;

    // --- 4. Start Microphone and Audio Processing ---
    function startMicrophone() {
        // Prevent starting multiple times
        document.body.removeEventListener('click', startMicrophone);
        statusMessage.textContent = "Requesting microphone access...";
        
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(function (stream) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    analyser = audioContext.createAnalyser();
                    microphone = audioContext.createMediaStreamSource(stream);

                    // Connect the stream to the analyser
                    microphone.connect(analyser);
                    
                    // Set analyser properties
                    analyser.fftSize = 256;
                    
                    statusMessage.textContent = "blow out your candles now !";

                    // Start the blow check loop
                    blowCheckInterval = setInterval(blowOutCandles, 200); 
                })
                .catch(function (err) {
                    console.error("Unable to access microphone: ", err);
                    statusMessage.textContent = "Microphone access denied or failed.";
                });
        } else {
            statusMessage.textContent = "getUserMedia not supported on your browser!";
        }
    }

    // Initial setup
    generateFixedCandles();
    // Use a click event on the body to comply with browser restrictions for starting audio
    document.body.addEventListener('click', startMicrophone, { once: true });
});
