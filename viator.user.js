// ==UserScript==
// @name         Viator Product Grid Numbering
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Shows position number on Viator search result cards across multiple pages
// @author       Assistant
// @match        https://www.viator.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const ITEMS_PER_PAGE = 24;

    // Detect the current page number from URL or DOM pagination
    const getCurrentPage = () => {
        // 1. Check URL parameters (e.g., ?page=2 or &page=2)
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page') || urlParams.get('pageNumber');
        if (pageParam && !isNaN(pageParam)) {
            return parseInt(pageParam, 10);
        }

        // 2. Fallback: inspect the active page element in the bottom pagination control
        const activePaginationBtn = document.querySelector(
            'nav[aria-label*="pagination"] [aria-current="page"], [data-automation*="pagination"] [aria-current="page"], .pagination .active'
        );
        if (activePaginationBtn && !isNaN(activePaginationBtn.textContent.trim())) {
            return parseInt(activePaginationBtn.textContent.trim(), 10);
        }

        return 1;
    };

    const updateNumbers = () => {
        const currentPage = getCurrentPage();
        const pageOffset = (currentPage - 1) * ITEMS_PER_PAGE;

        // Target valid product cards
        const links = Array.from(document.querySelectorAll('a[href]')).filter(a => {
            const hasReviewOrPrice = a.innerText.includes('Free Cancellation') ||
                                     a.innerText.includes('from $') ||
                                     /\d\.\d\s*\(\d+/.test(a.innerText);
            const hasImage = a.querySelector('img') !== null;
            return hasReviewOrPrice && hasImage && a.offsetHeight > 180;
        });

        const cards = [...new Set(links)];

        cards.forEach((card, index) => {
            const currentPosition = pageOffset + index + 1;

            if (window.getComputedStyle(card).position === 'static') {
                card.style.setProperty('position', 'relative', 'important');
            }

            let badge = card.querySelector(':scope > .tm-viator-number');

            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'tm-viator-number';

                Object.assign(badge.style, {
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    color: '#ffffff',
                    minWidth: '30px',
                    height: '30px',
                    lineHeight: '30px',
                    textAlign: 'center',
                    borderRadius: '50%',
                    fontSize: '15px',
                    fontWeight: '800',
                    zIndex: '10000',
                    pointerEvents: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                    border: '2px solid #ffffff'
                });

                card.appendChild(badge);
            }

            if (badge.textContent !== String(currentPosition)) {
                badge.textContent = currentPosition;
            }
        });
    };

    setInterval(updateNumbers, 500);
})();
