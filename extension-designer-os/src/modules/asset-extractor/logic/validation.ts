/**
 * Asset library validation & helpers.
 * Business logic only — no UI, no direct Dexie calls.
 */
import type { AssetType } from "@/types";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

const EXT_TO_TYPE: Record<string, AssetType> = {
  png: "png",
  jpg: "jpg",
  jpeg: "jpeg",
  webp: "webp",
  svg: "svg",
  gif: "gif",
  pdf: "pdf",
  mp4: "mp4",
  lottie: "lottie",
  json: "lottie", // .lottie zipped variant OR json lottie
};

const MIME_TO_TYPE: Record<string, AssetType> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
};

export const ACCEPTED_UPLOAD_MIMES = Object.keys(MIME_TO_TYPE).concat([
  "application/json",
]);

export function detectTypeFromUrl(url: string): AssetType {
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  const ext = clean.split(".").pop() ?? "";
  return EXT_TO_TYPE[ext] ?? "other";
}

export function detectTypeFromMime(mime: string | undefined): AssetType | null {
  if (!mime) return null;
  return MIME_TO_TYPE[mime.toLowerCase()] ?? null;
}

export function inferFilename(url: string, fallback = "asset"): string {
  if (url.startsWith("data:")) return fallback;
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop();
    return last || u.hostname || fallback;
  } catch {
    return fallback;
  }
}

export interface UploadValidation {
  ok: boolean;
  error?: string;
  type?: AssetType;
}

export function validateUploadFile(file: File): UploadValidation {
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: `File exceeds 5 MB limit (${Math.round(file.size / 1024)} KB).` };
  }
  const type = detectTypeFromMime(file.type) ?? detectTypeFromUrl(file.name);
  if (type === "other") {
    return { ok: false, error: `Unsupported file type: ${file.type || file.name}` };
  }
  return { ok: true, type };
}

export function parseTags(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);
}

/** Try to read the intrinsic dimensions of an image data URL. Resolves undefined on failure. */
export function readImageDimensions(
  src: string,
): Promise<{ width: number; height: number } | undefined> {
  return new Promise((resolve) => {
    if (typeof Image === "undefined") return resolve(undefined);
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(undefined);
    img.src = src;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number | undefined): string {
  if (!bytes || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
