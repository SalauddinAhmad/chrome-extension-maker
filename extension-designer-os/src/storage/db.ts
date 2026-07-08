import Dexie, { type Table } from "dexie";
import type {
  StoredColor,
  ColorPalette,
  StoredFont,
  FontPair,
  TypographySystem,
  Inspiration,
  InspirationBoard,
  Asset,
  Note,
  Project,
  Settings,
  DesignReport,
  DesignAudit,
} from "@/types";


/**
 * DesignerOSDB — single IndexedDB database, all local.
 * Bump `version()` when schema changes; add upgrade logic in the same call.
 */
export class DesignerOSDB extends Dexie {
  colors!: Table<StoredColor, string>;
  palettes!: Table<ColorPalette, string>;
  fonts!: Table<StoredFont, string>;
  fontPairs!: Table<FontPair, string>;
  typographySystems!: Table<TypographySystem, string>;
  inspirations!: Table<Inspiration, string>;
  boards!: Table<InspirationBoard, string>;
  assets!: Table<Asset, string>;
  assetBlobs!: Table<{ id: string; blob: Blob }, string>;
  notes!: Table<Note, string>;
  projects!: Table<Project, string>;
  settings!: Table<Settings, string>;
  designReports!: Table<DesignReport, string>;
  designAudits!: Table<DesignAudit, string>;

  constructor() {
    super("designer-os");
    this.version(1).stores({
      colors: "id, hex, createdAt, paletteId, *tags",
      palettes: "id, name, createdAt",
      fonts: "id, family, source, createdAt",
      fontPairs: "id, createdAt",
      inspirations: "id, url, createdAt, boardId, *tags",
      boards: "id, name, createdAt",
      assets: "id, kind, createdAt, pageUrl",
      assetBlobs: "id",
      notes: "id, pinned, projectId, updatedAt, *tags",
      projects: "id, archived, createdAt",
      settings: "id",
    });
    // v2: index projectId, favorite, collection on inspirations for fast filters.
    this.version(2).stores({
      inspirations:
        "id, url, createdAt, updatedAt, boardId, projectId, favorite, collection, *tags",
    });
    // v3: index projectId, type, favorite, source, tags on assets for the library.
    this.version(3).stores({
      assets:
        "id, projectId, type, favorite, source, createdAt, updatedAt, pageUrl, *tags",
    });
    // v4: index projectId, favorite, source, updatedAt on colors for the library.
    this.version(4).stores({
      colors: "id, hex, createdAt, updatedAt, paletteId, projectId, favorite, source, *tags",
      palettes: "id, name, createdAt, updatedAt, projectId",
    });
    // v5: expand fonts index set + add typographySystems table (Phase 5).
    this.version(5).stores({
      fonts:
        "id, family, source, category, projectId, favorite, createdAt, updatedAt, *tags",
      typographySystems:
        "id, name, projectId, favorite, createdAt, updatedAt, *tags",
    });
    // v6: add designReports table (Phase 6).
    this.version(6).stores({
      designReports:
        "id, projectId, url, saved, createdAt, updatedAt",
    });
  }
}

export const db = new DesignerOSDB();
