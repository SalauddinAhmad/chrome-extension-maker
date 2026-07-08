import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useTypeStore } from "../store";

export function InspectorPanel() {
  const { inspected, isInspecting, error, inspect } = useTypeStore();

  return (
    <div className="space-y-3">
      <button
        onClick={() => void inspect()}
        disabled={isInspecting}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-2 py-1.5 text-[11px] font-medium text-primary-foreground disabled:opacity-60"
      >
        {isInspecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        {inspected.length > 0 ? "Re-analyze hierarchy" : "Analyze typography hierarchy"}
      </button>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">{error}</div>
      )}

      {inspected.length === 0 && !isInspecting && (
        <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
          <Sparkles className="mx-auto mb-2 h-5 w-5 opacity-50" />
          Detect H1–H6, body and small text used on the page.
        </div>
      )}

      <div className="space-y-2">
        {inspected.map((s) => (
          <div key={s.tag} className="rounded-md border bg-card p-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{s.tag}</span>
              <span className="text-[9px] text-muted-foreground">{s.count} sample{s.count === 1 ? "" : "s"}</span>
            </div>
            <p
              className="mt-1 truncate leading-tight"
              style={{
                fontFamily: `"${s.fontFamily}", sans-serif`,
                fontWeight: s.fontWeight,
                fontSize: Math.min(s.fontSize, 32),
                lineHeight: s.lineHeight,
                letterSpacing: `${s.letterSpacing}em`,
              }}
              title={s.sample}
            >
              {s.sample || "The quick brown fox"}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1 text-[9px] text-muted-foreground">
              <span className="rounded bg-muted px-1 py-0.5">{s.fontFamily || "—"}</span>
              <span className="rounded bg-muted px-1 py-0.5">{s.fontSize}px</span>
              <span className="rounded bg-muted px-1 py-0.5">w{s.fontWeight}</span>
              <span className="rounded bg-muted px-1 py-0.5">lh {s.lineHeight}</span>
              <span className="rounded bg-muted px-1 py-0.5">ls {s.letterSpacing}em</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
