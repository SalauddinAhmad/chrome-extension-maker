/**
 * Designer OS — Side Panel Application
 * All module logic: Color Toolkit, Font Toolkit, Design System Extractor,
 * Inspiration Vault, SVG Toolkit, Screenshot & Annotation, Tech Analyzer,
 * Social Media Sizes, Design Resources
 *
 * 100% local-first. No API. No backend. No tracking.
 */

// ================================================================
// GLOBAL STATE & UTILITIES
// ================================================================

const DOS = window.DOS = {};

// ================================================================
// TOAST NOTIFICATIONS
// ================================================================
DOS.toast = {
  show(message, type = 'default', duration = 2800) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  },
  success(msg) { this.show('✅ ' + msg, 'success'); },
  error(msg) { this.show('❌ ' + msg, 'error'); },
  info(msg) { this.show('ℹ️ ' + msg); }
};

// Copy to clipboard
async function copyToClipboard(text, label = 'Copied') {
  try {
    await navigator.clipboard.writeText(text);
    DOS.toast.success(label + ' copied!');
  } catch {
    DOS.toast.error('Copy failed');
  }
}

// Send message to active tab
function sendToTab(type, payload = {}) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, ...payload }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ success: false, error: chrome.runtime.lastError.message });
      } else {
        resolve(response || { success: false });
      }
    });
  });
}

// Send message to active tab's content scripts directly
async function sendToActiveTab(message) {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return resolve({ success: false, error: 'No active tab' });
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          const errMsg = chrome.runtime.lastError.message;
          if (errMsg.includes('Receiving end does not exist')) {
            let fileToInject = '';
            if (message.type === 'START_AREA_SELECTION') {
              fileToInject = 'content/screenshot-cropper.js';
            } else if (message.type === 'EXTRACT_DESIGN_SYSTEM') {
              fileToInject = 'content/design-extractor.js';
            } else if (message.type === 'ENABLE_FONT_INSPECTOR' || message.type === 'GET_ALL_PAGE_FONTS') {
              fileToInject = 'content/font-detector.js';
            } else if (message.type === 'DETECT_TECH_STACK') {
              fileToInject = 'content/tech-detector.js';
            }

            if (fileToInject) {
              chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: [fileToInject]
              }, () => {
                if (chrome.runtime.lastError) {
                  resolve({ success: false, error: chrome.runtime.lastError.message });
                  return;
                }
                setTimeout(() => {
                  chrome.tabs.sendMessage(tabId, message, (secondResponse) => {
                    if (chrome.runtime.lastError) {
                      resolve({ success: false, error: chrome.runtime.lastError.message });
                    } else {
                      resolve(secondResponse || { success: true });
                    }
                  });
                }, 100);
              });
              return;
            }
          }
          resolve({ success: false, error: errMsg });
        } else {
          resolve(response || { success: false });
        }
      });
    });
  });
}

// ================================================================
// NAVIGATION — Module Router
// ================================================================
DOS.nav = {
  currentModule: 'color',

  init() {
    document.getElementById('main-nav').addEventListener('click', (e) => {
      const item = e.target.closest('.nav-item');
      if (!item) return;
      const module = item.dataset.module;
      this.switchTo(module);
    });
  },

  switchTo(module) {
    this.currentModule = module;

    // Update nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.module === module);
    });

    // Update panels
    document.querySelectorAll('.module-panel').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.panel === module);
    });
  }
};

// ================================================================
// SETTINGS
// ================================================================
DOS.settings = {
  init() {
    document.getElementById('btn-settings').addEventListener('click', () => {
      document.getElementById('settings-panel').classList.remove('hidden');
      this.loadStorageInfo();
    });
    document.getElementById('btn-settings-close').addEventListener('click', () => {
      document.getElementById('settings-panel').classList.add('hidden');
    });
    document.getElementById('btn-clear-all-data').addEventListener('click', async () => {
      if (confirm('This will delete ALL saved colors, fonts, inspiration screenshots, tasks, and palettes. Are you sure?')) {
        await chrome.storage.local.clear();
        const db = await DOS.db.open();
        const tx = db.transaction(['screenshots'], 'readwrite');
        tx.objectStore('screenshots').clear();
        DOS.toast.success('All local data cleared');
        document.getElementById('settings-panel').classList.add('hidden');
        setTimeout(() => location.reload(), 500);
      }
    });

    // Double-click image downloader toggle check
    const downloaderToggle = document.getElementById('image-downloader-toggle');
    chrome.storage.local.get(['imageDownloaderActive'], (result) => {
      downloaderToggle.checked = result.imageDownloaderActive || false;
    });

    downloaderToggle.addEventListener('change', () => {
      const active = downloaderToggle.checked;
      chrome.storage.local.set({ imageDownloaderActive: active }, () => {
        sendToActiveTab({ action: 'toggleImageDownloader', active });
      });
    });

    // Break Timer listeners
    document.getElementById('start-timer').addEventListener('click', () => this.startTimer());
    document.getElementById('stop-timer').addEventListener('click', () => this.stopTimer());
    
    // Select custom option radio if custom minutes is clicked
    const customMinutesInput = document.getElementById('custom-minutes');
    customMinutesInput.addEventListener('click', (e) => {
      e.stopPropagation();
      const customRadio = document.querySelector('input[name="break-time"][value="custom"]');
      if (customRadio) customRadio.checked = true;
    });
    customMinutesInput.addEventListener('input', () => {
      const customRadio = document.querySelector('input[name="break-time"][value="custom"]');
      if (customRadio) customRadio.checked = true;
    });

    this.updateTimerDisplay();
    // Start interval to update remaining time count
    setInterval(() => this.updateTimerDisplay(), 1000);
  },

  startTimer() {
    const selectedRadio = document.querySelector('input[name="break-time"]:checked');
    let minutes = 20;
    if (selectedRadio) {
      if (selectedRadio.value === 'custom') {
        minutes = parseInt(document.getElementById('custom-minutes').value) || 10;
      } else {
        minutes = parseInt(selectedRadio.value);
      }
    }
    const endTime = Date.now() + (minutes * 60000);
    chrome.storage.local.set({ breakTimerActive: true, breakTimerEnd: endTime, breakTimerMinutes: minutes }, () => {
      chrome.alarms.create('screen-break-timer', { delayInMinutes: minutes, periodInMinutes: minutes });
      this.updateTimerDisplay();
      DOS.toast.success(`Screen Break timer set for ${minutes} minutes!`);
    });
  },

  stopTimer() {
    chrome.alarms.clear('screen-break-timer');
    chrome.storage.local.set({ breakTimerActive: false, breakTimerEnd: null }, () => {
      this.updateTimerDisplay();
      DOS.toast.success('Break timer stopped');
    });
  },

  updateTimerDisplay() {
    chrome.storage.local.get(['breakTimerEnd', 'breakTimerActive', 'breakTimerMinutes'], (result) => {
      const timerStatus = document.getElementById('timer-status');
      const startBtn = document.getElementById('start-timer');
      const stopBtn = document.getElementById('stop-timer');
      if (!timerStatus) return;

      if (result.breakTimerActive && result.breakTimerEnd) {
        const remaining = Math.max(0, result.breakTimerEnd - Date.now());
        if (remaining === 0) {
          timerStatus.innerText = 'Break time! Rest your eyes 👀';
          timerStatus.style.color = 'var(--accent-500)';
          startBtn.classList.remove('hidden');
          stopBtn.classList.add('hidden');
        } else {
          const m = Math.floor(remaining / 60000);
          const s = Math.floor((remaining % 60000) / 1000);
          timerStatus.innerText = `Break in: ${m}:${s.toString().padStart(2, '0')}`;
          timerStatus.style.color = 'var(--primary-400)';
          startBtn.classList.add('hidden');
          stopBtn.classList.remove('hidden');
        }
      } else {
        timerStatus.innerText = 'No active timer';
        timerStatus.style.color = 'var(--text-muted)';
        startBtn.classList.remove('hidden');
        stopBtn.classList.add('hidden');
      }
    });
  },

  async loadStorageInfo() {
    const local = await chrome.storage.local.get(null);
    const localStr = JSON.stringify(local);
    const kb = (localStr.length / 1024).toFixed(1);
    document.getElementById('storage-info').innerHTML = `
      <div>chrome.storage.local: <strong>${kb} KB</strong></div>
      <div style="margin-top:4px;color:var(--text-muted)">IndexedDB: see Vault for screenshots</div>
    `;
  }
};

// ================================================================
// INDEXEDDB HELPER
// ================================================================
DOS.db = {
  _db: null,

  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('DesignerOS', 2);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('screenshots')) {
          const store = db.createObjectStore('screenshots', { keyPath: 'id', autoIncrement: true });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('tags', 'tags', { multiEntry: true });
        }
      };
      req.onsuccess = (e) => { this._db = e.target.result; resolve(this._db); };
      req.onerror = () => reject(req.error);
    });
  },

  async saveScreenshot(data) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['screenshots'], 'readwrite');
      const store = tx.objectStore('screenshots');
      const req = store.add(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async getAllScreenshots() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['screenshots'], 'readonly');
      const store = tx.objectStore('screenshots');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async updateScreenshot(id, updates) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['screenshots'], 'readwrite');
      const store = tx.objectStore('screenshots');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const record = { ...getReq.result, ...updates };
        const putReq = store.put(record);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
    });
  },

  async deleteScreenshot(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['screenshots'], 'readwrite');
      const store = tx.objectStore('screenshots');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
};

// ================================================================
// MODULE 1: COLOR TOOLKIT
// ================================================================
DOS.color = {
  currentHex: '#0f766e',
  history: [],
  savedPalettes: [],

  init() {
    this.loadHistory();
    this.loadSavedPalettes();
    this.bindTabs();
    this.bindPicker();
    this.bindPalette();
    this.bindContrast();
    this.bindGradient();
    this.bindFormats();
  },

  bindTabs() {
    document.getElementById('color-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const id = tab.dataset.tab;
      document.querySelectorAll('#color-tabs .tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.color-tab-content').forEach(p => p.classList.add('hidden'));
      document.getElementById(`color-tab-${id}`)?.classList.remove('hidden');
    });
  },

  bindPicker() {
    const hexInput = document.getElementById('input-hex');
    const nativeInput = document.getElementById('input-color-native');

    hexInput.addEventListener('input', () => {
      const val = hexInput.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        this.setColor(val);
        nativeInput.value = val;
      }
    });

    nativeInput.addEventListener('input', () => {
      this.setColor(nativeInput.value);
      hexInput.value = nativeInput.value;
    });

    document.getElementById('btn-eyedropper').addEventListener('click', () => this.activateEyedropper());
    document.getElementById('btn-copy-hex').addEventListener('click', () => copyToClipboard(this.currentHex, 'HEX'));
    document.getElementById('btn-clear-history').addEventListener('click', () => this.clearHistory());

    this.setColor(this.currentHex);
  },

  bindFormats() {
    document.querySelectorAll('.color-format-item').forEach(item => {
      item.addEventListener('click', () => {
        const type = item.dataset.copy;
        const value = item.querySelector('.color-format-value').textContent;
        copyToClipboard(value, type.toUpperCase());
      });
    });
  },

  async activateEyedropper() {
    if (!window.EyeDropper) {
      DOS.toast.error('EyeDropper API not supported in this browser');
      return;
    }
    try {
      const btn = document.getElementById('btn-eyedropper');
      btn.classList.add('eyedropper-active');
      btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;margin-right:6px;fill:none;stroke:currentColor;stroke-width:2;display:inline-block;vertical-align:middle;animation:spin 2s linear infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Pick...';
      const dropper = new EyeDropper();
      const result = await dropper.open();
      this.setColor(result.sRGBHex);
      document.getElementById('input-hex').value = result.sRGBHex;
      document.getElementById('input-color-native').value = result.sRGBHex;
      this.addToHistory(result.sRGBHex);
    } catch (e) {
      if (e.name !== 'AbortError') DOS.toast.error('Eyedropper failed');
    } finally {
      const btn = document.getElementById('btn-eyedropper');
      btn.classList.remove('eyedropper-active');
      btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;margin-right:6px;display:inline-block;vertical-align:middle;"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> Pick';
    }
  },

  setColor(hex) {
    hex = hex.toLowerCase();
    this.currentHex = hex;

    // Preview box
    document.getElementById('color-preview-box').style.background = hex;

    // Derive all formats
    const rgb = this.hexToRgb(hex);
    if (!rgb) return;

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Update format displays
    document.getElementById('fmt-hex').textContent = hex;
    document.getElementById('fmt-rgb').textContent = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
    document.getElementById('fmt-hsl').textContent = `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
    document.getElementById('fmt-tailwind').textContent = this.hexToTailwind(hex);
    document.getElementById('fmt-cssvar').textContent = `--color: ${hex}`;
    document.getElementById('fmt-oklch').textContent = this.hexToOklch(hex);

    // Color name
    document.getElementById('color-name-display').textContent = this.getColorName(hex);

    // Adjust text color on preview box for readability
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    document.getElementById('color-preview-box').querySelector('span').style.color =
      brightness > 128 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
  },

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  },

  hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  },

  hexToOklch(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 'oklch(0% 0 0)';
    // Simplified approximate conversion
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const L = Math.round((0.2126 * r + 0.7152 * g + 0.0722 * b) * 100);
    const c = Math.round(Math.sqrt((r - g) ** 2 + (g - b) ** 2 + (b - r) ** 2) * 30) / 100;
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    return `oklch(${L}% ${c.toFixed(2)} ${hsl.h})`;
  },

  hexToTailwind(hex) {
    // Map to nearest Tailwind color (simplified lookup)
    const tw = {
      '#ef4444':'red-500','#f97316':'orange-500','#f59e0b':'amber-500',
      '#eab308':'yellow-500','#84cc16':'lime-500','#22c55e':'green-500',
      '#10b981':'emerald-500','#14b8a6':'teal-500','#06b6d4':'cyan-500',
      '#3b82f6':'blue-500','#6366f1':'indigo-500','#8b5cf6':'violet-500',
      '#a855f7':'purple-500','#ec4899':'pink-500','#f43f5e':'rose-500',
      '#ffffff':'white','#000000':'black','#1f2937':'gray-800','#6b7280':'gray-500',
      '#f3f4f6':'gray-100','#e5e7eb':'gray-200','#d1d5db':'gray-300',
      '#9ca3af':'gray-400','#374151':'gray-700','#111827':'gray-900'
    };
    return tw[hex] || hex;
  },

  getColorName(hex) {
    // Simple algorithmic color naming based on HSL
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const { h, s, l } = hsl;

    if (s < 10) {
      if (l > 95) return 'White';
      if (l > 80) return 'Near White';
      if (l > 60) return 'Light Gray';
      if (l > 40) return 'Gray';
      if (l > 20) return 'Dark Gray';
      return 'Near Black';
    }

    const hueNames = [
      [0, 'Red'], [15, 'Red-Orange'], [30, 'Orange'], [45, 'Amber'],
      [60, 'Yellow'], [75, 'Yellow-Green'], [90, 'Lime'], [120, 'Green'],
      [150, 'Emerald'], [165, 'Teal'], [180, 'Cyan'], [195, 'Sky'],
      [210, 'Blue'], [240, 'Indigo'], [260, 'Violet'], [280, 'Purple'],
      [300, 'Magenta'], [330, 'Pink'], [345, 'Rose'], [360, 'Red']
    ];

    let hueName = 'Unknown';
    for (let i = 0; i < hueNames.length - 1; i++) {
      if (h >= hueNames[i][0] && h < hueNames[i + 1][0]) {
        hueName = hueNames[i][1]; break;
      }
    }

    let prefix = '';
    if (l > 70) prefix = 'Light ';
    else if (l < 30) prefix = 'Dark ';
    else if (l < 45) prefix = 'Deep ';
    if (s > 80 && l > 40 && l < 65) prefix = 'Vivid ';

    return prefix + hueName;
  },

  // ----- PALETTE GENERATION -----
  bindPalette() {
    document.getElementById('palette-base-native').addEventListener('input', (e) => {
      document.getElementById('palette-base-hex').value = e.target.value;
    });
    document.getElementById('palette-base-hex').addEventListener('input', (e) => {
      if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
        document.getElementById('palette-base-native').value = e.target.value;
      }
    });
    document.getElementById('btn-generate-palette').addEventListener('click', () => this.generatePalette());
  },

  generatePalette() {
    const hex = document.getElementById('palette-base-hex').value;
    const type = document.getElementById('harmony-type').value;
    const rgb = this.hexToRgb(hex);
    if (!rgb) return DOS.toast.error('Invalid hex color');
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    let colors = [];

    switch(type) {
      case 'complementary':
        colors = [hex, this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)];
        break;
      case 'triadic':
        colors = [hex, this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l), this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)];
        break;
      case 'analogous':
        colors = [this.hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l), hex, this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)];
        break;
      case 'split-complementary':
        colors = [hex, this.hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l), this.hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l)];
        break;
      case 'tetradic':
        colors = [hex, this.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l), this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l), this.hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l)];
        break;
      case 'monochromatic':
        colors = [
          this.hslToHex(hsl.h, hsl.s, Math.max(15, hsl.l - 40)),
          this.hslToHex(hsl.h, hsl.s, Math.max(25, hsl.l - 20)),
          hex,
          this.hslToHex(hsl.h, hsl.s, Math.min(85, hsl.l + 20)),
          this.hslToHex(hsl.h, hsl.s, Math.min(95, hsl.l + 40))
        ];
        break;
      case 'shades':
        colors = Array.from({ length: 9 }, (_, i) => this.hslToHex(hsl.h, hsl.s, 10 + i * 10));
        break;
    }

    const el = document.getElementById('palette-result');
    el.innerHTML = `
      <div class="palette-row mb-2">
        ${colors.map(c => `<div class="swatch-slot" style="background:${c}" title="${c}"></div>`).join('')}
      </div>
      <div class="flex gap-1 flex-wrap mb-3">
        ${colors.map(c => `<div class="swatch swatch-sm" style="background:${c}" title="${c}" data-copy="${c}"></div>`).join('')}
      </div>
      <div class="flex gap-2">
        <button class="btn btn-secondary btn-sm flex-1" id="btn-save-palette">
          <svg viewBox="0 0 24 24" style="width:12px;height:12px;margin-right:4px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save Palette
        </button>
        <button class="btn btn-ghost btn-sm flex-1" id="btn-copy-palette-css">
          <svg viewBox="0 0 24 24" style="width:12px;height:12px;margin-right:4px;fill:none;stroke:currentColor;stroke-width:2;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy CSS
        </button>
      </div>
    `;

    el.querySelectorAll('.swatch-sm').forEach(s => {
      s.addEventListener('click', () => copyToClipboard(s.dataset.copy, 'Color'));
    });

    document.getElementById('btn-save-palette')?.addEventListener('click', () => {
      this.savePalette(type, colors);
    });
    document.getElementById('btn-copy-palette-css')?.addEventListener('click', () => {
      const css = colors.map((c, i) => `--color-${i + 1}: ${c};`).join('\n');
      copyToClipboard(css, 'Palette CSS');
    });
  },

  async savePalette(name, colors) {
    const palettes = await this.loadPalettesFromStorage();
    palettes.push({ id: Date.now(), name, colors, createdAt: new Date().toISOString() });
    await chrome.storage.local.set({ palettes });
    this.renderSavedPalettes(palettes);
    DOS.toast.success('Palette saved!');
  },

  async loadPalettesFromStorage() {
    const result = await chrome.storage.local.get('palettes');
    return result.palettes || [];
  },

  async loadSavedPalettes() {
    const palettes = await this.loadPalettesFromStorage();
    this.renderSavedPalettes(palettes);
  },

  renderSavedPalettes(palettes) {
    const el = document.getElementById('saved-palettes-list');
    if (!palettes.length) {
      el.innerHTML = '<p class="text-xs text-muted">No palettes saved yet.</p>';
      return;
    }
    el.innerHTML = palettes.map(p => `
      <div class="mb-3" data-palette-id="${p.id}">
        <div class="flex items-center justify-between mb-1">
          <div class="text-xs font-medium">${p.name}</div>
          <button class="btn btn-ghost btn-sm" data-delete-palette="${p.id}" style="font-size:11px;">✕</button>
        </div>
        <div class="palette-row" style="height:32px;border-radius:6px;overflow:hidden;">
          ${p.colors.map(c => `<div class="swatch-slot" style="background:${c}"></div>`).join('')}
        </div>
      </div>
    `).join('');

    el.querySelectorAll('[data-delete-palette]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.deletePalette);
        const current = await this.loadPalettesFromStorage();
        const updated = current.filter(p => p.id !== id);
        await chrome.storage.local.set({ palettes: updated });
        this.renderSavedPalettes(updated);
      });
    });
  },

  // ----- CONTRAST CHECKER -----
  bindContrast() {
    const update = () => this.updateContrast();
    ['contrast-fg', 'contrast-bg'].forEach(id => {
      document.getElementById(id).addEventListener('input', update);
    });
    document.getElementById('contrast-fg-native').addEventListener('input', (e) => {
      document.getElementById('contrast-fg').value = e.target.value;
      update();
    });
    document.getElementById('contrast-bg-native').addEventListener('input', (e) => {
      document.getElementById('contrast-bg').value = e.target.value;
      update();
    });
    this.updateContrast();
  },

  updateContrast() {
    const fg = document.getElementById('contrast-fg').value;
    const bg = document.getElementById('contrast-bg').value;
    if (!/^#[0-9a-fA-F]{6}$/.test(fg) || !/^#[0-9a-fA-F]{6}$/.test(bg)) return;

    const ratio = this.getContrastRatio(fg, bg);
    document.getElementById('contrast-ratio').textContent = ratio.toFixed(2);

    const aa_normal = ratio >= 4.5;
    const aa_large = ratio >= 3;
    const aaa_normal = ratio >= 7;
    const aaa_large = ratio >= 4.5;

    const checkSVG = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--accent-500);fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;"><polyline points="20 6 9 17 4 12"/></svg>';
    const crossSVG = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--danger-500);fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    document.getElementById('wcag-aa-normal').innerHTML = aa_normal ? checkSVG : crossSVG;
    document.getElementById('wcag-aa-large').innerHTML = aa_large ? checkSVG : crossSVG;
    document.getElementById('wcag-aaa-normal').innerHTML = aaa_normal ? checkSVG : crossSVG;
    document.getElementById('wcag-aaa-large').innerHTML = aaa_large ? checkSVG : crossSVG;

    const preview = document.getElementById('contrast-preview');
    preview.style.background = bg;
    preview.style.color = fg;

    const ratioEl = document.getElementById('contrast-ratio');
    ratioEl.style.color = ratio >= 7 ? 'var(--success-400)' : ratio >= 4.5 ? 'var(--warning-400)' : 'var(--error-400)';
  },

  getRelativeLuminance(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  getContrastRatio(hex1, hex2) {
    const l1 = this.getRelativeLuminance(hex1);
    const l2 = this.getRelativeLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  // ----- GRADIENT -----
  bindGradient() {
    const update = () => this.updateGradient();
    document.getElementById('gradient-type').addEventListener('change', update);
    document.getElementById('gradient-angle').addEventListener('input', (e) => {
      document.getElementById('gradient-angle-display').textContent = e.target.value + '°';
      update();
    });

    document.getElementById('gradient-stops').addEventListener('input', (e) => {
      if (e.target.classList.contains('gradient-stop-color')) {
        const hexInput = e.target.nextElementSibling;
        hexInput.value = e.target.value;
      } else if (e.target.classList.contains('gradient-stop-hex')) {
        if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
          e.target.previousElementSibling.value = e.target.value;
        }
      }
      update();
    });

    document.getElementById('gradient-stops').addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.btn-delete-stop');
      if (deleteBtn) {
        deleteBtn.parentElement.remove();
        update();
      }
    });

    document.getElementById('btn-add-stop').addEventListener('click', () => {
      const stop = document.createElement('div');
      stop.className = 'input-group mb-2';
      stop.innerHTML = `
        <input type="color" value="#a855f7" class="gradient-stop-color" style="width:40px;height:36px;border:none;background:none;cursor:pointer;border-radius:8px;" />
        <input type="text" class="input input-mono gradient-stop-hex" value="#a855f7" />
        <button class="btn-icon btn-delete-stop">
          <svg viewBox="0 0 24 24" style="width:14px;height:14px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;
      document.getElementById('gradient-stops').appendChild(stop);
      update();
    });

    document.getElementById('btn-copy-gradient').addEventListener('click', () => {
      const css = document.getElementById('gradient-css-output').textContent.trim();
      copyToClipboard(css, 'Gradient CSS');
    });

    this.updateGradient();
  },

  updateGradient() {
    const type = document.getElementById('gradient-type').value;
    const angle = document.getElementById('gradient-angle').value;
    const stops = Array.from(document.querySelectorAll('.gradient-stop-hex'))
      .map(i => i.value)
      .filter(v => /^#[0-9a-fA-F]{6}$/.test(v));

    if (stops.length < 2) return;

    let css = '';
    if (type === 'linear') {
      css = `background: linear-gradient(${angle}deg, ${stops.join(', ')});`;
    } else if (type === 'radial') {
      css = `background: radial-gradient(circle, ${stops.join(', ')});`;
    } else if (type === 'conic') {
      css = `background: conic-gradient(from ${angle}deg, ${stops.join(', ')});`;
    }

    const preview = document.getElementById('gradient-preview');
    preview.style.background = css.replace('background: ', '').replace(';', '');
    document.getElementById('gradient-css-output').textContent = css;
  },

  // ----- HISTORY -----
  async loadHistory() {
    const result = await chrome.storage.local.get('colorHistory');
    this.history = result.colorHistory || [];
    this.renderHistory();
  },

  addToHistory(hex) {
    this.history = [hex, ...this.history.filter(h => h !== hex)].slice(0, 50);
    chrome.storage.local.set({ colorHistory: this.history });
    this.renderHistory();
  },

  renderHistory() {
    const el = document.getElementById('color-history-grid');
    if (!this.history.length) {
      el.innerHTML = '<p class="text-xs text-muted">No colors in history yet.</p>';
      return;
    }
    el.innerHTML = this.history.map(hex => `
      <div class="swatch" style="background:${hex}" title="${hex}" data-hex="${hex}"></div>
    `).join('');
    el.querySelectorAll('.swatch').forEach(s => {
      s.addEventListener('click', () => {
        this.setColor(s.dataset.hex);
        document.getElementById('input-hex').value = s.dataset.hex;
        document.getElementById('input-color-native').value = s.dataset.hex;
        DOS.nav.switchTo('color');
        document.querySelector('[data-tab="picker"]').click();
      });
    });
  },

  async clearHistory() {
    this.history = [];
    await chrome.storage.local.set({ colorHistory: [] });
    this.renderHistory();
    DOS.toast.info('History cleared');
  }
};

// ================================================================
// MODULE 2: FONT TOOLKIT
// ================================================================
DOS.font = {
  currentFont: null,
  savedFonts: [],
  isInspectorActive: false,

  init() {
    this.loadSavedFonts();
    this.bindTabs();
    this.bindInspector();
    this.bindAllFonts();

    // Listen for font inspection result
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'FONT_INSPECTED') {
        this.showFontResult(message.data);
        this.isInspectorActive = false;
        document.getElementById('btn-activate-inspector').innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;margin-right:4px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:2;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><span>Activate Font Inspector</span>';
      } else if (message.type === 'FONT_INSPECTOR_CANCELLED') {
        this.isInspectorActive = false;
        document.getElementById('btn-activate-inspector').innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;margin-right:4px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:2;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><span>Activate Font Inspector</span>';
      }
    });
  },

  bindTabs() {
    document.getElementById('font-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const id = tab.dataset.tab;
      document.querySelectorAll('#font-tabs .tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.font-tab-content').forEach(p => p.classList.add('hidden'));
      document.getElementById(`font-tab-${id.replace('-', '-')}`)?.classList.remove('hidden');
    });
  },

  bindInspector() {
    document.getElementById('btn-activate-inspector').addEventListener('click', async () => {
      if (this.isInspectorActive) {
        await sendToActiveTab({ type: 'DISABLE_FONT_INSPECTOR' });
        this.isInspectorActive = false;
        document.getElementById('btn-activate-inspector').innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;margin-right:4px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:2;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><span>Activate Font Inspector</span>';
        return;
      }
      const result = await sendToActiveTab({ type: 'ENABLE_FONT_INSPECTOR' });
      if (result.success) {
        this.isInspectorActive = true;
        document.getElementById('btn-activate-inspector').innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;margin-right:4px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:2;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg><span>Deactivate Inspector</span>';
        DOS.toast.info('Click any text element on the page');
      } else {
        DOS.toast.error('Could not activate on this page');
      }
    });
  },

  showFontResult(data) {
    this.currentFont = data;
    const card = document.getElementById('font-result-card');
    const content = document.getElementById('font-result-content');
    card.style.display = 'block';
    DOS.nav.switchTo('font');

    content.innerHTML = `
      <div style="background:rgba(10,10,20,0.6);border-radius:8px;padding:12px;margin-bottom:12px;font-family:'${data.family}',sans-serif;font-size:${data.size};font-weight:${data.weight};color:${data.color};">
        ${data.text || 'Aa — The quick brown fox'}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
        <div><div class="input-label">Family</div><div style="font-size:13px;color:var(--text-primary);font-weight:600;">${data.family}</div></div>
        <div><div class="input-label">Size</div><div style="font-size:13px;color:var(--text-primary);font-weight:600;">${data.size}</div></div>
        <div><div class="input-label">Weight</div><div style="font-size:13px;color:var(--text-primary);">${data.weight} (${data.weightName})</div></div>
        <div><div class="input-label">Style</div><div style="font-size:13px;color:var(--text-primary);">${data.style}</div></div>
        <div><div class="input-label">Line Height</div><div style="font-size:13px;color:var(--text-primary);">${data.lineHeight}</div></div>
        <div><div class="input-label">Letter Spacing</div><div style="font-size:13px;color:var(--text-primary);">${data.letterSpacing}</div></div>
      </div>
      <div class="mb-2">
        <div class="input-label">CSS</div>
        <div class="code-block" style="font-size:11px;">${data.css}</div>
      </div>
      <div class="mb-3">
        <div class="input-label">Tailwind Classes</div>
        <div class="code-block" style="font-size:11px;">${data.tailwind || 'N/A'}</div>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-secondary btn-sm flex-1" id="btn-copy-font-css">
          <svg viewBox="0 0 24 24" style="width:12px;height:12px;margin-right:4px;fill:none;stroke:currentColor;stroke-width:2;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy CSS
        </button>
        <button class="btn btn-secondary btn-sm flex-1" id="btn-copy-font-tw">
          <svg viewBox="0 0 24 24" style="width:12px;height:12px;margin-right:4px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Copy Tailwind
        </button>
        <button class="btn btn-primary btn-sm" id="btn-save-font">
          <svg viewBox="0 0 24 24" style="width:12px;height:12px;margin-right:4px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save
        </button>
      </div>
    `;

    content.querySelector('#btn-copy-font-css')?.addEventListener('click', () => copyToClipboard(data.css, 'Font CSS'));
    content.querySelector('#btn-copy-font-tw')?.addEventListener('click', () => copyToClipboard(data.tailwind, 'Tailwind classes'));
    content.querySelector('#btn-save-font')?.addEventListener('click', () => this.saveFont(data));
  },

  bindAllFonts() {
    document.getElementById('btn-scan-fonts').addEventListener('click', async () => {
      const el = document.getElementById('all-fonts-list');
      el.innerHTML = '<div class="loading"><div class="spinner"></div><span>Scanning fonts...</span></div>';
      const result = await sendToActiveTab({ type: 'GET_ALL_PAGE_FONTS' });
      if (result.success && result.data) {
        this.renderAllFonts(result.data);
      } else {
        el.innerHTML = '<p class="text-xs text-muted">Could not scan this page.</p>';
      }
    });
  },

  renderAllFonts(fonts) {
    const el = document.getElementById('all-fonts-list');
    if (!fonts.length) {
      el.innerHTML = '<p class="text-xs text-muted">No fonts detected.</p>';
      return;
    }
    el.innerHTML = fonts.map(f => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-subtle);">
        <div>
          <div style="font-size:16px;font-family:'${f.family}',sans-serif;color:var(--text-primary);margin-bottom:3px;">${f.family}</div>
          <div style="font-size:11px;color:var(--text-muted);">Weights: ${f.weights.slice(0,5).join(', ')} • Used ${f.count}×</div>
        </div>
        <button class="btn btn-ghost btn-sm" data-save-font='${JSON.stringify({family:f.family,fullFamily:f.fullFamily})}'>
          <svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        </button>
      </div>
    `).join('');
    el.querySelectorAll('[data-save-font]').forEach(btn => {
      btn.addEventListener('click', () => this.saveFont(JSON.parse(btn.dataset.saveFont)));
    });
  },

  async saveFont(data) {
    const result = await chrome.storage.local.get('savedFonts');
    const fonts = result.savedFonts || [];
    if (fonts.some(f => f.family === data.family)) {
      DOS.toast.info('Font already saved');
      return;
    }
    fonts.unshift({ ...data, savedAt: new Date().toISOString() });
    await chrome.storage.local.set({ savedFonts: fonts.slice(0, 50) });
    DOS.toast.success(`"${data.family}" saved!`);
    this.renderSavedFonts(fonts);
  },

  async loadSavedFonts() {
    const result = await chrome.storage.local.get('savedFonts');
    this.renderSavedFonts(result.savedFonts || []);
  },

  renderSavedFonts(fonts) {
    const el = document.getElementById('saved-fonts-list');
    if (!fonts.length) {
      el.innerHTML = '<p class="text-xs text-muted">No saved fonts yet.</p>';
      return;
    }
    el.innerHTML = fonts.map((f, i) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-subtle);">
        <div>
          <div style="font-size:18px;font-family:'${f.family}',sans-serif;color:var(--text-primary);">${f.family}</div>
          <div style="font-size:11px;color:var(--text-muted);">${f.size || ''} ${f.weight ? `• ${f.weight}` : ''}</div>
        </div>
        <div class="flex gap-1">
          <button class="btn btn-ghost btn-sm" data-copy-css="${i}">CSS</button>
          <button class="btn btn-ghost btn-sm" data-del-font="${i}">✕</button>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('[data-copy-css]').forEach(btn => {
      const f = fonts[parseInt(btn.dataset.copyCss)];
      btn.addEventListener('click', () => copyToClipboard(f.css || `font-family: '${f.family}';`, 'Font CSS'));
    });

    el.querySelectorAll('[data-del-font]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.delFont);
        const updated = fonts.filter((_, i) => i !== idx);
        await chrome.storage.local.set({ savedFonts: updated });
        this.renderSavedFonts(updated);
      });
    });
  }
};

// ================================================================
// MODULE 3: DESIGN SYSTEM EXTRACTOR
// ================================================================
DOS.designSystem = {
  data: null,

  init() {
    document.getElementById('btn-extract-design').addEventListener('click', () => this.extract());
    document.getElementById('btn-export-json').addEventListener('click', () => this.exportJson());
    document.getElementById('btn-export-css').addEventListener('click', () => this.exportCss());
    document.getElementById('btn-export-tailwind').addEventListener('click', () => this.exportTailwind());
  },

  async extract() {
    document.getElementById('ds-loading').classList.remove('hidden');
    document.getElementById('ds-results').classList.add('hidden');

    const result = await sendToActiveTab({ type: 'EXTRACT_DESIGN_SYSTEM' });

    document.getElementById('ds-loading').classList.add('hidden');

    if (!result.success || !result.data) {
      DOS.toast.error('Extraction failed. Try refreshing the page.');
      return;
    }

    this.data = result.data;
    this.render(result.data);
    document.getElementById('ds-results').classList.remove('hidden');
    DOS.toast.success('Design system extracted!');
  },

  render(data) {
    // COLORS
    const colorsEl = document.getElementById('ds-colors');
    colorsEl.innerHTML = (data.colors?.topColors || []).slice(0, 48).map(c => `
      <div class="swatch" style="background:${c.hex}" title="${c.hex} (${c.count}×)" data-hex="${c.hex}"></div>
    `).join('');
    colorsEl.querySelectorAll('.swatch').forEach(s => {
      s.addEventListener('click', () => copyToClipboard(s.dataset.hex, 'Color'));
    });

    // TYPOGRAPHY
    const typoEl = document.getElementById('ds-typography');
    typoEl.innerHTML = (data.typography?.topVariations || []).slice(0, 8).map(t => `
      <div class="typo-specimen-row">
        <div class="typo-specimen" style="font-family:'${t.family}',sans-serif;font-weight:${t.weight};">
          ${t.family}
        </div>
        <div class="typo-meta-badges">
          <span class="typo-badge">${t.size}px</span>
          <span class="typo-badge">${t.weight}</span>
          <span class="typo-badge" style="text-transform:uppercase;">${t.tag}</span>
          <span class="typo-badge count-badge">${t.count}×</span>
        </div>
      </div>
    `).join('') || '<p class="text-xs text-muted">No typography scale detected</p>';

    // SPACING
    const spacingEl = document.getElementById('ds-spacing');
    const baseUnit = data.spacing?.baseUnit || 8;
    spacingEl.innerHTML = `
      <div class="base-unit-label">Detected Base Unit: <span>${baseUnit}px</span></div>
      <div class="spacing-specimens-grid">
        ${(data.spacing?.topValues || []).slice(0, 6).map(s => `
          <div class="spacing-specimen-item">
            <span class="spacing-val">${s.value}px</span>
            <div class="spacing-visual-bar-wrap">
              <div class="spacing-visual-bar" style="width:${Math.min(s.value * 2.5, 100)}px;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // BORDERS
    const bordersEl = document.getElementById('ds-borders');
    bordersEl.innerHTML = (data.borders?.borderRadius || []).slice(0, 8).map(b => `
      <div class="border-specimen-item">
        <div class="border-visual-box" style="border-radius:${b.value};"></div>
        <span class="border-val">${b.value}</span>
      </div>
    `).join('') || '<span class="text-xs text-muted">None detected</span>';

    // SHADOWS
    const shadowsEl = document.getElementById('ds-shadows');
    shadowsEl.innerHTML = (data.shadows || []).slice(0, 4).map((s, idx) => `
      <div class="shadow-specimen-card">
        <div class="shadow-preview-box" style="box-shadow:${s.value}"></div>
        <div style="flex:1;min-width:0;">
          <div class="shadow-desc">Shadow ${idx + 1}</div>
          <div class="shadow-code" title="${s.value}">${s.value.slice(0, 32)}...</div>
        </div>
      </div>
    `).join('') || '<p class="text-xs text-muted">No shadows detected</p>';

    // BUTTONS
    const buttonsEl = document.getElementById('ds-buttons');
    buttonsEl.innerHTML = (data.components?.buttons || []).slice(0, 4).map(b => `
      <div class="button-specimen-wrap">
        <div style="padding:16px;background:rgba(255,255,255,0.4);border-radius:10px;border:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:center;min-height:70px;">
          <div class="button-specimen" style="background:${b.backgroundColor};color:${b.color};border-radius:${b.borderRadius};padding:${b.padding};font-size:${b.fontSize};font-weight:${b.fontWeight};border:${b.border};">
            ${b.text || 'Button'}
          </div>
        </div>
        <div class="button-specimen-meta">bg: ${b.backgroundColor} • color: ${b.color}</div>
      </div>
    `).join('') || '<p class="text-xs text-muted">No buttons detected</p>';
  },

  exportJson() {
    if (!this.data) return DOS.toast.error('Extract design system first');
    const json = JSON.stringify(this.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'design-system.json';
    a.click(); URL.revokeObjectURL(url);
    DOS.toast.success('JSON exported');
  },

  exportCss() {
    if (!this.data) return DOS.toast.error('Extract design system first');
    const colors = (this.data.colors?.topColors || []).slice(0, 20);
    const spacings = (this.data.spacing?.topValues || []).slice(0, 10);
    let css = ':root {\n';
    colors.forEach((c, i) => { css += `  --color-${i + 1}: ${c.hex};\n`; });
    spacings.forEach((s, i) => { css += `  --space-${i + 1}: ${s.value}px;\n`; });
    css += '}\n';
    copyToClipboard(css, 'CSS Variables');
  },

  exportTailwind() {
    if (!this.data) return DOS.toast.error('Extract design system first');
    const colors = (this.data.colors?.topColors || []).slice(0, 10);
    const config = {
      theme: {
        extend: {
          colors: Object.fromEntries(colors.map((c, i) => [`brand-${i + 1}`, c.hex])),
          spacing: Object.fromEntries((this.data.spacing?.topValues || []).slice(0,8).map((s, i) => [`custom-${i + 1}`, `${s.value}px`]))
        }
      }
    };
    copyToClipboard(JSON.stringify(config, null, 2), 'Tailwind config');
  }
};

// ================================================================
// MODULE 4: INSPIRATION VAULT
// ================================================================
DOS.vault = {
  items: [],
  currentId: null,

  init() {
    this.load();
    document.getElementById('btn-save-screenshot').addEventListener('click', () => this.saveScreenshot());
    document.getElementById('vault-search').addEventListener('input', (e) => this.filter(e.target.value));
    document.getElementById('vault-sort').addEventListener('change', () => this.filter(document.getElementById('vault-search').value));
    document.getElementById('vault-filter-tag').addEventListener('change', () => this.filter(document.getElementById('vault-search').value));
    document.getElementById('btn-vault-modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('btn-vault-save-meta').addEventListener('click', () => this.saveMeta());
    document.getElementById('btn-vault-delete').addEventListener('click', () => this.deleteCurrentItem());
    document.getElementById('btn-vault-export').addEventListener('click', () => this.exportZip());
  },

  async saveScreenshot() {
    const btn = document.getElementById('btn-save-screenshot');
    btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;margin-right:6px;fill:none;stroke:currentColor;stroke-width:2;display:inline-block;vertical-align:middle;animation:spin 2s linear infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Capturing...';
    btn.disabled = true;

    try {
      const response = await sendToTab('CAPTURE_SCREENSHOT');
      if (!response.success) {
        DOS.toast.error('Screenshot failed: ' + response.error);
        return;
      }

      // Get page info
      const tabInfo = await sendToTab('GET_ACTIVE_TAB_INFO');
      const url = tabInfo.url || '';
      const title = tabInfo.title || 'Untitled';

      // Auto-tag
      const tags = this.autoTag(url, title);

      await DOS.db.saveScreenshot({
        dataUrl: response.dataUrl,
        url,
        title,
        tags,
        notes: '',
        createdAt: new Date().toISOString()
      });

      DOS.toast.success('Saved to vault!');
      await this.load();
    } catch(e) {
      DOS.toast.error('Save failed');
    } finally {
      btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;margin-right:6px;fill:none;stroke:currentColor;stroke-width:2;display:inline-block;vertical-align:middle;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Save Page';
      btn.disabled = false;
    }
  },

  autoTag(url, title) {
    const tags = [];
    const combined = (url + ' ' + title).toLowerCase();

    const patterns = {
      'landing page': ['landing', 'home', 'homepage'],
      'saas': ['saas', 'software', 'app', 'dashboard', 'product'],
      'pricing': ['pricing', 'plans', 'subscribe', 'checkout'],
      'portfolio': ['portfolio', 'work', 'projects', 'case study'],
      'e-commerce': ['shop', 'store', 'cart', 'product', 'buy'],
      'blog': ['blog', 'article', 'post', 'news'],
      'documentation': ['docs', 'documentation', 'api', 'guide', 'tutorial'],
      'dark theme': ['dark', 'night'],
      'agency': ['agency', 'studio', 'creative', 'design'],
      'startup': ['startup', 'launch', 'beta', 'early access']
    };

    for (const [tag, keywords] of Object.entries(patterns)) {
      if (keywords.some(kw => combined.includes(kw))) tags.push(tag);
    }

    return tags.length ? tags : ['inspiration'];
  },

  async load() {
    this.items = await DOS.db.getAllScreenshots();
    this.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    this.render(this.items);
    this.updateTagFilter();
  },

  updateTagFilter() {
    const allTags = new Set();
    this.items.forEach(item => (item.tags || []).forEach(t => allTags.add(t)));
    const sel = document.getElementById('vault-filter-tag');
    const current = sel.value;
    sel.innerHTML = '<option value="">All Tags</option>' +
      Array.from(allTags).map(t => `<option value="${t}"${t === current ? ' selected' : ''}>${t}</option>`).join('');
  },

  filter(query) {
    const tag = document.getElementById('vault-filter-tag').value;
    const sort = document.getElementById('vault-sort').value;
    let filtered = [...this.items];

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(item =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q) ||
        (item.tags || []).some(t => t.includes(q)) ||
        (item.url || '').toLowerCase().includes(q)
      );
    }
    if (tag) {
      filtered = filtered.filter(item => (item.tags || []).includes(tag));
    }
    if (sort === 'oldest') filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sort === 'title') filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    this.render(filtered);
  },

  render(items) {
    const gallery = document.getElementById('vault-gallery');
    const empty = document.getElementById('vault-empty');

    if (!items.length) {
      gallery.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    gallery.innerHTML = items.map(item => `
      <div class="vault-item" data-id="${item.id}">
        <img src="${item.dataUrl}" alt="${item.title || 'Screenshot'}" loading="lazy" />
        <div class="vault-item-overlay">
          <div style="font-size:11px;font-weight:600;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.title || 'Untitled'}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.7);margin-top:2px;">
            ${(item.tags || []).slice(0,2).join(' • ')}
          </div>
        </div>
      </div>
    `).join('');

    gallery.querySelectorAll('.vault-item').forEach(el => {
      el.addEventListener('click', () => this.openModal(parseInt(el.dataset.id)));
    });
  },

  openModal(id) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    this.currentId = id;
    const modal = document.getElementById('vault-modal');
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    document.getElementById('vault-modal-title').textContent = item.title || 'Screenshot';
    document.getElementById('vault-modal-img').src = item.dataUrl;
    document.getElementById('vault-modal-title-input').value = item.title || '';
    document.getElementById('vault-modal-tags').value = (item.tags || []).join(', ');
    document.getElementById('vault-modal-notes').value = item.notes || '';
  },

  closeModal() {
    const modal = document.getElementById('vault-modal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
    this.currentId = null;
  },

  async saveMeta() {
    if (!this.currentId) return;
    const title = document.getElementById('vault-modal-title-input').value;
    const tags = document.getElementById('vault-modal-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    const notes = document.getElementById('vault-modal-notes').value;
    await DOS.db.updateScreenshot(this.currentId, { title, tags, notes });
    DOS.toast.success('Saved!');
    await this.load();
    this.closeModal();
  },

  async deleteCurrentItem() {
    if (!this.currentId || !confirm('Delete this screenshot?')) return;
    await DOS.db.deleteScreenshot(this.currentId);
    this.closeModal();
    await this.load();
    DOS.toast.success('Deleted');
  },

  async exportZip() {
    DOS.toast.info('ZIP export coming in Phase 2');
  }
};

// ================================================================
// MODULE 5: SVG TOOLKIT
// ================================================================
DOS.svg = {
  svgs: [],
  selectedSvg: null,

  init() {
    this.bindTabs();
    document.getElementById('btn-scan-svgs').addEventListener('click', () => this.scan());
    document.getElementById('btn-optimize-svg').addEventListener('click', () => this.optimizeSvg());
    document.getElementById('btn-preview-svg').addEventListener('click', () => this.previewSvg());
    document.getElementById('btn-export-svg').addEventListener('click', () => this.exportSvg());
    document.getElementById('btn-export-png').addEventListener('click', () => this.exportPng());
    document.getElementById('svg-size-slider').addEventListener('input', (e) => {
      document.getElementById('svg-size-label').textContent = e.target.value + 'x';
    });
  },

  bindTabs() {
    document.getElementById('svg-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const id = tab.dataset.tab;
      document.querySelectorAll('#svg-tabs .tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.svg-tab-content').forEach(p => p.classList.add('hidden'));
      document.getElementById(`svg-tab-${id}`)?.classList.remove('hidden');
    });
  },

  async scan() {
    const list = document.getElementById('svg-list');
    list.innerHTML = '<div class="loading"><div class="spinner"></div><span>Scanning SVGs...</span></div>';
    const result = await sendToActiveTab({ type: 'EXTRACT_SVGS' });

    if (!result.success || !result.data?.items?.length) {
      list.innerHTML = '<p class="text-xs text-muted text-center" style="padding:24px 0;">No SVGs found on this page.</p>';
      return;
    }

    this.svgs = result.data.items;
    DOS.toast.success(`Found ${result.data.total} SVG(s)`);

    list.innerHTML = this.svgs.map((svg, i) => `
      <div class="svg-item" data-idx="${i}">
        <div class="svg-preview">
          ${svg.type === 'inline' ? `<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;">${svg.svgString.slice(0, 500)}</div>` :
            `<img src="${svg.src}" alt="" style="max-width:36px;max-height:36px;" />`}
        </div>
        <div class="svg-info">
          <div class="svg-name">${svg.title}</div>
          <div class="svg-meta">${svg.width}×${svg.height} • ${svg.type === 'inline' ? svg.elementCount + ' elements' : 'External'}</div>
        </div>
        <div class="flex flex-col gap-1">
          <button class="btn btn-ghost btn-sm" data-action="svg-copy" data-idx="${i}">Copy</button>
          <button class="btn btn-secondary btn-sm" data-action="svg-opt" data-idx="${i}">Opt.</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('[data-action="svg-copy"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const svg = this.svgs[parseInt(btn.dataset.idx)];
        if (svg.svgString) copyToClipboard(svg.svgString, 'SVG code');
        else copyToClipboard(svg.src, 'SVG URL');
      });
    });

    list.querySelectorAll('[data-action="svg-opt"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const svg = this.svgs[parseInt(btn.dataset.idx)];
        if (svg.svgString) {
          document.getElementById('svg-paste-input').value = svg.svgString;
          // Switch to optimize tab
          document.querySelector('[data-tab="optimize"]').click();
          this.optimizeSvg();
        } else {
          DOS.toast.info('Only inline SVGs can be optimized');
        }
      });
    });
  },

  optimizeSvg() {
    const input = document.getElementById('svg-paste-input').value.trim();
    if (!input) { DOS.toast.error('Paste SVG code first'); return; }

    // Basic SVG optimization without SVGO (remove comments, whitespace, metadata)
    let optimized = input
      .replace(/<!--[\s\S]*?-->/g, '')           // remove comments
      .replace(/<title>[\s\S]*?<\/title>/g, '')  // remove title
      .replace(/<desc>[\s\S]*?<\/desc>/g, '')    // remove desc
      .replace(/<metadata>[\s\S]*?<\/metadata>/g, '') // remove metadata
      .replace(/\s+/g, ' ')                       // collapse whitespace
      .replace(/>\s+</g, '><')                    // remove space between tags
      .trim();

    const origSize = new Blob([input]).size;
    const optSize = new Blob([optimized]).size;
    const saved = Math.round((1 - optSize / origSize) * 100);

    document.getElementById('svg-orig-size').textContent = this.formatBytes(origSize);
    document.getElementById('svg-opt-size').textContent = this.formatBytes(optSize);
    document.getElementById('svg-saved-pct').textContent = `${saved}% smaller`;
    document.getElementById('svg-optimized-code').textContent = optimized;

    this.selectedSvg = optimized;
    this.previewSvg(optimized);
    document.getElementById('svg-preview-card').classList.remove('hidden');
    DOS.toast.success(`Optimized! Saved ${saved}%`);
  },

  previewSvg(svg) {
    const code = svg || document.getElementById('svg-paste-input').value.trim();
    if (!code) return;
    const area = document.getElementById('svg-preview-area');
    area.innerHTML = code;
    const svgEl = area.querySelector('svg');
    if (svgEl) {
      svgEl.style.maxWidth = '100%';
      svgEl.style.maxHeight = '200px';
    }
    this.selectedSvg = code;
    document.getElementById('svg-preview-card').classList.remove('hidden');
  },

  exportSvg() {
    const code = this.selectedSvg || document.getElementById('svg-paste-input').value.trim();
    if (!code) { DOS.toast.error('No SVG to export'); return; }
    const blob = new Blob([code], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'designer-os-export.svg';
    a.click(); URL.revokeObjectURL(url);
    DOS.toast.success('SVG exported');
  },

  exportPng() {
    const code = this.selectedSvg || document.getElementById('svg-paste-input').value.trim();
    if (!code) { DOS.toast.error('No SVG to export'); return; }
    const scale = parseInt(document.getElementById('svg-size-slider').value) || 2;

    const blob = new Blob([code], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = (img.naturalWidth || 100) * scale;
      canvas.height = (img.naturalHeight || 100) * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a'); a.href = pngUrl; a.download = `designer-os-export-${scale}x.png`;
      a.click(); URL.revokeObjectURL(url);
      DOS.toast.success(`PNG exported at ${scale}x`);
    };
    img.src = url;
  },

  formatBytes(bytes) {
    if (bytes < 1024) return bytes + 'B';
    return (bytes / 1024).toFixed(1) + 'KB';
  }
};

// ================================================================
// MODULE 6: SCREENSHOT & ANNOTATION
// ================================================================
DOS.annotation = {
  canvas: null,
  ctx: null,
  tool: 'pen',
  color: '#ef4444',
  size: 4,
  isDrawing: false,
  lastX: 0, lastY: 0,
  history: [],
  markerCount: 0,

  init() {
    document.getElementById('btn-capture-annotate').addEventListener('click', () => this.captureViewport());
    document.getElementById('btn-capture-area').addEventListener('click', () => this.captureArea());
    document.getElementById('btn-export-annotation').addEventListener('click', () => this.export());
    document.getElementById('btn-copy-annotation').addEventListener('click', () => this.copyToClipboard());
    document.getElementById('btn-save-to-vault').addEventListener('click', () => this.saveToVault());
    document.getElementById('btn-undo').addEventListener('click', () => this.undo());
    document.getElementById('btn-clear-canvas').addEventListener('click', () => this.clear());
    document.getElementById('tool-color').addEventListener('input', (e) => { this.color = e.target.value; });
    document.getElementById('tool-size').addEventListener('change', (e) => { this.size = parseInt(e.target.value); });

    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.tool = btn.dataset.tool;
      });
    });

    // Listen for custom area selection messages
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'AREA_SELECTED') {
        this.handleAreaSelected(message.coords);
      } else if (message.type === 'AREA_SELECTION_CANCELLED') {
        this.resetAreaButton();
      }
    });
  },

  async captureViewport() {
    const btn = document.getElementById('btn-capture-annotate');
    const oldText = btn.innerHTML;
    btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;margin-right:4px;fill:none;stroke:currentColor;stroke-width:2;display:inline-block;vertical-align:middle;animation:spin 2s linear infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Viewport...';
    btn.disabled = true;

    try {
      const response = await sendToTab('CAPTURE_SCREENSHOT');
      if (!response.success) {
        DOS.toast.error('Capture failed: ' + response.error);
        return;
      }
      this.setupCanvas(response.dataUrl);
      document.getElementById('annotation-workspace').classList.remove('hidden');
    } catch(e) {
      DOS.toast.error('Capture failed');
    } finally {
      btn.innerHTML = oldText;
      btn.disabled = false;
    }
  },

  async captureArea() {
    const btn = document.getElementById('btn-capture-area');
    this.oldAreaBtnHTML = btn.innerHTML;
    btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;margin-right:4px;fill:none;stroke:currentColor;stroke-width:2;display:inline-block;vertical-align:middle;animation:spin 2s linear infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Drag area...';
    btn.disabled = true;

    try {
      const response = await sendToActiveTab({ type: 'START_AREA_SELECTION' });
      if (!response.success) {
        DOS.toast.error('Could not activate: ' + (response.error || 'unknown error'));
        this.resetAreaButton();
      }
    } catch(e) {
      DOS.toast.error('Failed to trigger area selection');
      this.resetAreaButton();
    }
  },

  resetAreaButton() {
    const btn = document.getElementById('btn-capture-area');
    if (this.oldAreaBtnHTML) {
      btn.innerHTML = this.oldAreaBtnHTML;
    } else {
      btn.innerHTML = `<svg viewBox="0 0 24 24" style="width:12px;height:12px;margin-right:4px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg> Selected Area`;
    }
    btn.disabled = false;
  },

  async handleAreaSelected(coords) {
    try {
      const response = await sendToTab('CAPTURE_SCREENSHOT');
      if (!response.success) {
        DOS.toast.error('Capture failed: ' + response.error);
        this.resetAreaButton();
        return;
      }

      // Crop viewport screenshot using selected dimensions
      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = coords.width * coords.dpr;
        offCanvas.height = coords.height * coords.dpr;
        const offCtx = offCanvas.getContext('2d');
        
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        offCtx.drawImage(
          img,
          coords.x * coords.dpr,
          coords.y * coords.dpr,
          coords.width * coords.dpr,
          coords.height * coords.dpr,
          0,
          0,
          coords.width * coords.dpr,
          coords.height * coords.dpr
        );

        const croppedDataUrl = offCanvas.toDataURL('image/png');
        this.setupCanvas(croppedDataUrl);
        document.getElementById('annotation-workspace').classList.remove('hidden');
        this.resetAreaButton();
      };
      img.src = response.dataUrl;
    } catch(e) {
      DOS.toast.error('Error cropping screenshot');
      this.resetAreaButton();
    }
  },

  setupCanvas(dataUrl) {
    const wrap = document.querySelector('.canvas-wrap');
    const canvas = document.getElementById('annotation-canvas');
    this.canvas = canvas;

    const img = new Image();
    img.onload = () => {
      const maxW = wrap.clientWidth;
      const scale = maxW / img.naturalWidth;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.style.width = maxW + 'px';
      canvas.style.height = (img.naturalHeight * scale) + 'px';

      this.ctx = canvas.getContext('2d');
      this.ctx.drawImage(img, 0, 0);
      this.saveState();
      this.bindCanvasEvents();
    };
    img.src = dataUrl;
  },

  bindCanvasEvents() {
    const canvas = this.canvas;
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      this.isDrawing = true;
      this.lastX = pos.x; this.lastY = pos.y;

      if (this.tool === 'text') {
        const text = prompt('Enter text:');
        if (text) {
          const ctx = this.ctx;
          ctx.font = `${this.size * 6}px Inter, sans-serif`;
          ctx.fillStyle = this.color;
          ctx.fillText(text, pos.x, pos.y);
          this.saveState();
        }
        this.isDrawing = false;
        return;
      }
      if (this.tool === 'marker') {
        this.markerCount++;
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.markerCount, pos.x, pos.y);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
        this.saveState();
        this.isDrawing = false;
        return;
      }
      if (this.tool === 'rect' || this.tool === 'circle' || this.tool === 'arrow') {
        this.startX = pos.x; this.startY = pos.y;
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!this.isDrawing) return;
      const pos = getPos(e);
      const ctx = this.ctx;

      if (this.tool === 'pen') {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(this.lastX, this.lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        this.lastX = pos.x; this.lastY = pos.y;
      }
    });

    canvas.addEventListener('mouseup', (e) => {
      if (!this.isDrawing) return;
      const pos = getPos(e);
      const ctx = this.ctx;

      if (this.tool === 'rect') {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.strokeRect(this.startX, this.startY, pos.x - this.startX, pos.y - this.startY);
      } else if (this.tool === 'circle') {
        const r = Math.sqrt((pos.x - this.startX) ** 2 + (pos.y - this.startY) ** 2);
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.arc(this.startX, this.startY, r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (this.tool === 'arrow') {
        this.drawArrow(ctx, this.startX, this.startY, pos.x, pos.y);
      }

      this.isDrawing = false;
      this.saveState();
    });
  },

  drawArrow(ctx, fromX, fromY, toX, toY) {
    const headLen = 20;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = this.size;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  },

  saveState() {
    this.history.push(this.canvas.toDataURL());
    if (this.history.length > 20) this.history.shift();
  },

  undo() {
    if (this.history.length < 2) return;
    this.history.pop();
    const prev = this.history[this.history.length - 1];
    const img = new Image();
    img.onload = () => this.ctx.drawImage(img, 0, 0);
    img.src = prev;
  },

  clear() {
    if (!this.ctx) return;
    const img = new Image();
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0);
      this.saveState();
    };
    img.src = this.history[0];
  },

  export() {
    if (!this.canvas) { DOS.toast.error('Capture a screenshot first'); return; }
    const url = this.canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = 'designer-os-annotation.png';
    a.click();
    DOS.toast.success('Annotation exported');
  },

  copyToClipboard() {
    if (!this.canvas) { DOS.toast.error('Capture a screenshot first'); return; }
    this.canvas.toBlob((blob) => {
      if (!blob) {
        DOS.toast.error('Failed to copy image');
        return;
      }
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        DOS.toast.success('Screenshot copied to clipboard!');
      }).catch(err => {
        DOS.toast.error('Copy failed: ' + err.message);
      });
    }, 'image/png');
  },

  async saveToVault() {
    if (!this.canvas) { DOS.toast.error('Capture a screenshot first'); return; }
    const dataUrl = this.canvas.toDataURL('image/png');
    await DOS.db.saveScreenshot({
      dataUrl,
      url: '',
      title: 'Annotated Screenshot',
      tags: ['annotation'],
      notes: '',
      createdAt: new Date().toISOString()
    });
    DOS.toast.success('Saved to vault!');
  }
};

// ================================================================
// MODULE 7: TECH STACK ANALYZER
// ================================================================
DOS.tech = {
  init() {
    document.getElementById('btn-detect-tech').addEventListener('click', () => this.detect());
  },

  async detect() {
    document.getElementById('tech-loading').classList.remove('hidden');
    document.getElementById('tech-results').classList.add('hidden');

    const result = await sendToActiveTab({ type: 'DETECT_TECH_STACK' });

    document.getElementById('tech-loading').classList.add('hidden');

    if (!result.success || !result.data) {
      DOS.toast.error('Detection failed. Try refreshing.');
      return;
    }

    this.render(result.data);
    document.getElementById('tech-results').classList.remove('hidden');
  },

  render(data) {
    // Page meta
    const meta = data.meta || {};
    document.getElementById('tech-meta').innerHTML = `
      <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">${meta.title || 'Unknown'}</div>
      <div style="font-size:11px;color:var(--text-muted);word-break:break-all;">${meta.canonicalUrl || meta.favicon || ''}</div>
      ${meta.generator ? `<div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">Generator: ${meta.generator}</div>` : ''}
    `;

    const renderGroup = (id, items) => {
      const el = document.getElementById(id);
      if (!items || !items.length) {
        el.innerHTML = '<span class="text-xs text-muted">None detected</span>';
        return;
      }
      el.innerHTML = items.map(item => `
        <span class="tech-chip">${item.icon || ''} ${item.name}</span>
      `).join('');
    };

    renderGroup('tech-frameworks', data.frameworks);
    renderGroup('tech-css', data.cssFrameworks);
    renderGroup('tech-platforms', data.platforms);
    renderGroup('tech-analytics', data.analytics);
    renderGroup('tech-adpixels', data.adPixels);
    renderGroup('tech-other', data.other);
  }
};

// ================================================================
// MODULE 8: SOCIAL MEDIA SIZES
// ================================================================
DOS.social = {
  data: [],

  async init() {
    const response = await fetch('../data/social-sizes.json');
    const defaultPlatforms = (await response.json()).platforms;
    
    chrome.storage.local.get(['customSocialSizes'], (result) => {
      this.data = result.customSocialSizes || defaultPlatforms;
      this.render(this.data);
    });
    
    document.getElementById('social-search').addEventListener('input', (e) => this.search(e.target.value));

    // Tabs switching inside Social/Sizes
    document.querySelectorAll('#sizes-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#sizes-tabs .tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.sizes-tab-content').forEach(p => p.classList.add('hidden'));
        
        tab.classList.add('active');
        const tabId = tab.dataset.tab;
        document.getElementById(`sizes-tab-${tabId}`).classList.remove('hidden');
      });
    });

    // Initialize calculator
    this.initCalculator();
  },

  getPlatformIcon(name) {
    const icons = {
      'instagram': `<svg viewBox="0 0 24 24" class="platform-svg"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
      'facebook': `<svg viewBox="0 0 24 24" class="platform-svg"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
      'youtube': `<svg viewBox="0 0 24 24" class="platform-svg"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>`,
      'twitter / x': `<svg viewBox="0 0 24 24" class="platform-svg"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>`,
      'linkedin': `<svg viewBox="0 0 24 24" class="platform-svg"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
      'tiktok': `<svg viewBox="0 0 24 24" class="platform-svg"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>`,
      'pinterest': `<svg viewBox="0 0 24 24" class="platform-svg"><line x1="12" y1="8" x2="12" y2="22"/><path d="M12 2a10 10 0 0 0-3 19.5c0-1.8 1-4.3 1.5-5.6l-1-2c0-3.3 2.5-4.5 4.5-4.5 2.5 0 4.5 2 4.5 4.5 0 4.5-3 5.5-4.5 5.5-1 0-1.5-.5-1.5-1.5 0-1.3.5-3 1-4 0-1.5-.8-2-2.3-2-2 0-3.5 1.7-3.5 4 0 1 .3 2.3 1 2.8l-.5 2.2C5.5 16 5 13.5 5 11c0-4.5 3.5-8 9-8 5 0 8 3 8 8 0 5-3.5 9-7.5 9c-1.5 0-2.8-.8-3.3-1.8z"/></svg>`,
      'snapchat': `<svg viewBox="0 0 24 24" class="platform-svg"><path d="M12 3c-1.2 0-2.4.5-3.2 1.3C8 5.2 8.3 6.8 8.3 8.3c0 .8-.5 1.5-1.2 1.7A1.5 1.5 0 0 0 6 11.5c0 1.2 1 1.7 1.8 1.7a2 2 0 0 1 1.5.8c.8 1 2.3 1.5 3.7 1.5s2.9-.5 3.7-1.5a2 2 0 0 1 1.5-.8c.8 0 1.8-.5 1.8-1.7 0-.8-.7-1.4-1.1-1.5-.7-.2-1.2-.9-1.2-1.7 0-1.5.3-3.1-.5-4C14.4 3.5 13.2 3 12 3z"/><path d="M5.5 18.5a6 6 0 0 0 13 0"/></svg>`,
      'behance': `<svg viewBox="0 0 24 24" class="platform-svg"><path d="M15 11h6"/><path d="M20 7h-4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M3 7h4a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H3V7z"/><path d="M3 13h4a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H3v-6z"/></svg>`,
      'dribbble': `<svg viewBox="0 0 24 24" class="platform-svg"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 3.9c-3.5-.49-11.05 1-11.6 8.56"/></svg>`
    };
    return icons[name.toLowerCase()] || `<svg viewBox="0 0 24 24" style="width:14px;height:14px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:2;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
  },

  search(query) {
    if (!query) { this.render(this.data); return; }
    const q = query.toLowerCase();
    const filtered = this.data.map(platform => ({
      ...platform,
      sizes: platform.sizes.filter(s =>
        s.name.toLowerCase().includes(q) ||
        platform.name.toLowerCase().includes(q) ||
        `${s.width}x${s.height}`.includes(q)
      )
    })).filter(p => p.sizes.length > 0);
    this.render(filtered);
  },

  render(platforms) {
    const el = document.getElementById('social-sizes-list');
    el.innerHTML = platforms.map((p, idx) => `
      <div class="card platform-section draggable-group" draggable="true" data-index="${idx}">
        <div class="platform-header">
          <span class="drag-handle" style="margin-right:8px;">⋮⋮</span>
          <span class="platform-icon">${this.getPlatformIcon(p.name)}</span>
          <span class="platform-name">${p.name}</span>
          <span class="badge badge-accent" style="font-size:9px;margin-left:auto;">${p.sizes.length} sizes</span>
        </div>
        <table class="size-table">
          <thead><tr>
            <th>Format</th><th>Size</th><th>Ratio</th><th></th>
          </tr></thead>
          <tbody>
            ${p.sizes.map(s => {
              const sizeStr = `${s.width}${s.height === 'auto' ? '' : '×' + s.height}`;
              return `
                <tr class="size-row-item">
                  <td>${s.name}</td>
                  <td class="font-mono" style="font-size:11px;">${sizeStr}</td>
                  <td style="font-size:11px;">${s.ratio}</td>
                  <td><button class="copy-size-btn-sm" data-copy-val="${sizeStr}">Copy</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `).join('');

    // Copy buttons
    el.querySelectorAll('.copy-size-btn-sm').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = btn.dataset.copyVal;
        navigator.clipboard.writeText(val);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    });

    // Drag-and-drop for platform groupings
    el.querySelectorAll('.draggable-group').forEach(group => {
      group.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', group.dataset.index);
        group.classList.add('dragging-group');
      });

      group.addEventListener('dragend', () => {
        group.classList.remove('dragging-group');
        
        const newOrder = [...el.querySelectorAll('.draggable-group')].map(g => {
          return this.data[parseInt(g.dataset.index)];
        });
        this.data = newOrder;
        chrome.storage.local.set({ customSocialSizes: newOrder });
        this.render(newOrder);
      });
    });

    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      const draggingGroup = el.querySelector('.dragging-group');
      if (!draggingGroup) return;

      const siblings = [...el.querySelectorAll('.draggable-group:not(.dragging-group)')];
      const nextSibling = siblings.find(sibling => {
        const box = sibling.getBoundingClientRect();
        return e.clientY <= box.top + box.height / 2;
      });

      el.insertBefore(draggingGroup, nextSibling);
    });
  },

  initCalculator() {
    const fitSelect = document.getElementById('img-fit');
    const widthInput = document.getElementById('img-width');
    const heightInput = document.getElementById('img-height');
    const unitSelect = document.getElementById('img-unit');
    const resInput = document.getElementById('img-res');
    const lockBtn = document.getElementById('ratio-lock-btn');
    const ratioDisplay = document.getElementById('ratio-display');
    const fileSizeDisplay = document.getElementById('file-size-display');
    const copyBtn = document.getElementById('copy-size-btn');

    let isLocked = lockBtn.classList.contains('active');
    let aspectRatio = parseFloat(widthInput.value) / parseFloat(heightInput.value);

    lockBtn.addEventListener('click', () => {
      isLocked = !isLocked;
      lockBtn.classList.toggle('active', isLocked);
      if (isLocked) {
        const w = parseFloat(widthInput.value);
        const h = parseFloat(heightInput.value);
        if (w > 0 && h > 0) aspectRatio = w / h;
      }
    });

    const updateCalculations = () => {
      const w = parseFloat(widthInput.value);
      const h = parseFloat(heightInput.value);
      const unit = unitSelect.value;
      const res = parseFloat(resInput.value) || 300;

      if (w > 0 && h > 0) {
        let wPx = w, hPx = h;

        if (unit === 'in') {
          wPx = w * res; hPx = h * res;
        } else if (unit === 'cm') {
          wPx = (w / 2.54) * res; hPx = (h / 2.54) * res;
        } else if (unit === 'mm') {
          wPx = (w / 25.4) * res; hPx = (h / 25.4) * res;
        } else if (unit === 'pt') {
          wPx = (w / 72) * res; hPx = (h / 72) * res;
        } else if (unit === 'pc') {
          wPx = (w / 6) * res; hPx = (h / 6) * res;
        } else if (unit === 'percent') {
          wPx = (w / 100) * 1920; hPx = (h / 100) * 1080;
        }

        // Ratio Display
        const gcd = (a, b) => b ? gcd(b, a % b) : a;
        const roundedW = Math.round(w * 100);
        const roundedH = Math.round(h * 100);
        const common = gcd(roundedW, roundedH);
        const rw = Math.round(roundedW / common);
        const rh = Math.round(roundedH / common);
        ratioDisplay.innerText = unit === 'percent' ? '—' : `${rw}:${rh}`;

        // Raw size RGB
        const bytes = wPx * hPx * 3;
        if (bytes > 1048576) {
          fileSizeDisplay.innerText = (bytes / 1048576).toFixed(2) + ' MB';
        } else {
          fileSizeDisplay.innerText = (bytes / 1024).toFixed(0) + ' KB';
        }
      } else {
        ratioDisplay.innerText = '—';
        fileSizeDisplay.innerText = '0 KB';
      }
    };

    widthInput.addEventListener('input', () => {
      const w = parseFloat(widthInput.value);
      if (isLocked && w > 0) {
        heightInput.value = (w / aspectRatio).toFixed(2).replace(/\.00$/, '');
      }
      updateCalculations();
      fitSelect.value = 'custom';
    });

    heightInput.addEventListener('input', () => {
      const h = parseFloat(heightInput.value);
      if (isLocked && h > 0) {
        widthInput.value = (h * aspectRatio).toFixed(2).replace(/\.00$/, '');
      }
      updateCalculations();
      fitSelect.value = 'custom';
    });

    unitSelect.addEventListener('change', () => {
      const unit = unitSelect.value;
      const resWrap = document.getElementById('res-field-wrap');
      if (unit === 'px' || unit === 'percent') {
        resWrap.style.opacity = '0.4';
        resWrap.style.pointerEvents = 'none';
      } else {
        resWrap.style.opacity = '1';
        resWrap.style.pointerEvents = 'auto';
      }
      updateCalculations();
    });

    resInput.addEventListener('input', updateCalculations);

    fitSelect.addEventListener('change', () => {
      const val = fitSelect.value;
      if (val === 'custom') return;

      const parts = val.split('x');
      const w = parseFloat(parts[0]);
      const h = parseFloat(parts[1]);
      
      if (val.includes('.')) {
        unitSelect.value = 'in';
      } else if (val === '210x297') {
        unitSelect.value = 'mm';
      } else {
        unitSelect.value = 'px';
      }

      widthInput.value = w;
      heightInput.value = h;

      if (isLocked) aspectRatio = w / h;
      
      unitSelect.dispatchEvent(new Event('change'));
      updateCalculations();
    });

    copyBtn.addEventListener('click', () => {
      const w = widthInput.value;
      const h = heightInput.value;
      const unit = unitSelect.value;
      const ratio = ratioDisplay.innerText;
      const text = `${w} × ${h} ${unit} (Ratio: ${ratio}, DPI: ${resInput.value})`;
      
      navigator.clipboard.writeText(text);
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = 'Specs Copied!';
      setTimeout(() => copyBtn.innerHTML = orig, 2000);
    });

    unitSelect.dispatchEvent(new Event('change'));
    updateCalculations();
  }
};

// ================================================================
// MODULE 9: DESIGN RESOURCES
// ================================================================
DOS.resources = {
  data: [],
  currentCat: 'all',

  async init() {
    const response = await fetch('../data/resource-index.json');
    this.data = (await response.json()).categories;
    this.renderCategoryTabs();
    this.render('all');
    document.getElementById('resource-search').addEventListener('input', (e) => this.search(e.target.value));
  },

  renderCategoryTabs() {
    const container = document.getElementById('resource-category-tabs');
    this.data.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-ghost btn-sm resource-cat-btn';
      btn.dataset.cat = cat.id;
      btn.textContent = `${cat.icon} ${cat.name}`;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.resource-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCat = cat.id;
        this.render(cat.id);
        document.getElementById('resource-search').value = '';
      });
      container.appendChild(btn);
    });

    // Add click to "All" button
    document.querySelector('[data-cat="all"]').addEventListener('click', () => {
      document.querySelectorAll('.resource-cat-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-cat="all"]').classList.add('active');
      this.currentCat = 'all';
      this.render('all');
    });
  },

  render(catId) {
    const el = document.getElementById('resources-list');
    const cats = catId === 'all' ? this.data : this.data.filter(c => c.id === catId);
    el.innerHTML = cats.map(cat => `
      <div class="resource-category">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="font-size:18px;">${cat.icon}</span>
          <span style="font-size:14px;font-weight:600;color:var(--text-primary);">${cat.name}</span>
          <span class="badge badge-accent" style="font-size:9px;margin-left:auto;">${cat.resources.length}</span>
        </div>
        <div class="resource-list">
          ${cat.resources.map(r => `
            <a class="resource-item" href="${r.url}" target="_blank" rel="noopener">
              <div style="width:36px;display:flex;justify-content:center;align-items:center;flex-shrink:0;color:var(--primary-500);"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
              <div style="flex:1;min-width:0;">
                <div class="resource-name">${r.name}</div>
                <div class="resource-desc">${r.description}</div>
                <div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;">
                  ${r.free ? '<span class="badge badge-success" style="font-size:9px;">Free</span>' : '<span class="badge badge-warning" style="font-size:9px;">Paid</span>'}
                  ${(r.tags || []).slice(0, 2).map(t => `<span class="badge badge-primary" style="font-size:9px;">${t}</span>`).join('')}
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  search(query) {
    if (!query) { this.render(this.currentCat); return; }
    const q = query.toLowerCase();
    const el = document.getElementById('resources-list');
    const cats = this.currentCat === 'all' ? this.data : this.data.filter(c => c.id === this.currentCat);
    const filtered = cats.map(cat => ({
      ...cat,
      resources: cat.resources.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.tags || []).some(t => t.includes(q))
      )
    })).filter(c => c.resources.length > 0);

    if (!filtered.length) {
      el.innerHTML = '<div class="vault-empty"><span class="vault-empty-icon"><svg viewBox="0 0 24 24" style="width:48px;height:48px;stroke:var(--text-tertiary);fill:none;stroke-width:2;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span><p class="text-xs text-muted">No resources found.</p></div>';
      return;
    }

    el.innerHTML = filtered.map(cat => `
      <div class="resource-category">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="font-size:18px;">${cat.icon}</span>
          <span style="font-size:14px;font-weight:600;color:var(--text-primary);">${cat.name}</span>
        </div>
        <div class="resource-list">
          ${cat.resources.map(r => `
            <a class="resource-item" href="${r.url}" target="_blank" rel="noopener">
              <div style="width:36px;display:flex;justify-content:center;align-items:center;flex-shrink:0;color:var(--primary-500);"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
              <div style="flex:1;min-width:0;">
                <div class="resource-name">${r.name}</div>
                <div class="resource-desc">${r.description}</div>
                <div style="margin-top:4px;">
                  ${r.free ? '<span class="badge badge-success" style="font-size:9px;">Free</span>' : '<span class="badge badge-warning" style="font-size:9px;">Paid</span>'}
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');
  }
};

// ================================================================
// REFRESH BUTTON
// ================================================================
document.getElementById('btn-refresh').addEventListener('click', async () => {
  const btn = document.getElementById('btn-refresh');
  btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;display:inline-block;vertical-align:middle;animation:spin 2s linear infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
  btn.disabled = true;
  setTimeout(() => { btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>'; btn.disabled = false; }, 1000);
  DOS.toast.info('Page data refreshed');
});

// ================================================================
// MODULE 10: TASKS MANAGER
// ================================================================
DOS.tasks = {
  todos: [],

  init() {
    document.getElementById('add-todo-btn').addEventListener('click', () => this.addTask());
    document.getElementById('todo-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });

    chrome.storage.local.get(['todoList'], (result) => {
      this.todos = result.todoList || [];
      this.render();
    });
  },

  addTask() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    if (!text) return;

    this.todos.push({
      id: Date.now(),
      text: text,
      completed: false
    });

    chrome.storage.local.set({ todoList: this.todos }, () => {
      input.value = '';
      this.render();
    });
  },

  toggleTask(id, completed) {
    this.todos = this.todos.map(t => t.id === id ? { ...t, completed } : t);
    chrome.storage.local.set({ todoList: this.todos }, () => this.render());
  },

  deleteTask(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    chrome.storage.local.set({ todoList: this.todos }, () => this.render());
  },

  render() {
    const el = document.getElementById('todo-list');
    if (!el) return;

    if (this.todos.length === 0) {
      el.innerHTML = '<p class="text-xs text-muted" style="text-align:center;padding:16px;">No tasks yet. Add one above!</p>';
      return;
    }

    el.innerHTML = this.todos.map((todo, idx) => `
      <div class="todo-item" draggable="true" data-index="${idx}">
        <span class="drag-handle">⋮⋮</span>
        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}" />
        <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
        <button class="todo-delete" data-id="${todo.id}">×</button>
      </div>
    `).join('');

    // Checkboxes
    el.querySelectorAll('.todo-checkbox').forEach(chk => {
      chk.addEventListener('change', () => {
        this.toggleTask(parseInt(chk.dataset.id), chk.checked);
      });
    });

    // Delete buttons
    el.querySelectorAll('.todo-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        this.deleteTask(parseInt(btn.dataset.id));
      });
    });

    // HTML5 Drag and Drop Reordering
    el.querySelectorAll('.todo-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', item.dataset.index);
        item.classList.add('dragging');
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        
        const newOrder = [...el.querySelectorAll('.todo-item')].map(i => {
          return this.todos[parseInt(i.dataset.index)];
        });
        this.todos = newOrder;
        chrome.storage.local.set({ todoList: newOrder });
        this.render();
      });
    });

    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      const draggingItem = el.querySelector('.todo-item.dragging');
      if (!draggingItem) return;

      const siblings = [...el.querySelectorAll('.todo-item:not(.dragging)')];
      const nextSibling = siblings.find(sibling => {
        const box = sibling.getBoundingClientRect();
        return e.clientY <= box.top + box.height / 2;
      });

      el.insertBefore(draggingItem, nextSibling);
    });
  }
};

// ================================================================
// INITIALIZE ALL MODULES
// ================================================================
async function init() {
  DOS.nav.init();
  DOS.settings.init();
  DOS.color.init();
  DOS.font.init();
  DOS.designSystem.init();
  DOS.vault.init();
  DOS.svg.init();
  DOS.annotation.init();
  DOS.tech.init();
  await DOS.social.init();
  await DOS.resources.init();
  DOS.tasks.init();

  console.log('[Designer OS] All modules initialized ✅');
}

init().catch(console.error);
