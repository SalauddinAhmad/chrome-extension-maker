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
                popup.html · 400 × 780
              </span>
            </div>
            <div className="flex justify-center bg-[#05050f] p-6">
              <iframe
                title="Designer OS popup preview"
                src="/designer-os-ext/popup.html"
                className="h-[820px] w-[420px] rounded-xl border-0 bg-transparent"
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

            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6">
              <div className="text-xs tracking-[0.2em] text-primary uppercase mb-2">
                Phase 1 complete · awaiting approval
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Architecture, types, storage schema, stores, and UI foundation are ready.
                Business logic is intentionally omitted per spec. Approve to start
                <strong className="text-foreground"> Phase 2 · Color Studio</strong>.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Preview iframe above still shows the vanilla prototype for reference.
                Run <code>bun install &amp;&amp; bun run build</code> inside
                <code> extension-designer-os/</code> to build the new React version.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
