import type { Entity } from "./entity";

export type A11yGrade = "A" | "B" | "C" | "D" | "F";

export type A11yCategoryId =
  | "contrast"
  | "headings"
  | "images"
  | "forms"
  | "links"
  | "structure";

export const A11Y_CATEGORY_LABEL: Record<A11yCategoryId, string> = {
  contrast: "Color Contrast",
  headings: "Headings",
  images: "Images",
  forms: "Forms",
  links: "Links",
  structure: "Structure & Landmarks",
};

export type A11ySeverity = "info" | "warning" | "critical";

/** Scanner-collected page data — pure data, no DOM refs. */
export interface A11yScanData {
  url: string;
  title: string;
  favicon?: string;

  contrast: {
    samples: number;
    aaFails: Array<{ ratio: number; fg: string; bg: string; text?: string }>;
    aaaFails: number;
  };
  headings: {
    counts: Record<string, number>; // h1..h6
    order: string[];                 // ["h1","h2","h3",...] page order
    missingH1: boolean;
    multipleH1: boolean;
    skipped: Array<{ from: string; to: string }>;
  };
  images: {
    total: number;
    missingAlt: number;
    emptyAlt: number;
    decorative: number;
  };
  forms: {
    totalInputs: number;
    missingLabel: number;
    missingPlaceholder: number;
    missingDescription: number;
  };
  links: {
    total: number;
    empty: number;
    missingName: number;
  };
  structure: {
    hasMain: boolean;
    mainCount: number;
    hasNav: boolean;
    hasHeader: boolean;
    hasFooter: boolean;
    landmarkCount: number;
    semanticRatio: number; // semantic elements / total block-level elements
  };
}

export interface A11yScore {
  category: A11yCategoryId;
  score: number;  // 0-100
  weight: number; // 0-1
  notes?: string;
}

export interface A11yIssue {
  id: string;
  category: A11yCategoryId;
  severity: A11ySeverity;
  wcag?: string;    // e.g. "1.4.3", "1.1.1"
  level?: "A" | "AA" | "AAA";
  title: string;
  detail?: string;
}

export interface A11yRecommendation {
  id: string;
  category: A11yCategoryId;
  title: string;
  detail: string;
}

export interface AccessibilityReport extends Entity {
  projectId?: string;
  reportId?: string;
  url: string;
  title: string;
  favicon?: string;

  overall: number;    // 0-100
  grade: A11yGrade;

  scores: A11yScore[];
  issues: A11yIssue[];
  recommendations: A11yRecommendation[];
  scan: A11yScanData;
}
