# Designer OS — Phased Rebuild Plan

The current extension already has most modules scaffolded (Color, Typography, Inspiration, Notes, Asset, Screenshot, Design Inspector, Tech Stack, Resource Hub, Settings). It launches as a tool grid, not as a **workspace**. We will transform it into a proper Designer OS following the 6-phase order you specified — **starting with Phase 1 only**, then stopping for approval before moving on.

---

## Scope of this step: Phase 1 only

**Phase 1 — Dashboard, Navigation, Project System**

Nothing from Phase 2–6 will be touched in this step. Existing modules keep working exactly as they are; we only reframe the shell around them.

---

## What Phase 1 delivers

### 1. New Information Architecture (sidebar navigation)

Replace the flat module list with a grouped sidebar shell (inspired by Linear / Raycast):

```text
DASHBOARD
  Home

WORKSPACE
  Projects
  Recent Activity
  Collections

TOOLS
  Color Studio
  Typography Studio
  Design Inspector
  Screenshot Studio

LIBRARY
  Inspiration Vault
  Asset Manager
  Notes Workspace
  Resource Hub

UTILITIES
  Tech Stack Detector
  Settings
```

- Works in both **popup** and **sidepanel** shells.
- Popup uses a collapsed icon rail; sidepanel uses full labeled sidebar.
- Command palette (already present) gets updated with the new grouping.

### 2. Redesigned Dashboard

Replace the current dashboard with a real workspace overview:

- **Workspace Overview** — counts for Inspirations, Assets, Colors, Fonts, Notes, Projects (live from Dexie).
- **Quick Actions** — Pick Color, Scan Fonts, Capture Screenshot, Analyze Website, Extract Assets, Detect Tech Stack.
- **Recent Activity** — unified feed of last 10 saves across colors/fonts/inspirations/assets/screenshots/notes (derived from `createdAt`/`updatedAt` across existing tables — no new table needed).
- **Recent Projects** — 3–6 project cards with accent color + item counts.
- **Collections Overview** — preset collections (Landing Pages, Dashboards, Branding, Ecommerce, Mobile Apps, Islamic Design) as clickable cards that filter Inspiration Vault.

### 3. Projects System (new)

The `Project` type + `projects` Dexie table already exist. Phase 1 adds the full UX layer:

- **Projects list page** — grid of project cards (name, client, accent color, item counts, archived toggle).
- **New / Edit project** dialog (name, client, description, accent color, archive).
- **Project detail page** with tabs: Inspirations · Colors · Fonts · Assets · Notes — each tab filters existing repos by `projectId`.
- **Active project context** (Zustand) — when a project is active, quick-action saves auto-tag `projectId` so new colors/fonts/inspirations/notes attach to it.
- Add `projectId` field to `StoredColor` and `StoredFont` (Dexie schema bump v1 → v2, additive only; existing rows untouched).

### 4. UX polish for the shell

- Inter font, 12px radius, 4px spacing scale — enforce via existing tokens in `globals.css`.
- Light/Dark already wired via `use-theme`; verify parity in new shell.
- Framer Motion micro-transitions on route/module switch and dashboard cards.

---

## Technical details

**Files to add**
- `src/components/layout/app-shell.tsx` — new grouped sidebar + top bar (used by both popup + sidepanel shells).
- `src/components/layout/nav-groups.ts` — IA config (groups → module ids).
- `src/modules/projects/` — `index.tsx` (list), `detail.tsx` (tabs), `store.ts`, `ui/project-card.tsx`, `ui/project-dialog.tsx`, `logic/activity.ts` (unified recent activity feed).
- `src/stores/project-store.ts` — active project id + setter, persisted to settings.

**Files to change**
- `src/lib/modules.ts` — add `projects` module id, group metadata.
- `src/modules/dashboard/index.tsx` — rewrite around Workspace Overview / Quick Actions / Recent Activity / Recent Projects / Collections.
- `src/components/layout/popup-shell.tsx` + `sidepanel-shell.tsx` — mount new `AppShell`.
- `src/components/shared/active-module.tsx` — register projects module + detail view.
- `src/storage/db.ts` — version(2) with `projectId` index on `colors` and `fonts` (additive).
- `src/storage/repositories.ts` — `projectsRepo` list/create/update/archive + `attachToProject` helpers.
- `src/types/color.ts`, `src/types/font.ts` — optional `projectId?: string`.
- `src/components/shared/command-palette.tsx` — new grouped entries + "Switch project" action.

**Non-goals for Phase 1 (explicit)**
- No changes to Color Studio internals, Typography detection, Inspector, Vault, Notes, Asset, Screenshot, Tech Stack, Resource Hub logic.
- No new storage backends. No cloud sync. Still offline-first, local-only.
- No new dependencies beyond what's installed (React, Zustand, Dexie, shadcn, lucide, framer-motion).

---

## Build + package

After Phase 1 lands:
1. `cd extension-designer-os && bunx vite build`
2. Copy `dist/*` → `public/designer-os-preview/` and rewrite `/assets/` paths (same script as before) so the live iframe preview reflects the new shell.
3. Repackage `public/designer-os.zip` from `dist/`.

---

## After approval

I will stop after Phase 1 and wait. Next phases in your specified order:
- Phase 2 — Color Studio + Typography Studio upgrades
- Phase 3 — Inspiration Vault + Notes Workspace
- Phase 4 — Asset Manager + Screenshot Studio
- Phase 5 — Design Inspector + Tech Stack Detector
- Phase 6 — Resource Hub

Reply **approve** to start Phase 1, or tell me what to adjust in the IA / dashboard sections first.
