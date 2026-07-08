import type { StoredColor } from "@/types";

export type ColorFormat = "hex" | "rgb" | "hsl";

export type StudioTab =
  | "picker"
  | "library"
  | "palette"
  | "brand"
  | "contrast"
  | "gradient"
  | "export";

/** Result of the browser EyeDropper API — kept typed since @types/dom lacks it. */
export interface EyeDropperResult { sRGBHex: string }
export interface EyeDropperCtor {
  new (): { open: (opts?: { signal?: AbortSignal }) => Promise<EyeDropperResult> };
}

/** Minimal input used when creating a saved color from the picker. */
export type NewColorInput = Pick<StoredColor, "hex" | "rgb" | "hsl" | "name" | "sourceUrl">;

export interface GradientStop {
  color: string;
  position: number;
}

export interface Gradient {
  type: "linear" | "radial";
  angle: number;
  stops: GradientStop[];
}
