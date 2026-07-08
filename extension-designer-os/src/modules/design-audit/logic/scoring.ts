/**
 * Scoring engine — pure functions. Consumes a `DesignReport` from the
 * Design Inspector and produces category scores, issues, and
 * recommendations. No storage, no side effects.
 */
import type {
  AuditCategoryId,
  AuditGrade,
  AuditIssue,
  AuditIssueSeverity,
  AuditRecommendation,
  AuditScore,
  DesignReport,
} from "@/types";

export const CATEGORY_WEIGHTS: Record<AuditCategoryId, number> = {
  color: 0.2,
  typography: 0.2,
  layout: 0.15,
  components: 0.15,
  accessibility: 0.2,
  visual: 0.1,
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(h) && !/^[0-9a-fA-F]{3}$/.test(h)) return null;
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function relLum({ r, g, b }: { r: number; g: number; b: number }): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRatio(a: string, b: string): number | null {
  const ra = hexToRgb(a), rb = hexToRgb(b);
  if (!ra || !rb) return null;
  const la = relLum(ra), lb = relLum(rb);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

interface Bucket {
  scores: AuditScore[];
  issues: AuditIssue[];
  recs: AuditRecommendation[];
}
function push(
  b: Bucket,
  category: AuditCategoryId,
  score: number,
  notes?: string,
) {
  b.scores.push({ category, score: Math.round(clamp(score)), weight: CATEGORY_WEIGHTS[category], notes });
}
function issue(
  b: Bucket,
  category: AuditCategoryId,
  severity: AuditIssueSeverity,
  title: string,
  detail?: string,
) {
  b.issues.push({ id: `${category}-${b.issues.length + 1}`, category, severity, title, detail });
}
function rec(b: Bucket, category: AuditCategoryId, title: string, detail: string) {
  b.recs.push({ id: `${category}-r${b.recs.length + 1}`, category, title, detail });
}

/* -------- categories -------- */

function scoreColor(r: DesignReport, b: Bucket) {
  const total = r.colors.length;
  let s = 100;
  if (total > 20) {
    s -= (total - 20) * 3;
    issue(b, "color", "warning", `${total} distinct colors detected`, "Large palettes hurt visual consistency.");
    rec(b, "color", "Consolidate the palette", "Aim for 8-12 core colors covering brand, neutral, and semantic roles.");
  } else if (total < 4) {
    s -= 15;
    issue(b, "color", "info", "Very small palette", "Only a few colors were sampled — hierarchy may be weak.");
  }
  // hierarchy — is a dominant color present?
  const top = r.colors[0]?.count ?? 0;
  const second = r.colors[1]?.count ?? 1;
  const ratio = second > 0 ? top / second : 1;
  if (ratio < 1.3 && total > 6) {
    s -= 10;
    rec(b, "color", "Establish a dominant surface color", "One background color should clearly dominate to anchor the layout.");
  }
  push(b, "color", s, `${total} unique · dominance ${ratio.toFixed(2)}×`);
}

function scoreTypography(r: DesignReport, b: Bucket) {
  const families = r.fonts.length;
  const sizes = r.fontSizes.length;
  let s = 100;
  if (families > 3) {
    s -= (families - 3) * 15;
    issue(b, "typography", "warning", `${families} font families detected`, "Too many font families detected.");
    rec(b, "typography", "Reduce font families", "Limit to 2 families (heading + body) plus an optional mono.");
  }
  if (sizes < 4) {
    s -= 20;
    issue(b, "typography", "warning", "Weak type scale", `${sizes} distinct sizes — hierarchy is flat.`);
    rec(b, "typography", "Build a modular type scale", "Define at least 5 sizes (caption → display) for clear hierarchy.");
  } else if (sizes > 12) {
    s -= 15;
    issue(b, "typography", "warning", "Type scale is fragmented", `${sizes} distinct sizes.`);
    rec(b, "typography", "Consolidate sizes", "Snap sizes to a scale (e.g. 12, 14, 16, 20, 24, 32, 48).");
  }
  const bodySize = r.fontSizes.find((x) => x.px >= 14 && x.px <= 18);
  if (!bodySize) {
    s -= 10;
    issue(b, "typography", "info", "Body size out of comfort range", "No 14-18px sizes found — readability suffers.");
  }
  push(b, "typography", s, `${families} families · ${sizes} sizes`);
}

function scoreLayout(r: DesignReport, b: Bucket) {
  const { sectionCount, gridCount, flexCount, contentWidth, viewportWidth } = r.layout;
  let s = 100;
  if (sectionCount < 2) {
    s -= 20;
    issue(b, "layout", "info", "Few structural sections", "Only " + sectionCount + " section/article elements found.");
    rec(b, "layout", "Use semantic sections", "Wrap distinct page regions in <section> or <article> for structure.");
  }
  if (gridCount === 0 && flexCount < 3) {
    s -= 15;
    rec(b, "layout", "Adopt modern layout primitives", "Use CSS grid or flex for repeatable, responsive structure.");
  }
  if (contentWidth && viewportWidth && contentWidth > viewportWidth * 0.98 && viewportWidth > 1024) {
    s -= 10;
    issue(b, "layout", "info", "No max content width", "Content spans nearly the entire viewport.");
    rec(b, "layout", "Add a container width", "Cap content at ~1200-1440px for comfortable reading.");
  }
  push(b, "layout", s, `${sectionCount} sections · ${gridCount} grid · ${flexCount} flex`);
}

function scoreComponents(r: DesignReport, b: Bucket) {
  const map = Object.fromEntries(r.components.map((c) => [c.kind, c.count]));
  let s = 100;
  const buttons = map.button ?? 0;
  const forms = map.form ?? 0;
  const inputs = map.input ?? 0;

  if (buttons === 0) {
    s -= 15;
    issue(b, "components", "info", "No buttons detected", "Call-to-action elements are essential for conversion.");
  }
  // Button radius consistency uses top radii
  const radiiCount = r.radii.length;
  if (buttons > 4 && radiiCount > 4) {
    s -= 15;
    issue(b, "components", "warning", "Button radius inconsistent", `${radiiCount} distinct radii found.`);
    rec(b, "components", "Standardize border radii", "Reduce to 2-3 shared radius tokens (e.g. sm, md, full).");
  }
  if (forms > 0 && inputs === 0) {
    s -= 10;
    issue(b, "components", "warning", "Forms without inputs", "Forms detected but no input elements.");
  }
  const total = buttons + forms + inputs + (map.card ?? 0) + (map.nav ?? 0);
  if (total < 3) {
    s -= 10;
    rec(b, "components", "Increase component reuse", "Build reusable Button, Input, Card and Nav primitives.");
  }
  push(b, "components", s, `${buttons} btn · ${inputs} input · ${forms} form`);
}

function scoreAccessibility(r: DesignReport, b: Bucket) {
  let s = 100;
  const bg = r.colors.find((c) => c.roles.includes("bg"))?.hex;
  const fg = r.colors.find((c) => c.roles.includes("text"))?.hex;
  if (bg && fg) {
    const ratio = contrastRatio(bg, fg);
    if (ratio != null) {
      if (ratio < 4.5) {
        s -= 30;
        issue(b, "accessibility", "critical", "Low contrast ratio detected", `${ratio.toFixed(2)}:1 for primary text on primary background (WCAG AA requires 4.5:1).`);
        rec(b, "accessibility", "Improve text contrast", "Darken text or lighten background so the ratio reaches 4.5:1.");
      } else if (ratio < 7) {
        s -= 10;
        rec(b, "accessibility", "Target WCAG AAA where possible", `Contrast is ${ratio.toFixed(2)}:1 — bump to 7:1 for body copy.`);
      }
    }
  } else {
    s -= 10;
    issue(b, "accessibility", "info", "Text/background colors not identified", "Could not evaluate primary contrast.");
  }
  // Heading structure — proxy: presence of large sizes
  const large = r.fontSizes.filter((x) => x.px >= 24).length;
  if (large < 2) {
    s -= 10;
    issue(b, "accessibility", "warning", "Weak heading hierarchy", "Few large text sizes found — headings may be missing.");
    rec(b, "accessibility", "Use semantic headings", "Ensure H1-H3 sizes are distinct and used consistently.");
  }
  push(b, "accessibility", s);
}

function scoreVisual(r: DesignReport, b: Bucket) {
  let s = 100;
  if (r.radii.length > 5) {
    s -= 15;
    issue(b, "visual", "warning", "Border radius inconsistent", `${r.radii.length} distinct values.`);
    rec(b, "visual", "Consolidate radii", "Reduce to a small set of tokens (sm, md, lg, full).");
  }
  if (r.shadows.length > 4) {
    s -= 15;
    issue(b, "visual", "warning", "Shadow inconsistent", `${r.shadows.length} distinct shadows.`);
    rec(b, "visual", "Define an elevation scale", "Standardize on 3-4 elevation shadows.");
  }
  if (r.spacings.length > 10) {
    s -= 10;
    issue(b, "visual", "info", "Spacing scale is fragmented", `${r.spacings.length} distinct padding values.`);
    rec(b, "visual", "Snap to a spacing scale", "Use a base-4 or base-8 spacing scale for consistency.");
  }
  push(b, "visual", s, `${r.radii.length} radii · ${r.shadows.length} shadows · ${r.spacings.length} spacings`);
}

/* -------- public API -------- */

export function computeGrade(overall: number): AuditGrade {
  if (overall >= 90) return "A";
  if (overall >= 80) return "B";
  if (overall >= 70) return "C";
  if (overall >= 60) return "D";
  return "F";
}

export function auditReport(report: DesignReport): {
  scores: AuditScore[];
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
  overall: number;
  grade: AuditGrade;
} {
  const b: Bucket = { scores: [], issues: [], recs: [] };
  scoreColor(report, b);
  scoreTypography(report, b);
  scoreLayout(report, b);
  scoreComponents(report, b);
  scoreAccessibility(report, b);
  scoreVisual(report, b);

  const overall = Math.round(
    b.scores.reduce((acc, s) => acc + s.score * s.weight, 0),
  );
  return {
    scores: b.scores,
    issues: b.issues,
    recommendations: b.recs,
    overall,
    grade: computeGrade(overall),
  };
}
