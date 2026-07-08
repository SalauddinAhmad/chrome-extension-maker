import { useMemo } from "react";
import { hexToRgb, rgbToHsl, formatRgb, formatHsl, bestTextOn, contrastRatio, wcagGrade, nearestName } from "../logic";
import { CopyChip } from "./copy-chip";

interface ColorPreviewProps {
  hex: string;
}

export function ColorPreview({ hex }: ColorPreviewProps) {
  const info = useMemo(() => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    return {
      rgb,
      hsl,
      rgbStr: formatRgb(rgb),
      hslStr: formatHsl(hsl),
      textColor: bestTextOn(rgb),
      onWhite: contrastRatio(rgb, { r: 255, g: 255, b: 255 }),
      onBlack: contrastRatio(rgb, { r: 0, g: 0, b: 0 }),
      name: nearestName(rgb),
    };
  }, [hex]);

  return (
    <div className="space-y-3">
      <div
        className="relative flex h-24 items-end justify-between rounded-lg p-3 shadow-inner"
        style={{ background: hex, color: info.textColor }}
      >
        <div>
          <div className="text-[10px] uppercase tracking-widest opacity-70">Nearest</div>
          <div className="text-sm font-semibold">{info.name}</div>
        </div>
        <div className="font-mono text-xs opacity-80">{hex}</div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <CopyChip label="HEX" value={hex} />
        <CopyChip label="RGB" value={info.rgbStr} />
        <CopyChip label="HSL" value={info.hslStr} />
      </div>

      <div className="rounded-md border bg-background p-2 text-[11px]">
        <div className="mb-1 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
          WCAG contrast
        </div>
        <div className="flex items-center justify-between">
          <span>on white</span>
          <span className="font-mono">
            {info.onWhite.toFixed(2)}:1
            <span className="ml-1.5 rounded bg-muted px-1 text-[9px] font-semibold">
              {wcagGrade(info.onWhite)}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>on black</span>
          <span className="font-mono">
            {info.onBlack.toFixed(2)}:1
            <span className="ml-1.5 rounded bg-muted px-1 text-[9px] font-semibold">
              {wcagGrade(info.onBlack)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
