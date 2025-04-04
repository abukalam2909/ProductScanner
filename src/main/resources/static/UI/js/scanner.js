class BarcodeScanner {
    constructor() {
        this.codeReader = new ZXing.BrowserMultiFormatReader();
        this.scanning = false;
    }

    async startScanning(videoElement, resultCallback) {
        try {
            this.scanning = true;
            
            await this.codeReader.decodeFromVideoDevice(
                undefined, 
                videoElement, 
                (result, err) => {
                    if (result) {
                        resultCallback(result, null);
                        this.stopScanning();
                    }
                    
                    if (err && !(err instanceof ZXing.NotFoundException)) {
                        resultCallback(null, err);
                    }
                }
            );
            
            console.log("Started scanning");
        } catch (error) {
            resultCallback(null, error);
        }
    }

    stopScanning() {
        if (this.scanning) {
            this.codeReader.reset();
            this.scanning = false;
            console.log("Scanning stopped");
        }
    }
}