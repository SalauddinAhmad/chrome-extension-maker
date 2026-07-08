import type { Entity } from "./entity";

export type AssetKind = "image" | "svg" | "icon" | "logo" | "video" | "gif";

export interface Asset extends Entity {
  kind: AssetKind;
  filename: string;
  mimeType: string;
  sourceUrl: string;
  pageUrl?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
  // Binary lives in a separate Dexie table (asset_blobs) keyed by asset id.
}
