import type { AccessibilityReport } from "@/types";
import { A11Y_CATEGORY_LABEL } from "@/types";

export type ExportFormat = "json" | "pdf-ready";

export interface PdfReadyA11y {
  meta: { title: string; url: string; generatedAt: string };
  headline: { overall: number; grade: string };
  categories: Array<{ id: string; label: string; score: number; weight: number; notes?: string }>;
  issues: Array<{ severity: string; category: string; title: string; detail?: string; wcag?: string; level?: string }>;
  recommendations: Array<{ category: string; title: string; detail: string }>;
}

export function toPdfReady(r: AccessibilityReport): PdfReadyA11y {
  return {
    meta: { title: r.title, url: r.url, generatedAt: new Date(r.createdAt).toISOString() },
    headline: { overall: r.overall, grade: r.grade },
    categories: r.scores.map((s) => ({
      id: s.category,
      label: A11Y_CATEGORY_LABEL[s.category],
      score: s.score,
      weight: s.weight,
      notes: s.notes,
    })),
    issues: r.issues.map((i) => ({
      severity: i.severity,
      category: A11Y_CATEGORY_LABEL[i.category],
      title: i.title,
      detail: i.detail,
      wcag: i.wcag,
      level: i.level,
    })),
    recommendations: r.recommendations.map((x) => ({
      category: A11Y_CATEGORY_LABEL[x.category],
      title: x.title,
      detail: x.detail,
    })),
  };
}

export function exportA11y(r: AccessibilityReport, format: ExportFormat): string {
  if (format === "pdf-ready") return JSON.stringify(toPdfReady(r), null, 2);
  return JSON.stringify(r, null, 2);
}

export function downloadText(text: string, filename: string, mime = "application/json"): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
