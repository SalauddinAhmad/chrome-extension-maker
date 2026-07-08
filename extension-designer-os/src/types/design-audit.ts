import type { Entity } from "./entity";

export type AuditGrade = "A" | "B" | "C" | "D" | "F";

export type AuditCategoryId =
  | "color"
  | "typography"
  | "layout"
  | "components"
  | "accessibility"
  | "visual";

export const AUDIT_CATEGORY_LABEL: Record<AuditCategoryId, string> = {
  color: "Color System",
  typography: "Typography",
  layout: "Layout",
  components: "Components",
  accessibility: "Accessibility",
  visual: "Visual Design",
};

export type AuditIssueSeverity = "info" | "warning" | "critical";

export interface AuditScore {
  category: AuditCategoryId;
  score: number;          // 0-100
  weight: number;         // 0-1
  notes?: string;
}

export interface AuditIssue {
  id: string;
  category: AuditCategoryId;
  severity: AuditIssueSeverity;
  title: string;
  detail?: string;
}

export interface AuditRecommendation {
  id: string;
  category: AuditCategoryId;
  title: string;
  detail: string;
}

export interface DesignAudit extends Entity {
  projectId?: string;
  reportId: string;
  url: string;
  title: string;
  favicon?: string;

  overall: number;        // 0-100
  grade: AuditGrade;

  scores: AuditScore[];
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
}
