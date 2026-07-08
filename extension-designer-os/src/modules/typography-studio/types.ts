export type TypeTab = "detect" | "library" | "pairs" | "scale" | "export";

export interface DetectedFont {
  family: string;
  stack: string;
  weights: number[];
  sizes: number[];
  sampleTag: string;
  count: number;
  isSystem: boolean;
}
