import { useState } from "react";
import { cn } from "@/lib/cn";
import { analyzeReadability } from "../logic/readability";

export function ReadabilityAnalyzer() {
  const [size, setSize] = useState(16);
  const [lh, setLh] = useState(1.5);
  const [ls, setLs] = useState(0);
  const [measure, setMeasure] = useState(65);
  const [text, setText] = useState(
    "Good typography makes reading effortless. When size, rhythm and spacing align, the eye stops noticing letters and starts noticing meaning.",
  );

  const result = analyzeReadability({ fontSize: size, lineHeight: lh, letterSpacing: ls, measure });

  const scoreColor =
    result.overall >= 85 ? "text-emerald-500" :
    result.overall >= 65 ? "text-yellow-500" : "text-destructive";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <NumField label="Font size (px)" value={size} step={1} min={10} max={40} onChange={setSize} />
        <NumField label="Line height" value={lh} step={0.05} min={1} max={2.5} onChange={setLh} />
        <NumField label="Letter spacing (em)" value={ls} step={0.005} min={-0.1} max={0.2} onChange={setLs} />
        <NumField label="Line length (chars)" value={measure} step={1} min={20} max={120} onChange={setMeasure} />
      </div>

      <div
        className="rounded-md border bg-card p-3"
        style={{
          fontSize: size,
          lineHeight: lh,
          letterSpacing: `${ls}em`,
          maxWidth: `${measure}ch`,
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full resize-none border-0 bg-transparent p-0 focus:outline-none"
          rows={4}
        />
      </div>

      <div className="rounded-md border bg-card p-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Readability</span>
          <span className={cn("text-2xl font-semibold tabular-nums", scoreColor)}>{result.overall}</span>
        </div>
        <div className="mt-2 space-y-1.5">
          {result.breakdown.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">{b.label}</span>
                <span className="tabular-nums">{b.score}</span>
              </div>
              <div className="h-1 rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    b.score >= 85 ? "bg-emerald-500" : b.score >= 65 ? "bg-yellow-500" : "bg-destructive",
                  )}
                  style={{ width: `${b.score}%` }}
                />
              </div>
              <div className="mt-0.5 text-[9px] text-muted-foreground">{b.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange, step = 1, min, max }: {
  label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number;
}) {
  return (
    <label className="space-y-1">
      <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-7 w-full rounded-md border bg-background px-2 text-xs"
      />
    </label>
  );
}
