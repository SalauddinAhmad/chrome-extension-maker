import { useEffect, useState } from "react";
import { Download, Loader2, Play, Search, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useInspectorStore } from "@/modules/design-inspector/store";
import { useAuditStore, type AuditTab } from "./store";
import { ScoreBadge } from "./ui/score-badge";
import { ScoreBreakdown } from "./ui/score-breakdown";
import { IssueList, RecommendationList } from "./ui/issue-list";
import { AuditCard } from "./ui/audit-card";
import { downloadText, exportAudit, type ExportFormat } from "./logic/export";
import type { DesignAudit } from "@/types";

const TABS: Array<{ id: AuditTab; label: string }> = [
  { id: "run", label: "Run" },
  { id: "library", label: "Library" },
];

function hostOf(url: string) { try { return new URL(url).hostname; } catch { return url; } }

export default function DesignAuditModule() {
  const {
    tab, current, isRunning, error, audits, filters,
    setTab, setFilters, runFromCurrentInspector, refreshAudits,
    deleteAudit,
  } = useAuditStore();
  const currentReport = useInspectorStore((s) => s.current);
  const [detail, setDetail] = useState<DesignAudit | null>(null);

  useEffect(() => { void refreshAudits(); }, [refreshAudits]);

  const viewing = detail ?? current;

  async function handleRun() {
    const result = await runFromCurrentInspector({ save: true });
    if (result) setDetail(null);
  }

  function handleExport(format: ExportFormat) {
    if (!viewing) return;
    const text = exportAudit(viewing, format);
    const suffix = format === "pdf-ready" ? "pdf-ready" : "audit";
    downloadText(text, `${suffix}-${hostOf(viewing.url)}.json`);
  }

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Design Audit</div>
          <div className="text-[10px] text-muted-foreground">
            Professional quality score for any site
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
          <div className="rounded-md border bg-card p-2 text-[11px] text-muted-foreground">
            {currentReport ? (
              <>
                Source: <span className="font-medium text-foreground">{currentReport.title}</span>
                <div className="truncate text-[10px]">{currentReport.url}</div>
              </>
            ) : (
              <>Scan a page in <span className="font-medium">Design Inspector</span> to unlock audits.</>
            )}
          </div>
          <Button
            onClick={handleRun}
            disabled={!currentReport || isRunning}
            size="sm"
            className="w-full gap-2"
          >
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run audit
          </Button>

          {viewing && <AuditDetail audit={viewing} onExport={handleExport} />}
        </div>
      )}

      {tab === "library" && (
        <>
          {detail ? (
            <div className="space-y-2">
              <Button size="sm" variant="ghost" onClick={() => setDetail(null)} className="h-7 gap-1 text-[11px]">
                <X className="h-3 w-3" /> Back
              </Button>
              <AuditDetail audit={detail} onExport={handleExport} />
            </div>
          ) : (
            <LibraryView
              audits={audits}
              search={filters.search ?? ""}
              onSearch={(q) => setFilters({ search: q })}
              onOpen={(a) => setDetail(a)}
              onDelete={(id) => void deleteAudit(id)}
            />
          )}
        </>
      )}
    </div>
  );
}

function AuditDetail({
  audit,
  onExport,
}: {
  audit: DesignAudit;
  onExport: (f: ExportFormat) => void;
}) {
  return (
    <div className="space-y-3">
      <ScoreBadge score={audit.overall} grade={audit.grade} />
      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Category scores
        </div>
        <ScoreBreakdown scores={audit.scores} />
      </div>
      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Issues ({audit.issues.length})
        </div>
        <IssueList issues={audit.issues} />
      </div>
      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Recommendations ({audit.recommendations.length})
        </div>
        <RecommendationList items={audit.recommendations} />
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
  audits, search, onSearch, onOpen, onDelete,
}: {
  audits: DesignAudit[];
  search: string;
  onSearch: (q: string) => void;
  onOpen: (a: DesignAudit) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search audits…"
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
      {audits.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
          {search ? "No audits match." : "No audits yet. Run one from the Run tab."}
        </div>
      ) : (
        <div className="space-y-2">
          {audits.map((a) => (
            <AuditCard
              key={a.id}
              audit={a}
              onOpen={() => onOpen(a)}
              onDelete={() => onDelete(a.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
