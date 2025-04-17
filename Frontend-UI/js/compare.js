document.addEventListener('DOMContentLoaded', async () => {
    const resultContainer = document.getElementById('comparison-results');

    try {
        const response = await fetch(`${API_BASE_URL}/api/history/compare`);
        if (!response.ok) throw new Error('Failed to fetch comparison');

        const data = await response.json();

        resultContainer.innerHTML = '';

        Object.entries(data).forEach(([label, product]) => {
            const card = `
                <div class="product-card">
                    <div class="product-header">
                        <h3>${label}</h3>
                        <p>${product.name || 'Unknown Product'}</p>
                        <p class="brand">${product.brand || ''}</p>
                    </div>
                    <div class="product-details">
                        <p><strong>Barcode:</strong> ${product.barcode}</p>
                        <div class="nutrition-facts">
                            ${product.calories ? `<p>Calories: ${product.calories}</p>` : ''}
                            ${product.protein ? `<p>Protein: ${product.protein}g</p>` : ''}
                            ${product.sugar ? `<p>Sugar: ${product.sugar}g</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
            resultContainer.insertAdjacentHTML('beforeend', card);
        });
    } catch (err) {
        resultContainer.innerHTML = `<p style="color:red;">${err.message}</p>`;
        console.error(err);
    }
});
