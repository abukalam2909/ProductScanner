const API_BASE_URL = window._env_.API_BASE_URL;
document.addEventListener('DOMContentLoaded', async () => {
    const maxProteinContent = document.getElementById('max-protein-content');
    const minSugarContent = document.getElementById('min-sugar-content');
    const newScanBtn = document.getElementById('new-scan');
    const viewHistoryBtn = document.getElementById('view-history');

    try {
        const response = await fetch(`${API_BASE_URL}/api/history/compare`);
        if (!response.ok) throw new Error('Failed to fetch comparison data');

        const data = await response.json();

        // Clear previous content
        maxProteinContent.innerHTML = '';
        minSugarContent.innerHTML = '';

        // Process comparison data
        Object.entries(data).forEach(([label, product]) => {
            const content = `
                <div class="product-info">
                    <h3>${product.name || 'Unknown Product'}</h3>
                    <p class="brand">${product.brand || ''}</p>
                    <p><strong>Barcode:</strong> ${product.barcode}</p>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <span class="nutrition-label">Calories</span>
                            <span class="nutrition-value">${product.calories || 'N/A'}</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="nutrition-label">Protein</span>
                            <span class="nutrition-value">${product.protein ? product.protein + 'g' : 'N/A'}</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="nutrition-label">Sugar</span>
                            <span class="nutrition-value">${product.sugar ? product.sugar + 'g' : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            `;

            if (label.includes('Max Protein')) {
                maxProteinContent.innerHTML = content;
            } else if (label.includes('Min Sugar')) {
                minSugarContent.innerHTML = content;
            }
        });

    } catch (err) {
        // Only show error in console, don't display to user
        console.error('Comparison error:', err);
        // Instead of showing error, show empty state
        maxProteinContent.innerHTML = '<p class="empty-state">No protein data available</p>';
        minSugarContent.innerHTML = '<p class="empty-state">No sugar data available</p>';
    }

    // Button event listeners
    newScanBtn?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    viewHistoryBtn?.addEventListener('click', () => {
        window.location.href = 'index.html#product-history';
    });
});