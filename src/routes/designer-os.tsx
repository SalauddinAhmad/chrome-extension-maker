import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/designer-os")({
  head: () => ({
    meta: [
      { title: "Designer OS — The Open-Source Creative Workspace" },
      {
        name: "description",
        content:
          "Everything a designer needs, inside the browser. Inspiration vault, color & typography systems, design inspector, WCAG audit — 100% local, no account, no tracking.",
      },
      { property: "og:title", content: "Designer OS — Creative Workspace for Designers" },
      {
        property: "og:description",
        content:
          "Open-source Chromium extension. 10 designer-grade modules. Offline-first. Privacy-first. MIT.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DesignerOSLanding,
});

// Matches the extension's own modules registry (src/lib/modules.ts)
const modules = [
  {
    group: "Organize",
    title: "Projects",
    body: "Group inspiration, colors, fonts, assets and reports per client or product.",
    icon: "▦",
  },
  {
    group: "Capture",
    title: "Inspiration Vault",
    body: "Save URLs, screenshots and notes into visual, per-project collections.",
    icon: "✦",
  },
  {
    group: "Capture",
    title: "Asset Manager",
    body: "Extract images and SVGs from any live page. Upload local assets. Bulk export.",
    icon: "◈",
  },
  {
    group: "Systems",
    title: "Color Studio",
    body: "Pick colors, build a 7-role brand system, export to CSS, SCSS, JSON or Tailwind.",
    icon: "◐",
  },
  {
    group: "Systems",
    title: "Typography Studio",
    body: "Detect fonts on any page, build modular type scales, export full systems.",
    icon: "Aa",
  },
  {
    group: "Analyze",
    title: "Design Inspector",
    body: "One-click Design DNA report — colors, fonts, components, layout — for any site.",
    icon: "◊",
  },
  {
    group: "Analyze",
    title: "Design Audit",
    body: "0–100 Design Quality Score across 6 categories with actionable issues.",
    icon: "★",
  },
  {
    group: "Compliance",
    title: "Accessibility Center",
    body: "WCAG 2.1 scanner. Tagged issues, severity levels, remediation hints.",
    icon: "◉",
  },
  {
    group: "Workspace",
    title: "Notes",
    body: "Lightweight, project-scoped notes with markdown-friendly editing.",
    icon: "✎",
  },
  {
    group: "Workspace",
    title: "Backup & Restore",
    body: "Versioned JSON export/import of the entire local database. You own the data.",
    icon: "↺",
  },
];

const steps = [
  "Click ⬇ Download .zip below.",
  "Unzip designer-os.zip anywhere.",
  "Open chrome://extensions in your browser.",
  "Enable Developer mode (top right).",
  "Click Load unpacked → select the unzipped folder.",
  "Pin the icon, or right-click → Open side panel.",
];

const privacy = [
  "Zero telemetry, zero crash reporting",
  "No third-party scripts or beacons",
  "All data lives in local IndexedDB",
  "Versioned JSON backup / restore",
  "Minimum Chrome permissions",
  "MIT licensed — audit the source",
];

function DesignerOSLanding() {
  const [downloading, setDownloading] = useState(false);

  const download = () => {
    setDownloading(true);
    fetch("/designer-os.zip")
      .then((res) => {
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "designer-os.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => alert(err.message))
      .finally(() => setDownloading(false));
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-neutral-900">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-[#fafaf9]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <span className="text-sm font-semibold tracking-tight">D</span>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Designer OS</div>
              <div className="text-[11px] text-neutral-500">v1.0.0 · open source</div>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-neutral-600 md:flex">
            <a href="#modules" className="hover:text-neutral-900">Modules</a>
            <a href="#preview" className="hover:text-neutral-900">Preview</a>
            <a href="#install" className="hover:text-neutral-900">Install</a>
            <a href="#privacy" className="hover:text-neutral-900">Privacy</a>
            <a
              href="https://github.com/SalauddinAhmad/Designer-OS"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-900"
            >
              GitHub ↗
            </a>
          </nav>
          <button
            onClick={download}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
          >
            {downloading ? "Preparing…" : "⬇ Download"}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% -10%, rgba(99,102,241,0.14), transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pt-16 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              v1.0.0 · MIT · Chromium extension
            </div>
            <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-neutral-900 lg:text-6xl">
              The designer's{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
                operating system
              </span>{" "}
              — inside your browser.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600 lg:text-lg">
              Ten designer-grade modules. Zero accounts. Zero tracking. Everything stored
              locally in IndexedDB. Replace a dozen tabs and SaaS subscriptions with one
              open-source extension.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={download}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(23,23,23,0.4)] transition hover:bg-neutral-800 disabled:opacity-60"
              >
                {downloading ? "Preparing…" : "⬇ Download .zip"}
                <span className="text-[11px] text-neutral-400">v1.0.0</span>
              </button>
              <a
                href="#preview"
                className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-300"
              >
                See live preview →
              </a>
            </div>
            <p className="mt-4 text-xs text-neutral-500">
              Works on Chrome, Edge, Brave, Arc, Opera — any Chromium browser ≥ 116.
            </p>
          </div>

          {/* Browser mockup */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[2rem]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(217,70,239,0.08))",
                filter: "blur(20px)",
              }}
            />
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                <span className="ml-3 text-[10px] text-neutral-500">
                  Designer OS — side panel
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] bg-white">
                <aside className="border-r border-neutral-200 bg-neutral-50/60 p-3 text-[11px]">
                  {[
                    ["▦", "Projects"],
                    ["✦", "Inspiration"],
                    ["◈", "Assets"],
                    ["◐", "Colors"],
                    ["Aa", "Type"],
                    ["◊", "Inspector"],
                    ["★", "Audit"],
                    ["◉", "A11y"],
                    ["✎", "Notes"],
                  ].map(([icon, label], i) => (
                    <div
                      key={label}
                      className={`mb-0.5 flex items-center gap-2 rounded-md px-2 py-1.5 ${
                        i === 3 ? "bg-indigo-600/10 text-indigo-700" : "text-neutral-600"
                      }`}
                    >
                      <span className="w-4 text-center text-xs">{icon}</span>
                      {label}
                    </div>
                  ))}
                </aside>
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-xs font-semibold">Color Studio</div>
                    <div className="text-[10px] text-neutral-500">7-role system</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      "#4F46E5",
                      "#818CF8",
                      "#0EA5E9",
                      "#F59E0B",
                      "#10B981",
                      "#EF4444",
                      "#0F172A",
                      "#F8FAFC",
                    ].map((c) => (
                      <div key={c}>
                        <div
                          className="h-14 rounded-lg border border-neutral-200"
                          style={{ background: c }}
                        />
                        <div className="mt-1 text-[9px] font-mono text-neutral-500">{c}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-2 text-[10px] font-mono text-neutral-600">
                    <div>--color-primary: #4F46E5;</div>
                    <div>--color-accent: #F59E0B;</div>
                    <div className="text-neutral-400">/* + 5 more roles */</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 sm:grid-cols-4">
            {[
              ["10", "Modules"],
              ["0", "Trackers"],
              ["0", "Servers"],
              ["MIT", "License"],
            ].map(([n, l]) => (
              <div key={l} className="bg-white p-5">
                <div className="text-2xl font-semibold tracking-tight">{n}</div>
                <div className="text-xs text-neutral-500">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="border-t border-neutral-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 text-xs tracking-[0.2em] text-indigo-600 uppercase">
              What's inside
            </div>
            <h2 className="text-3xl leading-tight font-semibold tracking-tight lg:text-4xl">
              Ten modules. One workspace.
            </h2>
            <p className="mt-3 text-base text-neutral-600">
              Every tool a working designer reaches for — capture, systems, analysis and
              compliance — unified under one project model.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <div
                key={m.title}
                className="group bg-white p-6 transition hover:bg-neutral-50"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-600/10 text-sm text-indigo-700">
                    {m.icon}
                  </div>
                  <div className="text-[10px] tracking-[0.15em] text-neutral-500 uppercase">
                    {m.group}
                  </div>
                </div>
                <h3 className="mb-1.5 text-base font-semibold">{m.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview */}
      <section id="preview" className="border-t border-neutral-200 bg-neutral-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-2xl">
            <div className="mb-3 text-xs tracking-[0.2em] text-indigo-600 uppercase">
              Live preview
            </div>
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              Try the sidepanel in your browser.
            </h2>
            <p className="mt-3 text-base text-neutral-600">
              A rendered preview of the actual extension UI runs at{" "}
              <Link to="/extensions/designer-os" className="text-indigo-600 hover:underline">
                /extensions/designer-os
              </Link>{" "}
              — switch between Popup and Side panel modes.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { t: "Popup", d: "Quick access from the toolbar. 400×600 compact UI." },
              { t: "Side panel", d: "Full-height workspace docked next to any page." },
              { t: "Content probes", d: "Extract fonts, colors and assets from the live tab." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="mb-2 text-[10px] tracking-[0.15em] text-neutral-500 uppercase">
                  Surface
                </div>
                <div className="text-lg font-semibold">{c.t}</div>
                <p className="mt-2 text-sm text-neutral-600">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="border-t border-neutral-200 bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-3 text-xs tracking-[0.2em] text-emerald-600 uppercase">
              Privacy by design
            </div>
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              Your data never leaves your machine.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-neutral-600">
              Designer OS stores everything in your browser's IndexedDB. No telemetry,
              no analytics, no cloud sync, no accounts — ever. Verified in the source.
            </p>
          </div>
          <ul className="space-y-2.5 text-sm">
            {privacy.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3"
              >
                <span className="mt-1 grid h-4 w-4 flex-none place-items-center rounded-full bg-emerald-500 text-[10px] text-white">
                  ✓
                </span>
                <span className="text-neutral-800">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Install */}
      <section id="install" className="border-t border-neutral-200 bg-neutral-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-3 text-xs tracking-[0.2em] text-indigo-600 uppercase">
            Install guide
          </div>
          <h2 className="mb-10 text-3xl font-semibold tracking-tight lg:text-4xl">
            Up and running in 60 seconds.
          </h2>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-neutral-900 text-sm font-medium text-white">
                  {i + 1}
                </div>
                <p className="pt-1.5 text-sm text-neutral-800">{s}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button
              onClick={download}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(23,23,23,0.4)] transition hover:bg-neutral-800 disabled:opacity-60"
            >
              {downloading ? "Preparing…" : "⬇ Download designer-os.zip"}
            </button>
            <a
              href="https://github.com/SalauddinAhmad/Designer-OS"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-800 transition hover:border-neutral-300"
            >
              View on GitHub
            </a>
          </div>
          <p className="mt-4 text-center text-xs text-neutral-500">
            Chrome Web Store listing coming soon.
          </p>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white py-8 text-center text-xs text-neutral-500">
        Designer OS v1.0.0 · MIT · Built for designers, by designers.
      </footer>
    </div>
  );
}
