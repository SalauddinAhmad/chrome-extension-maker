import type { Entity } from "./entity";

export interface StoredFont extends Entity {
  family: string;
  weights: number[];
  styles: Array<"normal" | "italic">;
  category?: "serif" | "sans-serif" | "display" | "handwriting" | "monospace";
  source: "google" | "adobe" | "system" | "custom";
  previewUrl?: string;
  sourceUrl?: string;
  projectId?: string;
}

export interface FontPair extends Entity {
  headingFontId: string;
  bodyFontId: string;
  notes?: string;
  projectId?: string;
}
