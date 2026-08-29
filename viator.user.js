// ==UserScript==
// @name         Viator Product Grid Numbering
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Shows the position number for each activity on Viator search results
// @author       Assistant
// @match        https://www.viator.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Broadened selector: matches either the old automation attribute or any product detail link
    const CARD_SELECTOR = 'a[data-automation="srp-product-list-card-link"], a[href*="/tours/"]';

    const updateNumbers = () => {
        const rawLinks = document.querySelectorAll(CARD_SELECTOR);

        // Filter out non-card navigation links (e.g., reviews, breadcrumbs, footers)
        const validCards = Array.from(rawLinks).filter(el => {
            const hasImg = el.querySelector('img');
            const isCardSized = el.offsetWidth > 150 && el.offsetHeight > 150;
            return hasImg && isCardSized;
        });

        validCards.forEach((product, index) => {
            const currentPosition = index + 1;
            
            // Prefer placing on the first container wrapping the image, otherwise fallback to the anchor
            const img = product.querySelector('img');
            const target = img ? img.parentElement : product;
            let badge = target.querySelector('.tm-viator-number');

            if (!badge) {
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
                    zIndex: '9999',
                    pointerEvents: 'none',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
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
        debounceTimer = setTimeout(updateNumbers, 200);
    };

    updateNumbers();

    const observer = new MutationObserver(debouncedUpdate);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('scroll', debouncedUpdate, { passive: true });
})();
