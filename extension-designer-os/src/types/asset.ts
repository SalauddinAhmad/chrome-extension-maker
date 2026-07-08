import type { Entity } from "./entity";

/** Extension-based type, matches the spec (png, jpg, ...). */
export type AssetType =
  | "png"
  | "jpg"
  | "jpeg"
  | "webp"
  | "svg"
  | "gif"
  | "pdf"
  | "mp4"
  | "lottie"
  | "other";

export type AssetSource =
  | "extraction"      // scanned from a webpage
  | "inspiration"     // captured alongside an inspiration
  | "screenshot"      // from screenshot studio
  | "upload";         // manual file upload

/**
 * Central Asset model shared across the Designer OS library.
 * Legacy fields (`kind`, `filename`, ...) remain optional for backward
 * compatibility with previously-stored records.
 */
export interface Asset extends Entity {
  projectId?: string;

  name: string;
  type: AssetType;
  url: string;
  thumbnail?: string;
  source: AssetSource;

  width?: number;
  height?: number;
  size?: number;         // bytes

  favorite?: boolean;
  tags: string[];

  pageUrl?: string;
  mimeType?: string;

  /** @deprecated legacy field kept for older records */
  kind?: string;
  /** @deprecated legacy field kept for older records */
  filename?: string;
  /** @deprecated legacy field kept for older records */
  sourceUrl?: string;
  /** @deprecated legacy field kept for older records */
  sizeBytes?: number;
}

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  png: "PNG",
  jpg: "JPG",
  jpeg: "JPEG",
  webp: "WebP",
  svg: "SVG",
  gif: "GIF",
  pdf: "PDF",
  mp4: "MP4",
  lottie: "Lottie",
  other: "Other",
};

export const ASSET_SOURCE_LABEL: Record<AssetSource, string> = {
  extraction: "Extracted",
  inspiration: "Inspiration",
  screenshot: "Screenshot",
  upload: "Upload",
};
