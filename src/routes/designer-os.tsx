import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/designer-os")({
  head: () => ({
    meta: [
      { title: "Designer OS — The Open-Source Creative Workspace" },
      {
        name: "description",
        content:
          "Everything a designer needs, inside the browser. Capture inspiration, extract assets, build color & typography systems, audit accessibility — 100% local, no account, no tracking.",
      },
      { property: "og:title", content: "Designer OS — Creative Workspace for Designers" },
      {
        property: "og:description",
        content:
          "Open-source Chrome extension: inspiration vault, color studio, typography studio, design inspector, WCAG audit. Offline-first, privacy-first.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DesignerOSLanding,
});

const features = [
  {
    tag: "Capture",
    title: "Inspiration Vault",
    body: "Save URLs, screenshots, and notes into visual collections. Everything organized per project.",
  },
  {
    tag: "Extract",
    title: "Asset Manager",
    body: "Pull images and SVGs from any live page in one click. Bulk export, tag, and reuse.",
  },
  {
    tag: "System",
    title: "Color Studio",
    body: "Pick colors, build a 7-role brand system, export to CSS, SCSS, JSON or Tailwind.",
  },
  {
    tag: "System",
    title: "Typography Studio",
    body: "Detect fonts on any site, build modular type scales, and check readability.",
  },
  {
    tag: "Analyze",
    title: "Design Inspector",
    body: "One-click Design DNA report — colors, fonts, components, layout — for any website.",
  },
  {
    tag: "Analyze",
    title: "Design Audit",
    body: "0–100 Design Quality Score across 6 categories with actionable issues.",
  },
  {
    tag: "Compliance",
    title: "Accessibility Center",
    body: "WCAG 2.1 scanner with tagged issues, severity levels, and remediation hints.",
  },
  {
    tag: "Safety",
    title: "Backup & Restore",
    body: "Versioned JSON export/import of your entire local library. You own the data.",
  },
];

const steps = [
  "Click ⬇ Download .zip below.",
  "Unzip designer-os.zip anywhere.",
  "Open chrome://extensions in your browser.",
  "Enable Developer mode (top right).",
  "Click Load unpacked → select the unzipped folder.",
  "Pin the icon; click it, or right-click → Open side panel.",
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
    <div className="min-h-screen bg-[#0b0b0f] text-neutral-100">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <img
            src="/designer-os-ext/icons/icon48.png"
            alt="Designer OS logo"
            className="h-9 w-9 rounded-xl"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div>
            <div className="font-semibold tracking-tight">Designer OS</div>
            <div className="text-xs text-neutral-500">v1.0.0 · open source</div>
          </div>
        </div>
        <nav className="flex items-center gap-5 text-sm text-neutral-400">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#install" className="hover:text-white">Install</a>
          <a href="#privacy" className="hover:text-white">Privacy</a>
          <a
            href="https://github.com/SalauddinAhmad/Designer-OS"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
          >
            GitHub ↗
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(120,120,255,0.20), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pt-10 pb-20 lg:pt-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            v1.0.0 · MIT licensed · Chromium extension
          </div>
          <h1 className="max-w-3xl text-5xl leading-[1.05] font-semibold tracking-tight lg:text-6xl">
            The open-source
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
              creative workspace
            </span>
            <br />
            for designers.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-400 lg:text-lg">
            Capture inspiration, extract assets, build color & type systems, and audit any
            website — all inside your browser. 100% local. No account. No tracking. Zero
            subscriptions.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={download}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-black shadow-lg transition hover:bg-neutral-200 disabled:opacity-60"
            >
              {downloading ? "Preparing…" : "⬇ Download .zip"}
              <span className="text-xs text-neutral-500">v1.0.0</span>
            </button>
            <a
              href="#install"
              className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Install guide
            </a>
            <Link
              to="/extensions/designer-os"
              className="text-sm text-neutral-400 hover:text-white"
            >
              Live preview →
            </Link>
          </div>
          <p className="mt-4 text-xs text-neutral-500">
            Works on Chrome, Edge, Brave, Arc, Opera — any Chromium browser ≥ 116.
          </p>

          {/* Stat strip */}
          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-4">
            {[
              ["9", "Modules"],
              ["0", "Trackers"],
              ["0", "Servers"],
              ["MIT", "License"],
            ].map(([n, l]) => (
              <div key={l} className="bg-[#0b0b0f] p-5">
                <div className="text-2xl font-semibold tracking-tight">{n}</div>
                <div className="text-xs text-neutral-500">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 text-xs tracking-[0.2em] text-indigo-300 uppercase">
              What's inside
            </div>
            <h2 className="text-3xl leading-tight font-semibold tracking-tight lg:text-4xl">
              One extension. Nine designer-grade tools.
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="bg-[#0b0b0f] p-6">
                <div className="mb-3 text-[10px] tracking-[0.15em] text-neutral-500 uppercase">
                  {f.tag}
                </div>
                <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-400">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-3 text-xs tracking-[0.2em] text-emerald-300 uppercase">
              Privacy-first, by design
            </div>
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              Your data never leaves your machine.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-neutral-400">
              Designer OS stores everything in your browser's IndexedDB. No telemetry,
              no analytics, no cloud sync, no accounts. Ever. Verified in the source.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              "Zero telemetry, zero crash reporting",
              "No third-party scripts or beacons",
              "All data lives in local IndexedDB",
              "Versioned JSON backup / restore",
              "Minimum Chrome permissions",
              "MIT licensed — audit the source",
            ].map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span className="text-neutral-200">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Install */}
      <section id="install" className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-3 text-xs tracking-[0.2em] text-indigo-300 uppercase">
            Install guide
          </div>
          <h2 className="mb-10 text-3xl font-semibold tracking-tight lg:text-4xl">
            Up and running in 60 seconds.
          </h2>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-white text-sm font-medium text-black">
                  {i + 1}
                </div>
                <p className="pt-1.5 text-sm text-neutral-200">{s}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button
              onClick={download}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-black shadow-lg transition hover:bg-neutral-200 disabled:opacity-60"
            >
              {downloading ? "Preparing…" : "⬇ Download designer-os.zip"}
            </button>
            <a
              href="https://github.com/SalauddinAhmad/Designer-OS"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              View on GitHub
            </a>
          </div>
          <p className="mt-4 text-center text-xs text-neutral-500">
            Chrome Web Store listing coming soon.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-neutral-500">
        Designer OS v1.0.0 · MIT · Built for designers, by designers.
      </footer>
    </div>
  );
}
