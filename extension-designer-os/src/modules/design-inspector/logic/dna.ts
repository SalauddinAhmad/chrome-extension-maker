import type { DesignDNA } from "../types";

/**
 * Runs inside the target page via chrome.scripting.executeScript.
 * Fully self-contained.
 */
export function scanDesignDNA(): DesignDNA {
  const rgbToHex = (input: string): string | null => {
    const m = input.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
    const [r, g, b, a = 1] = parts;
    if (a < 0.05) return null; // fully transparent — ignore
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
      .toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  const inc = <T>(map: Map<string, { key: string; count: number; extras: T }>, key: string, extras: T) => {
    const cur = map.get(key);
    if (cur) cur.count++;
    else map.set(key, { key, count: 1, extras });
  };

  const colors = new Map<string, { key: string; count: number; extras: Set<string> }>();
  const fonts = new Map<string, { count: number }>();
  const fontSizes = new Map<number, number>();
  const radii = new Map<string, number>();
  const shadows = new Map<string, number>();
  const spacings = new Map<number, number>();

  const pushColor = (raw: string, role: string) => {
    const hex = rgbToHex(raw);
    if (!hex) return;
    const bucket = colors.get(hex);
    if (bucket) {
      bucket.count++;
      bucket.extras.add(role);
    } else {
      colors.set(hex, { key: hex, count: 1, extras: new Set([role]) });
    }
  };

  const nodes = document.body?.querySelectorAll("*") ?? [];
  let scanned = 0;

  for (const el of Array.from(nodes)) {
    if (scanned > 3000) break;
    const rect = (el as HTMLElement).getBoundingClientRect?.();
    if (!rect || rect.width < 4 || rect.height < 4) continue;
    scanned++;

    const cs = getComputedStyle(el);

    // Colors
    if (cs.color) pushColor(cs.color, "text");
    if (cs.backgroundColor) pushColor(cs.backgroundColor, "bg");
    if (cs.borderTopColor && cs.borderTopWidth !== "0px") pushColor(cs.borderTopColor, "border");

    // Font family (primary only)
    const stack = cs.fontFamily;
    if (stack) {
      const primary = stack.split(",")[0].trim().replace(/^["']|["']$/g, "");
      if (primary) fonts.set(primary, { count: (fonts.get(primary)?.count ?? 0) + 1 });
    }

    // Font size
    const fs = Math.round(parseFloat(cs.fontSize));
    if (!Number.isNaN(fs) && fs >= 8 && fs <= 200) {
      fontSizes.set(fs, (fontSizes.get(fs) ?? 0) + 1);
    }

    // Border radius
    const r = cs.borderRadius;
    if (r && r !== "0px") radii.set(r, (radii.get(r) ?? 0) + 1);

    // Shadow
    const sh = cs.boxShadow;
    if (sh && sh !== "none") shadows.set(sh, (shadows.get(sh) ?? 0) + 1);

    // Spacing — sample padding
    for (const side of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"] as const) {
      const px = Math.round(parseFloat(cs[side] as string));
      if (!Number.isNaN(px) && px > 0 && px <= 128) {
        spacings.set(px, (spacings.get(px) ?? 0) + 1);
      }
    }
  }

  const topColors = Array.from(colors.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 24)
    .map((c) => ({ hex: c.key, count: c.count, roles: Array.from(c.extras) }));

  const topFonts = Array.from(fonts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([family, { count }]) => ({ family, count }));

  const topSizes = Array.from(fontSizes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([px, count]) => ({ px, count }));

  const topRadii = Array.from(radii.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([value, count]) => ({ value, count }));

  const topShadows = Array.from(shadows.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([value, count]) => ({ value, count }));

  const topSpacings = Array.from(spacings.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([px, count]) => ({ px, count }));

  return {
    colors: topColors,
    fonts: topFonts,
    fontSizes: topSizes,
    radii: topRadii,
    shadows: topShadows,
    spacings: topSpacings,
    scannedElements: scanned,
  };
}
