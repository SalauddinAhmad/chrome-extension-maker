/**
 * WCAG 2.1 relative luminance + contrast.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
import type { RGB } from "./convert";

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance({ r, g, b }: RGB): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export type WcagGrade = "FAIL" | "AA-Large" | "AA" | "AAA";

export function wcagGrade(ratio: number): WcagGrade {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA-Large";
  return "FAIL";
}

/** Pick black or white as the highest-contrast overlay for a background. */
export function bestTextOn(bg: RGB): "black" | "white" {
  const white: RGB = { r: 255, g: 255, b: 255 };
  const black: RGB = { r: 0, g: 0, b: 0 };
  return contrastRatio(bg, white) >= contrastRatio(bg, black) ? "white" : "black";
}
