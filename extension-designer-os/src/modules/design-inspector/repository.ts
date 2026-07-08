/**
 * Design Inspector Repository — the ONLY module allowed to touch
 * `db.designReports`. All CRUD, filtering, and stats flow through here.
 */
import { db, designReportsRepo } from "@/storage";
import type { DesignReport } from "@/types";

export type ReportSort = "created-desc" | "created-asc" | "title-asc" | "url-asc";

export type ReportDateRange = "any" | "today" | "week" | "month";

export interface ReportFilters {
  search?: string;
  projectId?: string | "__any" | "__none";
  savedOnly?: boolean;
  dateRange?: ReportDateRange;
  sort?: ReportSort;
}

function hostname(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

function matchesSearch(r: DesignReport, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  return (
    r.title.toLowerCase().includes(n) ||
    r.url.toLowerCase().includes(n) ||
    hostname(r.url).toLowerCase().includes(n)
  );
}

function sinceForRange(range: ReportDateRange): number {
  const d = 24 * 60 * 60 * 1000;
  switch (range) {
    case "today": return Date.now() - d;
    case "week": return Date.now() - 7 * d;
    case "month": return Date.now() - 30 * d;
    default: return 0;
  }
}

function sortReports(items: DesignReport[], sort: ReportSort): DesignReport[] {
  const arr = [...items];
  switch (sort) {
    case "created-asc": return arr.sort((a, b) => a.createdAt - b.createdAt);
    case "title-asc": return arr.sort((a, b) => a.title.localeCompare(b.title));
    case "url-asc": return arr.sort((a, b) => hostname(a.url).localeCompare(hostname(b.url)));
    case "created-desc":
    default: return arr.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export const designInspectorRepository = {
  async getAll(): Promise<DesignReport[]> {
    return db.designReports.orderBy("createdAt").reverse().toArray();
  },

  async getById(id: string): Promise<DesignReport | undefined> {
    return designReportsRepo.get(id);
  },

  async query(filters: ReportFilters = {}): Promise<DesignReport[]> {
    const all = await this.getAll();
    const since = sinceForRange(filters.dateRange ?? "any");
    const filtered = all.filter((r) => {
      if (filters.projectId === "__none" && r.projectId) return false;
      if (
        filters.projectId &&
        filters.projectId !== "__any" &&
        filters.projectId !== "__none" &&
        r.projectId !== filters.projectId
      ) return false;
      if (filters.savedOnly && !r.saved) return false;
      if (since && r.createdAt < since) return false;
      if (!matchesSearch(r, (filters.search ?? "").trim())) return false;
      return true;
    });
    return sortReports(filtered, filters.sort ?? "created-desc");
  },

  async create(
    data: Omit<DesignReport, "id" | "createdAt" | "updatedAt">,
  ): Promise<DesignReport> {
    return designReportsRepo.create(data);
  },

  async update(id: string, patch: Partial<DesignReport>): Promise<void> {
    return designReportsRepo.update(id, patch);
  },

  /** Cascade delete: also drops audits + a11y reports that reference this report. */
  async remove(id: string): Promise<void> {
    await db.transaction(
      "rw",
      [db.designReports, db.designAudits, db.accessibilityReports],
      async () => {
        await db.designAudits.where("reportId").equals(id).delete();
        await db.accessibilityReports.where("reportId").equals(id).delete();
        await db.designReports.delete(id);
      },
    );
  },

  async removeMany(ids: string[]): Promise<void> {
    await db.transaction(
      "rw",
      [db.designReports, db.designAudits, db.accessibilityReports],
      async () => {
        await db.designAudits.where("reportId").anyOf(ids).delete();
        await db.accessibilityReports.where("reportId").anyOf(ids).delete();
        await db.designReports.bulkDelete(ids);
      },
    );
  },

  async listRecent(limit = 6): Promise<DesignReport[]> {
    return db.designReports.orderBy("createdAt").reverse().limit(limit).toArray();
  },

  async listByProject(projectId: string): Promise<DesignReport[]> {
    return db.designReports.where("projectId").equals(projectId).reverse().sortBy("createdAt");
  },

  async topSites(limit = 5): Promise<Array<{ host: string; count: number }>> {
    const all = await this.getAll();
    const map = new Map<string, number>();
    for (const r of all) {
      const h = hostname(r.url);
      map.set(h, (map.get(h) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([host, count]) => ({ host, count }));
  },

  async statistics(): Promise<{
    total: number;
    saved: number;
    uniqueSites: number;
    componentTotal: number;
  }> {
    const all = await this.getAll();
    const hosts = new Set(all.map((r) => hostname(r.url)));
    return {
      total: all.length,
      saved: all.filter((r) => r.saved).length,
      uniqueSites: hosts.size,
      componentTotal: all.reduce(
        (acc, r) => acc + r.components.reduce((a, c) => a + c.count, 0),
        0,
      ),
    };
  },
};
