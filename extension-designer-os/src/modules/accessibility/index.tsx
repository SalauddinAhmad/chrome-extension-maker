import { useEffect, useState } from "react";
import { Accessibility, Download, Loader2, Play, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useAccessibilityStore, type A11yTab } from "./store";
import { A11yScoreBadge } from "./ui/score-badge";
import { A11yBreakdown } from "./ui/score-breakdown";
import { A11yIssueList, A11yRecList } from "./ui/issue-list";
import { A11yReportCard } from "./ui/report-card";
import { downloadText, exportA11y, type ExportFormat } from "./logic/export";
import type { AccessibilityReport } from "@/types";

const TABS: Array<{ id: A11yTab; label: string }> = [
  { id: "run", label: "Analyze" },
  { id: "library", label: "Library" },
];

function hostOf(url: string) { try { return new URL(url).hostname; } catch { return url; } }

export default function AccessibilityModule() {
  const {
    tab, current, isScanning, error, reports, filters,
    setTab, setFilters, analyzePage, refreshReports, deleteReport,
  } = useAccessibilityStore();
  const [detail, setDetail] = useState<AccessibilityReport | null>(null);

  useEffect(() => { void refreshReports(); }, [refreshReports]);

  const viewing = detail ?? current;

  async function handleRun() {
    const result = await analyzePage({ save: true });
    if (result) setDetail(null);
  }

  function handleExport(format: ExportFormat) {
    if (!viewing) return;
    const text = exportA11y(viewing, format);
    const suffix = format === "pdf-ready" ? "pdf-ready" : "a11y";
    downloadText(text, `${suffix}-${hostOf(viewing.url)}.json`);
  }

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <Accessibility className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Accessibility Center</div>
          <div className="text-[10px] text-muted-foreground">
            WCAG 2.1 checks for any page
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-1 rounded-md border bg-muted/40 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setDetail(null); }}
            className={cn(
              "rounded px-1.5 py-1 text-[11px] font-medium transition-colors",
              tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
          {error}
        </div>
      )}

      {tab === "run" && (
        <div className="space-y-3">
          <Button
            onClick={handleRun}
            disabled={isScanning}
            size="sm"
            className="w-full gap-2"
          >
            {isScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Analyze this page
          </Button>

          {viewing && <ReportDetail report={viewing} onExport={handleExport} />}
        </div>
      )}

      {tab === "library" && (
        <>
          {detail ? (
            <div className="space-y-2">
              <Button size="sm" variant="ghost" onClick={() => setDetail(null)} className="h-7 gap-1 text-[11px]">
                <X className="h-3 w-3" /> Back
              </Button>
              <ReportDetail report={detail} onExport={handleExport} />
            </div>
          ) : (
            <LibraryView
              reports={reports}
              search={filters.search ?? ""}
              onSearch={(q) => setFilters({ search: q })}
              onOpen={setDetail}
              onDelete={(id) => void deleteReport(id)}
            />
          )}
        </>
      )}
    </div>
  );
}

function ReportDetail({
  report,
  onExport,
}: {
  report: AccessibilityReport;
  onExport: (f: ExportFormat) => void;
}) {
  return (
    <div className="space-y-3">
      <A11yScoreBadge score={report.overall} grade={report.grade} />
      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Category scores
        </div>
        <A11yBreakdown scores={report.scores} />
      </div>
      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Issues ({report.issues.length})
        </div>
        <A11yIssueList issues={report.issues} />
      </div>
      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Recommendations ({report.recommendations.length})
        </div>
        <A11yRecList items={report.recommendations} />
      </div>
      <div className="rounded-md border p-2">
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Export
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Button size="sm" variant="outline" onClick={() => onExport("json")} className="h-8 gap-1 text-[10px]">
            <Download className="h-3 w-3" /> JSON
          </Button>
          <Button size="sm" variant="outline" onClick={() => onExport("pdf-ready")} className="h-8 gap-1 text-[10px]">
            <Download className="h-3 w-3" /> PDF ready
          </Button>
        </div>
      </div>
    </div>
  );
}

function LibraryView({
  reports, search, onSearch, onOpen, onDelete,
}: {
  reports: AccessibilityReport[];
  search: string;
  onSearch: (q: string) => void;
  onOpen: (r: AccessibilityReport) => void;
  onDelete: (id: string) => void;
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
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      {reports.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
          {search ? "No reports match." : "No reports yet. Run one from the Analyze tab."}
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <A11yReportCard
              key={r.id}
              report={r}
              onOpen={() => onOpen(r)}
              onDelete={() => onDelete(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
