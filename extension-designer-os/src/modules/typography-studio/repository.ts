/**
 * Typography Repository — the ONLY module allowed to touch `db.fonts` /
 * `db.fontPairs` / `db.typographySystems`. Query, CRUD, bulk, stats.
 */
import { db, fontsRepo, typographySystemsRepo } from "@/storage";
import type {
  FontCategory,
  FontSource,
  StoredFont,
  TypographySystem,
} from "@/types";

export type FontSort = "created-desc" | "created-asc" | "name-asc" | "name-desc";
export type FontDateRange = "any" | "today" | "week" | "month";

export interface FontFilters {
  search?: string;
  projectId?: string | "__any" | "__none";
  category?: FontCategory | "__any";
  source?: FontSource | "__any";
  favoritesOnly?: boolean;
  dateRange?: FontDateRange;
  sort?: FontSort;
}

function matchesSearch(f: StoredFont, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    f.family.toLowerCase().includes(needle) ||
    (f.tags?.some((t) => t.toLowerCase().includes(needle)) ?? false)
  );
}

function sinceForRange(range: FontDateRange): number {
  const d = 24 * 60 * 60 * 1000;
  switch (range) {
    case "today": return Date.now() - d;
    case "week": return Date.now() - 7 * d;
    case "month": return Date.now() - 30 * d;
    default: return 0;
  }
}

function sortFonts(items: StoredFont[], sort: FontSort): StoredFont[] {
  const arr = [...items];
  switch (sort) {
    case "created-asc": return arr.sort((a, b) => a.createdAt - b.createdAt);
    case "name-asc": return arr.sort((a, b) => a.family.localeCompare(b.family));
    case "name-desc": return arr.sort((a, b) => b.family.localeCompare(a.family));
    case "created-desc":
    default: return arr.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export const typographyRepository = {
  // ─── Fonts ──────────────────────────────────────────────
  async getAll(): Promise<StoredFont[]> {
    return db.fonts.orderBy("createdAt").reverse().toArray();
  },

  async getById(id: string): Promise<StoredFont | undefined> {
    return fontsRepo.get(id);
  },

  async query(filters: FontFilters = {}): Promise<StoredFont[]> {
    const all = await this.getAll();
    const since = sinceForRange(filters.dateRange ?? "any");

    const filtered = all.filter((f) => {
      if (filters.projectId === "__none" && f.projectId) return false;
      if (
        filters.projectId &&
        filters.projectId !== "__any" &&
        filters.projectId !== "__none" &&
        f.projectId !== filters.projectId
      ) return false;
      if (filters.category && filters.category !== "__any" && (f.category ?? "sans-serif") !== filters.category) return false;
      if (filters.source && filters.source !== "__any" && f.source !== filters.source) return false;
      if (filters.favoritesOnly && !f.favorite) return false;
      if (since && f.createdAt < since) return false;
      if (!matchesSearch(f, (filters.search ?? "").trim())) return false;
      return true;
    });

    return sortFonts(filtered, filters.sort ?? "created-desc");
  },

  async createFont(data: Omit<StoredFont, "id" | "createdAt" | "updatedAt">): Promise<StoredFont> {
    return fontsRepo.create(data);
  },

  async updateFont(id: string, patch: Partial<StoredFont>): Promise<void> {
    return fontsRepo.update(id, patch);
  },

  async deleteFont(id: string): Promise<void> {
    return fontsRepo.remove(id);
  },

  async removeMany(ids: string[]): Promise<void> {
    await db.fonts.bulkDelete(ids);
  },

  async toggleFavorite(id: string): Promise<void> {
    const item = await this.getById(id);
    if (!item) return;
    return this.updateFont(id, { favorite: !item.favorite });
  },

  async moveToProject(id: string, projectId: string | undefined): Promise<void> {
    return this.updateFont(id, { projectId });
  },

  async listRecent(limit = 6): Promise<StoredFont[]> {
    return db.fonts.orderBy("createdAt").reverse().limit(limit).toArray();
  },

  async listFavorites(limit = 6): Promise<StoredFont[]> {
    return db.fonts
      .orderBy("createdAt")
      .reverse()
      .filter((f) => Boolean(f.favorite))
      .limit(limit)
      .toArray();
  },

  async categoryStats(): Promise<Record<string, number>> {
    const all = await this.getAll();
    const map: Record<string, number> = {};
    for (const f of all) {
      const key = f.category ?? "sans-serif";
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  },

  async sourceStats(): Promise<Record<string, number>> {
    const all = await this.getAll();
    const map: Record<string, number> = {};
    for (const f of all) {
      map[f.source] = (map[f.source] ?? 0) + 1;
    }
    return map;
  },

  // ─── Typography Systems ────────────────────────────────
  async listSystems(projectId?: string): Promise<TypographySystem[]> {
    const all = await db.typographySystems.orderBy("createdAt").reverse().toArray();
    return projectId ? all.filter((s) => s.projectId === projectId) : all;
  },

  async createSystem(
    data: Omit<TypographySystem, "id" | "createdAt" | "updatedAt">,
  ): Promise<TypographySystem> {
    return typographySystemsRepo.create(data);
  },

  async updateSystem(id: string, patch: Partial<TypographySystem>): Promise<void> {
    return typographySystemsRepo.update(id, patch);
  },

  async deleteSystem(id: string): Promise<void> {
    return typographySystemsRepo.remove(id);
  },

  async toggleSystemFavorite(id: string): Promise<void> {
    const item = await db.typographySystems.get(id);
    if (!item) return;
    return this.updateSystem(id, { favorite: !item.favorite });
  },
};
