/**
 * Modular type scale + export helpers.
 */
import type { StoredFont } from "@/types";

export const SCALE_RATIOS: Record<string, number> = {
  "Minor Second (1.067)": 1.067,
  "Major Second (1.125)": 1.125,
  "Minor Third (1.200)": 1.2,
  "Major Third (1.250)": 1.25,
  "Perfect Fourth (1.333)": 1.333,
  "Augmented Fourth (1.414)": 1.414,
  "Perfect Fifth (1.500)": 1.5,
  "Golden Ratio (1.618)": 1.618,
};

export interface ScaleStep {
  name: string;
  px: number;
  rem: number;
}

const NAMES = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"];

export function generateScale(basePx: number, ratio: number): ScaleStep[] {
  const baseIndex = 2; // "base" is at index 2
  return NAMES.map((name, i) => {
    const px = basePx * Math.pow(ratio, i - baseIndex);
    return {
      name,
      px: Math.round(px * 100) / 100,
      rem: Math.round((px / 16) * 1000) / 1000,
    };
  });
}

export function exportScaleCss(scale: ScaleStep[]): string {
  const lines = scale.map((s) => `  --text-${s.name}: ${s.rem}rem; /* ${s.px}px */`);
  return `:root {\n${lines.join("\n")}\n}\n`;
}

export function exportScaleJson(scale: ScaleStep[]): string {
  return JSON.stringify(
    scale.reduce<Record<string, { px: number; rem: string }>>((acc, s) => {
      acc[s.name] = { px: s.px, rem: `${s.rem}rem` };
      return acc;
    }, {}),
    null,
    2,
  );
}

export function exportFontsCss(fonts: StoredFont[]): string {
  if (fonts.length === 0) return "/* no fonts saved */";
  const vars = fonts.map((f, i) => {
    const key = f.family.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `font-${i + 1}`;
    return `  --font-${key}: "${f.family}", ${f.source === "system" ? "system-ui, sans-serif" : "sans-serif"};`;
  });
  return `:root {\n${vars.join("\n")}\n}\n`;
}

export function exportFontsJson(fonts: StoredFont[]): string {
  return JSON.stringify(
    fonts.map((f) => ({
      family: f.family,
      weights: f.weights,
      source: f.source,
    })),
    null,
    2,
  );
}
