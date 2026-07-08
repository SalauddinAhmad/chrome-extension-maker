export type TypeTab = "detect" | "library" | "pairs";

export interface DetectedFont {
  family: string;           // primary family (first in stack)
  stack: string;            // full font-family value
  weights: number[];
  sizes: number[];          // in px, unique rounded
  sampleTag: string;        // e.g. "h1", "p"
  count: number;
  isSystem: boolean;
}
