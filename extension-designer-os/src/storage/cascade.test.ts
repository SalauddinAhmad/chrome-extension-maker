/**
 * Cascade delete integrity tests.
 *
 * Uses fake-indexeddb to run Dexie fully in a Node environment. We seed a
 * project with one row in every child table, then verify `remove()` leaves
 * zero orphaned rows behind. Also covers asset-blob and design-report
 * cascade paths.
 */
import "fake-indexeddb/auto";
import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/storage/db";
import { projectRepository } from "@/modules/projects/repository";
import { assetRepository } from "@/modules/asset-extractor/repository";
import { designInspectorRepository } from "@/modules/design-inspector/repository";

async function reset() {
  await Promise.all([
    db.projects.clear(),
    db.inspirations.clear(),
    db.colors.clear(),
    db.palettes.clear(),
    db.fonts.clear(),
    db.typographySystems.clear(),
    db.assets.clear(),
    db.assetBlobs.clear(),
    db.notes.clear(),
    db.designReports.clear(),
    db.designAudits.clear(),
    db.accessibilityReports.clear(),
  ]);
}

async function seedProjectChildren(projectId: string) {
  const now = Date.now();
  const base = { createdAt: now, updatedAt: now };
  await db.inspirations.put({
    id: "insp-1", projectId, title: "t", url: "https://x", tags: [], ...base,
  });
  await db.colors.put({
    id: "c-1", projectId, name: "n", hex: "#000",
    rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 },
    ...base,
  });
  await db.palettes.put({
    id: "pal-1", projectId, name: "p", colorIds: ["c-1"], ...base,
  });
  await db.fonts.put({
    id: "f-1", projectId, family: "Inter", weights: [400], styles: ["normal"],
    source: "google", ...base,
  });
  await db.typographySystems.put({
    id: "ts-1", projectId, name: "sys", styles: [], ...base,
  });
  await db.assets.put({
    id: "a-1", projectId, name: "x", type: "png", url: "u",
    source: "upload", tags: [], ...base,
  });
  await db.assetBlobs.put({ id: "a-1", blob: new Blob(["hi"]) });
  await db.notes.put({
    id: "n-1", projectId, title: "n", body: "", pinned: false, tags: [], ...base,
  });
  await db.designReports.put({
    id: "r-1", projectId, url: "https://x", title: "t",
    colors: [], fonts: [], components: {} as never, layout: {} as never,
    effects: {} as never, assets: [], ...base,
  } as never);
  await db.designAudits.put({
    id: "au-1", projectId, reportId: "r-1", url: "https://x",
    score: 90, grade: "A", categories: {} as never, issues: [], recommendations: [], ...base,
  } as never);
  await db.accessibilityReports.put({
    id: "ax-1", projectId, reportId: "r-1", url: "https://x",
    score: 85, level: "AA", issues: [], summary: {} as never, ...base,
  } as never);
}

describe("cascade delete", () => {
  beforeEach(reset);

  test("deleting a project removes every child row across 10 tables", async () => {
    const project = await projectRepository.create({
      name: "Test", archived: false,
    });
    await seedProjectChildren(project.id);

    // Sanity: everything is present.
    expect(await db.inspirations.count()).toBe(1);
    expect(await db.assets.count()).toBe(1);
    expect(await db.assetBlobs.count()).toBe(1);

    await projectRepository.remove(project.id);

    // Everything is gone. No orphaned rows anywhere.
    const counts = await Promise.all([
      db.projects.count(),
      db.inspirations.count(),
      db.colors.count(),
      db.palettes.count(),
      db.fonts.count(),
      db.typographySystems.count(),
      db.assets.count(),
      db.assetBlobs.count(),
      db.notes.count(),
      db.designReports.count(),
      db.designAudits.count(),
      db.accessibilityReports.count(),
    ]);
    expect(counts).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  test("deleting a design report cascades to its audits and a11y rows", async () => {
    const now = Date.now();
    const base = { createdAt: now, updatedAt: now };
    await db.designReports.put({
      id: "r-1", url: "https://x", title: "t",
      colors: [], fonts: [], components: {} as never, layout: {} as never,
      effects: {} as never, assets: [], ...base,
    } as never);
    await db.designAudits.put({
      id: "au-1", reportId: "r-1", url: "https://x",
      score: 90, grade: "A", categories: {} as never, issues: [], recommendations: [], ...base,
    } as never);
    await db.accessibilityReports.put({
      id: "ax-1", reportId: "r-1", url: "https://x",
      score: 85, level: "AA", issues: [], summary: {} as never, ...base,
    } as never);

    await designInspectorRepository.remove("r-1");

    expect(await db.designReports.count()).toBe(0);
    expect(await db.designAudits.count()).toBe(0);
    expect(await db.accessibilityReports.count()).toBe(0);
  });

  test("deleting an asset removes its paired blob", async () => {
    const now = Date.now();
    await db.assets.put({
      id: "a-1", name: "x", type: "png", url: "u", source: "upload",
      tags: [], createdAt: now, updatedAt: now,
    });
    await db.assetBlobs.put({ id: "a-1", blob: new Blob(["hi"]) });

    await assetRepository.remove("a-1");

    expect(await db.assets.count()).toBe(0);
    expect(await db.assetBlobs.count()).toBe(0);
  });
});
