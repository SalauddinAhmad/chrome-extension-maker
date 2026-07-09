# Data Policy — Designer OS

Companion to `PRIVACY.md`. Describes **where data lives, how it moves, and
how it dies.**

## Storage locations

| Store | Backend | Contents | Cleared by |
|---|---|---|---|
| App DB | IndexedDB (`designer-os`) | Projects, colors, fonts, assets, notes, reports | Settings → Clear all data / uninstall |
| Settings | IndexedDB (`settings` table, `singleton` row) | Theme, favorites, checklist, onboarding | Settings → Clear all data / uninstall |
| Extension state | `chrome.storage.local` | Ephemeral UI state only | Uninstall |

## Data flows

```text
User action ──▶ Content script (activeTab)
                    │
                    ▼
              Repository layer ──▶ Dexie (IndexedDB, local only)
                    │
                    ▼
                 UI store
```

**No arrow leaves the browser.** There is no server tier, no sync worker, no
background upload.

## Retention

Data persists until the user deletes it or uninstalls the extension. There is
no automatic expiry.

## Export / portability

- **Backup**: `Settings → Export data` writes a JSON file containing every
  table plus `schemaVersion` and file `version`. The user controls the file.
- **Restore**: `Settings → Import data` validates the envelope
  (`validateBackup`) and rejects incompatible schemas.
- **Per-module exports**: Colors (CSS/SCSS/JSON/Tailwind), Typography
  (systems), Assets (bulk download), Reports (JSON) are written to the user's
  Downloads folder via `chrome.downloads`.

## Deletion

- **Cascade deletes** are enforced at the repository layer and covered by
  `src/storage/cascade.test.ts`. Removing a Project removes its Inspirations,
  Assets (+ blobs), Colors, Palettes, Fonts, Systems, Notes, Reports, Audits,
  and Accessibility reports in a single Dexie transaction.
- **Full wipe**: `Settings → Clear all data` truncates every table except
  `settings` (preserves onboarding state so the app is usable afterwards).
- **Uninstall**: Chrome removes the extension origin's IndexedDB and
  `chrome.storage.local` entries entirely.

## Verification

- No `fetch`, `XMLHttpRequest`, or WebSocket calls to external hosts exist in
  the source (grep the build output to confirm).
- `manifest.json` declares empty `host_permissions`.
- Content scripts run only via `chrome.scripting.executeScript` on user
  action, scoped to `activeTab`.
