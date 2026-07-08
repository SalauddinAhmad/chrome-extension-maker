import type { StoredColor } from "@/types";
import { generateTailwindScale } from "./palette";
import { formatHsl, formatRgb } from "./convert";

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "color";
}

function uniqueNames(colors: StoredColor[]): Array<{ color: StoredColor; key: string }> {
  const seen = new Set<string>();
  return colors.map((c, i) => {
    const base = c.name ? slugify(c.name) : `color-${i + 1}`;
    let key = base;
    let n = 2;
    while (seen.has(key)) key = `${base}-${n++}`;
    seen.add(key);
    return { color: c, key };
  });
}

export function exportCssVariables(colors: StoredColor[]): string {
  const lines = uniqueNames(colors).map(({ color, key }) => `  --${key}: ${color.hex};`);
  return `:root {\n${lines.join("\n")}\n}\n`;
}

export function exportScssVariables(colors: StoredColor[]): string {
  const lines = uniqueNames(colors).map(({ color, key }) => `$${key}: ${color.hex};`);
  return `${lines.join("\n")}\n`;
}

export function exportJson(colors: StoredColor[]): string {
  return JSON.stringify(
    colors.map((c) => ({
      name: c.name ?? null,
      hex: c.hex,
      rgb: formatRgb(c.rgb),
      hsl: formatHsl(c.hsl),
      source: c.source ?? null,
      tags: c.tags ?? [],
    })),
    null,
    2,
  );
}

export function exportTailwindConfig(colors: StoredColor[]): string {
  const entries: string[] = [];
  for (const { color, key } of uniqueNames(colors)) {
    const scale = generateTailwindScale(color.hex);
    const scaleBody = Object.entries(scale)
      .map(([k, v]) => `        "${k}": "${v}"`)
      .join(",\n");
    entries.push(`      "${key}": {\n${scaleBody}\n      }`);
  }
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${entries.join(",\n")}\n      }\n    }\n  }\n};\n`;
}
