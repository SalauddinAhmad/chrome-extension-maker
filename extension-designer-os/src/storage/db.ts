import Dexie, { type Table } from "dexie";
import type {
  StoredColor,
  ColorPalette,
  StoredFont,
  FontPair,
  Inspiration,
  InspirationBoard,
  Asset,
  Note,
  Project,
  Settings,
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
  inspirations!: Table<Inspiration, string>;
  boards!: Table<InspirationBoard, string>;
  assets!: Table<Asset, string>;
  assetBlobs!: Table<{ id: string; blob: Blob }, string>;
  notes!: Table<Note, string>;
  projects!: Table<Project, string>;
  settings!: Table<Settings, string>;

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
  }
}

export const db = new DesignerOSDB();
