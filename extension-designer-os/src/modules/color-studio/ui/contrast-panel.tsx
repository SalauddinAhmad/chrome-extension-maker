import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useColorStudioStore } from "../store";
import { contrastRatio, hexToRgb, normalizeHex, wcagGrade } from "../logic";
import { cn } from "@/lib/cn";

export function ContrastPanel() {
  const { currentHex } = useColorStudioStore();
  const [bg, setBg] = useState(currentHex);
  const [fg, setFg] = useState("#FFFFFF");

  const parsed = useMemo(() => {
    try {
      return {
        ok: true as const,
        bg: normalizeHex(bg),
        fg: normalizeHex(fg),
      };
    } catch (err) {
      return { ok: false as const, msg: (err as Error).message };
    }
  }, [bg, fg]);

  if (!parsed.ok) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
        {parsed.msg}
      </div>
    );
  }

  const ratio = contrastRatio(hexToRgb(parsed.bg), hexToRgb(parsed.fg));
  const grade = wcagGrade(ratio);

  const gradeColor: Record<string, string> = {
    AAA: "bg-emerald-500/15 text-emerald-500 border-emerald-500/40",
    AA: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    "AA-Large": "bg-amber-500/10 text-amber-500 border-amber-500/40",
    FAIL: "bg-destructive/10 text-destructive border-destructive/40",
  };

  return (
    <div className="space-y-3">
      <div
        className="rounded-lg border p-4"
        style={{ background: parsed.bg, color: parsed.fg }}
      >
        <div className="text-[10px] uppercase tracking-widest opacity-70">Sample</div>
        <div className="mt-1 text-lg font-semibold leading-tight">Design is intelligence made visible</div>
        <div className="mt-2 text-[11px] leading-snug opacity-90">
          The quick brown fox jumps over the lazy dog. 0123456789 · @ # $ %
        </div>
        <div className="mt-2 text-[9px] opacity-70">14px body · 18px heading</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ColorField label="Background" value={bg} onChange={setBg} />
        <ColorField label="Foreground" value={fg} onChange={setFg} />
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-md border bg-card p-2 text-center">
        <div>
          <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Ratio</div>
          <div className="text-lg font-semibold leading-tight">{ratio.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Grade</div>
          <div className={cn("mt-0.5 inline-block rounded-md border px-1.5 py-0.5 text-xs font-bold", gradeColor[grade])}>
            {grade}
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Target</div>
          <div className="text-[10px] leading-tight text-muted-foreground">
            <div>{ratio >= 4.5 ? "✓" : "×"} 4.5 body</div>
            <div>{ratio >= 7 ? "✓" : "×"} 7 AAA</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => { const b = bg; setBg(fg); setFg(b); }}
        className="w-full rounded-md border px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        Swap foreground / background
      </button>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="space-y-1">
      <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="h-7 w-7 shrink-0 rounded border" style={{ background: value }} />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8 font-mono text-[11px] uppercase" />
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-7 w-7 shrink-0 cursor-pointer rounded border bg-transparent"
          aria-label={`${label} picker`}
        />
      </div>
    </label>
  );
}
