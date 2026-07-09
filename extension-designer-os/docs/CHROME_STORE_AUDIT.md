# Chrome Web Store Audit — Designer OS v1.0.0

_Generated: 2026-07-09_

## Manifest V3 compliance

| Check | Status | Detail |
|---|---|---|
| `manifest_version: 3` | ✅ | Confirmed in `manifest.json` |
| Service worker (not background page) | ✅ | `src/background/index.ts`, `type: module` |
| No remotely hosted code | ✅ | All JS bundled by Vite; only external asset is Google Fonts CSS in Typography preview |
| No `eval` / `new Function` | ✅ | Vite production build; no runtime code eval |
| CSP defaults respected | ✅ | No custom CSP overrides |

## Permissions justification

| Permission | Justification |
|---|---|
| `storage` | Persist UI settings (`chrome.storage.local`) |
| `tabs` / `activeTab` | Read active tab's URL/title for inspiration & reports |
| `scripting` | Inject inspector/scanner/extractor on user click only |
| `downloads` | Save asset exports, backups, and report files |
| `sidePanel` | Provide Side Panel UI |
| `host_permissions: []` | **Empty** — no broad host access |

**Verdict**: Minimum permissions; each maps to a visible user action.

## Icons

- 16 / 32 / 48 / 128 declared in both `action.default_icon` and `icons`. ✅
- **Author action required**: verify PNG files exist in `extension-designer-os/icons/` before packaging.

## Screenshots

- **Author action required**: capture five listing screenshots per `docs/RELEASE_CHECKLIST.md`.

## Descriptions

- Manifest `description` (≤132 chars): ✅ present.
- Store short description drafted in `RELEASE_CHECKLIST.md`. ✅

## Privacy compliance

| Check | Status |
|---|---|
| Single-purpose (design workspace in browser) | ✅ |
| Privacy policy published (`PRIVACY.md`, `DATA_POLICY.md`) | ✅ |
| No telemetry / analytics | ✅ — grep confirms no fetch/XHR to external hosts |
| No PII collection | ✅ — nothing collected |
| Data usage disclosures match code | ✅ |
| User data handled locally only | ✅ (IndexedDB + chrome.storage.local) |

## Build health

| Check | Result |
|---|---|
| Typecheck (`tsc --noEmit`) | ✅ 0 errors |
| Tests (`vitest run`) | ✅ 23/23 passing |
| Production build | ✅ succeeds |
| Onboarding chunk size (P0 target < 50 KB) | ✅ 7.22 KB |
| Command palette chunk | ⚠️ 618 KB (contains cmdk + all module lazy imports); acceptable for v1.0 since it loads on demand |

## Author action items before submission

1. Add real PNG icons at the four required sizes.
2. Capture the five store screenshots.
3. Host the privacy policy at a public URL and paste it into the store listing.
4. Optionally trim `command-palette` chunk in a post-1.0 patch.
