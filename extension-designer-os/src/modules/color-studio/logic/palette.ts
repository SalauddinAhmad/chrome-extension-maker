/**
 * Color harmony + shade/tint generation from a base hex.
 * Pure functions on top of convert.ts / contrast.ts.
 */
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, normalizeHex } from "./convert";
import type { HSL } from "./convert";
import type { BrandRole } from "@/types";

function fromHsl(h: HSL): string {
  return rgbToHex(hslToRgb(h));
}

/** N tints (lighter) + N shades (darker) around a base, evenly spaced in L. */
export function generateScale(hex: string, steps = 5): string[] {
  const base = rgbToHsl(hexToRgb(normalizeHex(hex)));
  const out: string[] = [];
  for (let i = -steps; i <= steps; i++) {
    const l = clamp(
      base.l + i * (i < 0 ? base.l / (steps + 1) : (100 - base.l) / (steps + 1)),
      4,
      96,
    );
    out.push(fromHsl({ h: base.h, s: base.s, l }));
  }
  return out;
}

/** Tailwind-style 50→950 scale using perceptual anchors. */
export function generateTailwindScale(hex: string): Record<string, string> {
  const base = rgbToHsl(hexToRgb(normalizeHex(hex)));
  const stops = [
    { key: "50", l: 97 }, { key: "100", l: 94 }, { key: "200", l: 86 },
    { key: "300", l: 76 }, { key: "400", l: 64 }, { key: "500", l: 52 },
    { key: "600", l: 44 }, { key: "700", l: 36 }, { key: "800", l: 28 },
    { key: "900", l: 20 }, { key: "950", l: 12 },
  ];
  const out: Record<string, string> = {};
  for (const s of stops) {
    out[s.key] = fromHsl({ h: base.h, s: Math.max(base.s, 20), l: s.l });
  }
  return out;
}

export type HarmonyKind =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "split-complementary"
  | "monochromatic";

export function generateHarmony(hex: string, kind: HarmonyKind): string[] {
  const base = rgbToHsl(hexToRgb(normalizeHex(hex)));
  const rot = (deg: number) => fromHsl({ ...base, h: (base.h + deg + 360) % 360 });
  switch (kind) {
    case "complementary":       return [fromHsl(base), rot(180)];
    case "analogous":           return [rot(-30), fromHsl(base), rot(30)];
    case "triadic":             return [fromHsl(base), rot(120), rot(240)];
    case "tetradic":            return [fromHsl(base), rot(90), rot(180), rot(270)];
    case "split-complementary": return [fromHsl(base), rot(150), rot(210)];
    case "monochromatic":
      return [-30, -15, 0, 15, 30].map((dl) =>
        fromHsl({ ...base, l: clamp(base.l + dl, 6, 94) }),
      );
  }
}

/**
 * Generate a semantic brand palette from a single primary hex.
 * Semantic colors (success/warning/danger) use fixed hues; secondary/accent
 * rotate around the primary hue; neutral desaturates the base.
 */
export function generateBrandPalette(hex: string): Record<BrandRole, string> {
  const base = rgbToHsl(hexToRgb(normalizeHex(hex)));
  const withSL = (h: number, s: number, l: number) =>
    fromHsl({ h: ((h % 360) + 360) % 360, s: clamp(s, 0, 100), l: clamp(l, 0, 100) });

  return {
    primary: fromHsl(base),
    secondary: withSL(base.h + 210, Math.max(base.s - 10, 25), base.l),
    accent: withSL(base.h + 45, Math.min(base.s + 15, 90), Math.min(base.l + 8, 62)),
    success: withSL(142, 65, 40),
    warning: withSL(38, 92, 50),
    danger: withSL(0, 78, 52),
    neutral: withSL(base.h, 6, 45),
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
