/**
 * Backup schemaVersion validation tests.
 */
import "fake-indexeddb/auto";
import { describe, expect, test } from "vitest";
import { db } from "@/storage/db";
import { BACKUP_FILE_VERSION, exportAll, importAll, validateBackup } from "./backup";

describe("backup versioning", () => {
  test("export embeds schemaVersion and file version", async () => {
    const file = await exportAll();
    expect(file.app).toBe("designer-os");
    expect(file.version).toBe(BACKUP_FILE_VERSION);
    expect(file.schemaVersion).toBe(db.verno);
    expect(typeof file.exportedAt).toBe("number");
  });

  test("rejects a foreign file", () => {
    expect(() => validateBackup({ app: "other", version: 1 })).toThrow(
      /Designer OS/,
    );
  });

  test("rejects a backup with no schemaVersion field", () => {
    expect(() =>
      validateBackup({ app: "designer-os", version: 1, data: {} }),
    ).toThrow(/schemaVersion/);
  });

  test("rejects a backup from a newer schema", () => {
    expect(() =>
      validateBackup({
        app: "designer-os",
        version: 1,
        schemaVersion: db.verno + 5,
        data: {},
      }),
    ).toThrow(/only supports up to/);
  });

  test("rejects a backup with a newer file version", () => {
    expect(() =>
      validateBackup({
        app: "designer-os",
        version: BACKUP_FILE_VERSION + 1,
        schemaVersion: db.verno,
        data: {},
      }),
    ).toThrow(/newer than this build/);
  });

  test("accepts a valid same-schema backup", async () => {
    const file = await exportAll();
    const res = await importAll(file, "merge");
    expect(res.skipped).toEqual([]);
  });
});
