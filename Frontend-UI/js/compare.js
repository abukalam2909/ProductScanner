const API_BASE_URL = window._env_.API_BASE_URL;
document.addEventListener('DOMContentLoaded', async () => {
    const resultContainer = document.getElementById('comparison-results');
    const newScanBtn = document.getElementById('new-scan');
    const viewHistoryBtn = document.getElementById('view-history');

    try {
        const response = await fetch(`${API_BASE_URL}/api/history/compare`);
        if (!response.ok) throw new Error('Failed to fetch comparison');

        const data = await response.json();
        resultContainer.innerHTML = '';

        Object.entries(data).forEach(([label, product]) => {
            const isMaxProtein = label.includes('Max Protein');
            const headerClass = isMaxProtein ? 'max-protein' : 'min-sugar';

            const card = `
                <div class="comparison-group">
                    <div class="comparison-header ${headerClass}">
                        ${label}
                    </div>
                    <div class="comparison-content">
                        <div class="comparison-item">
                            <h3>${product.name || 'Unknown Product'}</h3>
                            <p class="brand">${product.brand || ''}</p>
                            <p><strong>Barcode:</strong> ${product.barcode}</p>
                        </div>
                        <div class="comparison-nutrition">
                            <div class="nutrition-value">
                                <strong>Calories</strong>
                                ${product.calories || 'N/A'}
                            </div>
                            <div class="nutrition-value">
                                <strong>Protein</strong>
                                ${product.protein ? product.protein + 'g' : 'N/A'}
                            </div>
                            <div class="nutrition-value">
                                <strong>Sugar</strong>
                                ${product.sugar ? product.sugar + 'g' : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            resultContainer.insertAdjacentHTML('beforeend', card);
        });

    } catch (err) {
        resultContainer.innerHTML = `
            <div class="error-message">
                <h3>Comparison Error</h3>
                <p>${err.message}</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Try Again</button>
            </div>
        `;
        console.error(err);
    }

    // Button event listeners
    newScanBtn?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    viewHistoryBtn?.addEventListener('click', () => {
        window.location.href = 'index.html#product-history';
    });
});