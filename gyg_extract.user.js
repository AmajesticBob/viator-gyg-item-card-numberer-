// ==UserScript==
// @name         Product Data Exporter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Load all items and export product data to CSV
// @author       Assistant
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create container for buttons
    const btnContainer = document.createElement('div');
    btnContainer.style.position = 'fixed';
    btnContainer.style.top = '10px';
    btnContainer.style.right = '10px';
    btnContainer.style.zIndex = '9999';
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '10px';
    btnContainer.style.padding = '10px';
    btnContainer.style.background = 'rgba(255, 255, 255, 0.9)';
    btnContainer.style.border = '1px solid #ccc';
    btnContainer.style.borderRadius = '8px';
    btnContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

    // Function to create styled buttons
    const createBtn = (text, color) => {
        const btn = document.createElement('button');
        btn.innerText = text;
        btn.style.padding = '8px 12px';
        btn.style.backgroundColor = color;
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = 'bold';
        return btn;
    };

    const loadAllBtn = createBtn('Load All Items', '#007bff');
    const exportBtn = createBtn('Export to CSV', '#28a745');

    // 1. Logic to Load All Items
    loadAllBtn.addEventListener('click', async () => {
        loadAllBtn.disabled = true;
        loadAllBtn.innerText = 'Loading...';

        const findButton = () => Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Show more'));

        let showMoreBtn = findButton();
        while (showMoreBtn) {
            showMoreBtn.scrollIntoView({ behavior: 'smooth' });
            showMoreBtn.click();
            console.log('Clicked Show More...');
            
            // Wait for new content to load
            await new Promise(resolve => setTimeout(resolve, 2000));
            showMoreBtn = findButton();
        }

        loadAllBtn.innerText = 'All Loaded';
        alert('All items have been loaded!');
    });

    // 2. Logic to Extract Data to CSV
    exportBtn.addEventListener('click', () => {
        const cards = Array.from(document.querySelectorAll('.vertical-layout.clickable[class*="activity-card"]'));
        const results = cards.map((card, index) => {
            const name = card.querySelector('[id$="-title"]')?.innerText?.trim() || 'N/A';
            const stars = card.querySelector('[id$="-polished-rating-text"]')?.innerText?.trim() || 'N/A';
            const reviews = card.querySelector('[id$="-polished-review-description"]')?.innerText?.trim().replace(/[()]/g, '') || 'N/A';
            const price = card.querySelector('[id$="-polished-price-start-v2"], [id$="-polished-price-base-v2"]')?.innerText?.trim() || 'N/A';
            return { name, stars, reviews, price, order: index + 1 };
        });

        const headers = ['Name', 'Stars', 'Review Count', 'Price', 'List Order'];
        const csvContent = [headers.join(','), ...results.map(row => 
            [`"${row.name.replace(/"/g, '""')}"`, `"${row.stars}"`, `"${row.reviews}"`, `"${row.price}"`, `"${row.order}"`].join(',')
        )].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `products_export_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    btnContainer.appendChild(loadAllBtn);
    btnContainer.appendChild(exportBtn);
    document.body.appendChild(btnContainer);

})();
