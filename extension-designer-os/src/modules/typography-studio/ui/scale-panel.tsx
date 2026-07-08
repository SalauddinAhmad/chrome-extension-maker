import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { generateScale, SCALE_RATIOS, exportScaleCss, exportScaleJson } from "../logic/scale";
import { cn } from "@/lib/cn";

type Format = "css" | "json";

export function ScalePanel() {
  const [base, setBase] = useState(16);
  const [ratioName, setRatioName] = useState<keyof typeof SCALE_RATIOS>("Major Third (1.250)");
  const [format, setFormat] = useState<Format>("css");

  const ratio = SCALE_RATIOS[ratioName];
  const scale = generateScale(base, ratio);
  const output = format === "css" ? exportScaleCss(scale) : exportScaleJson(scale);

  function copy() {
    navigator.clipboard.writeText(output);
    toast.success(`Copied ${format.toUpperCase()}`);
  }
  function download() {
    const blob = new Blob([output], { type: format === "css" ? "text/css" : "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `type-scale.${format}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Base (px)</span>
          <Input type="number" min={10} max={24} value={base} onChange={(e) => setBase(Number(e.target.value) || 16)} className="h-8 text-xs" />
        </label>
        <label className="space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Ratio</span>
          <select
            value={ratioName}
            onChange={(e) => setRatioName(e.target.value as keyof typeof SCALE_RATIOS)}
            className="h-8 w-full rounded-md border bg-background px-2 text-xs"
          >
            {Object.keys(SCALE_RATIOS).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
      </div>

      <div className="space-y-1 rounded-md border bg-card p-2">
        {scale.slice().reverse().map((s) => (
          <div key={s.name} className="flex items-baseline gap-2 border-b py-1 last:border-b-0">
            <span className="w-10 shrink-0 font-mono text-[9px] uppercase text-muted-foreground">{s.name}</span>
            <span className="w-14 shrink-0 font-mono text-[9px] text-muted-foreground">{s.px}px</span>
            <span className="truncate" style={{ fontSize: `${Math.min(s.px, 28)}px`, lineHeight: 1.1 }}>
              Aa
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-md border bg-muted/40 p-1">
        {(["css", "json"] as Format[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={cn(
              "rounded px-2 py-1 text-[10px] font-medium",
              format === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <pre className="max-h-40 overflow-auto rounded-md border bg-card p-2 font-mono text-[10px] leading-relaxed">
        {output}
      </pre>

      <div className="flex gap-2">
        <button onClick={copy} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border bg-background px-2 py-1.5 text-[11px] font-medium hover:bg-muted">
          <Copy className="h-3 w-3" /> Copy
        </button>
        <button onClick={download} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border bg-background px-2 py-1.5 text-[11px] font-medium hover:bg-muted">
          <Download className="h-3 w-3" /> Download
        </button>
      </div>
    </div>
  );
}
