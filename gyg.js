// ==UserScript==
// @name         Product Grid Numbering
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Shows the position number for each product in the activities grid
// @author       Assistant
// @match        https://www.getyourguide.com/*
// @match        https://getyourguide.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Matches standard activity cards across GYG search and location layouts
    const CARD_SELECTOR = 'div#activities-grid .grid-wrapper a.clickable-href, [data-test-id="activity-card"] a';

    const updateNumbers = () => {
        const products = document.querySelectorAll(CARD_SELECTOR);

        products.forEach((product, index) => {
            const currentPosition = index + 1;
            let badge = product.querySelector('.tm-product-number');

            if (!badge) {
                // Ensure parent container has positioning context
                if (window.getComputedStyle(product).position === 'static') {
                    product.style.position = 'relative';
                }

                badge = document.createElement('div');
                badge.className = 'tm-product-number';

                Object.assign(badge.style, {
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: '#ffffff',
                    minWidth: '24px',
                    height: '24px',
                    lineHeight: '24px',
                    textAlign: 'center',
                    padding: '0 6px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    zIndex: '20',
                    pointerEvents: 'none',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    border: '1.5px solid #ffffff'
                });

                product.appendChild(badge);
            }

            // Sync inner text to maintain order if cards re-render or shift
            if (badge.textContent !== String(currentPosition)) {
                badge.textContent = currentPosition;
            }
        });
    };

    // Debounce mutation handling to avoid layout thrashing during batch DOM inserts
    let debounceTimer = null;
    const debouncedUpdate = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateNumbers, 120);
    };

    // Run initial parse
    updateNumbers();

    // Observe document body directly to catch deferred grid initialization and pagination
    const observer = new MutationObserver(debouncedUpdate);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Fallback trigger for infinite scrolling / network state updates
    window.addEventListener('scroll', debouncedUpdate, { passive: true });
})();
