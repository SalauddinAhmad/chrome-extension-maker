import { downloadFile } from "@/lib/chrome";
import type { ScannedAsset } from "../types";

/** Sanitize a filename so browsers accept it as a download target. */
export function safeFilename(name: string): string {
  const clean = name.replace(/[\\/:*?"<>|]+/g, "-").slice(0, 120);
  return clean || "asset";
}

export async function downloadAsset(asset: ScannedAsset): Promise<void> {
  await downloadFile(asset.url, safeFilename(asset.filename));
}

export async function downloadMany(assets: ScannedAsset[]): Promise<void> {
  // Sequential to avoid overwhelming chrome.downloads / browser popups.
  for (const a of assets) {
    await downloadAsset(a);
  }
}
