import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/extensions/designer-os")({
  head: () => ({
    meta: [
      { title: "Designer OS — Extension" },
      {
        name: "description",
        content:
          "Designer OS — The Open-Source Creative Workspace for Designers. 100% local, no account, no tracking.",
      },
      { property: "og:title", content: "Designer OS — Extension" },
      {
        property: "og:description",
        content: "Open-source creative workspace for designers (WIP).",
      },
    ],
  }),
  component: DesignerOSPage,
});

function DesignerOSPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <img
            src="/designer-os-ext/icons/icon48.png"
            alt="Designer OS"
            className="h-9 w-9 rounded-xl"
          />
          <div>
            <div className="font-serif text-base font-semibold tracking-tight">
              Designer OS
            </div>
            <div className="text-xs text-muted-foreground">v1.0.0 · imported from GitHub</div>
          </div>
        </div>
        <a
          href="https://github.com/SalauddinAhmad/Designer-OS"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          GitHub ↗
        </a>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            লাইভ প্রিভিউ · sidepanel UI
          </div>
          <h1 className="font-serif text-4xl leading-[1.05] font-semibold tracking-tight lg:text-5xl">
            Designer <span className="text-primary">OS</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            GitHub থেকে সকল সোর্স কোড <code>extension-designer-os/</code> ফোল্ডারে
            নিয়ে আসা হয়েছে। নিচে extension এর sidepanel UI লাইভ প্রিভিউ দেখানো
            হচ্ছে — এখান থেকেই আমরা কাজ শুরু করতে পারি।
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              <span className="ml-3 text-[11px] text-muted-foreground">
                sidepanel/index.html
              </span>
            </div>
            <iframe
              title="Designer OS sidepanel preview"
              src="/designer-os-ext/sidepanel/index.html"
              className="h-[720px] w-full bg-white"
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-xs tracking-[0.2em] text-primary uppercase mb-3">
                সোর্স স্ট্রাকচার
              </div>
              <pre className="text-xs leading-relaxed text-muted-foreground overflow-x-auto">
{`extension-designer-os/
├── manifest.json         MV3, sidepanel + content scripts
├── sidepanel/            main UI (vanilla JS)
│   ├── index.html
│   ├── app.js
│   └── styles/main.css
├── background/
│   └── service-worker.js
├── content/              injected on every page
│   ├── design-extractor.js
│   ├── font-detector.js
│   ├── tech-detector.js
│   ├── screenshot-cropper.js
│   └── downloader.js
├── data/                 color-names, social-sizes …
├── icons/                16 / 32 / 48 / 128
└── implementation_plan.md`}
              </pre>
            </div>

            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6">
              <div className="text-xs tracking-[0.2em] text-primary uppercase mb-2">
                পরবর্তী ধাপ
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                কোন module থেকে শুরু করব বলুন — Color Toolkit, Font Toolkit,
                Design System extractor, SVG Toolkit, Screenshot Tool, বা অন্য
                কিছু? <code>implementation_plan.md</code> এ পুরো Phase 1 roadmap
                আছে।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
