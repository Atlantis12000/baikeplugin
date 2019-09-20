// Default options
let options = {
    enabled: true,
    dark: true,
    auto_show: true,
    ctrlRequired: false,
};

/**
 * Saves options to chrome.storage
 */
function saveOptions(newOptions, callback) {
    options.enabled = newOptions.hasOwnProperty('enabled') ? newOptions.enabled : options.enabled;
    options.dark = newOptions.hasOwnProperty('dark') ? newOptions.dark : options.dark;
    options.auto_show = newOptions.hasOwnProperty('auto_show') ? newOptions.auto_show : options.auto_show;
    options.ctrlRequired = newOptions.hasOwnProperty('ctrlRequired') ? newOptions.ctrlRequired : options.ctrlRequired;

    chrome.storage.sync.set({
        options: options
    }, callback);
}

/**
 * Restores select box and checkbox state using the preferences
 * stored in chrome.storage.
 */
function restoreOptions(callback) {
    chrome.storage.sync.get({
        options: options
    }, function (items) {
        options.enabled = items.options.enabled;
        options.dark = items.options.dark;
        options.auto_show = items.options.auto_show;
        options.ctrlRequired = items.options.ctrlRequired;

        if (callback) {
            callback();
        }
    });
}

/**
 * Update extension icon to reflect the state
 */
function updateUI() {
    if (chrome.browserAction) {
        let iconName = options.enabled ? '48' : '-off';
        let title = options.enabled ? chrome.i18n.getMessage("enabled") : chrome.i18n.getMessage("disabled");
        chrome.browserAction.setIcon({path: "icons/icon" + iconName + ".png"});
        chrome.browserAction.setTitle({title: title});
    }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    options = changes.options.newValue;
    updateUI();
});