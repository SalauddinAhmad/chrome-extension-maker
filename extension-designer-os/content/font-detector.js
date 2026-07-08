// Designer OS — Font Detector Content Script
// Enables click-to-inspect font information on any element

(function() {
  'use strict';

  if (window.__designerOSFontDetectorLoaded) return;
  window.__designerOSFontDetectorLoaded = true;

  let isInspectMode = false;
  let overlay = null;
  let tooltip = null;
  let lastHighlighted = null;

  // Listen for messages from side panel
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ENABLE_FONT_INSPECTOR') {
      enableInspector();
      sendResponse({ success: true });
    } else if (message.type === 'DISABLE_FONT_INSPECTOR') {
      disableInspector();
      sendResponse({ success: true });
    } else if (message.type === 'GET_ALL_PAGE_FONTS') {
      sendResponse({ success: true, data: getAllPageFonts() });
    }
    return true;
  });

  // =====================================================
  // FONT INSPECTOR MODE
  // =====================================================
  function enableInspector() {
    if (isInspectMode) return;
    isInspectMode = true;
    document.body.style.cursor = 'crosshair';
    createTooltip();
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);
    // Notify user
    showNotification('Font Inspector Active — Click any text to inspect. Press Esc to exit.');
  }

  function disableInspector() {
    if (!isInspectMode) return;
    isInspectMode = false;
    document.body.style.cursor = '';
    removeHighlight();
    removeTooltip();
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
  }

  function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.id = '__dos_font_tooltip__';
    tooltip.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      background: rgba(10, 10, 18, 0.95);
      color: #fff;
      border: 1px solid rgba(13, 138, 126, 0.6);
      border-radius: 8px;
      padding: 10px 14px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 12px;
      line-height: 1.6;
      pointer-events: none;
      max-width: 300px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      backdrop-filter: blur(10px);
      display: none;
    `;
    document.body.appendChild(tooltip);
  }

  function removeTooltip() {
    if (tooltip && tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip);
      tooltip = null;
    }
  }

  function onMouseMove(e) {
    if (!isInspectMode) return;
    e.stopPropagation();

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === tooltip || el.id === '__dos_font_tooltip__') return;

    highlightElement(el);
    const fontData = getFontData(el);
    showTooltip(fontData, e.clientX, e.clientY);
  }

  function onClick(e) {
    if (!isInspectMode) return;
    e.preventDefault();
    e.stopPropagation();

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el.id === '__dos_font_tooltip__') return;

    const fontData = getFontData(el);
    // Send selected font data to side panel
    chrome.runtime.sendMessage({
      type: 'FONT_INSPECTED',
      data: fontData
    });
    disableInspector();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      disableInspector();
      chrome.runtime.sendMessage({ type: 'FONT_INSPECTOR_CANCELLED' });
    }
  }

  function highlightElement(el) {
    if (lastHighlighted) {
      lastHighlighted.style.outline = lastHighlighted.__dosOriginalOutline || '';
      lastHighlighted.__dosOriginalOutline = undefined;
    }
    if (el) {
      el.__dosOriginalOutline = el.style.outline;
      el.style.outline = '2px solid rgba(13, 138, 126, 0.8)';
      lastHighlighted = el;
    }
  }

  function removeHighlight() {
    if (lastHighlighted) {
      lastHighlighted.style.outline = lastHighlighted.__dosOriginalOutline || '';
      lastHighlighted = null;
    }
  }

  function showTooltip(fontData, x, y) {
    if (!tooltip) return;
    tooltip.innerHTML = `
      <div style="color:#a78bfa;font-weight:700;margin-bottom:6px;">📝 Font Inspector</div>
      <div><span style="color:#6b7280">Family:</span> <strong>${fontData.family}</strong></div>
      <div><span style="color:#6b7280">Size:</span> ${fontData.size} • <span style="color:#6b7280">Weight:</span> ${fontData.weight}</div>
      <div><span style="color:#6b7280">Line Height:</span> ${fontData.lineHeight} • <span style="color:#6b7280">Tracking:</span> ${fontData.letterSpacing}</div>
      <div><span style="color:#6b7280">Color:</span> <span style="background:${fontData.color};width:10px;height:10px;display:inline-block;border-radius:2px;margin-right:4px;"></span>${fontData.color}</div>
      <div style="margin-top:6px;color:#4ade80;font-size:11px">Click to capture</div>
    `;
    tooltip.style.display = 'block';

    // Position tooltip
    const pad = 12;
    let tx = x + pad;
    let ty = y + pad;
    if (tx + 300 > window.innerWidth) tx = x - 300 - pad;
    if (ty + 150 > window.innerHeight) ty = y - 150 - pad;
    tooltip.style.left = tx + 'px';
    tooltip.style.top = ty + 'px';
  }

  // =====================================================
  // FONT DATA EXTRACTION
  // =====================================================
  function getFontData(el) {
    const style = window.getComputedStyle(el);
    const family = style.fontFamily;
    const primaryFont = family.split(',')[0].replace(/['"]/g, '').trim();

    return {
      family: primaryFont,
      fullFamily: family,
      size: style.fontSize,
      weight: style.fontWeight,
      weightName: weightToName(style.fontWeight),
      style: style.fontStyle,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      color: style.color,
      textTransform: style.textTransform,
      textDecoration: style.textDecoration,
      tag: el.tagName.toLowerCase(),
      text: el.textContent?.trim().slice(0, 80) || '',
      // CSS outputs
      css: `font-family: ${family};\nfont-size: ${style.fontSize};\nfont-weight: ${style.fontWeight};\nline-height: ${style.lineHeight};\nletter-spacing: ${style.letterSpacing};`,
      tailwind: generateTailwindClasses(style, primaryFont)
    };
  }

  function weightToName(weight) {
    const map = {
      '100': 'Thin', '200': 'Extra Light', '300': 'Light',
      '400': 'Regular', '500': 'Medium', '600': 'SemiBold',
      '700': 'Bold', '800': 'Extra Bold', '900': 'Black'
    };
    return map[weight] || weight;
  }

  function generateTailwindClasses(style, family) {
    const classes = [];
    const size = parseFloat(style.fontSize);
    const weight = style.fontWeight;

    // Font size
    if (size <= 12) classes.push('text-xs');
    else if (size <= 14) classes.push('text-sm');
    else if (size <= 16) classes.push('text-base');
    else if (size <= 18) classes.push('text-lg');
    else if (size <= 20) classes.push('text-xl');
    else if (size <= 24) classes.push('text-2xl');
    else if (size <= 30) classes.push('text-3xl');
    else if (size <= 36) classes.push('text-4xl');
    else if (size <= 48) classes.push('text-5xl');
    else if (size <= 60) classes.push('text-6xl');
    else classes.push('text-7xl');

    // Font weight
    const wMap = { '100': 'thin', '200': 'extralight', '300': 'light', '400': 'normal',
                   '500': 'medium', '600': 'semibold', '700': 'bold', '800': 'extrabold', '900': 'black' };
    if (wMap[weight]) classes.push(`font-${wMap[weight]}`);

    // Line height
    const lh = parseFloat(style.lineHeight);
    const fs = parseFloat(style.fontSize);
    if (lh && fs) {
      const ratio = lh / fs;
      if (ratio <= 1) classes.push('leading-none');
      else if (ratio <= 1.25) classes.push('leading-tight');
      else if (ratio <= 1.375) classes.push('leading-snug');
      else if (ratio <= 1.5) classes.push('leading-normal');
      else if (ratio <= 1.625) classes.push('leading-relaxed');
      else classes.push('leading-loose');
    }

    return classes.join(' ');
  }

  // =====================================================
  // GET ALL PAGE FONTS
  // =====================================================
  function getAllPageFonts() {
    const fontMap = new Map();
    const elements = document.querySelectorAll('*');
    const limit = Math.min(elements.length, 1000);

    for (let i = 0; i < limit; i++) {
      const el = elements[i];
      if (!el.textContent?.trim()) continue;
      const style = window.getComputedStyle(el);
      const family = style.fontFamily;
      const primaryFont = family.split(',')[0].replace(/['"]/g, '').trim();
      if (!primaryFont) continue;

      if (!fontMap.has(primaryFont)) {
        fontMap.set(primaryFont, {
          family: primaryFont,
          fullFamily: family,
          weights: new Set(),
          sizes: new Set(),
          count: 0
        });
      }
      const entry = fontMap.get(primaryFont);
      entry.weights.add(style.fontWeight);
      entry.sizes.add(style.fontSize);
      entry.count++;
    }

    return Array.from(fontMap.values()).map(f => ({
      ...f,
      weights: Array.from(f.weights),
      sizes: Array.from(f.sizes)
    })).sort((a, b) => b.count - a.count);
  }

  // =====================================================
  // NOTIFICATION
  // =====================================================
  function showNotification(msg) {
    const note = document.createElement('div');
    note.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483647;
      background: rgba(10, 10, 18, 0.95);
      color: #fff;
      border: 1px solid rgba(13, 138, 126, 0.6);
      border-radius: 8px;
      padding: 12px 20px;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      backdrop-filter: blur(10px);
    `;
    note.textContent = msg;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 3000);
  }

  console.log('[Designer OS] Font detector loaded');
})();
