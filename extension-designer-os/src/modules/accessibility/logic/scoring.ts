/**
 * Pure scoring engine — consumes A11yScanData, emits scores, issues,
 * recommendations. No storage, no DOM.
 */
import type {
  A11yCategoryId,
  A11yGrade,
  A11yIssue,
  A11yRecommendation,
  A11yScanData,
  A11yScore,
  A11ySeverity,
} from "@/types";

export const A11Y_WEIGHTS: Record<A11yCategoryId, number> = {
  contrast: 0.25,
  headings: 0.15,
  images: 0.15,
  forms: 0.2,
  links: 0.15,
  structure: 0.1,
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

interface Bucket {
  scores: A11yScore[];
  issues: A11yIssue[];
  recs: A11yRecommendation[];
}

function push(b: Bucket, category: A11yCategoryId, score: number, notes?: string) {
  b.scores.push({
    category,
    score: Math.round(clamp(score)),
    weight: A11Y_WEIGHTS[category],
    notes,
  });
}
function issue(
  b: Bucket,
  category: A11yCategoryId,
  severity: A11ySeverity,
  title: string,
  detail?: string,
  wcag?: string,
  level?: "A" | "AA" | "AAA",
) {
  b.issues.push({
    id: `${category}-${b.issues.length + 1}`,
    category, severity, title, detail, wcag, level,
  });
}
function rec(b: Bucket, category: A11yCategoryId, title: string, detail: string) {
  b.recs.push({ id: `${category}-r${b.recs.length + 1}`, category, title, detail });
}

/* -------- categories -------- */

function scoreContrast(s: A11yScanData, b: Bucket) {
  const { samples, aaFails, aaaFails } = s.contrast;
  let score = 100;
  if (samples === 0) {
    push(b, "contrast", 70, "No visible text sampled.");
    return;
  }
  const aaRate = aaFails.length / samples;
  const aaaRate = aaaFails / samples;
  score -= aaRate * 100;
  score -= aaaRate * 20;
  if (aaFails.length > 0) {
    issue(
      b, "contrast", aaFails.length > 5 ? "critical" : "warning",
      `${aaFails.length} text sample${aaFails.length === 1 ? "" : "s"} fail WCAG AA`,
      `Contrast below 4.5:1 (or 3:1 for large text).`,
      "1.4.3", "AA",
    );
    rec(b, "contrast", "Increase text contrast",
      "Darken text or lighten backgrounds so contrast reaches 4.5:1 for body copy and 3:1 for large text.");
  }
  if (aaaRate > 0.3) {
    rec(b, "contrast", "Aim for WCAG AAA where possible",
      `${aaaFails} samples fall below 7:1 — bump body copy for maximum readability.`);
  }
  push(b, "contrast", score, `${samples} samples · ${aaFails.length} AA fail · ${aaaFails} AAA fail`);
}

function scoreHeadings(s: A11yScanData, b: Bucket) {
  const { counts, missingH1, multipleH1, skipped } = s.headings;
  let score = 100;
  if (missingH1) {
    score -= 30;
    issue(b, "headings", "critical", "Missing H1", "Every page needs exactly one H1.",
      "1.3.1", "A");
    rec(b, "headings", "Add a single H1", "Introduce the page with one meaningful H1 near the top.");
  }
  if (multipleH1) {
    score -= 20;
    issue(b, "headings", "warning", `${counts.h1} H1 elements found`,
      "Multiple H1s hurt document structure.", "1.3.1", "A");
    rec(b, "headings", "Keep a single H1", "Demote extra H1s to H2 to preserve hierarchy.");
  }
  if (skipped.length > 0) {
    score -= Math.min(30, skipped.length * 10);
    issue(b, "headings", "warning", `${skipped.length} skipped heading level${skipped.length === 1 ? "" : "s"}`,
      skipped.map((x) => `${x.from} → ${x.to}`).join(", "),
      "1.3.1", "A");
    rec(b, "headings", "Never skip heading levels",
      "Follow H1 → H2 → H3 order without gaps for assistive tech to build an accurate outline.");
  }
  push(b, "headings", score,
    `H1:${counts.h1} H2:${counts.h2} H3:${counts.h3} · ${skipped.length} skips`);
}

function scoreImages(s: A11yScanData, b: Bucket) {
  const { total, missingAlt } = s.images;
  let score = 100;
  if (total === 0) {
    push(b, "images", 100, "No images on page.");
    return;
  }
  const rate = missingAlt / total;
  score -= rate * 100;
  if (missingAlt > 0) {
    issue(
      b, "images", missingAlt > 3 ? "critical" : "warning",
      `${missingAlt} image${missingAlt === 1 ? "" : "s"} missing alt`,
      "Screen readers cannot describe these images.",
      "1.1.1", "A",
    );
    rec(b, "images", "Add alt text",
      "Provide alt describing the image's purpose, or alt=\"\" if purely decorative.");
  }
  push(b, "images", score, `${total} images · ${missingAlt} missing alt`);
}

function scoreForms(s: A11yScanData, b: Bucket) {
  const { totalInputs, missingLabel, missingPlaceholder, missingDescription } = s.forms;
  let score = 100;
  if (totalInputs === 0) {
    push(b, "forms", 100, "No form controls on page.");
    return;
  }
  const labelRate = missingLabel / totalInputs;
  score -= labelRate * 100;
  if (missingLabel > 0) {
    issue(
      b, "forms", missingLabel > 2 ? "critical" : "warning",
      `${missingLabel} input${missingLabel === 1 ? "" : "s"} missing label`,
      "Every form control needs a programmatically associated label.",
      "3.3.2", "A",
    );
    rec(b, "forms", "Associate labels",
      "Wrap the input in a <label> or use for=/id, aria-label, or aria-labelledby.");
  }
  if (missingPlaceholder > totalInputs * 0.7 && totalInputs > 2) {
    score -= 5;
    issue(b, "forms", "info", "Most inputs lack placeholders",
      "Placeholders help sighted users but never replace labels.");
  }
  if (missingDescription > 0 && missingDescription === totalInputs) {
    score -= 5;
    rec(b, "forms", "Add helper descriptions",
      "Use aria-describedby to link inputs to hint or error text.");
  }
  push(b, "forms", score,
    `${totalInputs} inputs · ${missingLabel} unlabelled`);
}

function scoreLinks(s: A11yScanData, b: Bucket) {
  const { total, empty, missingName } = s.links;
  let score = 100;
  if (total === 0) {
    push(b, "links", 100, "No links on page.");
    return;
  }
  const nameRate = missingName / total;
  score -= nameRate * 100;
  score -= Math.min(20, (empty / total) * 40);
  if (missingName > 0) {
    issue(b, "links", "critical", `${missingName} link${missingName === 1 ? "" : "s"} lack an accessible name`,
      "Icon or image links need aria-label or descriptive alt.",
      "2.4.4", "A");
    rec(b, "links", "Name every link",
      "Give icon-only links aria-label describing the destination.");
  }
  if (empty > 0) {
    issue(b, "links", "warning", `${empty} empty href link${empty === 1 ? "" : "s"}`,
      "Links pointing to # or nothing are not keyboard-usable navigation.");
    rec(b, "links", "Use buttons for actions", "Replace <a href=\"#\"> with <button> for JavaScript-only actions.");
  }
  push(b, "links", score, `${total} links · ${missingName} unnamed · ${empty} empty`);
}

function scoreStructure(s: A11yScanData, b: Bucket) {
  const { hasMain, mainCount, hasNav, hasHeader, hasFooter, semanticRatio } = s.structure;
  let score = 100;
  if (!hasMain) {
    score -= 30;
    issue(b, "structure", "critical", "Missing <main> landmark",
      "Screen readers need a main landmark to skip navigation.",
      "1.3.1", "A");
    rec(b, "structure", "Wrap primary content in <main>",
      "Every page should have exactly one <main> containing its unique content.");
  } else if (mainCount > 1) {
    score -= 15;
    issue(b, "structure", "warning", `${mainCount} <main> landmarks found`,
      "Exactly one <main> per page.", "1.3.1", "A");
  }
  if (!hasNav) {
    score -= 10;
    issue(b, "structure", "info", "No <nav> landmark", "Navigation regions help assistive tech skip menus.");
  }
  if (!hasHeader) score -= 5;
  if (!hasFooter) score -= 5;
  if (semanticRatio < 0.15) {
    score -= 15;
    issue(b, "structure", "warning", "Low semantic HTML ratio",
      `Only ${Math.round(semanticRatio * 100)}% of block containers use semantic tags.`);
    rec(b, "structure", "Use semantic elements",
      "Replace generic <div>s with <section>, <article>, <header>, <footer> where meaningful.");
  }
  push(b, "structure", score,
    `main:${hasMain ? "y" : "n"} nav:${hasNav ? "y" : "n"} header:${hasHeader ? "y" : "n"} footer:${hasFooter ? "y" : "n"}`);
}

/* -------- public -------- */

export function computeGrade(overall: number): A11yGrade {
  if (overall >= 90) return "A";
  if (overall >= 80) return "B";
  if (overall >= 70) return "C";
  if (overall >= 60) return "D";
  return "F";
}

export function scoreAccessibility(scan: A11yScanData): {
  scores: A11yScore[];
  issues: A11yIssue[];
  recommendations: A11yRecommendation[];
  overall: number;
  grade: A11yGrade;
} {
  const b: Bucket = { scores: [], issues: [], recs: [] };
  scoreContrast(scan, b);
  scoreHeadings(scan, b);
  scoreImages(scan, b);
  scoreForms(scan, b);
  scoreLinks(scan, b);
  scoreStructure(scan, b);
  const overall = Math.round(b.scores.reduce((acc, s) => acc + s.score * s.weight, 0));
  return {
    scores: b.scores,
    issues: b.issues,
    recommendations: b.recs,
    overall,
    grade: computeGrade(overall),
  };
}
