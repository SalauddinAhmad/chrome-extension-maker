import { Loader2, RefreshCw, Plus, Type as TypeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTypeStore } from "../store";

export function DetectPanel() {
  const { detected, isScanning, error, scan, saveDetected } = useTypeStore();

  return (
    <div className="space-y-3">
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
        {detected.length > 0 ? "Rescan page" : "Scan current page"}
      </Button>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
          {error}
        </div>
      )}

      {detected.length === 0 && !isScanning && (
        <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
          <TypeIcon className="mx-auto mb-2 h-5 w-5 opacity-50" />
          Click scan to detect fonts on the current tab.
        </div>
      )}

      <div className="space-y-2">
        {detected.map((f) => (
          <div
            key={f.family}
            className="group rounded-md border bg-card p-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-base leading-tight"
                  style={{ fontFamily: f.stack }}
                  title={f.stack}
                >
                  {f.family}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                  <span>{f.count}× used</span>
                  {f.isSystem && (
                    <span className="rounded bg-muted px-1 py-0.5">system</span>
                  )}
                  {f.weights.length > 0 && (
                    <span>· {f.weights.join(", ")}</span>
                  )}
                  {f.sizes.length > 0 && (
                    <span>· {f.sizes.slice(0, 3).map((s) => `${s}px`).join(" ")}</span>
                  )}
                </div>
                <p
                  className="mt-1.5 truncate text-[13px] leading-snug"
                  style={{ fontFamily: f.stack }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
              <button
                onClick={() => void saveDetected(f)}
                className="rounded border p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover:opacity-100"
                title="Save to library"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
