// LeadPilot — background service worker.
// Opens the side panel when the toolbar icon is clicked (in addition to popup).

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: false }).catch(() => {});
});
