/**
 * Repositories — thin CRUD wrappers around Dexie tables.
 * Business logic lives in module `logic/` folders, not here.
 * All methods return promises and stay side-effect free beyond the DB.
 *
 * NOTE: Explicit generic arguments MUST be supplied at each `createRepo<T>()`
 * export call so the returned method signatures are `T`-typed instead of the
 * base `Entity` (otherwise `.get()`, `.create()`, `.update()` widen to Entity
 * and downstream repositories/stores type-check with wrong shapes).
 */
import { db } from "./db";
import type { Entity } from "@/types";
import type { Table } from "dexie";

const now = () => Date.now();
const uid = () =>
  (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

export interface Repo<T extends Entity> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

export function createRepo<T extends Entity>(tableName: keyof typeof db): Repo<T> {
  const table = (db as unknown as Record<string, Table<T, string>>)[tableName as string];

  return {
    async list() {
      return table.orderBy("createdAt").reverse().toArray();
    },
    async get(id) {
      return table.get(id);
    },
    async create(data) {
      const entity = {
        ...(data as object),
        id: uid(),
        createdAt: now(),
        updatedAt: now(),
      } as T;
      await table.add(entity);
      return entity;
    },
    async update(id, patch) {
      await table.update(id, { ...(patch as object), updatedAt: now() } as Partial<T>);
    },
    async remove(id) {
      await table.delete(id);
    },
    async clear() {
      await table.clear();
    },
  };
}

import type {
  StoredColor, ColorPalette, StoredFont, FontPair, TypographySystem,
  Inspiration, InspirationBoard, Asset, Note, Project,
  DesignReport, DesignAudit, AccessibilityReport,
} from "@/types";

export const colorsRepo = createRepo<StoredColor>("colors");
export const palettesRepo = createRepo<ColorPalette>("palettes");
export const fontsRepo = createRepo<StoredFont>("fonts");
export const fontPairsRepo = createRepo<FontPair>("fontPairs");
export const typographySystemsRepo = createRepo<TypographySystem>("typographySystems");
export const inspirationsRepo = createRepo<Inspiration>("inspirations");
export const boardsRepo = createRepo<InspirationBoard>("boards");
export const assetsRepo = createRepo<Asset>("assets");
export const notesRepo = createRepo<Note>("notes");
export const projectsRepo = createRepo<Project>("projects");
export const designReportsRepo = createRepo<DesignReport>("designReports");
export const designAuditsRepo = createRepo<DesignAudit>("designAudits");
export const accessibilityReportsRepo = createRepo<AccessibilityReport>("accessibilityReports");
