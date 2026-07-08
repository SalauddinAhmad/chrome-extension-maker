import { Copy, Loader2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useInspectorStore } from "./store";
import type { InspectorTab } from "./types";

const TABS: Array<{ id: InspectorTab; label: string }> = [
  { id: "colors", label: "Colors" },
  { id: "type", label: "Type" },
  { id: "spacing", label: "Spacing" },
  { id: "effects", label: "Effects" },
];

function copy(text: string) {
  navigator.clipboard.writeText(text);
}

export default function DesignInspector() {
  const { tab, dna, isScanning, error, setTab, scan } = useInspectorStore();

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <Search className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Design Inspector</div>
          <div className="text-[10px] text-muted-foreground">
            {dna ? `${dna.scannedElements} elements scanned` : "Full design DNA"}
          </div>
        </div>
      </header>

      <Button
        onClick={() => void scan()}
        disabled={isScanning}
        size="sm"
        className="w-full gap-2"
      >
        {isScanning ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        {dna ? "Rescan" : "Scan design DNA"}
      </Button>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
          {error}
        </div>
      )}

      {!dna && !isScanning && (
        <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
          Scan any page to extract colors, type, spacing and effects.
        </div>
      )}

      {dna && (
        <>
          <div className="grid grid-cols-4 gap-1 rounded-md border bg-muted/40 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded px-1.5 py-1.5 text-[11px] font-medium transition-colors",
                  tab === t.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "colors" && (
            <div className="grid grid-cols-6 gap-1.5">
              {dna.colors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => copy(c.hex)}
                  className="group aspect-square overflow-hidden rounded-md border"
                  style={{ background: c.hex }}
                  title={`${c.hex} · ${c.count}× · ${c.roles.join(", ")}`}
                >
                  <span className="sr-only">{c.hex}</span>
                </button>
              ))}
            </div>
          )}

          {tab === "type" && (
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Font families
                </div>
                <div className="space-y-1">
                  {dna.fonts.map((f) => (
                    <button
                      key={f.family}
                      onClick={() => copy(f.family)}
                      className="group flex w-full items-center justify-between gap-2 rounded border bg-card px-2 py-1.5 text-left hover:bg-muted"
                    >
                      <span
                        className="truncate text-xs"
                        style={{ fontFamily: `"${f.family}", sans-serif` }}
                      >
                        {f.family}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                        {f.count}×
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Font sizes
                </div>
                <div className="flex flex-wrap gap-1">
                  {dna.fontSizes.map((s) => (
                    <button
                      key={s.px}
                      onClick={() => copy(`${s.px}px`)}
                      className="rounded border bg-card px-2 py-1 font-mono text-[10px] hover:bg-muted"
                      title={`${s.count}× used`}
                    >
                      {s.px}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "spacing" && (
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Padding scale (px)
                </div>
                <div className="flex flex-wrap gap-1">
                  {dna.spacings.map((s) => (
                    <button
                      key={s.px}
                      onClick={() => copy(`${s.px}px`)}
                      className="rounded border bg-card px-2 py-1 font-mono text-[10px] hover:bg-muted"
                    >
                      {s.px}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Border radius
                </div>
                <div className="space-y-1">
                  {dna.radii.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => copy(r.value)}
                      className="flex w-full items-center gap-2 rounded border bg-card px-2 py-1.5 text-left hover:bg-muted"
                    >
                      <div
                        className="h-6 w-6 shrink-0 border bg-primary/20"
                        style={{ borderRadius: r.value }}
                      />
                      <span className="flex-1 truncate font-mono text-[10px]">{r.value}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{r.count}×</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "effects" && (
            <div className="space-y-2">
              <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Box shadows
              </div>
              {dna.shadows.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                  No shadows detected.
                </div>
              ) : (
                dna.shadows.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => copy(s.value)}
                    className="group flex w-full items-center gap-3 rounded border bg-card p-2 text-left hover:bg-muted"
                  >
                    <div
                      className="h-10 w-10 shrink-0 rounded bg-background"
                      style={{ boxShadow: s.value }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-[10px]">{s.value}</div>
                      <div className="text-[10px] text-muted-foreground">{s.count}× · click to copy</div>
                    </div>
                    <Copy className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
