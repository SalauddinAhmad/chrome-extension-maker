/**
 * Pure color-space conversions. No DOM, no side effects — trivially testable.
 * All inputs are validated; invalid values throw so callers surface bad state
 * instead of silently rendering garbage swatches.
 */

export interface RGB { r: number; g: number; b: number; a?: number }
export interface HSL { h: number; s: number; l: number; a?: number }

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function normalizeHex(input: string): string {
  const m = input.trim().match(HEX_RE);
  if (!m) throw new Error(`Invalid hex: ${input}`);
  let hex = m[1];
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  return `#${hex.toUpperCase()}`;
}

export function hexToRgb(hex: string): RGB {
  const h = normalizeHex(hex).slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : undefined;
  return a === undefined ? { r, g, b } : { r, g, b, a };
}

const toHex2 = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0");

export function rgbToHex({ r, g, b, a }: RGB): string {
  const base = `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`.toUpperCase();
  return a === undefined || a >= 1
    ? base
    : `${base}${Math.round(clamp(a, 0, 1) * 255).toString(16).padStart(2, "0").toUpperCase()}`;
}

export function rgbToHsl({ r, g, b, a }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60; break;
      case gn: h = ((bn - rn) / d + 2) * 60; break;
      default: h = ((rn - gn) / d + 4) * 60;
    }
  }
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    ...(a === undefined ? {} : { a }),
  };
}

export function hslToRgb({ h, s, l, a }: HSL): RGB {
  const sn = s / 100, ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return a === undefined ? { r: v, g: v, b: v } : { r: v, g: v, b: v, a };
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hk = ((h % 360) + 360) % 360 / 360;
  const t = (n: number) => {
    let x = n; if (x < 0) x += 1; if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return {
    r: Math.round(t(hk + 1 / 3) * 255),
    g: Math.round(t(hk) * 255),
    b: Math.round(t(hk - 1 / 3) * 255),
    ...(a === undefined ? {} : { a }),
  };
}

export function formatRgb({ r, g, b, a }: RGB): string {
  return a === undefined || a >= 1
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${round(a, 2)})`;
}

export function formatHsl({ h, s, l, a }: HSL): string {
  return a === undefined || a >= 1
    ? `hsl(${h}, ${s}%, ${l}%)`
    : `hsla(${h}, ${s}%, ${l}%, ${round(a, 2)})`;
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function round(n: number, digits: number) { const p = 10 ** digits; return Math.round(n * p) / p; }
