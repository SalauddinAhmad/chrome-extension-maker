import { db } from "@/storage";

const TABLES = [
  "colors",
  "palettes",
  "fonts",
  "fontPairs",
  "inspirations",
  "boards",
  "assets",
  "notes",
  "projects",
  "settings",
] as const;

export interface BackupFile {
  app: "designer-os";
  version: 1;
  exportedAt: number;
  data: Record<string, unknown[]>;
}

export async function exportAll(): Promise<BackupFile> {
  const data: Record<string, unknown[]> = {};
  for (const t of TABLES) {
    // @ts-expect-error dynamic table access
    data[t] = await db[t].toArray();
  }
  return { app: "designer-os", version: 1, exportedAt: Date.now(), data };
}

export function downloadBackup(file: BackupFile): void {
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date(file.exportedAt).toISOString().slice(0, 10);
  a.href = url;
  a.download = `designer-os-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  imported: number;
  skipped: string[];
}

export async function importAll(
  file: BackupFile,
  mode: "merge" | "replace",
): Promise<ImportResult> {
  if (file?.app !== "designer-os") throw new Error("Not a Designer OS backup file");
  let imported = 0;
  const skipped: string[] = [];

  for (const t of TABLES) {
    const rows = file.data?.[t];
    if (!Array.isArray(rows)) {
      skipped.push(t);
      continue;
    }
    // @ts-expect-error dynamic table access
    const table = db[t];
    if (mode === "replace") await table.clear();
    if (rows.length) {
      await table.bulkPut(rows);
      imported += rows.length;
    }
  }
  return { imported, skipped };
}

export async function clearAll(): Promise<void> {
  for (const t of TABLES) {
    if (t === "settings") continue; // preserve settings row
    // @ts-expect-error dynamic table access
    await db[t].clear();
  }
}
