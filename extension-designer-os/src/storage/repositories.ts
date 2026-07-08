/**
 * Repositories — thin CRUD wrappers around Dexie tables.
 * Business logic lives in module `logic/` folders, not here.
 * All methods return promises and stay side-effect free beyond the DB.
 */
import { db } from "./db";
import type { Entity } from "@/types";

const now = () => Date.now();
const uid = () =>
  (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

export function createRepo<T extends Entity>(tableName: keyof typeof db) {
  const table = (db as unknown as Record<string, import("dexie").Table<T, string>>)[
    tableName as string
  ];

  return {
    async list(): Promise<T[]> {
      return table.orderBy("createdAt").reverse().toArray();
    },
    async get(id: string): Promise<T | undefined> {
      return table.get(id);
    },
    async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
      const entity = {
        ...(data as object),
        id: uid(),
        createdAt: now(),
        updatedAt: now(),
      } as T;
      await table.add(entity);
      return entity;
    },
    async update(id: string, patch: Partial<T>): Promise<void> {
      await table.update(id, { ...patch, updatedAt: now() } as Partial<T>);
    },
    async remove(id: string): Promise<void> {
      await table.delete(id);
    },
    async clear(): Promise<void> {
      await table.clear();
    },
  };
}

export const colorsRepo = createRepo("colors");
export const palettesRepo = createRepo("palettes");
export const fontsRepo = createRepo("fonts");
export const fontPairsRepo = createRepo("fontPairs");
export const typographySystemsRepo = createRepo("typographySystems");
export const inspirationsRepo = createRepo("inspirations");
export const boardsRepo = createRepo("boards");
export const assetsRepo = createRepo("assets");
export const notesRepo = createRepo("notes");
export const projectsRepo = createRepo("projects");
export const designReportsRepo = createRepo("designReports");
export const designAuditsRepo = createRepo("designAudits");
export const accessibilityReportsRepo = createRepo("accessibilityReports");
