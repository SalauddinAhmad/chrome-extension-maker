import { AlertOctagon, AlertTriangle, Info, Lightbulb } from "lucide-react";
import { AUDIT_CATEGORY_LABEL, type AuditIssue, type AuditRecommendation } from "@/types";

const SEVERITY_META = {
  critical: { icon: AlertOctagon, tone: "text-red-500 bg-red-500/10 border-red-500/30" },
  warning: { icon: AlertTriangle, tone: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
  info: { icon: Info, tone: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
} as const;

export function IssueList({ issues }: { issues: AuditIssue[] }) {
  if (issues.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-center text-[11px] text-muted-foreground">
        No issues detected.
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      {issues.map((i) => {
        const meta = SEVERITY_META[i.severity];
        const Icon = meta.icon;
        return (
          <div key={i.id} className={`flex gap-2 rounded-md border p-2 ${meta.tone}`}>
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-xs font-medium">{i.title}</div>
                <div className="shrink-0 text-[9px] uppercase tracking-wide opacity-70">
                  {AUDIT_CATEGORY_LABEL[i.category]}
                </div>
              </div>
              {i.detail && (
                <div className="mt-0.5 text-[10px] opacity-80">{i.detail}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RecommendationList({ items }: { items: AuditRecommendation[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-center text-[11px] text-muted-foreground">
        No recommendations — nice work.
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      {items.map((r) => (
        <div key={r.id} className="flex gap-2 rounded-md border bg-card p-2">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="truncate text-xs font-medium">{r.title}</div>
              <div className="shrink-0 text-[9px] uppercase tracking-wide text-muted-foreground">
                {AUDIT_CATEGORY_LABEL[r.category]}
              </div>
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">{r.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
