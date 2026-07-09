# Privacy Policy — Designer OS

_Last updated: 2026-07-09_

Designer OS is designed around a single principle: **your data never leaves
your browser.**

## What we collect

**Nothing.** Designer OS has no servers, no analytics, no telemetry, no crash
reporting, and no third-party trackers. We cannot see your data because there
is nowhere for it to go.

## What Designer OS stores locally

All application data lives in your browser's IndexedDB under the Designer OS
extension origin:

- Projects, notes, inspiration items
- Colors, palettes, fonts, typography systems
- Assets (images/SVGs) and their binary blobs
- Design reports, audit reports, accessibility reports
- User preferences (theme, checklist progress, favorites)

You can export everything to a JSON file at any time (**Settings → Backup**),
and delete everything at any time (**Settings → Clear all data**) or by
removing the extension.

## Chrome permissions — why each is required

| Permission | Why |
|---|---|
| `storage` | Persist settings via `chrome.storage.local` |
| `tabs` / `activeTab` | Read the current tab's URL/title to attach inspiration and reports to the right page |
| `scripting` | Inject the Design Inspector, Font Detector, Asset Extractor, and Accessibility Scanner into the active tab **only when you click the button** |
| `downloads` | Save exports (assets, backups, reports) to your Downloads folder |
| `sidePanel` | Show the Side Panel UI |

`host_permissions` is empty. Scripts run only via `activeTab` on explicit user
action.

## Network access

Designer OS makes **no outbound network requests** from the extension itself.
The only external assets are Google Fonts stylesheets loaded on demand inside
the Typography Studio preview; this happens in your browser directly and is
governed by Google's policies. Disable this by keeping the Typography preview
closed if you prefer zero external requests.

## Third parties

None. There is no SDK, no ad network, no A/B testing service, and no error
reporter embedded in the build.

## Children's privacy

Designer OS does not collect any personal data from any user, including
children.

## Changes to this policy

Any change to the data model or permissions will be reflected here and in the
`CHANGELOG.md` for the release that introduces it.

## Contact

Open an issue on the project's GitHub repository.
