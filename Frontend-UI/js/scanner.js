// scanner.js
class BarcodeScanner {
    constructor() {
        this.codeReader = new ZXing.BrowserMultiFormatReader();
        this.scanning = false;
        this.currentStream = null;
    }

    async startScanning(videoElement, resultCallback) {
        try {
            if (this.scanning) return;
            this.scanning = true;

            // Get camera stream
            this.currentStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            videoElement.srcObject = this.currentStream;
            await videoElement.play();

            // Start decoding
            await this.codeReader.decodeFromVideoDevice(
                null,
                videoElement,
                (result, err) => {
                    if (result) {
                        resultCallback(result.text);
                        this.stopScanning();
                    }

                    if (err && !(err instanceof ZXing.NotFoundException)) {
                        console.error('Scanning error:', err);
                        resultCallback(null, err);
                    }
                }
            );

            console.log("Started scanning");
        } catch (error) {
            console.error("Scanner initialization error:", error);
            this.stopScanning();
            resultCallback(null, error);
        }
    }

    stopScanning() {
        if (this.scanning) {
            this.codeReader.reset();
            if (this.currentStream) {
                this.currentStream.getTracks().forEach(track => track.stop());
                this.currentStream = null;
            }
            this.scanning = false;
            console.log("Scanning stopped");
        }
    }
}

// Export an instance of the scanner
const barcodeScanner = new BarcodeScanner();