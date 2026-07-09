# Designer OS

**Everything a designer needs inside the browser.**
Open-source · Offline-first · Privacy-first · No account · No subscription · No backend.

Designer OS is a Chrome extension that turns your browser into a designer's
workspace: capture inspiration, extract assets, analyze design systems, build
color and typography systems, and run accessibility & design audits — all
without sending a single byte off your machine.

---

## Product Overview

Designer OS is the open-source alternative to fragmented design tooling. It
lives in your browser (Popup + Side Panel), stores everything locally in
IndexedDB, and never phones home. One extension replaces a dozen tabs, plugins,
and SaaS subscriptions.

## Core Features

| Module | What it does |
|---|---|
| **Projects** | Group inspiration, colors, fonts, assets, and reports per client/product |
| **Inspiration Vault** | Save URLs, screenshots, and notes into visual collections |
| **Asset Manager** | Extract images/SVGs from any page; upload local assets; bulk export |
| **Color Studio** | Pick colors, build 7-role brand systems, export CSS/SCSS/JSON/Tailwind |
| **Typography Studio** | Detect fonts on any page, build modular type scales, export systems |
| **Design Inspector** | One-click Design DNA report for any site (colors, fonts, components, layout) |
| **Design Audit** | 0–100 Design Quality Score across 6 categories with actionable issues |
| **Accessibility Center** | WCAG 2.1 scanner with tagged issues and severity |
| **Notes** | Lightweight project-scoped notes |
| **Backup & Restore** | Versioned JSON export/import of the entire local database |

## Screenshots

Screenshots for the Chrome Web Store listing live in `docs/screenshots/`:

- `popup.png` — 1280×800 — Popup home
- `dashboard.png` — 1280×800 — Dashboard with checklist & active project
- `inspector.png` — 1280×800 — Design Inspector report
- `audit.png` — 1280×800 — Design Audit score breakdown
- `accessibility.png` — 1280×800 — Accessibility Center report

## Installation

### From source (unpacked)

```bash
bun install
bun run build
```

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select the `dist/` folder

Works in any Chromium browser: Chrome, Edge, Brave, Arc, Opera.

### Packaged ZIP

```bash
bun run build
bun run zip     # → designer-os.zip
```

## Development Setup

```bash
bun install
bun run dev          # Vite + CRX HMR
bun run typecheck    # tsc --noEmit
bun run test         # vitest
bun run lint
bun run build
```

Requirements: Bun ≥ 1.0 (or Node ≥ 20 + npm). Chrome/Chromium ≥ 116.

## Architecture

- **Framework**: React 18 + TypeScript (strict)
- **Build**: Vite + `@crxjs/vite-plugin` (Manifest V3)
- **Styling**: TailwindCSS + shadcn/ui + Lucide icons
- **State**: Zustand
- **Storage**: Dexie (IndexedDB) — schema v8, versioned migrations
- **Testing**: Vitest + fake-indexeddb + jsdom

Layered structure per module: `types → storage → repository → logic → store → ui → index`.
All DB access flows through repositories — components never touch Dexie directly.
See `implementation_plan.md` for the phased build history.

## Data Privacy

Designer OS is privacy-first by design:

- **No telemetry.** Zero analytics, zero crash reporting.
- **No external tracking.** No third-party scripts, no beacons.
- **No cloud storage.** All data lives in your browser's IndexedDB.
- **No account.** Nothing to sign up for.
- **Minimum permissions.** See `PRIVACY.md` for the full breakdown.

Full policy: [PRIVACY.md](./PRIVACY.md).

## Roadmap

Post-1.0 candidates (not committed):

- Figma / Framer export bridges
- Cross-device backup via user-provided WebDAV
- Firefox / Safari ports
- Team-shared read-only report links (opt-in, self-hosted)
- Additional WCAG 2.2 rules

## License

MIT — see [LICENSE](./LICENSE).
