# Color Studio

**Phase 2 · Ready**

Everything a designer needs to grab, save, and reuse colors — locally, in one place.

## Surface

- **Picker** — EyeDropper API (native), system color input, or manual hex entry. Live preview with nearest CSS name, HEX/RGB/HSL copy chips, and WCAG contrast ratio on white and black.
- **Saved** — grid of every saved color from IndexedDB. Click to load into picker. Copy hex or delete on hover.
- **Gradient** — 2-stop linear generator with angle slider and one-click CSS copy.

## Files

```
color-studio/
├── index.tsx                Entry — tabs + shell
├── types.ts                 StudioTab · GradientStop · NewColorInput
├── store.ts                 Zustand (tab, currentHex, pick/save)
├── logic/
│   ├── convert.ts           hex ↔ rgb ↔ hsl (+ formatters)
│   ├── contrast.ts          WCAG luminance + grade
│   ├── name.ts              nearestName(rgb)
│   ├── convert.test.ts      vitest — round-trip + edge cases
│   └── contrast.test.ts     vitest — luminance + WCAG thresholds
└── ui/
    ├── color-picker.tsx     EyeDropper + hex input + system picker
    ├── color-preview.tsx    swatch + copy chips + contrast card
    ├── saved-colors.tsx     live grid from Dexie
    ├── gradient-lab.tsx     2-stop linear + CSS export
    └── copy-chip.tsx        shared clipboard chip
```

## Storage

Persists via `colorsRepo` → Dexie `colors` table. Zero network calls. Data stays on device.

## Tests

Pure-logic tests only (color math). Run with:

```bash
bun run test
```

UI is intentionally test-free until vitest + happy-dom + testing-library are wired for the extension.
