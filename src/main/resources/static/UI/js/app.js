document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startButton = document.getElementById('start-scan');
    const scannerModal = document.getElementById('scanner-modal');
    const closeButton = document.getElementById('close-scanner');
    const videoElement = document.getElementById('scanner-video');
    const resultElement = document.getElementById('result');
    const scannedResult = document.getElementById('scanned-result');

    // State variables
    let scanning = false;
    let barcodeDetector = null;

    // Helper Functions
    async function captureFrame() {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        canvas.getContext('2d').drawImage(videoElement, 0, 0);
        return canvas.toDataURL('image/jpeg');
    }

    async function fetchProductInfo(barcode) {
        try {
            console.log("Fetching product for barcode:", barcode); // Debug log
            const response = await fetch(`/api/products/${barcode}`);

            console.log("API Response:", response); // Debug log

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Product not found');
            }

            const product = await response.json();
            console.log("Product Data:", product); // Debug log
            return product;

        } catch (error) {
            console.error('API Error:', error);
            return {
                error: error.message,
                barcode: barcode // Include barcode in error
            };
        }
    }

    function displayProductInfo(response) {
        const resultContainer = document.getElementById('scanned-result');
        console.log("Product ready to be displayed:", response);
        if (response.error) {
            resultContainer.innerHTML = `
            <div class="error-message">
                <h3>Error for Barcode: ${response.data.barcode}</h3>
                <p>${response.error}</p>
                <button id="retry-button">Try Again</button>
            </div>
        `;
            document.getElementById('retry-button').addEventListener('click', () => {
                fetchProductInfo(response.data.barcode).then(displayProductInfo);
            });
        } else {
            const product = response.data;
            console.log("Name of the product :", product.name);
            console.log("barcode of the product:", product.barcode);
            resultContainer.innerHTML = `
            <div class="product-info">
                <h3>${product.name || 'Product Not Found'}</h3>
                <h4>${product.brand}</h4>
                <p><strong>Barcode:</strong> ${product.barcode}</p>
                <div class="nutrition-facts">
                    ${product.calories ? `<p>Calories: ${product.calories}</p>` : ''}
                    ${product.protein ? `<p>Protein: ${product.protein}g</p>` : ''}
                </div>
            </div>
        `;
            resultContainer.innerHTML += `
                <button id="scan-another" class="scan-button">Scan Another Item</button>
            `;

                    document.getElementById('scan-another').addEventListener('click', () => {
                        resultContainer.innerHTML = '';
                        scannerModal.style.display = 'block';
                        startScanning();
                    });
        }
    }

    async function handleDetectedBarcode(barcode) {
        resultElement.innerHTML = `<strong>Detected:</strong> ${barcode}`;
        scannedResult.innerHTML = `
            <h3>Scanned Barcode:</h3>
            <p>${barcode}</p>
        `;

        console.log("Handling barcode:", barcode);
        const product = await fetchProductInfo(barcode);
        console.log("Received product:", product);
        displayProductInfo(product);

        // Pause scanning for 3 seconds after detection
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    async function detectBarcodes() {
        if (!scanning) return; // Early exit if scanning was stopped

        try {
            let barcode;

            // Try browser detection first
            if (window.BarcodeDetector && barcodeDetector) {
                const barcodes = await barcodeDetector.detect(videoElement);
                if (barcodes.length > 0) {
                    barcode = barcodes[0].rawValue;
                }
            }

            // Fallback to backend decoding if needed
            if (!barcode) {
                const base64Image = await captureFrame();
                const response = await fetch('/api/decode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64Image })
                });

                if (!response.ok) throw new Error('Decoding failed');
                const result = await response.json();
                barcode = result.barcode; // Assuming API returns {barcode: "...", ...}
            }

            // Process the found barcode
            if (barcode) {
                await handleDetectedBarcode(barcode);
                stopScanning();
                scannerModal.style.display = 'none';
                return; // Exit the detection loop
            }

        } catch (error) {
            console.error('Detection error:', error);
            // Consider showing error to user
            resultElement.textContent = `Error: ${error.message}`;
        }

        // Continue scanning if still active
        if (scanning) {
            requestAnimationFrame(detectBarcodes);
        }
    }

    // Scanner Control Functions
    async function startScanning() {
        try {
            scanning = true;
            resultElement.textContent = "Scanning...";

            // Initialize BarcodeDetector if available
            if ('BarcodeDetector' in window) {
                barcodeDetector = new BarcodeDetector({
                    formats: ['ean_13', 'upc_a', 'code_128']
                });
            }

            // Start camera stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            videoElement.srcObject = stream;

            // Start detection loop
            detectBarcodes();

        } catch (error) {
            console.error("Error starting scanner:", error);
            resultElement.textContent = `Error: ${error.message}`;
        }
    }

    function stopScanning() {
        scanning = false;
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }
        // Add transition effect
        scannerModal.style.opacity = '0';
        setTimeout(() => {
            scannerModal.style.display = 'none';
            scannerModal.style.opacity = '1';
        }, 300);
    }

    // Event Listeners
    startButton.addEventListener('click', () => {
        scannerModal.style.display = 'block';
        startScanning();
    });

    closeButton.addEventListener('click', () => {
        stopScanning();
        scannerModal.style.display = 'none';
    });

    window.addEventListener('beforeunload', stopScanning);
});