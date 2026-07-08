import { ExternalLink, Trash2 } from "lucide-react";
import type { AccessibilityReport } from "@/types";
import { A11yScoreBadge } from "./score-badge";

function hostOf(url: string) { try { return new URL(url).hostname; } catch { return url; } }
function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

interface Props {
  report: AccessibilityReport;
  onOpen: () => void;
  onDelete: () => void;
}

export function A11yReportCard({ report, onOpen, onDelete }: Props) {
  return (
    <div className="group relative rounded-lg border bg-card p-3">
      <button onClick={onOpen} className="block w-full text-left">
        <div className="flex items-start gap-2">
          {report.favicon && (
            <img src={report.favicon} alt="" className="mt-0.5 h-4 w-4 rounded-sm" />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium leading-tight">{report.title}</div>
            <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
              {hostOf(report.url)} · {timeAgo(report.createdAt)}
            </div>
          </div>
          <A11yScoreBadge score={report.overall} grade={report.grade} compact />
        </div>
        <div className="mt-2 grid grid-cols-6 gap-0.5">
          {report.scores.map((s) => (
            <div key={s.category} className="h-1 rounded-full bg-muted" title={`${s.category}: ${s.score}`}>
              <div className="h-full rounded-full bg-primary/70" style={{ width: `${s.score}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>{report.issues.length} issues</span>
          <span>{report.recommendations.length} recs</span>
        </div>
      </button>
      <div className="mt-2 flex items-center justify-between">
        <a
          href={report.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-2.5 w-2.5" /> Open
        </a>
        <button
          onClick={onDelete}
          className="rounded p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete report"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
