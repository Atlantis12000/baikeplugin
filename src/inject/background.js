/**
 * Called whenever extension is reloaded
 */
function initialize() {
    restoreOptions(function () {
        updateUI();
    });

    // Context menu
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("showSummary"),
        contexts: ["selection"],
        onclick: function () {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {message: "show-card"}, null);
            });
        }
    });
}

/**
 * Strip away content security policies to allow images and text to be loaded
 * @param details
 * @returns {{responseHeaders: *}}
 */
let onHeadersReceived = function (details) {
    for (let i = 0; i < details.responseHeaders.length; i++) {
        if ('content-security-policy' === details.responseHeaders[i].name.toLowerCase()) {
            details.responseHeaders[i].value = '';
        }
    }

    return {
        responseHeaders: details.responseHeaders
    };
};

let filter = {
    urls: ["*://*/*"],
    types: ["main_frame", "sub_frame"]
};
chrome.webRequest.onHeadersReceived.addListener(onHeadersReceived, filter, ["blocking", "responseHeaders"]);

/**
 * Browser action clicked
 */
chrome.browserAction.onClicked.addListener(function () {
    options.enabled = !options.enabled;
    saveOptions({enabled: options.enabled}, function () {
        updateUI();
    });
});

initialize();