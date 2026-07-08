import { Copy, Cpu, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useTechStore } from "./store";
import type { TechCategory } from "./types";

const CATEGORY_ORDER: TechCategory[] = [
  "framework",
  "cms",
  "ecommerce",
  "ui",
  "analytics",
  "tag-manager",
  "font",
  "cdn",
  "hosting",
];

const CATEGORY_LABEL: Record<TechCategory, string> = {
  framework: "Frameworks",
  cms: "CMS / Builder",
  ecommerce: "E-commerce",
  ui: "UI Library",
  analytics: "Analytics",
  "tag-manager": "Tag Manager",
  font: "Fonts",
  cdn: "CDN",
  hosting: "Hosting",
};

const CONFIDENCE_COLOR = {
  high: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  low: "bg-muted text-muted-foreground",
} as const;

export default function TechStack() {
  const { report, isScanning, error, scan } = useTechStore();

  const grouped: Partial<Record<TechCategory, typeof report.items>> = {};
  if (report) {
    for (const it of report.items) {
      (grouped[it.category] ??= []).push(it);
    }
  }

  const copyReport = () => {
    if (!report) return;
    const lines = [
      `Tech stack — ${report.title}`,
      report.url,
      "",
      ...report.items.map((i) => `• ${i.name} (${i.category}) — ${i.evidence}`),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
  };

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <Cpu className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Tech Stack</div>
          <div className="text-[10px] text-muted-foreground">
            {report ? `${report.items.length} technologies detected` : "Framework · CMS · CDN"}
          </div>
        </div>
      </header>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => void scan()}
          disabled={isScanning}
          size="sm"
          className="flex-1 gap-2"
        >
          {isScanning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {report ? "Rescan" : "Detect stack"}
        </Button>
        {report && (
          <Button
            onClick={copyReport}
            variant="secondary"
            size="sm"
            className="gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
          {error}
        </div>
      )}

      {!report && !isScanning && (
        <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
          <Cpu className="mx-auto mb-2 h-5 w-5 opacity-50" />
          Detect what powers any website — framework, CMS, analytics, CDN.
        </div>
      )}

      {report && (
        <div className="space-y-3">
          {report.items.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
              No known technologies detected.
            </div>
          ) : (
            CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((cat) => (
              <div key={cat}>
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {CATEGORY_LABEL[cat]}
                </div>
                <div className="space-y-1">
                  {grouped[cat]!.map((it) => (
                    <div
                      key={it.name}
                      className="flex items-start justify-between gap-2 rounded-md border bg-card px-2 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">{it.name}</div>
                        <div className="truncate text-[10px] text-muted-foreground" title={it.evidence}>
                          {it.evidence}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                          CONFIDENCE_COLOR[it.confidence],
                        )}
                      >
                        {it.confidence}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {report.scriptHosts.length > 0 && (
            <details className="rounded-md border bg-card">
              <summary className="cursor-pointer px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Script hosts ({report.scriptHosts.length})
              </summary>
              <div className="border-t p-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
                {report.scriptHosts.map((h) => (
                  <div key={h} className="truncate">{h}</div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
