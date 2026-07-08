/**
 * Inspiration repository — the ONLY module allowed to touch `db.inspirations`.
 */
import { db, inspirationsRepo } from "@/storage";
import type { Inspiration } from "@/types";

export type InspirationSort = "created-desc" | "updated-desc" | "title-asc";

export interface InspirationFilters {
  search?: string;
  projectId?: string | null;   // null = unassigned
  collection?: string;         // collection id
  favoritesOnly?: boolean;
  since?: number;              // ms epoch lower bound
  sort?: InspirationSort;
}

function matchesSearch(i: Inspiration, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    i.title.toLowerCase().includes(needle) ||
    i.url.toLowerCase().includes(needle) ||
    (i.notes?.toLowerCase().includes(needle) ?? false) ||
    i.tags.some((t) => t.toLowerCase().includes(needle))
  );
}

function sortItems(items: Inspiration[], sort: InspirationSort): Inspiration[] {
  const arr = [...items];
  switch (sort) {
    case "updated-desc": return arr.sort((a, b) => b.updatedAt - a.updatedAt);
    case "title-asc": return arr.sort((a, b) => a.title.localeCompare(b.title));
    case "created-desc":
    default: return arr.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export const inspirationRepository = {
  async getAll(): Promise<Inspiration[]> {
    return db.inspirations.orderBy("createdAt").reverse().toArray();
  },

  async getById(id: string): Promise<Inspiration | undefined> {
    return inspirationsRepo.get(id);
  },

  async query(filters: InspirationFilters = {}): Promise<Inspiration[]> {
    const all = await this.getAll();
    const filtered = all.filter((i) => {
      if (filters.projectId === null && i.projectId) return false;
      if (typeof filters.projectId === "string" && i.projectId !== filters.projectId) return false;
      if (filters.collection && i.collection !== filters.collection) return false;
      if (filters.favoritesOnly && !i.favorite) return false;
      if (filters.since && i.createdAt < filters.since) return false;
      if (!matchesSearch(i, (filters.search ?? "").trim())) return false;
      return true;
    });
    return sortItems(filtered, filters.sort ?? "created-desc");
  },

  async create(data: Omit<Inspiration, "id" | "createdAt" | "updatedAt">): Promise<Inspiration> {
    return inspirationsRepo.create(data);
  },

  async update(id: string, patch: Partial<Inspiration>): Promise<void> {
    return inspirationsRepo.update(id, patch);
  },

  async remove(id: string): Promise<void> {
    return inspirationsRepo.remove(id);
  },

  async toggleFavorite(id: string): Promise<void> {
    const item = await this.getById(id);
    if (!item) return;
    return this.update(id, { favorite: !item.favorite });
  },

  async moveToProject(id: string, projectId: string | undefined): Promise<void> {
    return this.update(id, { projectId });
  },

  async listRecent(limit = 6): Promise<Inspiration[]> {
    return db.inspirations.orderBy("createdAt").reverse().limit(limit).toArray();
  },

  async listFavorites(limit = 6): Promise<Inspiration[]> {
    const items = await db.inspirations
      .orderBy("createdAt")
      .reverse()
      .filter((i) => Boolean(i.favorite))
      .limit(limit)
      .toArray();
    return items;
  },

  async collectionStats(): Promise<Record<string, number>> {
    const items = await this.getAll();
    const map: Record<string, number> = {};
    for (const i of items) {
      const key = i.collection ?? "__uncategorized";
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  },

  async projectStats(projectId: string): Promise<number> {
    return db.inspirations.filter((i) => i.projectId === projectId).count();
  },
};
