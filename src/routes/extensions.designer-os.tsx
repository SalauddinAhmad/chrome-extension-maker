import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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
  const [view, setView] = useState<"popup" | "sidepanel">("popup");
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
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
                .catch((err) => alert(err.message));
            }}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            ⬇ Download .zip
          </button>
          <a
            href="https://github.com/SalauddinAhmad/Designer-OS"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            GitHub ↗
          </a>
        </div>
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
                {view === "popup" ? "popup.html · 400 × 600" : "sidepanel.html · full-height"}
              </span>
              <div className="ml-auto flex overflow-hidden rounded-md border border-border text-[10px] font-medium">
                <button
                  onClick={() => setView("popup")}
                  className={
                    view === "popup"
                      ? "bg-primary px-2.5 py-1 text-primary-foreground"
                      : "px-2.5 py-1 text-muted-foreground hover:bg-muted"
                  }
                >
                  Popup
                </button>
                <button
                  onClick={() => setView("sidepanel")}
                  className={
                    view === "sidepanel"
                      ? "bg-primary px-2.5 py-1 text-primary-foreground"
                      : "px-2.5 py-1 text-muted-foreground hover:bg-muted"
                  }
                >
                  Side panel
                </button>
              </div>
            </div>
            <div className="flex justify-center bg-[#05050f] p-6">
              <iframe
                key={view}
                title={`Designer OS ${view} preview`}
                src={`/designer-os-preview/${view}.html`}
                className={
                  view === "popup"
                    ? "h-[620px] w-[420px] rounded-xl border-0 bg-background"
                    : "h-[720px] w-full rounded-xl border-0 bg-background"
                }
              />
            </div>
          </div>


          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-xs tracking-[0.2em] text-primary uppercase mb-3">
                Architecture v1.0 · scaffolded
              </div>
              <pre className="text-[11px] leading-relaxed text-muted-foreground overflow-x-auto">
{`extension-designer-os/
├── manifest.json          MV3 · popup · sidepanel · content
├── popup.html             React popup entry (400px)
├── sidepanel.html         React sidepanel entry
├── vite.config.ts         @crxjs/vite-plugin + aliases
├── tailwind.config.ts     Inter · 12px radius · dark mode
├── tsconfig.json          strict TS
└── src/
    ├── background/        MV3 service worker
    ├── content/           Injected probes (empty in P1)
    ├── popup/             main.tsx
    ├── sidepanel/         main.tsx
    ├── modules/           10 module shells (dashboard + 9)
    │   ├── color-studio/
    │   ├── typography-studio/
    │   ├── design-inspector/
    │   ├── inspiration-vault/
    │   ├── asset-extractor/
    │   ├── resource-hub/
    │   ├── notes/
    │   ├── tech-stack/
    │   ├── screenshot/
    │   └── dashboard/
    ├── components/{ui,layout,shared}/
    ├── stores/            Zustand (theme, ui)
    ├── storage/           Dexie schema + repositories
    ├── types/             color · font · inspiration · asset · note · project · settings
    ├── hooks/             use-theme · use-hotkey
    ├── lib/               cn · chrome · modules registry
    └── styles/globals.css shadcn tokens (light + dark)`}
              </pre>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-xs tracking-[0.2em] text-primary uppercase mb-3">
                Install unpacked · Chrome / Edge / Brave / Arc
              </div>
              <ol className="space-y-2 text-xs leading-relaxed text-muted-foreground list-decimal pl-4">
                <li>উপরের <strong className="text-foreground">⬇ Download .zip</strong> চাপুন — <code>designer-os.zip</code> নামব।</li>
                <li>ZIP আনজিপ করুন যেকোনো ফোল্ডারে।</li>
                <li>ব্রাউজারে <code>chrome://extensions</code> খুলুন।</li>
                <li>উপর-ডানে <strong className="text-foreground">Developer mode</strong> টগল অন করুন।</li>
                <li><strong className="text-foreground">Load unpacked</strong> চাপুন → আনজিপ করা ফোল্ডার সিলেক্ট করুন।</li>
                <li>টুলবার আইকনে ক্লিক করে popup — অথবা রাইট-ক্লিক → <em>Open side panel</em>।</li>
              </ol>
              <p className="mt-3 text-[11px] text-muted-foreground/70">
                Chrome Web Store publish ছাড়া one-click install সম্ভব না — এটাই standard unpacked flow।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

