export type ShotFormat = "png" | "jpeg";

export interface Shot {
  dataUrl: string;
  format: ShotFormat;
  width: number;
  height: number;
  pageTitle: string;
  pageUrl: string;
  createdAt: number;
}
