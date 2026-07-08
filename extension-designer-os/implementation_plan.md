# Designer OS — Chrome Extension Implementation Plan

> **"Everything a designer needs inside the browser. No account. No subscription. No server. No tracking."**

---

## Overview

A premium, 100% local-first Chrome Extension that acts as a designer's browser-based operating system. All processing happens in the browser using DOM analysis, Canvas API, and open-source libraries — zero backend, zero API cost, zero privacy risk.

---

## User Review Required

> [!IMPORTANT]
> **Phase 1 MVP Scope** — This plan focuses on **Phase 1** only: the 7 core modules that form the foundation. Phase 2 (Accessibility Audit, Asset Manager, Browser Workspace) and Phase 3 (AI integration, Figma Export) will follow after Phase 1 ships.

> [!WARNING]
> **AI Features** — AI-powered features (screenshot→editable UI, smart tagging, inspiration engine) require either WebAssembly local models or user-provided API keys. These are Phase 3 features. Phase 1 will use **rule-based intelligence** instead (no AI cost).

> [!NOTE]
> **Optional AI** — When AI is added in Phase 3, the user provides their own key (Gemini API, OpenRouter, or local LLM). We never pay for API calls.

---

## Open Questions

> [!IMPORTANT]
> 1. **Extension UI Pattern** — Should the primary UI be a **side panel** (Chrome's native SidePanel API, always visible alongside pages) or a **popup** (clicks the extension icon)? Side panel feels more "OS-like" but requires Chrome 114+.
> 2. **Keyboard Shortcut** — Should there be a global keyboard shortcut to toggle the panel (e.g., `Alt+D`)?
> 3. **Design Theme** — Dark-only, or light/dark toggle? The mockup below will use a premium dark glassmorphism theme.
> 4. **Extension Name on Store** — "Designer OS" is confirmed? Or one of the alternatives (Creative OS, PixelPilot, etc.)?

---

## Architecture

```
Designer OS Chrome Extension
├── manifest.json          (MV3, SidePanel + content scripts)
├── sidepanel/             (Main UI - React-free, Vanilla JS)
│   ├── index.html
│   ├── app.js             (Router, module loader)
│   └── styles/
├── content/               (Injected into every page)
│   ├── design-extractor.js
│   ├── font-detector.js
│   ├── tech-detector.js
│   └── inspector.js
├── background/
│   └── service-worker.js  (Message routing, screenshot API)
├── modules/               (Each module is self-contained)
│   ├── color-toolkit/
│   ├── font-toolkit/
│   ├── design-system/
│   ├── inspiration-vault/
│   ├── svg-toolkit/
│   ├── screenshot-tool/
│   └── tech-analyzer/
├── libs/                  (Open-source, bundled locally)
│   ├── svgo.min.js        (SVG optimization)
│   ├── colorjs.min.js     (Color manipulation)
│   └── chroma.min.js      (Color scales/palettes)
└── data/
    ├── social-sizes.json
    ├── resource-index.json
    └── color-names.json   (10,000+ named colors)
```

**Storage Strategy:**
| Data Type | Storage |
|---|---|
| User settings | `chrome.storage.sync` |
| Saved colors, fonts | `chrome.storage.local` |
| Inspiration vault (images) | IndexedDB |
| Bookmarks, notes | `chrome.storage.local` |
| Temp session data | `sessionStorage` |

---

## Phase 1 — MVP Modules

### Module 1 — Color Toolkit (Advanced)
**Far beyond ColorZilla.**

- 🎯 **Eyedropper** — Native browser EyeDropper API
- 🎨 **Gradient Generator** — Linear/radial/conic + CSS export
- 🔍 **Contrast Checker** — WCAG AA/AAA live check
- 🎭 **Palette Generator** — Complementary, triadic, analogous, split-complementary, monochromatic
- 🏷️ **Smart Color Naming** — Algorithm maps any hex to nearest named color (10,000+ database)
- 🖌️ **Brand Palette Builder** — Build & save named palettes
- 📋 **Copy formats** — HEX, RGB, HSL, HSB, OKLCH, Tailwind, CSS var
- 💾 **History** — Last 50 picked colors, saved locally

---

### Module 2 — Font Toolkit
**Detect every font on any page.**

- 🔍 **Font Inspector** — Click any element → see font family, weight, size, line-height, letter-spacing
- 📋 **Copy CSS** — `font-family: 'Inter', sans-serif; font-weight: 600;`
- 📋 **Copy Tailwind** — `font-inter font-semibold`
- 📦 **All Fonts on Page** — List every unique font loaded on the page
- 🔗 **Google Fonts Link** — Auto-generate `<link>` tag for detected Google Fonts
- 💾 **Save Font** — Add to local font library

---

### Module 3 — Design System Extractor
**The killer feature. Full design system in one click.**

- 🎨 **Color Palette** — Every unique color used (grouped by usage frequency)
- 🔤 **Typography Scale** — Every unique font/size/weight combination
- 📐 **Spacing System** — Detect spacing increments (e.g., 8px grid)
- 🔲 **Border Radius Scale** — All border-radius values used
- 🌑 **Shadow System** — All box-shadows
- 🖱️ **Interactive Components** — Detect buttons, inputs, cards, modals
- 📊 **Grid/Layout** — Container widths, column systems
- 📤 **Export** — JSON, CSS Variables, Tailwind config

---

### Module 4 — Inspiration Vault
**Local Pinterest for designers.**

- 📸 **Save Screenshot** — One-click save current page/selection
- 🏷️ **Smart Auto-Tags** — Rule-based: detect SaaS, landing page, hero, pricing, dashboard, etc.
- 📁 **Collections** — Folders/boards (all local)
- 🔍 **Search** — Full-text search across notes and tags
- 📝 **Notes** — Add annotations to saved inspiration
- 🖼️ **Gallery View** — Masonry grid display
- 📤 **Export** — ZIP with screenshots + metadata JSON

---

### Module 5 — SVG Toolkit
**Full SVG workbench in the browser.**

- 📥 **Grab SVGs** — Detect and list all SVGs on the current page
- 👁️ **Preview** — Render SVG at any size
- ⚡ **Optimize** — SVGO-powered minification (bundled, no API)
- 📐 **Resize** — Change viewBox/dimensions
- 📤 **Export SVG** — Clean, optimized file
- 📤 **Export PNG** — Canvas-based conversion at any resolution
- 🎨 **Color Replace** — Find/replace colors in SVG code

---

### Module 6 — Screenshot & Annotation
**Capture → Annotate → Export.**

- 📸 **Full Page Screenshot** — Chrome's `captureVisibleTab` API
- ✏️ **Drawing Tools** — Pen, arrow, rectangle, circle, text
- 🎨 **Color & Size** — Tool color and stroke size
- 📝 **Text Annotations** — Add text boxes
- 🔢 **Numbered Markers** — For feedback/review workflows
- ✂️ **Crop** — Select area before export
- 📤 **Export PNG/JPG** — Canvas-based

---

### Module 7 — Tech Stack Detector
**Full competitor research tool.**

- ⚛️ **JS Framework** — React, Vue, Angular, Svelte, Next.js, Nuxt, SvelteKit
- 🎨 **CSS Framework** — Tailwind, Bootstrap, Bulma, Material UI
- 🏗️ **CMS/Platform** — WordPress, Shopify, Webflow, Wix, Framer, Squarespace, Ghost
- 📊 **Analytics** — GA4, Plausible, Mixpanel, Hotjar, Segment
- 💸 **Ad Pixels** — Facebook, TikTok, Google Ads, LinkedIn
- 🌐 **CDN** — Cloudflare, Fastly, CloudFront
- 🔧 **Other** — Intercom, Crisp, HubSpot, Stripe, Paddle

---

## Proposed File Structure

### Root Files

#### [NEW] manifest.json
MV3 manifest with `sidePanel`, `tabs`, `storage`, `scripting`, `activeTab` permissions. Content scripts for design extraction.

#### [NEW] background/service-worker.js
Message bus between content scripts and side panel. Handles screenshot capture via `chrome.tabs.captureVisibleTab`.

---

### Side Panel UI

#### [NEW] sidepanel/index.html
The main OS shell. Navigation sidebar + module content area. Dark glassmorphism theme. No external CSS frameworks.

#### [NEW] sidepanel/app.js
Module router, state management (no React — vanilla JS with custom component system for MV3 compatibility and zero bundle size).

#### [NEW] sidepanel/styles/main.css
Full design system: CSS variables, glassmorphism cards, animations, dark theme.

---

### Modules (7 for Phase 1)

#### [NEW] modules/color-toolkit/ (index.html, app.js, styles.css)
#### [NEW] modules/font-toolkit/ (index.html, app.js, styles.css)
#### [NEW] modules/design-system/ (index.html, app.js, styles.css)
#### [NEW] modules/inspiration-vault/ (index.html, app.js, styles.css)
#### [NEW] modules/svg-toolkit/ (index.html, app.js, styles.css)
#### [NEW] modules/screenshot-tool/ (index.html, app.js, styles.css)
#### [NEW] modules/tech-analyzer/ (index.html, app.js, styles.css)

---

### Content Scripts

#### [NEW] content/design-extractor.js
Runs on every page. Extracts complete design system: colors, fonts, spacing, components. Communicates via `chrome.runtime.sendMessage`.

#### [NEW] content/font-detector.js
Element-level font inspector. Injects click listener when Font Toolkit is active.

#### [NEW] content/tech-detector.js
Reads `window` globals, `<meta>` tags, script sources, cookies to fingerprint tech stack.

---

### Data Files

#### [NEW] data/color-names.json
10,000+ color names mapped to hex values for smart color naming.

#### [NEW] data/social-sizes.json
All social media canvas sizes for every platform.

#### [NEW] data/resource-index.json
Curated design resources (icons, fonts, illustrations, mockups) — searchable offline.

---

## Tech Stack (Zero External Dependencies at Runtime)

| Purpose | Solution |
|---|---|
| UI Framework | Vanilla JS + Web Components |
| Color math | Bundled `chroma.js` (local) |
| SVG optimization | Bundled SVGO core (local) |
| Image conversion | HTML5 Canvas API |
| Eyedropper | Native EyeDropper API |
| Screenshot | `chrome.tabs.captureVisibleTab` |
| Storage | IndexedDB + chrome.storage |
| Fonts detection | `document.fonts` API + CSS computed styles |

---

## Verification Plan

### Manual Testing Checklist
- [ ] Load unpacked extension in Chrome → Side panel opens
- [ ] Color Toolkit: Eyedropper picks color from any page, copies HEX/RGB/HSL/Tailwind
- [ ] Font Toolkit: Click any text element → correct font data shown
- [ ] Design System Extractor: Run on stripe.com → extracts full color + typography system
- [ ] Inspiration Vault: Save screenshot → appears in gallery → searchable
- [ ] SVG Toolkit: Visit icons8.com → list all SVGs → export PNG
- [ ] Screenshot Tool: Capture + annotate + export PNG
- [ ] Tech Analyzer: Visit vercel.com → detects Next.js, Cloudflare, etc.

### Automated
- No build step required (pure HTML/CSS/JS, MV3 compatible)
- Chrome Extension Developer Mode → Load Unpacked → verify no errors in console

---

## Phased Roadmap

| Phase | Features | Status |
|---|---|---|
| **Phase 1 (Now)** | Color, Font, Design System, Inspiration Vault, SVG, Screenshot, Tech Analyzer | 🔨 Building |
| **Phase 2** | Accessibility Audit, Design Audit, Asset Manager, Browser Workspace, Social Media Center | 📋 Planned |
| **Phase 3** | User-provided AI key (Gemini/OpenRouter), Figma Export, Brand Generator, Client Handover | 📋 Planned |
