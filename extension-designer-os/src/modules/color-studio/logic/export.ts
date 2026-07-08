import type { StoredColor } from "@/types";
import { generateTailwindScale } from "./palette";
import { formatHsl, formatRgb } from "./convert";

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "color";
}

export function exportCssVariables(colors: StoredColor[]): string {
  const lines = colors.map((c, i) => {
    const name = c.name ? slugify(c.name) : `color-${i + 1}`;
    return `  --${name}: ${c.hex};`;
  });
  return `:root {\n${lines.join("\n")}\n}\n`;
}

export function exportJson(colors: StoredColor[]): string {
  return JSON.stringify(
    colors.map((c) => ({
      name: c.name ?? null,
      hex: c.hex,
      rgb: formatRgb(c.rgb),
      hsl: formatHsl(c.hsl),
    })),
    null,
    2,
  );
}

export function exportTailwindConfig(colors: StoredColor[]): string {
  const entries: string[] = [];
  const seen = new Set<string>();
  for (const c of colors) {
    const base = c.name ? slugify(c.name) : `brand-${entries.length + 1}`;
    let key = base;
    let n = 2;
    while (seen.has(key)) key = `${base}-${n++}`;
    seen.add(key);
    const scale = generateTailwindScale(c.hex);
    const scaleBody = Object.entries(scale)
      .map(([k, v]) => `        "${k}": "${v}"`)
      .join(",\n");
    entries.push(`      "${key}": {\n${scaleBody}\n      }`);
  }
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${entries.join(",\n")}\n      }\n    }\n  }\n};\n`;
}
