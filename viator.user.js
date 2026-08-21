js
// ==UserScript==
// @name         Product Grid Numbering (Viator & GYG)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Shows the position number for each product in the activities grid
// @author       Assistant
// @match        https://www.viator.com/*
// @match        https://www.getyourguide.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Combined selectors for both sites
    const CARD_SELECTOR = 'a[data-automation="srp-product-list-card-link"], a[class*="_productCard_"], [data-test-id="activity-card"]';
    const IMG_CONTAINER = '[data-automation="srp-product-list-card-image-container"], ._imageContainer_zgdtm_400, .activity-card__image-container';

    const updateNumbers = () => {
        const products = document.querySelectorAll(CARD_SELECTOR);

        products.forEach((product, index) => {
            const currentPosition = index + 1;
            
            // Try to find an image container first for better placement
            const target = product.querySelector(IMG_CONTAINER) || product;
            let badge = target.querySelector('.tm-product-number');

            if (!badge) {
                // Ensure the target container has a positioning context
                if (window.getComputedStyle(target).position === 'static') {
                    target.style.setProperty('position', 'relative', 'important');
                }

                badge = document.createElement('div');
                badge.className = 'tm-product-number';

                Object.assign(badge.style, {
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: '#ffffff',
                    minWidth: '26px',
                    height: '26px',
                    lineHeight: '26px',
                    textAlign: 'center',
                    padding: '0 4px',
                    borderRadius: '50%',
                    fontSize: '13px',
                    fontWeight: '800',
                    zIndex: '1000',
                    pointerEvents: 'none',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                    border: '2px solid #ffffff'
                });

                target.appendChild(badge);
            }

            if (badge.textContent !== String(currentPosition)) {
                badge.textContent = currentPosition;
            }
        });
    };

    let debounceTimer = null;
    const debouncedUpdate = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateNumbers, 150);
    };

    // Run immediately and observe for dynamic content
    updateNumbers();
    const observer = new MutationObserver(debouncedUpdate);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('scroll', debouncedUpdate, { passive: true });
})();
