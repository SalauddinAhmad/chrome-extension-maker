/**
 * Accessibility Repository — the ONLY module allowed to touch
 * `db.accessibilityReports`. All CRUD, filtering, and stats flow here.
 */
import { db, accessibilityReportsRepo } from "@/storage";
import type { AccessibilityReport } from "@/types";

export type A11ySort = "created-desc" | "created-asc" | "score-desc" | "score-asc";
export type A11yDateRange = "any" | "today" | "week" | "month";

export interface A11yFilters {
  search?: string;
  projectId?: string | "__any" | "__none";
  minScore?: number;
  dateRange?: A11yDateRange;
  sort?: A11ySort;
}

function host(u: string) { try { return new URL(u).hostname; } catch { return u; } }

function matchesSearch(r: AccessibilityReport, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  return r.title.toLowerCase().includes(n) ||
    r.url.toLowerCase().includes(n) ||
    host(r.url).toLowerCase().includes(n);
}

function sinceFor(range: A11yDateRange): number {
  const d = 24 * 60 * 60 * 1000;
  switch (range) {
    case "today": return Date.now() - d;
    case "week": return Date.now() - 7 * d;
    case "month": return Date.now() - 30 * d;
    default: return 0;
  }
}

function sortItems(items: AccessibilityReport[], sort: A11ySort): AccessibilityReport[] {
  const arr = [...items];
  switch (sort) {
    case "created-asc": return arr.sort((a, b) => a.createdAt - b.createdAt);
    case "score-desc": return arr.sort((a, b) => b.overall - a.overall);
    case "score-asc": return arr.sort((a, b) => a.overall - b.overall);
    case "created-desc":
    default: return arr.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export const accessibilityRepository = {
  async getAll(): Promise<AccessibilityReport[]> {
    return db.accessibilityReports.orderBy("createdAt").reverse().toArray();
  },

  async getById(id: string): Promise<AccessibilityReport | undefined> {
    return accessibilityReportsRepo.get(id);
  },

  async query(filters: A11yFilters = {}): Promise<AccessibilityReport[]> {
    const all = await this.getAll();
    const since = sinceFor(filters.dateRange ?? "any");
    const filtered = all.filter((r) => {
      if (filters.projectId === "__none" && r.projectId) return false;
      if (
        filters.projectId &&
        filters.projectId !== "__any" &&
        filters.projectId !== "__none" &&
        r.projectId !== filters.projectId
      ) return false;
      if (typeof filters.minScore === "number" && r.overall < filters.minScore) return false;
      if (since && r.createdAt < since) return false;
      if (!matchesSearch(r, (filters.search ?? "").trim())) return false;
      return true;
    });
    return sortItems(filtered, filters.sort ?? "created-desc");
  },

  async create(data: Omit<AccessibilityReport, "id" | "createdAt" | "updatedAt">): Promise<AccessibilityReport> {
    return accessibilityReportsRepo.create(data);
  },

  async update(id: string, patch: Partial<AccessibilityReport>): Promise<void> {
    return accessibilityReportsRepo.update(id, patch);
  },

  async remove(id: string): Promise<void> {
    return accessibilityReportsRepo.remove(id);
  },

  async removeMany(ids: string[]): Promise<void> {
    await db.accessibilityReports.bulkDelete(ids);
  },

  async listRecent(limit = 5): Promise<AccessibilityReport[]> {
    return db.accessibilityReports.orderBy("createdAt").reverse().limit(limit).toArray();
  },

  async listByReportId(reportId: string): Promise<AccessibilityReport[]> {
    return db.accessibilityReports.where("reportId").equals(reportId).reverse().sortBy("createdAt");
  },

  /** Latest accessibility report for a given design report id, if any. */
  async latestForReport(reportId: string): Promise<AccessibilityReport | undefined> {
    const list = await this.listByReportId(reportId);
    return list[0];
  },

  async statistics(): Promise<{
    total: number;
    averageScore: number;
    bestScore: number;
    worstScore: number;
    gradeCounts: Record<string, number>;
  }> {
    const all = await this.getAll();
    if (all.length === 0) {
      return { total: 0, averageScore: 0, bestScore: 0, worstScore: 0, gradeCounts: {} };
    }
    const scores = all.map((r) => r.overall);
    const gradeCounts: Record<string, number> = {};
    for (const r of all) gradeCounts[r.grade] = (gradeCounts[r.grade] ?? 0) + 1;
    return {
      total: all.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      gradeCounts,
    };
  },
};
