/**
 * Asset Repository — the ONLY module allowed to touch `db.assets`.
 * All CRUD, filtering, and bulk operations go through here.
 */
import { db, assetsRepo } from "@/storage";
import type { Asset, AssetSource, AssetType } from "@/types";

export type AssetSort = "created-desc" | "created-asc" | "name-asc" | "size-desc";

export type AssetDateRange = "any" | "today" | "week" | "month";

export interface AssetFilters {
  search?: string;
  projectId?: string | "__any" | "__none";
  type?: AssetType | "__any";
  source?: AssetSource | "__any";
  favoritesOnly?: boolean;
  dateRange?: AssetDateRange;
  sort?: AssetSort;
}

function matchesSearch(asset: Asset, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    asset.name.toLowerCase().includes(needle) ||
    asset.tags.some((t) => t.toLowerCase().includes(needle)) ||
    (asset.pageUrl?.toLowerCase().includes(needle) ?? false)
  );
}

function sinceForRange(range: AssetDateRange): number {
  const d = 24 * 60 * 60 * 1000;
  switch (range) {
    case "today": return Date.now() - d;
    case "week": return Date.now() - 7 * d;
    case "month": return Date.now() - 30 * d;
    default: return 0;
  }
}

function sortAssets(items: Asset[], sort: AssetSort): Asset[] {
  const arr = [...items];
  switch (sort) {
    case "created-asc": return arr.sort((a, b) => a.createdAt - b.createdAt);
    case "name-asc": return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "size-desc": return arr.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
    case "created-desc":
    default: return arr.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export const assetRepository = {
  async getAll(): Promise<Asset[]> {
    return db.assets.orderBy("createdAt").reverse().toArray();
  },

  async getById(id: string): Promise<Asset | undefined> {
    return assetsRepo.get(id);
  },

  async query(filters: AssetFilters = {}): Promise<Asset[]> {
    const all = await this.getAll();
    const since = sinceForRange(filters.dateRange ?? "any");

    const filtered = all.filter((a) => {
      if (filters.projectId === "__none" && a.projectId) return false;
      if (
        filters.projectId &&
        filters.projectId !== "__any" &&
        filters.projectId !== "__none" &&
        a.projectId !== filters.projectId
      ) return false;
      if (filters.type && filters.type !== "__any" && a.type !== filters.type) return false;
      if (filters.source && filters.source !== "__any" && a.source !== filters.source) return false;
      if (filters.favoritesOnly && !a.favorite) return false;
      if (since && a.createdAt < since) return false;
      if (!matchesSearch(a, (filters.search ?? "").trim())) return false;
      return true;
    });

    return sortAssets(filtered, filters.sort ?? "created-desc");
  },

  async create(data: Omit<Asset, "id" | "createdAt" | "updatedAt">): Promise<Asset> {
    return assetsRepo.create(data);
  },

  async update(id: string, patch: Partial<Asset>): Promise<void> {
    return assetsRepo.update(id, patch);
  },

  /** Cascade delete: also drops the paired binary in `assetBlobs`. */
  async remove(id: string): Promise<void> {
    await db.transaction("rw", [db.assets, db.assetBlobs], async () => {
      await db.assetBlobs.delete(id);
      await db.assets.delete(id);
    });
  },

  async removeMany(ids: string[]): Promise<void> {
    await db.transaction("rw", [db.assets, db.assetBlobs], async () => {
      await db.assetBlobs.bulkDelete(ids);
      await db.assets.bulkDelete(ids);
    });
  },

  async toggleFavorite(id: string): Promise<void> {
    const item = await this.getById(id);
    if (!item) return;
    return this.update(id, { favorite: !item.favorite });
  },

  async moveToProject(id: string, projectId: string | undefined): Promise<void> {
    return this.update(id, { projectId });
  },

  async moveManyToProject(ids: string[], projectId: string | undefined): Promise<void> {
    const now = Date.now();
    await db.transaction("rw", db.assets, async () => {
      for (const id of ids) {
        await db.assets.update(id, { projectId, updatedAt: now });
      }
    });
  },

  async listRecent(limit = 6): Promise<Asset[]> {
    return db.assets.orderBy("createdAt").reverse().limit(limit).toArray();
  },

  async listFavorites(limit = 6): Promise<Asset[]> {
    return db.assets
      .orderBy("createdAt")
      .reverse()
      .filter((a) => Boolean(a.favorite))
      .limit(limit)
      .toArray();
  },

  async typeStats(): Promise<Record<string, number>> {
    const all = await this.getAll();
    const map: Record<string, number> = {};
    for (const a of all) map[a.type] = (map[a.type] ?? 0) + 1;
    return map;
  },
};
