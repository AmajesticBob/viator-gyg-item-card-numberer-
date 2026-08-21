// ==UserScript==
// @name         Viator Enhanced: Infinite Scroll & Numbering
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Adds global numbering to cards and turns pagination into an auto-loading infinite scroll.
// @author       Assistant
// @match        https://www.viator.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        cardSelector: '[data-automation="ttd-product-list-card"]',
        nextButtonSelector: 'a[aria-label="Next Page"]',
        labelClass: 'tm-card-number-label',
        loadingText: "✨ Loading more adventures...",
        endText: "🏁 You've reached the end of the results."
    };

    let isLoading = false;

    /**
     * Labels each item card with its global index
     */
    function labelCards() {
        const cards = document.querySelectorAll(CONFIG.cardSelector);
        const urlParams = new URLSearchParams(window.location.search);
        const startOffset = parseInt(urlParams.get('start')) || 0;

        cards.forEach((card, index) => {
            const itemNumber = startOffset + index + 1;
            let label = card.querySelector(`.${CONFIG.labelClass}`);

            if (!label) {
                label = document.createElement('div');
                label.className = CONFIG.labelClass;
                Object.assign(label.style, {
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(0, 113, 235, 0.9)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    zIndex: '100',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    pointerEvents: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    border: '1px solid white'
                });

                if (window.getComputedStyle(card).position === 'static') {
                    card.style.position = 'relative';
                }
                card.appendChild(label);
            }
            label.innerText = `#${itemNumber}`;
        });
    }

    /**
     * Fetches next page and appends cards
     */
    async function loadMore() {
        const nextButton = document.querySelector(CONFIG.nextButtonSelector);
        if (!nextButton || isLoading) return;

        isLoading = true;
        const nextUrl = nextButton.href;

        // Update UI
        const originalText = nextButton.innerText;
        nextButton.innerText = CONFIG.loadingText;
        nextButton.style.opacity = '0.5';

        try {
            const response = await fetch(nextUrl);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const newCards = doc.querySelectorAll(CONFIG.cardSelector);
            const container = document.querySelector(CONFIG.cardSelector)?.parentElement;

            if (newCards.length > 0 && container) {
                newCards.forEach(card => {
                    container.appendChild(document.importNode(card, true));
                });

                // Update the "Next" button reference for the next scroll trigger
                const newNextButton = doc.querySelector(CONFIG.nextButtonSelector);
                if (newNextButton) {
                    nextButton.href = newNextButton.href;
                    nextButton.innerText = originalText;
                    nextButton.style.opacity = '1';
                } else {
                    nextButton.innerText = CONFIG.endText;
                    nextButton.style.pointerEvents = 'none';
                    scrollObserver.disconnect();
                }

                // Re-run numbering for the new cards
                labelCards();
            }
        } catch (err) {
            console.error("Infinite scroll error:", err);
            nextButton.innerText = "Error loading. Click to retry.";
        } finally {
            isLoading = false;
        }
    }

    // --- INITIALIZATION ---

    // 1. Initial Numbering
    labelCards();

    // 2. Set up Intersection Observer for Auto-Load
    const scrollObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadMore();
        }
    }, {
        rootMargin: '600px', // Start loading earlier for smoother experience
        threshold: 0.1
    });

    const nextBtn = document.querySelector(CONFIG.nextButtonSelector);
    if (nextBtn) {
        scrollObserver.observe(nextBtn);
    }

    // 3. Mutation Observer to handle dynamic site changes (filters, sorting)
    const mutationObserver = new MutationObserver(() => {
        clearTimeout(window.tmTimeout);
        window.tmTimeout = setTimeout(() => {
            labelCards();
            // Re-attach scroll observer if button was replaced by the site
            const currentBtn = document.querySelector(CONFIG.nextButtonSelector);
            if (currentBtn) scrollObserver.observe(currentBtn);
        }, 500);
    });

    mutationObserver.observe(document.body, { childList: true,
