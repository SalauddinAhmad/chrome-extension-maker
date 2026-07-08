/**
 * Backup / restore for the local Dexie DB. Uses a static table map so
 * TypeScript can prove each access is well-typed (no dynamic string keys).
 */
import { db } from "@/storage";
import type { Table } from "dexie";

interface TableEntry {
  name: string;
  table: Table<unknown, string>;
  preserveOnClear?: boolean;
}

function tables(): TableEntry[] {
  return [
    { name: "colors", table: db.colors as unknown as Table<unknown, string> },
    { name: "palettes", table: db.palettes as unknown as Table<unknown, string> },
    { name: "fonts", table: db.fonts as unknown as Table<unknown, string> },
    { name: "fontPairs", table: db.fontPairs as unknown as Table<unknown, string> },
    { name: "typographySystems", table: db.typographySystems as unknown as Table<unknown, string> },
    { name: "inspirations", table: db.inspirations as unknown as Table<unknown, string> },
    { name: "boards", table: db.boards as unknown as Table<unknown, string> },
    { name: "assets", table: db.assets as unknown as Table<unknown, string> },
    { name: "assetBlobs", table: db.assetBlobs as unknown as Table<unknown, string> },
    { name: "notes", table: db.notes as unknown as Table<unknown, string> },
    { name: "projects", table: db.projects as unknown as Table<unknown, string> },
    { name: "designReports", table: db.designReports as unknown as Table<unknown, string> },
    { name: "designAudits", table: db.designAudits as unknown as Table<unknown, string> },
    { name: "accessibilityReports", table: db.accessibilityReports as unknown as Table<unknown, string> },
    { name: "settings", table: db.settings as unknown as Table<unknown, string>, preserveOnClear: true },
  ];
}

export interface BackupFile {
  app: "designer-os";
  version: 1;
  exportedAt: number;
  data: Record<string, unknown[]>;
}

export async function exportAll(): Promise<BackupFile> {
  const data: Record<string, unknown[]> = {};
  for (const { name, table } of tables()) {
    data[name] = await table.toArray();
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

  for (const { name, table } of tables()) {
    const rows = file.data?.[name];
    if (!Array.isArray(rows)) {
      skipped.push(name);
      continue;
    }
    if (mode === "replace") await table.clear();
    if (rows.length) {
      await table.bulkPut(rows);
      imported += rows.length;
    }
  }
  return { imported, skipped };
}

export async function clearAll(): Promise<void> {
  for (const { table, preserveOnClear } of tables()) {
    if (preserveOnClear) continue;
    await table.clear();
  }
}
