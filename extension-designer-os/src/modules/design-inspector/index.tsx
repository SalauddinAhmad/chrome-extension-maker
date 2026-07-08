import { useEffect, useState } from "react";
import {
  Copy, Download, ExternalLink, Loader2, Palette, RefreshCw, Save, Search, Star,
  Type, Image as ImageIcon, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useProjectStore } from "@/stores/project-store";
import { useInspectorStore } from "./store";
import { AnalysisSummary, ComponentExplorer } from "./ui/analysis-summary";
import { ReportCard } from "./ui/report-card";
import { downloadText, exportReport, type ExportFormat } from "./logic/export";
import type { DesignReport } from "@/types";
import type { InspectorTab, ReportViewTab } from "./types";

const TABS: Array<{ id: InspectorTab; label: string }> = [
  { id: "analyze", label: "Analyze" },
  { id: "library", label: "Library" },
];

const VIEW_TABS: Array<{ id: ReportViewTab; label: string }> = [
  { id: "summary", label: "Summary" },
  { id: "colors", label: "Colors" },
  { id: "type", label: "Type" },
  { id: "components", label: "Components" },
  { id: "layout", label: "Layout" },
  { id: "effects", label: "Effects" },
  { id: "assets", label: "Assets" },
];

function copy(text: string) { void navigator.clipboard.writeText(text); }
function host(url: string) { try { return new URL(url).hostname; } catch { return url; } }

export default function DesignInspector() {
  const {
    tab, viewTab, current, isScanning, isSaving, error, reports, filters,
    setTab, setViewTab, setFilters,
    analyzePage, saveReport, refreshReports, deleteReport, loadReport,
    saveColorsToStudio, saveFontsToStudio, saveAssetsToLibrary,
  } = useInspectorStore();

  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { void refreshReports(); }, [refreshReports]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2200);
    return () => clearTimeout(t);
  }, [msg]);

  async function handleSave() {
    const r = await saveReport({ projectId: activeProjectId ?? undefined });
    if (r) setMsg("Report saved");
  }

  async function handleExport(format: ExportFormat) {
    if (!current) return;
    const text = exportReport(current, format);
    const ext = format === "css" ? "css" : format === "tailwind" ? "js" : "json";
    downloadText(text, `design-dna-${host(current.url)}.${ext}`, "text/plain");
  }

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <Search className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Design Inspector</div>
          <div className="text-[10px] text-muted-foreground">
            {current ? `${current.statistics.scannedElements} elements · ${host(current.url)}` : "Extract full design DNA"}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-1 rounded-md border bg-muted/40 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded px-1.5 py-1 text-[11px] font-medium transition-colors",
              tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className="rounded-md border border-primary/30 bg-primary/5 px-2 py-1.5 text-[11px] text-primary">
          {msg}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
          {error}
        </div>
      )}

      {tab === "analyze" && (
        <AnalyzeView
          report={current}
          viewTab={viewTab}
          setViewTab={setViewTab}
          isScanning={isScanning}
          isSaving={isSaving}
          onScan={() => void analyzePage()}
          onSave={handleSave}
          onExport={handleExport}
          onSaveColors={async () => { const n = await saveColorsToStudio(current!); setMsg(`${n} colors → Studio`); }}
          onSaveFonts={async () => { const n = await saveFontsToStudio(current!); setMsg(`${n} fonts → Studio`); }}
          onSaveAssets={async () => { const n = await saveAssetsToLibrary(current!); setMsg(`${n} assets → Library`); }}
        />
      )}

      {tab === "library" && (
        <LibraryView
          reports={reports}
          search={filters.search ?? ""}
          onSearch={(q) => setFilters({ search: q })}
          onOpen={async (id) => { await loadReport(id); }}
          onDelete={async (id) => { await deleteReport(id); }}
        />
      )}
    </div>
  );
}

interface AnalyzeProps {
  report: DesignReport | null;
  viewTab: ReportViewTab;
  setViewTab: (v: ReportViewTab) => void;
  isScanning: boolean;
  isSaving: boolean;
  onScan: () => void;
  onSave: () => void | Promise<void>;
  onExport: (f: ExportFormat) => void;
  onSaveColors: () => void | Promise<void>;
  onSaveFonts: () => void | Promise<void>;
  onSaveAssets: () => void | Promise<void>;
}

function AnalyzeView({
  report, viewTab, setViewTab, isScanning, isSaving,
  onScan, onSave, onExport, onSaveColors, onSaveFonts, onSaveAssets,
}: AnalyzeProps) {
  return (
    <>
      <div className="flex gap-1.5">
        <Button onClick={onScan} disabled={isScanning} size="sm" className="flex-1 gap-2">
          {isScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {report ? "Rescan" : "Scan page"}
        </Button>
        {report && !report.saved && (
          <Button onClick={onSave} disabled={isSaving} size="sm" variant="outline" className="gap-1">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </Button>
        )}
        {report?.saved && (
          <div className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 text-[10px] text-primary">
            <Star className="h-3 w-3 fill-primary" /> Saved
          </div>
        )}
      </div>

      {!report && !isScanning && (
        <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
          Scan the active page to extract colors, type, components, layout, effects and assets.
        </div>
      )}

      {report && (
        <>
          <div className="grid grid-cols-4 gap-1 rounded-md border bg-muted/40 p-1 md:grid-cols-7">
            {VIEW_TABS.map((v) => (
              <button
                key={v.id}
                onClick={() => setViewTab(v.id)}
                className={cn(
                  "rounded px-1 py-1 text-[10px] font-medium transition-colors",
                  viewTab === v.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          {viewTab === "summary" && (
            <div className="space-y-3">
              <AnalysisSummary report={report} />
              <div className="rounded-md border p-2">
                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Save to project
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <Button size="sm" variant="outline" onClick={onSaveColors} className="h-8 gap-1 text-[10px]">
                    <Palette className="h-3 w-3" /> Colors
                  </Button>
                  <Button size="sm" variant="outline" onClick={onSaveFonts} className="h-8 gap-1 text-[10px]">
                    <Type className="h-3 w-3" /> Fonts
                  </Button>
                  <Button size="sm" variant="outline" onClick={onSaveAssets} className="h-8 gap-1 text-[10px]">
                    <ImageIcon className="h-3 w-3" /> Assets
                  </Button>
                </div>
              </div>
              <div className="rounded-md border p-2">
                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Export
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["json", "css", "tailwind"] as ExportFormat[]).map((f) => (
                    <Button key={f} size="sm" variant="outline" onClick={() => onExport(f)} className="h-8 gap-1 text-[10px] uppercase">
                      <Download className="h-3 w-3" /> {f}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {viewTab === "colors" && (
            <div className="grid grid-cols-6 gap-1.5">
              {report.colors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => copy(c.hex)}
                  className="aspect-square overflow-hidden rounded-md border"
                  style={{ background: c.hex }}
                  title={`${c.hex} · ${c.count}× · ${c.roles.join(", ")}`}
                >
                  <span className="sr-only">{c.hex}</span>
                </button>
              ))}
            </div>
          )}

          {viewTab === "type" && (
            <div className="space-y-3">
              <div className="space-y-1">
                {report.fonts.map((f) => (
                  <button
                    key={f.family}
                    onClick={() => copy(f.family)}
                    className="flex w-full items-center justify-between gap-2 rounded border bg-card px-2 py-1.5 hover:bg-muted"
                  >
                    <span className="truncate text-xs" style={{ fontFamily: `"${f.family}", sans-serif` }}>{f.family}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {f.count}× {f.weights?.length ? `· ${f.weights.join("/")}` : ""}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {report.fontSizes.map((s) => (
                  <button
                    key={s.px}
                    onClick={() => copy(`${s.px}px`)}
                    className="rounded border bg-card px-2 py-1 font-mono text-[10px] hover:bg-muted"
                    title={`${s.count}×`}
                  >
                    {s.px}px
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewTab === "components" && <ComponentExplorer report={report} />}

          {viewTab === "layout" && (
            <div className="space-y-2">
              <div className="rounded-md border bg-card p-2 text-[11px]">
                <div className="flex justify-between"><span className="text-muted-foreground">Viewport</span><span className="font-mono">{report.layout.viewportWidth}×{report.layout.viewportHeight}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Content width</span><span className="font-mono">{report.layout.contentWidth ?? "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sections</span><span className="font-mono">{report.layout.sectionCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Grid layouts</span><span className="font-mono">{report.layout.gridCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Flex layouts</span><span className="font-mono">{report.layout.flexCount}</span></div>
              </div>
              <div>
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Common spacing (px)</div>
                <div className="flex flex-wrap gap-1">
                  {report.spacings.map((s) => (
                    <button key={s.px} onClick={() => copy(`${s.px}px`)}
                      className="rounded border bg-card px-2 py-1 font-mono text-[10px] hover:bg-muted">{s.px}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {viewTab === "effects" && (
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Radius</div>
                <div className="space-y-1">
                  {report.radii.map((r) => (
                    <button key={r.value} onClick={() => copy(r.value)}
                      className="flex w-full items-center gap-2 rounded border bg-card px-2 py-1.5 hover:bg-muted">
                      <div className="h-6 w-6 border bg-primary/20" style={{ borderRadius: r.value }} />
                      <span className="flex-1 truncate font-mono text-[10px]">{r.value}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{r.count}×</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Shadows</div>
                {report.shadows.length === 0 ? (
                  <div className="rounded-md border border-dashed p-3 text-center text-[11px] text-muted-foreground">None detected.</div>
                ) : (
                  <div className="space-y-1">
                    {report.shadows.map((s) => (
                      <button key={s.value} onClick={() => copy(s.value)}
                        className="flex w-full items-center gap-3 rounded border bg-card p-2 hover:bg-muted">
                        <div className="h-10 w-10 shrink-0 rounded bg-background" style={{ boxShadow: s.value }} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-mono text-[10px]">{s.value}</div>
                          <div className="text-[10px] text-muted-foreground">{s.count}× · click to copy</div>
                        </div>
                        <Copy className="h-3 w-3 shrink-0 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {viewTab === "assets" && (
            report.assets.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-center text-[11px] text-muted-foreground">
                No images or SVGs detected.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {report.assets.map((a) => (
                  <a
                    key={a.url}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block aspect-square overflow-hidden rounded-md border bg-muted"
                    title={a.alt ?? a.kind}
                  >
                    <img src={a.url} alt={a.alt ?? ""} className="h-full w-full object-contain" />
                    <span className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[9px] text-white opacity-0 transition group-hover:opacity-100">
                      {a.kind}
                    </span>
                  </a>
                ))}
              </div>
            )
          )}
        </>
      )}
    </>
  );
}

function LibraryView({
  reports, search, onSearch, onOpen, onDelete,
}: {
  reports: DesignReport[];
  search: string;
  onSearch: (q: string) => void;
  onOpen: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search reports…"
          className="h-8 pl-7 text-xs"
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      {reports.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
          {search ? "No reports match." : "No saved reports yet. Scan a page and save it."}
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} onOpen={() => void onOpen(r.id)} onDelete={() => void onDelete(r.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
