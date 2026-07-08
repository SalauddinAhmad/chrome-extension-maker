/**
 * Typography System templates + exporters.
 */
import type { TypographyStyle, TypographySystem, StoredFont } from "@/types";

const uid = () =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Default style set: Display / H1–H3 / Body / Caption. */
export function defaultStyles(headingFamily: string, bodyFamily: string): TypographyStyle[] {
  return [
    { id: uid(), name: "Display", fontFamily: headingFamily, fontWeight: 700, fontSize: 56, lineHeight: 1.1, letterSpacing: -0.02, usage: "Hero titles" },
    { id: uid(), name: "H1",      fontFamily: headingFamily, fontWeight: 700, fontSize: 40, lineHeight: 1.15, letterSpacing: -0.02, usage: "Page titles" },
    { id: uid(), name: "H2",      fontFamily: headingFamily, fontWeight: 600, fontSize: 32, lineHeight: 1.2, letterSpacing: -0.01, usage: "Section titles" },
    { id: uid(), name: "H3",      fontFamily: headingFamily, fontWeight: 600, fontSize: 24, lineHeight: 1.25, letterSpacing: 0, usage: "Sub-sections" },
    { id: uid(), name: "Body",    fontFamily: bodyFamily,    fontWeight: 400, fontSize: 16, lineHeight: 1.6, letterSpacing: 0, usage: "Paragraphs" },
    { id: uid(), name: "Caption", fontFamily: bodyFamily,    fontWeight: 400, fontSize: 12, lineHeight: 1.4, letterSpacing: 0.02, usage: "Meta / captions" },
  ];
}

export function makeStyle(name: string, fontFamily: string): TypographyStyle {
  return {
    id: uid(),
    name,
    fontFamily,
    fontWeight: 400,
    fontSize: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
  };
}

// ─── Exporters ────────────────────────────────────────────────
function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function exportSystemCss(system: TypographySystem): string {
  const lines = system.styles.map((s) => {
    const k = slug(s.name);
    return `  --font-${k}-family: "${s.fontFamily}";
  --font-${k}-size: ${s.fontSize}px;
  --font-${k}-weight: ${s.fontWeight};
  --font-${k}-line-height: ${s.lineHeight};
  --font-${k}-letter-spacing: ${s.letterSpacing}em;`;
  });
  return `:root {\n${lines.join("\n")}\n}\n`;
}

export function exportSystemScss(system: TypographySystem): string {
  return system.styles.map((s) => {
    const k = slug(s.name);
    return `$font-${k}: (\n  family: "${s.fontFamily}",\n  size: ${s.fontSize}px,\n  weight: ${s.fontWeight},\n  line-height: ${s.lineHeight},\n  letter-spacing: ${s.letterSpacing}em\n);`;
  }).join("\n\n") + "\n";
}

export function exportSystemJson(system: TypographySystem): string {
  return JSON.stringify(
    system.styles.reduce<Record<string, unknown>>((acc, s) => {
      acc[slug(s.name)] = {
        fontFamily: s.fontFamily,
        fontSize: `${s.fontSize}px`,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        letterSpacing: `${s.letterSpacing}em`,
        usage: s.usage,
      };
      return acc;
    }, {}),
    null,
    2,
  );
}

export function exportSystemTailwind(system: TypographySystem): string {
  const entries = system.styles.map((s) => {
    const k = slug(s.name);
    return `      "${k}": ["${s.fontSize}px", { lineHeight: "${s.lineHeight}", letterSpacing: "${s.letterSpacing}em", fontWeight: "${s.fontWeight}" }]`;
  });
  return `module.exports = {\n  theme: {\n    extend: {\n      fontSize: {\n${entries.join(",\n")}\n      }\n    }\n  }\n}\n`;
}

/** Export saved fonts as a Tailwind fontFamily config. */
export function exportFontsTailwind(fonts: StoredFont[]): string {
  const entries = fonts.map((f) => `      "${slug(f.family)}": ['${f.family}', 'sans-serif']`);
  return `module.exports = {\n  theme: {\n    extend: {\n      fontFamily: {\n${entries.join(",\n")}\n      }\n    }\n  }\n}\n`;
}
