// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "quickCite",
        title: "Quick Cite",
        contexts: ["page", "selection", "link"]
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "quickCite") {
        // Open the popup
        chrome.action.openPopup();
    }
}); 