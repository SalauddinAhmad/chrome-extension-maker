export type ScannedKind = "image" | "svg" | "background" | "video" | "icon";

export interface ScannedAsset {
  id: string;              // stable-ish key (url + kind)
  kind: ScannedKind;
  url: string;             // absolute URL or data: URL
  filename: string;
  width?: number;
  height?: number;
  alt?: string;
  mimeGuess?: string;
}

export type AssetTab = "all" | ScannedKind;
