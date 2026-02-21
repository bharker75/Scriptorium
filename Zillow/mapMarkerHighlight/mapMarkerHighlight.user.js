// ==UserScript==
// @name         Zillow Map Marker Highlight (Optimized)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Highlight Zillow map markers efficiently
// @author       You
// @match        https://www.zillow.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
    .property-pill.is-hovered {
        outline: 3px solid #FFD700 !important;
        box-shadow: 0 0 16px 6px #FFD700, 0 0 8px 2px #000 !important;
        filter: brightness(1.3) drop-shadow(0 0 8px #FFD700);
        z-index: 9999 !important;
    }
    .property-pill.is-hovered > div {
        color: #222 !important;
        font-weight: bold !important;
        text-shadow: 0 0 4px #FFD700, 0 0 2px #fff;
    }
    .property-dot.z-highlighted,
    .saved-property-dot.z-highlighted {
        outline: 3px solid #FFD700 !important;
        box-shadow: 0 0 16px 6px #FFD700, 0 0 8px 2px #000 !important;
        filter: brightness(1.3) drop-shadow(0 0 8px #FFD700);
        z-index: 9999 !important;
    }
    `);

    function isHoveredDotColor(bg) {
        return bg === "rgb(5, 94, 22)";
    }

    function isSavedDotHovered(dot) {
        const svgs = dot.querySelectorAll('svg path');
        for (const path of svgs) {
            const fill = path.getAttribute('fill') || '';
            if (fill.toLowerCase() === '#055e16' || fill === 'rgb(5, 94, 22)') {
                return true;
            }
        }
        return false;
    }

    function observeDot(dot) {
        if (dot._z_observing) return;
        dot._z_observing = true;
        const observer = new MutationObserver(() => {
            const bg = dot.style.background;
            if (isHoveredDotColor(bg)) {
                dot.classList.add("z-highlighted");
            } else {
                dot.classList.remove("z-highlighted");
            }
        });
        observer.observe(dot, { attributes: true, attributeFilter: ["style"] });
    }

    function observeSavedDot(dot) {
        if (dot._z_observing) return;
        dot._z_observing = true;
        // Only observe attribute changes on SVG paths
        const update = () => {
            if (isSavedDotHovered(dot)) {
                dot.classList.add("z-highlighted");
            } else {
                dot.classList.remove("z-highlighted");
            }
        };
        // Initial check
        update();
        // Observe only attribute changes on SVGs inside this dot
        dot.querySelectorAll('svg path').forEach(path => {
            const observer = new MutationObserver(update);
            observer.observe(path, { attributes: true, attributeFilter: ["fill"] });
        });
    }

    // Debounce scanDots to avoid excessive calls
    let scanTimeout = null;
    function scanDots() {
        if (scanTimeout) clearTimeout(scanTimeout);
        scanTimeout = setTimeout(() => {
            document.querySelectorAll('.property-dot.streamlined-property-dot').forEach(observeDot);
            document.querySelectorAll('.saved-property-dot.streamlined-property-dot').forEach(observeSavedDot);
        }, 200);
    }

    // Only observe additions/removals of marker elements, not the whole body
    const markerContainer = () => document.querySelector('[data-test="search-page-map-container"]') || document.body;
    const containerObserver = new MutationObserver(scanDots);
    containerObserver.observe(markerContainer(), { childList: true, subtree: true });

    // Initial scan
    scanDots();
})();
