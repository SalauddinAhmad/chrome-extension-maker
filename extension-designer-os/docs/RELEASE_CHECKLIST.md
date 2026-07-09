# Release Checklist — Designer OS v1.0.0

## Icons (required by Chrome Web Store)

Place in `extension-designer-os/icons/`:

- [ ] `icon16.png` — 16×16 — toolbar
- [ ] `icon32.png` — 32×32 — Windows taskbar
- [ ] `icon48.png` — 48×48 — extensions page
- [ ] `icon128.png` — 128×128 — Chrome Web Store listing

All referenced in `manifest.json` under `action.default_icon` and `icons`.

## Screenshots (Chrome Web Store, 1280×800 or 640×400)

Store in `extension-designer-os/docs/screenshots/`:

- [ ] `popup.png` — Popup home with active project
- [ ] `dashboard.png` — Dashboard: checklist + active project + quick actions
- [ ] `inspector.png` — Design Inspector Design DNA report
- [ ] `audit.png` — Design Audit score breakdown (A–F grade visible)
- [ ] `accessibility.png` — Accessibility Center report with WCAG issues

Minimum 1 screenshot required; 5 recommended for listing quality.

## Store listing copy

- **Name**: Designer OS
- **Short description (132 chars max)**: Everything a designer needs inside the browser. Inspection, audits, color & type systems. Offline-first. Privacy-first.
- **Category**: Developer Tools (secondary: Productivity)
- **Language**: English

## Store listing assets (optional but recommended)

- [ ] Small promo tile — 440×280
- [ ] Marquee promo tile — 1400×560

## Legal

- [x] `PRIVACY.md` in repo
- [x] `DATA_POLICY.md` in repo
- [x] `LICENSE` (MIT) in repo
- [ ] Privacy policy URL hosted (link from Chrome Web Store listing)
- [ ] Single-purpose description confirmed (design workspace for browsers)

## Packaging

```bash
bun install
bun run build
bun run zip   # → designer-os.zip
```

Upload `designer-os.zip` to the Chrome Web Store Developer Dashboard.
