// ==UserScript==
// @name           Amazon canonical URL
// @namespace      bharker75
// @version        v1.0.0
// @description    Replace URL with the canonical link
// @author         bharker75
// @match        https://www.amazon.com/*
// @icon           https://www.amazon.com/favicon.ico
// @grant          none
// @license        MIT
// ==/UserScript==

// Minor mods from source: https://greasyfork.org/en/scripts/33227-amazon-short-url
(function (doc) {
    'use strict';

    function getAsin(){
        let asinId = doc.getElementById('ASIN');

        if (asinId && asinId.value.length === 10) {
            return asinId.value;
        }
        else {
            // Get ASIN from canonical link
            let links = doc.getElementsByTagName('link');

            let i;
            for (i=0; i < links.length; i++) {

                if (links[i].rel === 'canonical') {

                    let canonical = links[i].href;
                    let asin = canonical.replace(/https?:\/\/www\.amazon\..*\/dp\/([\w]+)$/, '$1');

                    if (asin.length === 10) {
                        return asin;
                    }
                }
            }
        }
    }

    function replaceUrl() {
        let asin = getAsin();
        if (asin){
            history.replaceState(null, 'Amazon canonical URL userscript', '/dp/' + asin + '/');
            //console.log("URL replaced by Amazon canonical URL userscript. ASIN: " + asin);
        }
    }
    replaceUrl();

    // Execute again when item variation is selected
    var buyboxParent = doc.getElementById('desktop_buybox');
    if (buyboxParent) {
        var MO = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(nodeElement) {
                    if (nodeElement.id === "buybox") {
                        replaceUrl();
                    }
                });
            });
        });
        MO.observe(buyboxParent, { childList: true, subtree: true });
    }

    // Clear dynamically added URL parameters
    function checkUrlParameters(){
        if(window.location.search !== '') {
            window.history.replaceState(window.history.state, "", window.location.origin + window.location.pathname);
        }
    }
    setInterval(checkUrlParameters, 2000);

}) (document);
