import type { Entity } from "./entity";

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

/** Where the color came from. */
export type ColorSource =
  | "picker"
  | "website"
  | "inspiration"
  | "asset"
  | "manual";

export const COLOR_SOURCE_LABEL: Record<ColorSource, string> = {
  picker: "Picker",
  website: "Website",
  inspiration: "Inspiration",
  asset: "Asset",
  manual: "Manual",
};

export interface StoredColor extends Entity {
  name: string | null;
  hex: string;
  rgb: { r: number; g: number; b: number; a?: number };
  hsl: { h: number; s: number; l: number; a?: number };
  source?: ColorSource;
  favorite?: boolean;
  tags?: string[];
  sourceUrl?: string;
  paletteId?: string;
  projectId?: string;
}

export type BrandRole =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export const BRAND_ROLES: BrandRole[] = [
  "primary",
  "secondary",
  "accent",
  "success",
  "warning",
  "danger",
  "neutral",
];

export interface ColorPalette extends Entity {
  name: string;
  colorIds: string[];
  sourceUrl?: string;
  projectId?: string;
}
