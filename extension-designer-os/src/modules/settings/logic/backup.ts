/**
 * Backup / restore for the local Dexie DB. Uses a static table map so
 * TypeScript can prove each access is well-typed (no dynamic string keys).
 *
 * Backups embed the Dexie `schemaVersion` at export time. Imports reject
 * files that were written against an incompatible (newer) schema so a
 * post-1.0 backup can't silently corrupt older installs.
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

/** Bump when the shape of the backup file itself (not the DB schema) changes. */
export const BACKUP_FILE_VERSION = 1;

export interface BackupFile {
  app: "designer-os";
  /** Backup FILE format version. */
  version: number;
  /** Dexie DB schema version this backup was written against. */
  schemaVersion: number;
  exportedAt: number;
  /** Human-readable app version, informational only. */
  appVersion?: string;
  data: Record<string, unknown[]>;
}

export async function exportAll(): Promise<BackupFile> {
  const data: Record<string, unknown[]> = {};
  for (const { name, table } of tables()) {
    data[name] = await table.toArray();
  }
  return {
    app: "designer-os",
    version: BACKUP_FILE_VERSION,
    schemaVersion: db.verno,
    exportedAt: Date.now(),
    appVersion: "1.0.0",
    data,
  };
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

/**
 * Validate the backup envelope BEFORE touching the DB. Throws a
 * user-facing error message on any incompatibility.
 */
export function validateBackup(file: unknown): asserts file is BackupFile {
  if (!file || typeof file !== "object") {
    throw new Error("Not a Designer OS backup file.");
  }
  const f = file as Partial<BackupFile>;
  if (f.app !== "designer-os") {
    throw new Error("Not a Designer OS backup file.");
  }
  if (typeof f.version !== "number") {
    throw new Error("Backup is missing a version field.");
  }
  if (f.version > BACKUP_FILE_VERSION) {
    throw new Error(
      `Backup file version ${f.version} is newer than this build supports ` +
        `(max ${BACKUP_FILE_VERSION}). Update Designer OS and try again.`,
    );
  }
  if (typeof f.schemaVersion !== "number") {
    throw new Error(
      "Backup is missing a schemaVersion. Regenerate it with Designer OS 1.0 or later.",
    );
  }
  if (f.schemaVersion > db.verno) {
    throw new Error(
      `Backup was written against DB schema v${f.schemaVersion}, but this ` +
        `build only supports up to v${db.verno}. Update Designer OS and try again.`,
    );
  }
  if (!f.data || typeof f.data !== "object") {
    throw new Error("Backup has no data payload.");
  }
}

export async function importAll(
  file: unknown,
  mode: "merge" | "replace",
): Promise<ImportResult> {
  validateBackup(file);
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
