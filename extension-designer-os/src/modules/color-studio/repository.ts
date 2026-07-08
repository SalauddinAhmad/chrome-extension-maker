/**
 * Color Repository — the ONLY module allowed to touch `db.colors` /
 * `db.palettes`. Query, CRUD, bulk, stats.
 */
import { db, colorsRepo } from "@/storage";
import type { ColorSource, StoredColor } from "@/types";

export type ColorSort = "created-desc" | "created-asc" | "name-asc" | "hue-asc";

export type ColorDateRange = "any" | "today" | "week" | "month";

export interface ColorFilters {
  search?: string;
  projectId?: string | "__any" | "__none";
  source?: ColorSource | "__any";
  favoritesOnly?: boolean;
  dateRange?: ColorDateRange;
  sort?: ColorSort;
}

function matchesSearch(c: StoredColor, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    (c.name?.toLowerCase().includes(needle) ?? false) ||
    c.hex.toLowerCase().includes(needle) ||
    (c.tags?.some((t) => t.toLowerCase().includes(needle)) ?? false)
  );
}

function sinceForRange(range: ColorDateRange): number {
  const d = 24 * 60 * 60 * 1000;
  switch (range) {
    case "today": return Date.now() - d;
    case "week": return Date.now() - 7 * d;
    case "month": return Date.now() - 30 * d;
    default: return 0;
  }
}

function sortColors(items: StoredColor[], sort: ColorSort): StoredColor[] {
  const arr = [...items];
  switch (sort) {
    case "created-asc": return arr.sort((a, b) => a.createdAt - b.createdAt);
    case "name-asc":
      return arr.sort((a, b) => (a.name ?? a.hex).localeCompare(b.name ?? b.hex));
    case "hue-asc":
      return arr.sort((a, b) => (a.hsl?.h ?? 0) - (b.hsl?.h ?? 0));
    case "created-desc":
    default: return arr.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export const colorRepository = {
  async getAll(): Promise<StoredColor[]> {
    return db.colors.orderBy("createdAt").reverse().toArray();
  },

  async getById(id: string): Promise<StoredColor | undefined> {
    return colorsRepo.get(id);
  },

  async query(filters: ColorFilters = {}): Promise<StoredColor[]> {
    const all = await this.getAll();
    const since = sinceForRange(filters.dateRange ?? "any");

    const filtered = all.filter((c) => {
      if (filters.projectId === "__none" && c.projectId) return false;
      if (
        filters.projectId &&
        filters.projectId !== "__any" &&
        filters.projectId !== "__none" &&
        c.projectId !== filters.projectId
      ) return false;
      if (filters.source && filters.source !== "__any" && (c.source ?? "manual") !== filters.source) return false;
      if (filters.favoritesOnly && !c.favorite) return false;
      if (since && c.createdAt < since) return false;
      if (!matchesSearch(c, (filters.search ?? "").trim())) return false;
      return true;
    });

    return sortColors(filtered, filters.sort ?? "created-desc");
  },

  async create(data: Omit<StoredColor, "id" | "createdAt" | "updatedAt">): Promise<StoredColor> {
    return colorsRepo.create(data);
  },

  async createMany(items: Array<Omit<StoredColor, "id" | "createdAt" | "updatedAt">>): Promise<number> {
    let saved = 0;
    for (const item of items) {
      try { await colorsRepo.create(item); saved += 1; } catch { /* skip */ }
    }
    return saved;
  },

  async update(id: string, patch: Partial<StoredColor>): Promise<void> {
    return colorsRepo.update(id, patch);
  },

  async remove(id: string): Promise<void> {
    return colorsRepo.remove(id);
  },

  async removeMany(ids: string[]): Promise<void> {
    await db.colors.bulkDelete(ids);
  },

  async toggleFavorite(id: string): Promise<void> {
    const item = await this.getById(id);
    if (!item) return;
    return this.update(id, { favorite: !item.favorite });
  },

  async moveToProject(id: string, projectId: string | undefined): Promise<void> {
    return this.update(id, { projectId });
  },

  async listRecent(limit = 6): Promise<StoredColor[]> {
    return db.colors.orderBy("createdAt").reverse().limit(limit).toArray();
  },

  async listFavorites(limit = 6): Promise<StoredColor[]> {
    return db.colors
      .orderBy("createdAt")
      .reverse()
      .filter((c) => Boolean(c.favorite))
      .limit(limit)
      .toArray();
  },

  async sourceStats(): Promise<Record<string, number>> {
    const all = await this.getAll();
    const map: Record<string, number> = {};
    for (const c of all) {
      const key = c.source ?? "manual";
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  },

  async paletteCount(): Promise<number> {
    return db.palettes.count();
  },
};
