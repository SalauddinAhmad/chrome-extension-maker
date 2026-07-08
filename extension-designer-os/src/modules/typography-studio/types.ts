export type TypeTab =
  | "detect"
  | "library"
  | "inspector"
  | "system"
  | "pairs"
  | "scale"
  | "readability"
  | "export";

export interface DetectedFont {
  family: string;
  stack: string;
  weights: number[];
  sizes: number[];
  sampleTag: string;
  count: number;
  isSystem: boolean;
}

/**
 * Typography hierarchy sample harvested by the Typography Inspector.
 * `tag` is one of h1..h6, body, small. `sample` is a short excerpt.
 */
export interface InspectedStyle {
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "small";
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  sample: string;
  count: number;
}
