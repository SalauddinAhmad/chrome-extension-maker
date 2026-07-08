# Designer OS

Everything a designer needs inside the browser.
Open-source · Offline-first · Privacy-first · No subscription · No backend.

## Stack

- **Framework**: React 18 + TypeScript (strict)
- **Build**: Vite + `@crxjs/vite-plugin` (MV3)
- **Styling**: TailwindCSS + shadcn/ui + Lucide Icons
- **State**: Zustand
- **Storage**: Dexie (IndexedDB), local only
- **Animation**: Framer Motion
- **Target**: Chrome Extension Manifest V3 (popup + side panel + content scripts)

## Design System

- Font: Inter (400/500/600/700), JetBrains Mono for numbers/hex
- Spacing scale: 4 px
- Border radius: 12 px
- Popup width: **400 px**
- Side panel width: **320 px**
- Light + Dark mode (class-based)
- Inspired by: Linear · Raycast · Arc Browser

## Folder Structure

```
extension-designer-os/
├── manifest.json                 MV3 config
├── popup.html                    Popup entry (React)
├── sidepanel.html                Side panel entry (React)
├── vite.config.ts                CRX plugin + aliases
├── tailwind.config.ts
├── tsconfig.json
├── components.json               shadcn config
└── src/
    ├── background/               MV3 service worker
    ├── content/                  Injected content scripts
    ├── popup/                    Popup app (main.tsx + App.tsx)
    ├── sidepanel/                Side panel app
    ├── modules/                  Feature modules (self-contained)
    │   ├── dashboard/
    │   ├── color-studio/
    │   ├── typography-studio/
    │   ├── design-inspector/
    │   ├── inspiration-vault/
    │   ├── asset-extractor/
    │   ├── resource-hub/
    │   ├── notes/
    │   ├── tech-stack/
    │   └── screenshot/
    ├── components/               Cross-module UI
    │   ├── ui/                   shadcn primitives
    │   ├── layout/               Shells (popup/sidepanel)
    │   └── shared/               Reusable app widgets
    ├── hooks/                    React hooks
    ├── lib/                      Utilities (cn, chrome wrapper)
    ├── storage/                  Dexie schema + repositories
    ├── stores/                   Zustand stores
    ├── types/                    Domain types (one file per collection)
    └── styles/                   Global CSS + tokens
```

## Module Contract

Every module lives in `src/modules/<name>/` and exposes:

```
<name>/
├── index.tsx        Entry component (default export)
├── types.ts         Module-local types (extends /types/*)
├── store.ts         Zustand slice (optional)
├── logic/           Pure functions, no React
├── ui/              Presentational components
└── README.md        What this module does + status
```

## Development Order (Phased)

- **Phase 1** — Project setup · UI framework · Database layer · Dashboard  ← _current_
- **Phase 2** — Color Studio · Typography Studio
- **Phase 3** — Inspiration Vault · Notes Workspace
- **Phase 4** — Asset Extractor · Screenshot Studio
- **Phase 5** — Design Inspector · Tech Stack Detector
- **Phase 6** — Resource Hub

**Rule**: one module at a time — architecture → types → UI → logic → storage → tests → **stop for approval**.

## Getting Started

```bash
bun install                # or: npm install
bun run dev                # Vite dev server + CRX HMR
bun run build              # Production build to dist/
bun run zip                # Package dist/ into designer-os.zip
```

Load unpacked in `chrome://extensions` → Developer mode → **Load unpacked** → select `dist/`.

## Non-Functional Requirements

- Extension size < 15 MB · Startup < 1 s
- Zero tracking · zero analytics · zero background network
- Minimum permissions only (see `manifest.json`)

## License

MIT — see LICENSE.
