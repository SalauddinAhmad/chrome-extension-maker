import { A11Y_CATEGORY_LABEL, type A11yScore } from "@/types";

function toneFor(score: number): string {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-lime-500";
  if (score >= 55) return "bg-amber-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export function A11yBreakdown({ scores }: { scores: A11yScore[] }) {
  return (
    <div className="space-y-2">
      {scores.map((s) => (
        <div key={s.category} className="rounded-md border bg-card p-2">
          <div className="flex items-center justify-between text-xs">
            <div className="font-medium">{A11Y_CATEGORY_LABEL[s.category]}</div>
            <div className="font-mono tabular-nums">
              {s.score}
              <span className="ml-1 text-[10px] text-muted-foreground">
                · w{(s.weight * 100).toFixed(0)}
              </span>
            </div>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all ${toneFor(s.score)}`}
              style={{ width: `${s.score}%` }}
            />
          </div>
          {s.notes && (
            <div className="mt-1 text-[10px] text-muted-foreground">{s.notes}</div>
          )}
        </div>
      ))}
    </div>
  );
}
