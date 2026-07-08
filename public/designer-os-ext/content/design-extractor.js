// Designer OS — Design System Extractor Content Script
// Analyzes the current page DOM to extract the complete design system

(function() {
  'use strict';

  // Avoid re-injection
  if (window.__designerOSExtractorLoaded) return;
  window.__designerOSExtractorLoaded = true;

  // Listen for extraction requests from the side panel
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXTRACT_DESIGN_SYSTEM') {
      const result = extractDesignSystem();
      sendResponse({ success: true, data: result });
    } else if (message.type === 'EXTRACT_COLORS') {
      const colors = extractPageColors();
      sendResponse({ success: true, data: colors });
    } else if (message.type === 'EXTRACT_TYPOGRAPHY') {
      const typo = extractTypography();
      sendResponse({ success: true, data: typo });
    } else if (message.type === 'EXTRACT_SVGS') {
      const svgs = extractSVGs();
      sendResponse({ success: true, data: svgs });
    }
    return true;
  });

  // =====================================================
  // MAIN EXTRACTOR — Full Design System
  // =====================================================
  function extractDesignSystem() {
    const start = performance.now();

    return {
      url: window.location.href,
      title: document.title,
      extractedAt: new Date().toISOString(),
      colors: extractPageColors(),
      typography: extractTypography(),
      spacing: extractSpacing(),
      borders: extractBorders(),
      shadows: extractShadows(),
      components: extractComponents(),
      layout: extractLayout(),
      extractionTime: Math.round(performance.now() - start) + 'ms'
    };
  }

  // =====================================================
  // COLOR EXTRACTION
  // =====================================================
  function extractPageColors() {
    const colorMap = new Map(); // hex -> { count, elements, usages }
    const elements = document.querySelectorAll('*');
    const limit = Math.min(elements.length, 2000);

    for (let i = 0; i < limit; i++) {
      const el = elements[i];
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;

      const style = window.getComputedStyle(el);
      const properties = [
        { prop: 'color', usage: 'text' },
        { prop: 'backgroundColor', usage: 'background' },
        { prop: 'borderColor', usage: 'border' },
        { prop: 'outlineColor', usage: 'outline' }
      ];

      for (const { prop, usage } of properties) {
        const value = style[prop];
        if (!value || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') continue;

        const hex = rgbToHex(value);
        if (!hex || hex === '#000000' && usage === 'border' && style.borderStyle === 'none') continue;

        const key = hex.toLowerCase();
        if (!colorMap.has(key)) {
          colorMap.set(key, { hex: key, count: 0, usages: new Set(), rgb: value });
        }
        const entry = colorMap.get(key);
        entry.count++;
        entry.usages.add(usage);
      }
    }

    // Convert to array, sort by frequency
    const colors = Array.from(colorMap.values())
      .filter(c => c.hex !== '#000000' || c.count < 500) // filter out default blacks with huge counts
      .map(c => ({
        hex: c.hex,
        count: c.count,
        rgb: c.rgb,
        usages: Array.from(c.usages)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 60); // top 60 colors

    return {
      total: colorMap.size,
      topColors: colors
    };
  }

  // =====================================================
  // TYPOGRAPHY EXTRACTION
  // =====================================================
  function extractTypography() {
    const fontMap = new Map();
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, li, span, label, input, textarea');
    const limit = Math.min(elements.length, 500);

    for (let i = 0; i < limit; i++) {
      const el = elements[i];
      const style = window.getComputedStyle(el);
      const family = style.fontFamily;
      const size = parseFloat(style.fontSize);
      const weight = style.fontWeight;
      const lineHeight = style.lineHeight;
      const letterSpacing = style.letterSpacing;

      if (!family || !size) continue;

      const primaryFont = family.split(',')[0].replace(/['"]/g, '').trim();
      const key = `${primaryFont}__${size}__${weight}`;

      if (!fontMap.has(key)) {
        fontMap.set(key, {
          family: primaryFont,
          fullFamily: family,
          size: size,
          weight: weight,
          lineHeight: lineHeight,
          letterSpacing: letterSpacing,
          tag: el.tagName.toLowerCase(),
          count: 0
        });
      }
      fontMap.get(key).count++;
    }

    // Also get all loaded fonts
    const loadedFonts = [];
    if (document.fonts) {
      document.fonts.forEach(font => {
        loadedFonts.push({
          family: font.family,
          style: font.style,
          weight: font.weight,
          status: font.status
        });
      });
    }

    // Detect Google Fonts
    const googleFonts = detectGoogleFonts();

    const entries = Array.from(fontMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);

    return {
      totalVariations: fontMap.size,
      topVariations: entries,
      loadedFonts: loadedFonts.slice(0, 20),
      googleFonts
    };
  }

  function detectGoogleFonts() {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const styles = Array.from(document.querySelectorAll('style'));
    const gFonts = new Set();

    links.forEach(link => {
      if (link.href && (link.href.includes('fonts.googleapis.com') || link.href.includes('fonts.gstatic.com'))) {
        const match = link.href.match(/family=([^&]+)/);
        if (match) {
          match[1].split('|').forEach(f => gFonts.add(decodeURIComponent(f.split(':')[0]).replace(/\+/g, ' ')));
        }
      }
    });

    styles.forEach(style => {
      const matches = style.textContent.matchAll(/fonts\.googleapis\.com\/css[^)'"]+family=([^&)'"]+)/g);
      for (const m of matches) {
        m[1].split('|').forEach(f => gFonts.add(decodeURIComponent(f.split(':')[0]).replace(/\+/g, ' ')));
      }
    });

    return Array.from(gFonts);
  }

  // =====================================================
  // SPACING EXTRACTION
  // =====================================================
  function extractSpacing() {
    const spacingValues = new Map();
    const elements = document.querySelectorAll('div, section, article, header, footer, main, aside, nav');
    const limit = Math.min(elements.length, 300);

    for (let i = 0; i < limit; i++) {
      const el = elements[i];
      const style = window.getComputedStyle(el);
      const props = ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
                     'marginTop', 'marginBottom', 'gap', 'rowGap', 'columnGap'];

      for (const prop of props) {
        const val = parseFloat(style[prop]);
        if (val && val > 0 && val <= 200) {
          const key = Math.round(val);
          spacingValues.set(key, (spacingValues.get(key) || 0) + 1);
        }
      }
    }

    const sorted = Array.from(spacingValues.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([value, count]) => ({ value, count }));

    // Detect grid base
    const values = sorted.map(s => s.value);
    const baseUnit = detectBaseUnit(values);

    return { topValues: sorted, baseUnit };
  }

  function detectBaseUnit(values) {
    const candidates = [4, 8, 10, 12, 16, 20, 24];
    for (const base of candidates) {
      const aligned = values.filter(v => v % base === 0).length;
      if (aligned / values.length > 0.5) return base;
    }
    return 8; // default
  }

  // =====================================================
  // BORDERS EXTRACTION
  // =====================================================
  function extractBorders() {
    const radiusMap = new Map();
    const elements = document.querySelectorAll('button, input, img, div, a, card, [class*="card"], [class*="btn"], [class*="badge"]');
    const limit = Math.min(elements.length, 500);

    for (let i = 0; i < limit; i++) {
      const el = elements[i];
      const style = window.getComputedStyle(el);
      const radius = style.borderRadius;
      if (!radius || radius === '0px') continue;

      const key = radius;
      radiusMap.set(key, (radiusMap.get(key) || 0) + 1);
    }

    return {
      borderRadius: Array.from(radiusMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([value, count]) => ({ value, count }))
    };
  }

  // =====================================================
  // SHADOWS EXTRACTION
  // =====================================================
  function extractShadows() {
    const shadowMap = new Map();
    const elements = document.querySelectorAll('*');
    const limit = Math.min(elements.length, 1000);

    for (let i = 0; i < limit; i++) {
      const el = elements[i];
      const style = window.getComputedStyle(el);
      const shadow = style.boxShadow;
      if (!shadow || shadow === 'none') continue;

      shadowMap.set(shadow, (shadowMap.get(shadow) || 0) + 1);
    }

    return Array.from(shadowMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({ value, count }));
  }

  // =====================================================
  // COMPONENT DETECTION
  // =====================================================
  function extractComponents() {
    return {
      buttons: extractButtons(),
      inputs: extractInputs(),
      cards: extractCards(),
      navs: extractNavs(),
      badges: extractBadges()
    };
  }

  function extractButtons() {
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], a.btn, [class*="btn"], [class*="button"]'));
    const unique = new Map();
    const limit = Math.min(buttons.length, 50);

    for (let i = 0; i < limit; i++) {
      const el = buttons[i];
      const style = window.getComputedStyle(el);
      const sig = `${style.backgroundColor}|${style.color}|${style.borderRadius}|${style.padding}`;
      if (!unique.has(sig)) {
        unique.set(sig, {
          text: el.textContent?.trim().slice(0, 40) || '',
          backgroundColor: style.backgroundColor,
          color: style.color,
          borderRadius: style.borderRadius,
          padding: style.padding,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          border: style.border,
          tag: el.tagName
        });
      }
    }

    return Array.from(unique.values()).slice(0, 10);
  }

  function extractInputs() {
    const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
    const unique = new Map();
    const limit = Math.min(inputs.length, 20);

    for (let i = 0; i < limit; i++) {
      const el = inputs[i];
      const style = window.getComputedStyle(el);
      const sig = `${style.backgroundColor}|${style.borderColor}|${style.borderRadius}`;
      if (!unique.has(sig)) {
        unique.set(sig, {
          type: el.type || el.tagName,
          placeholder: el.placeholder || '',
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          borderRadius: style.borderRadius,
          padding: style.padding,
          fontSize: style.fontSize
        });
      }
    }

    return Array.from(unique.values()).slice(0, 5);
  }

  function extractCards() {
    const cards = document.querySelectorAll('[class*="card"], [class*="Card"], [class*="panel"], article, .post, [class*="item"]');
    const results = [];
    const limit = Math.min(cards.length, 10);

    for (let i = 0; i < limit; i++) {
      const el = cards[i];
      const style = window.getComputedStyle(el);
      if (style.display === 'none') continue;
      results.push({
        className: el.className?.toString().slice(0, 60) || '',
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
        padding: style.padding,
        border: style.border
      });
    }

    return results;
  }

  function extractNavs() {
    const navs = document.querySelectorAll('nav, header, [role="navigation"], [class*="navbar"], [class*="nav"]');
    const results = [];
    navs.forEach(nav => {
      const style = window.getComputedStyle(nav);
      results.push({
        tag: nav.tagName,
        backgroundColor: style.backgroundColor,
        height: style.height,
        position: style.position
      });
    });
    return results.slice(0, 3);
  }

  function extractBadges() {
    const badges = document.querySelectorAll('[class*="badge"], [class*="tag"], [class*="chip"], [class*="label"], [class*="pill"]');
    const unique = new Map();
    badges.forEach(el => {
      const style = window.getComputedStyle(el);
      const sig = `${style.backgroundColor}|${style.color}`;
      if (!unique.has(sig)) {
        unique.set(sig, {
          text: el.textContent?.trim().slice(0, 20) || '',
          backgroundColor: style.backgroundColor,
          color: style.color,
          borderRadius: style.borderRadius,
          padding: style.padding,
          fontSize: style.fontSize
        });
      }
    });
    return Array.from(unique.values()).slice(0, 8);
  }

  // =====================================================
  // LAYOUT DETECTION
  // =====================================================
  function extractLayout() {
    const containers = document.querySelectorAll('[class*="container"], [class*="wrapper"], main, .main, #main');
    const containerWidths = [];

    containers.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 200 && rect.width < 2000) {
        containerWidths.push(Math.round(rect.width));
      }
    });

    const grids = document.querySelectorAll('[class*="grid"], [style*="grid"], [class*="flex"], [class*="row"]');
    const gridSystems = [];

    grids.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.display === 'grid' || style.display === 'flex') {
        gridSystems.push({
          type: style.display,
          columns: style.gridTemplateColumns || 'N/A',
          gap: style.gap || 'N/A'
        });
      }
    });

    return {
      containerWidths: [...new Set(containerWidths)].slice(0, 5),
      viewportWidth: window.innerWidth,
      gridSystems: gridSystems.slice(0, 5)
    };
  }

  // =====================================================
  // SVG EXTRACTION
  // =====================================================
  function extractSVGs() {
    const svgElements = document.querySelectorAll('svg');
    const imgSvgs = Array.from(document.querySelectorAll('img[src$=".svg"], img[src*=".svg"]'));
    const results = [];

    svgElements.forEach((svg, index) => {
      if (index >= 50) return;
      const clone = svg.cloneNode(true);
      // Ensure viewBox exists
      if (!clone.getAttribute('viewBox') && clone.getAttribute('width') && clone.getAttribute('height')) {
        clone.setAttribute('viewBox', `0 0 ${clone.getAttribute('width')} ${clone.getAttribute('height')}`);
      }
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(clone);

      results.push({
        type: 'inline',
        index,
        width: svg.getAttribute('width') || svg.clientWidth || 24,
        height: svg.getAttribute('height') || svg.clientHeight || 24,
        viewBox: svg.getAttribute('viewBox') || '',
        svgString: svgStr,
        elementCount: svg.querySelectorAll('*').length,
        hasTitle: !!svg.querySelector('title'),
        title: svg.querySelector('title')?.textContent || `SVG ${index + 1}`
      });
    });

    imgSvgs.forEach((img, index) => {
      results.push({
        type: 'img',
        index: svgElements.length + index,
        src: img.src,
        alt: img.alt || `SVG Image ${index + 1}`,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        title: img.alt || img.src.split('/').pop() || `SVG ${index + 1}`
      });
    });

    return {
      total: results.length,
      items: results
    };
  }

  // =====================================================
  // UTILITIES
  // =====================================================
  function rgbToHex(rgb) {
    if (!rgb) return null;
    if (rgb.startsWith('#')) return rgb;

    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    // Skip pure white (too common) unless it's not full white
    if (r === 255 && g === 255 && b === 255) return '#ffffff';

    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  console.log('[Designer OS] Design extractor loaded');
})();
