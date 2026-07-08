/**
 * Import helpers — convert scanned page assets or uploaded files into
 * repository-ready Asset payloads.
 */
import type { Asset, AssetType } from "@/types";
import type { ScannedAsset } from "../types";
import {
  detectTypeFromMime,
  detectTypeFromUrl,
  fileToDataUrl,
  inferFilename,
  readImageDimensions,
  validateUploadFile,
} from "./validation";

export type NewAssetPayload = Omit<Asset, "id" | "createdAt" | "updatedAt">;

export function scannedToAssetPayload(
  s: ScannedAsset,
  projectId: string | undefined,
  pageUrl: string | undefined,
): NewAssetPayload {
  const type: AssetType =
    detectTypeFromMime(s.mimeGuess) ?? detectTypeFromUrl(s.url) ?? "other";
  return {
    projectId,
    name: s.filename || inferFilename(s.url),
    type,
    url: s.url,
    thumbnail: s.url,
    source: "extraction",
    width: s.width,
    height: s.height,
    tags: [],
    pageUrl,
    mimeType: s.mimeGuess,
  };
}

export async function fileToAssetPayload(
  file: File,
  projectId: string | undefined,
): Promise<NewAssetPayload> {
  const check = validateUploadFile(file);
  if (!check.ok) throw new Error(check.error);
  const dataUrl = await fileToDataUrl(file);
  const dims = (check.type === "png" || check.type === "jpg" || check.type === "jpeg" ||
    check.type === "webp" || check.type === "gif" || check.type === "svg")
    ? await readImageDimensions(dataUrl)
    : undefined;
  return {
    projectId,
    name: file.name,
    type: check.type!,
    url: dataUrl,
    thumbnail: check.type === "pdf" || check.type === "mp4" ? undefined : dataUrl,
    source: "upload",
    width: dims?.width,
    height: dims?.height,
    size: file.size,
    tags: [],
    mimeType: file.type || undefined,
  };
}
