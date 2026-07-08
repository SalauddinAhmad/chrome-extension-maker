// Designer OS — Screenshot Cropper Content Script
// Handles custom region selection overlay on the target web page

(function() {
  'use strict';

  if (window.__designerOSScreenshotCropperLoaded) return;
  window.__designerOSScreenshotCropperLoaded = true;

  let canvas = null;
  let ctx = null;
  let isDrawing = false;
  let startX = 0, startY = 0;
  let currentX = 0, currentY = 0;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_AREA_SELECTION') {
      try {
        startSelection();
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    }
    return true;
  });

  function startSelection() {
    if (canvas) return;

    // Prevent scrolling
    document.body.style.overflow = 'hidden';

    // Create selection overlay canvas
    canvas = document.createElement('canvas');
    canvas.id = '__dos_crop_overlay__';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647;
      cursor: crosshair;
      pointer-events: auto;
    `;
    
    // Set resolution match
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    
    ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    drawBackdrop();

    document.body.appendChild(canvas);

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
  }

  function drawBackdrop() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  function drawSelection() {
    drawBackdrop();

    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(startX - currentX);
    const h = Math.abs(startY - currentY);

    if (w > 0 && h > 0) {
      // Clear overlay inside selection
      ctx.clearRect(x, y, w, h);

      // Draw dashed border around selection
      ctx.strokeStyle = '#0d8a7e';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(x, y, w, h);

      // Draw dimensions badge
      ctx.fillStyle = 'rgba(13, 138, 126, 0.9)';
      ctx.setLineDash([]);
      const text = `${Math.round(w)} × ${Math.round(h)} px`;
      ctx.font = '12px system-ui, sans-serif';
      const textWidth = ctx.measureText(text).width;
      
      let badgeY = y - 25;
      if (badgeY < 5) badgeY = y + h + 5;
      
      ctx.fillRect(x, badgeY, textWidth + 12, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, x + 6, badgeY + 14);
    }
  }

  function onMouseDown(e) {
    if (e.button !== 0) return; // Left click only
    isDrawing = true;
    startX = e.clientX;
    startY = e.clientY;
    currentX = e.clientX;
    currentY = e.clientY;
  }

  function onMouseMove(e) {
    if (!isDrawing) return;
    currentX = e.clientX;
    currentY = e.clientY;
    drawSelection();
  }

  function onMouseUp(e) {
    if (!isDrawing) return;
    isDrawing = false;

    const x = Math.min(startX, e.clientX);
    const y = Math.min(startY, e.clientY);
    const w = Math.abs(startX - e.clientX);
    const h = Math.abs(startY - e.clientY);

    cleanup();

    if (w > 10 && h > 10) {
      // Send coordinates back to extension
      chrome.runtime.sendMessage({
        type: 'AREA_SELECTED',
        coords: {
          x: x,
          y: y,
          width: w,
          height: h,
          dpr: window.devicePixelRatio
        }
      });
    } else {
      chrome.runtime.sendMessage({ type: 'AREA_SELECTION_CANCELLED' });
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      cleanup();
      chrome.runtime.sendMessage({ type: 'AREA_SELECTION_CANCELLED' });
    }
  }

  function cleanup() {
    if (canvas) {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
      canvas.remove();
      canvas = null;
      ctx = null;
    }
    document.body.style.overflow = '';
  }

  console.log('[Designer OS] Screenshot cropper loaded');
})();
