document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startButton = document.getElementById('start-scan');
    const scannerModal = document.getElementById('scanner-modal');
    const closeButton = document.getElementById('close-scanner');
    const videoElement = document.getElementById('scanner-video');
    const resultElement = document.getElementById('result');
    const scannedResult = document.getElementById('scanned-result');
    const productHistoryContainer = document.createElement('div');

    // Initialize history container
    productHistoryContainer.id = 'product-history';
    productHistoryContainer.className = 'product-history';
    document.body.insertBefore(productHistoryContainer, scannedResult.nextSibling);

    // State variables
    let scanning = false;
    let barcodeDetector = null;
    const MAX_HISTORY_ITEMS = 4;

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
            const response = await fetch(`/api/products/${barcode}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Product not found');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return {
                error: error.message,
                barcode: barcode
            };
        }
    }

    // Sends the scanned product to the server history
    async function sendProductToHistory(product) {
        try {
            const response = await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            if (response.ok) {
                const historyData = await response.json();
                return historyData;
            } else {
                console.error('Failed to update history.');
            }
        } catch (error) {
            console.error('Error sending product to history:', error);
        }
    }

    // Loads product history from the server and attaches highlight listeners
    async function loadHistory() {
        try {
            const response = await fetch('/api/history');
            if (response.ok) {
                const historyProducts = await response.json();
                productHistoryContainer.innerHTML = '';
                historyProducts.forEach(product => {
                    productHistoryContainer.insertAdjacentHTML('beforeend', createProductCard(product, true));
                });
                // Attach highlight button listeners after loading history
                attachHighlightListeners();
            } else {
                console.error('Failed to load history');
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    // Attach event listeners to all highlight buttons in history
    function attachHighlightListeners() {
        const highlightButtons = productHistoryContainer.querySelectorAll('.highlight-btn');
        highlightButtons.forEach(button => {
            button.addEventListener('click', () => {
                const barcode = button.dataset.barcode;
                // Call the highlight function to display details in the top block
                highlightProduct(barcode);
            });
        });
    }

    // Display the details of a product in the top block without re-posting it
    async function highlightProduct(barcode) {
        try {
            const response = await fetchProductInfo(barcode);
            if (response.error) {
                scannedResult.innerHTML = `
                    <div class="error-message">
                        <h3>Error for Barcode: ${response.barcode}</h3>
                        <p>${response.error}</p>
                    </div>
                `;
                return;
            }
            const product = response.data || response;
            scannedResult.innerHTML = createProductCard(product);
            scannedResult.innerHTML += `
                <button id="scan-another" class="scan-button">Scan Another Item</button>
            `;
            document.getElementById('scan-another').addEventListener('click', () => {
                scannedResult.innerHTML = '';
                scannerModal.style.display = 'block';
                startScanning();
            });
        } catch (error) {
            console.error("Error highlighting product:", error);
        }
    }

    // Create a product card (used both for current scan and history)
    function createProductCard(product, isHistory = false) {
        const scanTime = new Date().toLocaleString();
        return `
            <div class="product-card ${isHistory ? 'history-item' : 'current-scan'}">
                <div class="product-header">
                    <h3>${product.name || 'Unknown Product'}</h3>
                    ${product.brand ? `<p class="brand">${product.brand}</p>` : ''}
                </div>
                <div class="product-details">
                    <p><strong>Barcode:</strong> ${product.barcode}</p>
                    <div class="nutrition-facts">
                        ${product.calories ? `<p>Calories: ${product.calories}</p>` : ''}
                        ${product.protein ? `<p>Protein: ${product.protein}g</p>` : ''}
                        ${product.sugar ? `<p>Sugar: ${product.sugar}g</p>` : ''}
                    </div>
                </div>
                <div class="product-footer">
                    <p class="scan-time">${scanTime}</p>
                    ${isHistory ? `<button class="highlight-btn" data-barcode="${product.barcode}">Highlight</button>` : ''}
                </div>
            </div>
        `;
    }

    // Display product info after a successful scan
    async function displayProductInfo(response) {
        if (response.error) {
            scannedResult.innerHTML = `
                <div class="error-message">
                    <h3>Error for Barcode: ${response.barcode}</h3>
                    <p>${response.error}</p>
                    <button id="retry-button">Try Again</button>
                </div>
            `;
            document.getElementById('retry-button').addEventListener('click', () => {
                fetchProductInfo(response.barcode).then(displayProductInfo);
            });
            return;
        }

        const product = response.data || response;

        // Send the scanned product to the server history
        await sendProductToHistory(product);
        // Reload history from the server
        loadHistory();

        // Display current product in the top block
        scannedResult.innerHTML = createProductCard(product);
        scannedResult.innerHTML += `
            <button id="scan-another" class="scan-button">Scan Another Item</button>
        `;
        document.getElementById('scan-another').addEventListener('click', () => {
            scannedResult.innerHTML = '';
            scannerModal.style.display = 'block';
            startScanning();
        });
    }

    async function handleDetectedBarcode(barcode) {
        resultElement.innerHTML = `<strong>Detected:</strong> ${barcode}`;
        const product = await fetchProductInfo(barcode);
        displayProductInfo(product);
    }

    async function detectBarcodes() {
        if (!scanning) return;

        try {
            let barcode;

            // Try browser detection first
            if (window.BarcodeDetector && barcodeDetector) {
                const barcodes = await barcodeDetector.detect(videoElement);
                if (barcodes.length > 0) {
                    barcode = barcodes[0].rawValue;
                }
            }

            // Fallback to backend decoding
            if (!barcode) {
                const base64Image = await captureFrame();
                const response = await fetch('/api/decode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64Image })
                });
                if (!response.ok) throw new Error('Decoding failed');
                const result = await response.json();
                barcode = result.barcode;
            }

            if (barcode) {
                await handleDetectedBarcode(barcode);
                stopScanning();
                scannerModal.style.display = 'none';
                return;
            }
        } catch (error) {
            console.error('Detection error:', error);
            resultElement.textContent = `Error: ${error.message}`;
        }

        if (scanning) {
            requestAnimationFrame(detectBarcodes);
        }
    }

    async function startScanning() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera API not supported in this browser");
            }

            scanning = true;
            resultElement.textContent = "Scanning...";

            if ('BarcodeDetector' in window) {
                barcodeDetector = new BarcodeDetector({
                    formats: ['ean_13', 'upc_a', 'code_128']
                });
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            videoElement.srcObject = stream;
            videoElement.playsInline = true;
            videoElement.muted = true;
            videoElement.play().catch(e => console.error("Video play error:", e));

            detectBarcodes();
        } catch (error) {
            console.error("Camera Error:", error);
            resultElement.innerHTML = `
                <div class="error-message">
                    <h3>Camera Access Error</h3>
                    <p>${error.message}</p>
                    ${error.name === 'NotAllowedError' ? '<p>Please allow camera permissions in your browser settings</p>' : ''}
                    <button id="try-again">Try Again</button>
                </div>
            `;
            document.getElementById('try-again').addEventListener('click', startScanning);
            stopScanning();
        }
    }

    function stopScanning() {
        scanning = false;
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }
        scannerModal.style.opacity = '0';
        setTimeout(() => {
            scannerModal.style.display = 'none';
            scannerModal.style.opacity = '1';
        }, 300);
    }

    startButton.addEventListener('click', () => {
        scannerModal.style.display = 'block';
        startScanning();
    });

    closeButton.addEventListener('click', () => {
        stopScanning();
        scannerModal.style.display = 'none';
    });

    window.addEventListener('beforeunload', stopScanning);

    // Load history when the page loads
    loadHistory();
});
