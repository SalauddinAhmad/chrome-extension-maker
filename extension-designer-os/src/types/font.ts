import type { Entity } from "./entity";

/** Broad font family classifications (see Phase 5 spec). */
export type FontCategory =
  | "sans-serif"
  | "serif"
  | "display"
  | "monospace"
  | "script"
  | "handwriting";

export const FONT_CATEGORY_LABEL: Record<FontCategory, string> = {
  "sans-serif": "Sans Serif",
  serif: "Serif",
  display: "Display",
  monospace: "Monospace",
  script: "Script",
  handwriting: "Handwritten",
};

/**
 * Where a saved font entry came from.
 * Extended from the original {google|adobe|system|custom} set to include
 * user-facing sources per Phase 5.
 */
export type FontSource =
  | "website"
  | "inspiration"
  | "asset"
  | "manual"
  | "google"
  | "adobe"
  | "system"
  | "custom";

export const FONT_SOURCE_LABEL: Record<FontSource, string> = {
  website: "Website",
  inspiration: "Inspiration",
  asset: "Asset",
  manual: "Manual",
  google: "Google",
  adobe: "Adobe",
  system: "System",
  custom: "Custom",
};

export interface StoredFont extends Entity {
  family: string;
  weights: number[];
  styles: Array<"normal" | "italic">;
  category?: FontCategory;
  source: FontSource;
  previewUrl?: string;
  sourceUrl?: string;
  projectId?: string;
  favorite?: boolean;
  tags?: string[];
  notes?: string;
}

export interface FontPair extends Entity {
  headingFontId: string;
  bodyFontId: string;
  notes?: string;
  projectId?: string;
}

/** Named typography style inside a system (e.g. H1, Body). */
export interface TypographyStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;      // px
  lineHeight: number;    // unitless multiplier
  letterSpacing: number; // em
  usage?: string;
}

export interface TypographySystem extends Entity {
  projectId?: string;
  name: string;
  styles: TypographyStyle[];
  favorite?: boolean;
  tags?: string[];
}
