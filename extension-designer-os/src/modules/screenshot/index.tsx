import { Camera, Copy, Download, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useScreenshotStore } from "./store";
import type { ShotFormat } from "./types";

const FORMATS: Array<{ id: ShotFormat; label: string }> = [
  { id: "png", label: "PNG" },
  { id: "jpeg", label: "JPEG" },
];

export default function ScreenshotStudio() {
  const {
    format, quality, shot, isCapturing, error,
    setFormat, setQuality, capture, download, copy, clear,
  } = useScreenshotStore();

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <Camera className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Screenshot Studio</div>
          <div className="text-[10px] text-muted-foreground">Capture visible tab</div>
        </div>
      </header>

      <div className="space-y-2 rounded-md border bg-card p-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Format
          </span>
          <div className="ml-auto flex gap-1 rounded-md border bg-muted/40 p-0.5">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                  format === f.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {format === "jpeg" && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Quality
            </span>
            <input
              type="range"
              min={0.3}
              max={1}
              step={0.05}
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="ml-auto w-32 accent-primary"
            />
            <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">
              {Math.round(quality * 100)}
            </span>
          </div>
        )}
      </div>

      <Button
        onClick={() => void capture()}
        disabled={isCapturing}
        className="w-full gap-2"
        size="sm"
      >
        {isCapturing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Camera className="h-3.5 w-3.5" />
        )}
        {shot ? "Recapture visible tab" : "Capture visible tab"}
      </Button>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
          {error}
        </div>
      )}

      {shot && (
        <div className="space-y-2 rounded-md border bg-card p-2">
          <div className="overflow-hidden rounded border bg-muted/30">
            <img
              src={shot.dataUrl}
              alt="Captured screenshot"
              className="h-auto w-full object-contain"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="truncate pr-2" title={shot.pageTitle}>
              {shot.pageTitle}
            </span>
            <span className="shrink-0 font-mono">
              {shot.width}×{shot.height} · {shot.format}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => void download()}
              size="sm"
              className="h-7 flex-1 gap-1.5 text-[11px]"
            >
              <Download className="h-3 w-3" /> Download
            </Button>
            <Button
              onClick={() => void copy()}
              size="sm"
              variant="secondary"
              className="h-7 gap-1.5 text-[11px]"
            >
              <Copy className="h-3 w-3" /> Copy
            </Button>
            <Button
              onClick={clear}
              size="sm"
              variant="ghost"
              className="h-7 gap-1.5 text-[11px]"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
