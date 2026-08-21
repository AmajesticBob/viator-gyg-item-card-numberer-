// ==UserScript==
// @name         Product Grid Numbering (Universal)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Shows the position number for activities on GYG and Viator
// @author       Assistant
// @match        https://www.getyourguide.com/*
// @match        https://getyourguide.com/*
// @match        https://www.viator.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Updated to include Viator selectors
    const CARD_SELECTOR = [
        'div#activities-grid .grid-wrapper a.clickable-href',
        '[data-test-id="activity-card"] a',
        'a[data-automation="srp-product-list-card-link"]', // Viator SRP
        'a[class*="_productCard_"]' // Viator general
    ].join(',');

    const updateNumbers = () => {
        const products = document.querySelectorAll(CARD_SELECTOR);

        products.forEach((product, index) => {
            const currentPosition = index + 1;
            let badge = product.querySelector('.tm-product-number');

            if (!badge) {
                // Ensure parent has positioning context
                if (window.getComputedStyle(product).position === 'static') {
                    product.style.setProperty('position', 'relative', 'important');
                }

                badge = document.createElement('div');
                badge.className = 'tm-product-number';

                Object.assign(badge.style, {
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#ff595e', // Distinct color
                    color: '#ffffff',
                    minWidth: '28px',
                    height: '28px',
                    lineHeight: '28px',
                    textAlign: 'center',
                    borderRadius: '50%',
                    fontSize: '14px',
                    fontWeight: '800',
                    zIndex: '100',
                    pointerEvents: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                    border: '2px solid #ffffff'
                });

                product.appendChild(badge);
            }

            if (badge.textContent !== String(currentPosition)) {
                badge.textContent = currentPosition;
            }
        });
    };

    let debounceTimer = null;
    const debouncedUpdate = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateNumbers, 200);
    };

    updateNumbers();

    const observer = new MutationObserver(debouncedUpdate);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('scroll', debouncedUpdate, { passive: true });
})();
