export type InspectorTab = "colors" | "type" | "spacing" | "effects";

export interface DesignDNA {
  colors: Array<{ hex: string; count: number; roles: string[] }>;
  fonts: Array<{ family: string; count: number }>;
  fontSizes: Array<{ px: number; count: number }>;
  radii: Array<{ value: string; count: number }>;
  shadows: Array<{ value: string; count: number }>;
  spacings: Array<{ px: number; count: number }>;
  scannedElements: number;
}
