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
            const decodePromise = new Promise((resolve, reject) => {
                this.codeReader.decodeFromVideoDevice(
                    null,
                    videoElement,
                    (result, err) => {
                        if (result) {
                            resolve(result.text);
                        }
                        if (err && !(err instanceof ZXing.NotFoundException)) {
                            reject(err);
                        }
                    }
                );
            });

            const barcode = await decodePromise;
            resultCallback(barcode, null);
            this.stopScanning();

        } catch (error) {
            this.stopScanning();
            resultCallback(null, error);
            throw error; // Re-throw for outer catch block
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
        }
    }
}