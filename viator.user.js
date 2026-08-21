// ==UserScript==
// @name         Viator Product Grid Numbering
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Shows the position number for each activity on Viator search results
// @author       Assistant
// @match        https://www.viator.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Target the specific Viator product link and its image container
    const CARD_SELECTOR = 'a[data-automation="srp-product-list-card-link"]';
    const IMG_CONTAINER = '[data-automation="srp-product-list-card-image-container"]';

    const updateNumbers = () => {
        const products = document.querySelectorAll(CARD_SELECTOR);

        products.forEach((product, index) => {
            const currentPosition = index + 1;
            
            // Append to the image container so it's visible over the thumbnail
            const target = product.querySelector(IMG_CONTAINER) || product;
            let badge = target.querySelector('.tm-viator-number');

            if (!badge) {
                // Ensure target has a positioning context for the absolute badge
                if (window.getComputedStyle(target).position === 'static') {
                    target.style.setProperty('position', 'relative', 'important');
                }

                badge = document.createElement('div');
                badge.className = 'tm-viator-number';

                Object.assign(badge.style, {
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    color: '#ffffff',
                    minWidth: '28px',
                    height: '28px',
                    lineHeight: '28px',
                    textAlign: 'center',
                    borderRadius: '50%',
                    fontSize: '14px',
                    fontWeight: '800',
                    zIndex: '999',
                    pointerEvents: 'none',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                    border: '2px solid #ffffff'
                });

                target.appendChild(badge);
            }

            // Keep the number in sync (important for infinite scroll/sorting)
            if (badge.textContent !== String(currentPosition)) {
                badge.textContent = currentPosition;
            }
        });
    };

    // Use a small delay to catch cards that render via React after page load
    let debounceTimer = null;
    const debouncedUpdate = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateNumbers, 200);
    };

    // Initial run
    updateNumbers();

    // Observe the app container for dynamic content shifts (pagination, filters, etc)
    const observer = new MutationObserver(debouncedUpdate);
    observer.observe(document.body, { childList: true, subtree: true });

    // Fallback for scroll-based loading
    window.addEventListener('scroll', debouncedUpdate, { passive: true });
})();
