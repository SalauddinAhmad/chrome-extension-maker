import { ExternalLink, Star, Trash2, Layers } from "lucide-react";
import type { DesignReport } from "@/types";

interface Props {
  report: DesignReport;
  onOpen: () => void;
  onDelete: () => void;
}

function hostOf(url: string) {
  try { return new URL(url).hostname; } catch { return url; }
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function ReportCard({ report, onOpen, onDelete }: Props) {
  const swatches = report.colors.slice(0, 6);
  return (
    <div className="group relative rounded-lg border bg-card p-3 text-left transition hover:border-primary/40">
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
          {report.saved && <Star className="h-3 w-3 shrink-0 fill-primary text-primary" />}
        </div>
        <div className="mt-2 flex h-4 overflow-hidden rounded">
          {swatches.map((c) => (
            <div key={c.hex} className="flex-1" style={{ background: c.hex }} />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>{report.statistics.uniqueColors} colors</span>
          <span>{report.statistics.uniqueFonts} fonts</span>
          <span className="flex items-center gap-0.5"><Layers className="h-2.5 w-2.5" />{report.statistics.componentCount}</span>
        </div>
      </button>
      <div className="mt-2 flex items-center justify-between">
        <a
          href={report.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-2.5 w-2.5" />
          Open
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
