import type { DesignReport } from "@/types";

export type ExportFormat = "json" | "css" | "tailwind";

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "token";
}

export function exportReport(report: DesignReport, format: ExportFormat): string {
  if (format === "json") return JSON.stringify(report, null, 2);

  if (format === "css") {
    const lines: string[] = [":root {"];
    report.colors.slice(0, 24).forEach((c, i) => {
      lines.push(`  --color-${i + 1}: ${c.hex};`);
    });
    report.fonts.slice(0, 4).forEach((f, i) => {
      lines.push(`  --font-${i + 1}: "${f.family}", sans-serif;`);
    });
    report.fontSizes.slice(0, 8).forEach((s) => {
      lines.push(`  --text-${s.px}: ${s.px}px;`);
    });
    report.radii.slice(0, 6).forEach((r, i) => {
      lines.push(`  --radius-${i + 1}: ${r.value};`);
    });
    report.shadows.slice(0, 4).forEach((s, i) => {
      lines.push(`  --shadow-${i + 1}: ${s.value};`);
    });
    lines.push("}");
    return lines.join("\n");
  }

  // tailwind
  const colors: Record<string, string> = {};
  report.colors.slice(0, 24).forEach((c, i) => {
    colors[c.hex.toLowerCase().replace("#", "") || `c${i + 1}`] = c.hex;
  });
  const fontFamily: Record<string, string[]> = {};
  report.fonts.slice(0, 4).forEach((f) => {
    fontFamily[slug(f.family)] = [f.family, "sans-serif"];
  });
  const borderRadius: Record<string, string> = {};
  report.radii.slice(0, 6).forEach((r, i) => {
    borderRadius[`r${i + 1}`] = r.value;
  });
  const boxShadow: Record<string, string> = {};
  report.shadows.slice(0, 4).forEach((s, i) => {
    boxShadow[`s${i + 1}`] = s.value;
  });
  const config = {
    theme: { extend: { colors, fontFamily, borderRadius, boxShadow } },
  };
  return `module.exports = ${JSON.stringify(config, null, 2)};`;
}

export function downloadText(text: string, filename: string, mime = "text/plain"): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
