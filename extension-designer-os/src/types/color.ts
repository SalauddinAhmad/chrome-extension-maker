import type { Entity } from "./entity";

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

export interface StoredColor extends Entity {
  name: string | null;
  hex: string;
  rgb: { r: number; g: number; b: number; a?: number };
  hsl: { h: number; s: number; l: number; a?: number };
  sourceUrl?: string;
  paletteId?: string;
  projectId?: string;
  tags?: string[];
}

export interface ColorPalette extends Entity {
  name: string;
  colorIds: string[];
  sourceUrl?: string;
  projectId?: string;
}
