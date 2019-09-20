/**
 * Saves options to chrome.storage
 */
function save() {
    options.enabled = document.getElementById('enabled').checked;
    options.dark = document.getElementById('dark').checked;
    options.auto_show = document.getElementById('auto_show').checked;
    options.ctrlRequired = document.getElementById('ctrlRequired').checked;

    saveOptions(options, function () {
        // Update status to let user know options were saved.
        let status = document.getElementById('status');
        status.textContent = '保存成功';
        setTimeout(function () {
            status.textContent = '';
        }, 1500);
    });
}

/**
 * Called when settings screen has loaded
 */
function onLoad() {
    // Set version number from manifest
    const manifestData = chrome.runtime.getManifest();
    document.getElementById("version").innerHTML = "Version " + manifestData.version;

    // Set default values.
    restoreOptions(function () {
        document.getElementById('enabled').checked = options.enabled;
        document.getElementById('dark').checked = options.dark;

        const autoShowCheckbox = document.getElementById('auto_show');
        const ctrlRequiredCheckbox = document.getElementById('ctrlRequired');
        autoShowCheckbox.checked = options.auto_show;
        ctrlRequiredCheckbox.disabled = !options.auto_show;
        ctrlRequiredCheckbox.checked = options.ctrlRequired;
        autoShowCheckbox.addEventListener('change', function () {
            ctrlRequiredCheckbox.disabled = !this.checked;
            if (!this.checked) {
                ctrlRequiredCheckbox.checked = false;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', onLoad);
document.getElementById('save').addEventListener('click', save);