# Changelog

All notable changes to Designer OS are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-07-09

**Initial public release.**

### Added
- **Projects** — Create/edit/delete projects with zod validation and cover images.
- **Inspiration Vault** — Save URLs, screenshots, and collections.
- **Asset Manager** — Extract images/SVGs from any page; upload local assets; bulk export; grid/list views.
- **Color Studio** — Picker, 7-role brand system generator, contrast checker, CSS/SCSS/JSON/Tailwind exports.
- **Typography Studio** — Font detector, modular scale builder, readability analyzer, system builder.
- **Design Inspector** — One-click Design DNA report (colors, fonts, components, layout, effects, assets).
- **Design Audit** — 0–100 Design Quality Score across 6 categories with severity-coded issues.
- **Accessibility Center** — WCAG 2.1 scanner with tagged issues.
- **Notes** — Project-scoped lightweight notes.
- **Backup & Restore** — Versioned JSON with `schemaVersion` validation.
- **Onboarding** — Welcome screen, Getting Started checklist, sample project seeder.
- **Dashboard** — Restructured hierarchy: Checklist → Active Project → Quick Actions → Recent Activity → Summaries.

### Infrastructure
- Manifest V3, Popup + Side Panel + Content Scripts.
- Dexie schema v8 with cascade deletes at the repository layer.
- Strict TypeScript, 0 type errors, 0 repository violations.
- Vitest suite covering cascades and backup versioning (23 tests).
- Onboarding chunk reduced from 598 KB → 7.22 KB via lazy loading + CSS animations.

### Privacy
- Zero telemetry, zero analytics, zero external tracking, zero cloud storage.
- Empty `host_permissions`; scripts run only via `activeTab` on explicit user action.
