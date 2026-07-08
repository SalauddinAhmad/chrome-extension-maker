// Designer OS — Image Downloader Content Script
// Handles double-clicking to trigger page image downloads when enabled

(function() {
  'use strict';

  if (window.__designerOSDownloaderLoaded) return;
  window.__designerOSDownloaderLoaded = true;

  let imageDownloaderActive = false;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleImageDownloader') {
      imageDownloaderActive = request.active;
      updateGlobalCursor();
      sendResponse({ success: true });
    }
    return true;
  });

  function updateGlobalCursor() {
    const styleId = 'designer-os-downloader-cursor-style';
    let styleEl = document.getElementById(styleId);
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    if (imageDownloaderActive) {
      styleEl.textContent = `img, [style*="background-image"] { cursor: copy !important; }`;
    } else {
      styleEl.textContent = '';
    }
  }

  // Initial state check
  chrome.storage.local.get(['imageDownloaderActive'], (result) => {
    imageDownloaderActive = result.imageDownloaderActive || false;
    updateGlobalCursor();
  });

  // Double-click to download image
  document.addEventListener('dblclick', (e) => {
    if (!imageDownloaderActive) return;

    const target = e.target;
    let imageUrl = '';

    if (target.tagName === 'IMG') {
      imageUrl = target.src;
    } else {
      const style = window.getComputedStyle(target);
      const bgImage = style.backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const match = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
        if (match && match[1]) {
          imageUrl = match[1];
        }
      }
    }

    if (imageUrl && imageUrl.startsWith('http')) {
      e.preventDefault();
      e.stopPropagation();

      chrome.runtime.sendMessage({ type: 'DOWNLOAD_IMAGE', url: imageUrl }, (response) => {
        if (response && response.success) {
          // Visual feedback outline
          const originalOutline = target.style.outline;
          target.style.outline = '4px solid #0d8a7e';
          setTimeout(() => target.style.outline = originalOutline, 500);
        }
      });
    }
  });

  console.log('[Designer OS] Downloader content script loaded');
})();
