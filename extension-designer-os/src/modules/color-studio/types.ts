import type { StoredColor } from "@/types";

export type ColorFormat = "hex" | "rgb" | "hsl";

export type StudioTab = "picker" | "saved" | "gradient";

/** Result of the browser EyeDropper API — kept typed since @types/dom lacks it. */
export interface EyeDropperResult {
  sRGBHex: string;
}
export interface EyeDropperCtor {
  new (): { open: (opts?: { signal?: AbortSignal }) => Promise<EyeDropperResult> };
}

/** Minimal input used when creating a saved color from the picker. */
export type NewColorInput = Pick<StoredColor, "hex" | "rgb" | "hsl" | "name" | "sourceUrl">;

export interface GradientStop {
  color: string;
  position: number; // 0..100
}

export interface Gradient {
  type: "linear" | "radial";
  angle: number; // degrees, linear only
  stops: GradientStop[];
}
