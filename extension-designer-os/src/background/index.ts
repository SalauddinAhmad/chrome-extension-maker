/**
 * MV3 service worker.
 * Responsibilities (kept minimal — Privacy First):
 *  - Open the side panel from the toolbar action.
 *  - Route messages between content scripts and UI.
 * No network calls. No analytics.
 */

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    ?.setPanelBehavior({ openPanelOnActionClick: false })
    .catch(() => void 0);
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.windowId != null) {
    await chrome.sidePanel?.open({ windowId: tab.windowId });
  }
});

// Message router placeholder — modules will register handlers here.
chrome.runtime.onMessage.addListener((_msg, _sender, sendResponse) => {
  sendResponse({ ok: true });
  return true;
});

export {};
