// ==UserScript==
// @name         Viator Product Grid Numbering
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Shows position number on Viator search result cards
// @author       Assistant
// @match        https://www.viator.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const updateNumbers = () => {
        // Find links that contain product titles and review stars or price labels
        const links = Array.from(document.querySelectorAll('a[href]')).filter(a => {
            const hasReviewOrPrice = a.innerText.includes('Free Cancellation') ||
                                     a.innerText.includes('from $') ||
                                     /\d\.\d\s*\(\d+/.test(a.innerText);
            const hasImage = a.querySelector('img') !== null;
            return hasReviewOrPrice && hasImage && a.offsetHeight > 180;
        });

        // Deduplicate in case nested anchors exist
        const cards = [...new Set(links)];

        cards.forEach((card, index) => {
            const currentPosition = index + 1;

            // Ensure the main card element establishes a positioning context
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

    // Run periodically to catch dynamic hydration / filter updates
    setInterval(updateNumbers, 500);
})();
