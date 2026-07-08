// Designer OS — Background Service Worker
// Handles: message routing, screenshot capture, downloads, alarms

// Message routing hub
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'CAPTURE_SCREENSHOT':
      handleScreenshot(sender.tab?.id, sendResponse);
      return true; // keep channel open for async

    case 'GET_ACTIVE_TAB_INFO':
      handleGetTabInfo(sendResponse);
      return true;

    case 'INJECT_INSPECTOR':
      handleInjectInspector(sender.tab?.id, message.payload, sendResponse);
      return true;

    case 'EXECUTE_SCRIPT':
      handleExecuteScript(sender.tab?.id, message.payload, sendResponse);
      return true;

    case 'DOWNLOAD_IMAGE':
      chrome.downloads.download({
        url: message.url,
        filename: `designer-os-download-${Date.now()}.png`,
        saveAs: false
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true, downloadId });
        }
      });
      return true;

    default:
      break;
  }
});

// Capture visible tab as PNG data URL
async function handleScreenshot(tabId, sendResponse) {
  try {
    // Get current active tab if tabId not provided
    if (!tabId) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      tabId = tab.id;
    }
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 100
    });
    sendResponse({ success: true, dataUrl });
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }
}

// Get active tab URL and title
async function handleGetTabInfo(sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    sendResponse({
      success: true,
      url: tab.url,
      title: tab.title,
      tabId: tab.id,
      favIconUrl: tab.favIconUrl
    });
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }
}

// Inject inspector script into active tab
async function handleInjectInspector(senderTabId, payload, sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/inspector.js']
    });
    sendResponse({ success: true });
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }
}

// Execute arbitrary script in active tab and return result
async function handleExecuteScript(senderTabId, payload, sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: new Function(payload.args || [], payload.body),
      args: payload.funcArgs || []
    });
    sendResponse({ success: true, result: results[0]?.result });
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }
}

// Break timer alarm listener
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'screen-break-timer') {
    chrome.notifications.create('screen-break-notification', {
      type: 'basic',
      iconUrl: '/icons/icon128.png',
      title: 'Take a Screen Break 👀',
      message: 'Take a 2-5 minute break. Give your eyes a rest!',
      priority: 2
    });

    chrome.storage.local.get(['breakTimerMinutes'], (result) => {
      if (result.breakTimerMinutes) {
        const nextEndTime = Date.now() + (result.breakTimerMinutes * 60000);
        chrome.storage.local.set({ breakTimerEnd: nextEndTime });
      }
    });
  }
});

console.log('[Designer OS] Service worker initialized');
