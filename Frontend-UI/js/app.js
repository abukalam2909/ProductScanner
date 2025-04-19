const API_BASE_URL = window._env_.API_BASE_URL;

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
            const response = await fetch(`${API_BASE_URL}/api/products/${barcode}`);
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

    async function sendProductToHistory(product) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            if (response.ok) {
                return await response.json();
            } else {
                console.error('Failed to update history.');
            }
        } catch (error) {
            console.error('Error sending product to history:', error);
        }
    }

    async function loadHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/history`);
            if (response.ok) {
                const historyProducts = await response.json();
                productHistoryContainer.innerHTML = '';

                historyProducts.forEach(product => {
                    productHistoryContainer.insertAdjacentHTML('beforeend', createProductCard(product, true));
                });

                attachHighlightListeners();

                const existingCompareButton = document.getElementById('compare-button');

                if (historyProducts.length >= 2 && !existingCompareButton) {
                    const compareButton = document.createElement('button');
                    compareButton.id = 'compare-button';
                    compareButton.className = 'scan-button';
                    compareButton.textContent = 'Compare Products';
                    compareButton.addEventListener('click', () => {
                        window.location.href = 'compare.html';
                    });
                    document.body.insertBefore(compareButton, productHistoryContainer);
                }

                if (historyProducts.length < 2 && existingCompareButton) {
                    existingCompareButton.remove();
                }

            } else {
                console.error('Failed to load history');
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    function attachHighlightListeners() {
        const highlightButtons = productHistoryContainer.querySelectorAll('.highlight-btn');
        highlightButtons.forEach(button => {
            button.addEventListener('click', () => {
                const barcode = button.dataset.barcode;
                highlightProduct(barcode);
            });
        });
    }

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
                scannedResult.innerHTML = '';
                scannerModal.style.display = 'block';
                startScanning();
            });
            return;
        }

        const product = response.data || response;

        await sendProductToHistory(product);
        await loadHistory();

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

            if (window.BarcodeDetector && barcodeDetector) {
                const barcodes = await barcodeDetector.detect(videoElement);
                if (barcodes.length > 0) {
                    barcode = barcodes[0].rawValue;
                }
            }

            // if (!barcode) {
            //     const base64Image = await captureFrame();
            //     const response = await fetch(`${API_BASE_URL}/api/decode`, {
            //         method: 'POST',
            //         headers: { 'Content-Type': 'application/json' },
            //         body: JSON.stringify({ image: base64Image })
            //     });
            //     if (!response.ok) throw new Error('Decoding failed');
            //     const result = await response.json();
            //     barcode = result.barcode;
            // }

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
                    <button id="retry-button">Try Again</button>
                </div>
            `;
            document.getElementById('retry-button').addEventListener('click', () => {
                scannedResult.innerHTML = '';
                scannerModal.style.display = 'block';
                startScanning();
            });
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

    // Event Listeners
    startButton.addEventListener('click', async () => {
        try {
            // Hit the DELETE endpoint to clear history
            await fetch(`${API_BASE_URL}/api/history/clear`, { method: 'DELETE' });

            // Manually clear UI
            scannedResult.innerHTML = '';
            productHistoryContainer.innerHTML = '';

            // Start scanning
            scannerModal.style.display = 'block';
            startScanning();
        } catch (error) {
            console.error('Failed to clear history:', error);
            alert('Could not clear history. Please try again.');
        }
    });

    closeButton.addEventListener('click', () => {
        stopScanning();
        scannerModal.style.display = 'none';
    });

    window.addEventListener('beforeunload', stopScanning);

    document.getElementById('upload-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const status = document.getElementById('upload-status');
        status.innerText = "Uploading...";

        try {
            const response = await fetch(`${API_BASE_URL}/api/tickets/upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.text();
            status.innerText = response.ok ? "✅ Success: " + result : "❌ Error: " + result;
        } catch (err) {
            status.innerText = "❌ Failed to upload ticket: " + err.message;
        }
    });


    // Load history when the page loads
    loadHistory();
});
