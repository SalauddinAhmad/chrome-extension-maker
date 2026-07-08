import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { CopyChip } from "./copy-chip";
import { bestTextOn, hexToRgb, normalizeHex } from "../logic";

/**
 * Minimal 2-stop linear gradient. Enough for Phase 2 to prove the surface;
 * mesh/radial/multi-stop lives in a follow-up sprint.
 */
export function GradientLab() {
  const [from, setFrom] = useState("#6366F1");
  const [to, setTo] = useState("#EC4899");
  const [angle, setAngle] = useState(135);

  const safe = useMemo(() => {
    try {
      return { from: normalizeHex(from), to: normalizeHex(to), ok: true as const };
    } catch (err) {
      return { from: "#000", to: "#000", ok: false as const, msg: (err as Error).message };
    }
  }, [from, to]);

  const css = `linear-gradient(${angle}deg, ${safe.from} 0%, ${safe.to} 100%)`;
  const fg = safe.ok ? bestTextOn(hexToRgb(safe.from)) : "black";

  return (
    <div className="space-y-3">
      <div
        className="flex h-28 items-end justify-between rounded-lg p-3 shadow-inner"
        style={{ background: safe.ok ? css : "#eee", color: fg }}
      >
        <span className="text-[10px] uppercase tracking-widest opacity-70">Linear</span>
        <span className="font-mono text-xs opacity-80">{angle}°</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">From</span>
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 shrink-0 rounded border" style={{ background: safe.from }} />
            <Input value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 font-mono text-[11px] uppercase" />
          </div>
        </label>
        <label className="space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">To</span>
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 shrink-0 rounded border" style={{ background: safe.to }} />
            <Input value={to} onChange={(e) => setTo(e.target.value)} className="h-8 font-mono text-[11px] uppercase" />
          </div>
        </label>
      </div>

      <label className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Angle</span>
          <span className="font-mono text-[10px]">{angle}°</span>
        </div>
        <input
          type="range" min={0} max={360}
          value={angle}
          onChange={(e) => setAngle(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </label>

      <CopyChip label="CSS" value={`background: ${css};`} />

      {!safe.ok && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
          {safe.msg}
        </div>
      )}
    </div>
  );
}
