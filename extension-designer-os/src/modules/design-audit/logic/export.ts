import type { DesignAudit } from "@/types";
import { AUDIT_CATEGORY_LABEL } from "@/types";

export type ExportFormat = "json" | "pdf-ready";

/**
 * PDF-ready structure — hierarchical, print-friendly JSON that a PDF
 * generator can consume directly (each block maps to a printable section).
 */
export interface PdfReadyAudit {
  meta: { title: string; url: string; generatedAt: string };
  headline: { overall: number; grade: string };
  categories: Array<{
    id: string;
    label: string;
    score: number;
    weight: number;
    notes?: string;
  }>;
  issues: Array<{ severity: string; category: string; title: string; detail?: string }>;
  recommendations: Array<{ category: string; title: string; detail: string }>;
}

export function toPdfReady(audit: DesignAudit): PdfReadyAudit {
  return {
    meta: {
      title: audit.title,
      url: audit.url,
      generatedAt: new Date(audit.createdAt).toISOString(),
    },
    headline: { overall: audit.overall, grade: audit.grade },
    categories: audit.scores.map((s) => ({
      id: s.category,
      label: AUDIT_CATEGORY_LABEL[s.category],
      score: s.score,
      weight: s.weight,
      notes: s.notes,
    })),
    issues: audit.issues.map((i) => ({
      severity: i.severity,
      category: AUDIT_CATEGORY_LABEL[i.category],
      title: i.title,
      detail: i.detail,
    })),
    recommendations: audit.recommendations.map((r) => ({
      category: AUDIT_CATEGORY_LABEL[r.category],
      title: r.title,
      detail: r.detail,
    })),
  };
}

export function exportAudit(audit: DesignAudit, format: ExportFormat): string {
  if (format === "pdf-ready") return JSON.stringify(toPdfReady(audit), null, 2);
  return JSON.stringify(audit, null, 2);
}

export function downloadText(text: string, filename: string, mime = "application/json"): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
