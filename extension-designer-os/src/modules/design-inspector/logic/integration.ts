/**
 * Integration bridge — save report artifacts to other module libraries.
 */
import type { DesignReport } from "@/types";
import { colorRepository } from "@/modules/color-studio/repository";
import { typographyRepository } from "@/modules/typography-studio/repository";
import { assetRepository } from "@/modules/asset-extractor/repository";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16,
  );
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export async function saveColorsFromReport(
  report: DesignReport,
  limit = 12,
): Promise<number> {
  const items = report.colors.slice(0, limit).map((c) => {
    const rgb = hexToRgb(c.hex);
    return {
      name: null,
      hex: c.hex,
      rgb,
      hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
      source: "website" as const,
      sourceUrl: report.url,
      projectId: report.projectId,
      tags: c.roles,
    };
  });
  return colorRepository.createMany(items);
}

export async function saveFontsFromReport(
  report: DesignReport,
  limit = 6,
): Promise<number> {
  let saved = 0;
  for (const f of report.fonts.slice(0, limit)) {
    try {
      await typographyRepository.createFont({
        family: f.family,
        weights: f.weights?.length ? f.weights : [400],
        styles: ["normal"],
        source: "website",
        sourceUrl: report.url,
        projectId: report.projectId,
      });
      saved++;
    } catch { /* skip dupes */ }
  }
  return saved;
}

export async function saveAssetsFromReport(
  report: DesignReport,
  limit = 20,
): Promise<number> {
  let saved = 0;
  for (const a of report.assets.slice(0, limit)) {
    const ext = /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.exec(a.url)?.[1]?.toLowerCase();
    const type =
      a.kind === "svg" ? "svg" :
      ext === "jpg" || ext === "jpeg" ? "jpg" :
      ext === "png" ? "png" :
      ext === "webp" ? "webp" :
      ext === "gif" ? "gif" : "other";
    try {
      await assetRepository.create({
        name: a.alt || a.url.split("/").pop()?.split("?")[0] || "asset",
        type: type as never,
        url: a.url,
        thumbnail: a.url,
        source: "extraction",
        width: a.width,
        height: a.height,
        tags: [a.kind],
        pageUrl: report.url,
        projectId: report.projectId,
      });
      saved++;
    } catch { /* skip */ }
  }
  return saved;
}
