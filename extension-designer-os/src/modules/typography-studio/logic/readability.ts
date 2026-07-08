/**
 * Readability heuristics — pure functions.
 * Score is 0–100 with independent breakdowns per rule.
 */
export interface ReadabilityInput {
  fontSize: number;      // px
  lineHeight: number;    // unitless (e.g. 1.5)
  letterSpacing: number; // em
  measure?: number;      // chars per line
}

export interface ReadabilityScore {
  overall: number;
  breakdown: Array<{ label: string; score: number; hint: string }>;
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

/** WCAG-inspired body-size score: 16px baseline. */
function sizeScore(size: number): number {
  if (size >= 16 && size <= 22) return 100;
  if (size < 16) return clamp(100 - (16 - size) * 12);
  return clamp(100 - (size - 22) * 4);
}

/** 1.4–1.7 sweet spot for body copy. */
function lineHeightScore(lh: number): number {
  if (lh >= 1.4 && lh <= 1.7) return 100;
  if (lh < 1.4) return clamp(100 - (1.4 - lh) * 200);
  return clamp(100 - (lh - 1.7) * 80);
}

/** −0.02em .. 0.05em is comfortable at body sizes. */
function letterSpacingScore(ls: number): number {
  if (ls >= -0.02 && ls <= 0.05) return 100;
  return clamp(100 - Math.abs(ls) * 400);
}

/** 45–75 characters per line is ideal. */
function measureScore(m: number): number {
  if (m >= 45 && m <= 75) return 100;
  if (m < 45) return clamp(100 - (45 - m) * 3);
  return clamp(100 - (m - 75) * 1.5);
}

export function analyzeReadability(input: ReadabilityInput): ReadabilityScore {
  const s = sizeScore(input.fontSize);
  const l = lineHeightScore(input.lineHeight);
  const t = letterSpacingScore(input.letterSpacing);
  const m = input.measure != null ? measureScore(input.measure) : null;

  const parts: ReadabilityScore["breakdown"] = [
    { label: "Font size", score: Math.round(s), hint: "Body copy reads best 16–22px." },
    { label: "Line height", score: Math.round(l), hint: "Aim for 1.4–1.7 × font size." },
    { label: "Letter spacing", score: Math.round(t), hint: "Keep tracking near 0em for body." },
  ];
  if (m != null) parts.push({ label: "Line length", score: Math.round(m), hint: "45–75 chars per line." });

  const overall = Math.round(parts.reduce((a, p) => a + p.score, 0) / parts.length);
  return { overall, breakdown: parts };
}
