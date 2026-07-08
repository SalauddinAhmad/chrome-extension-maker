/**
 * Design Audit Repository — the ONLY module allowed to touch
 * `db.designAudits`. All CRUD, filtering, and stats flow through here.
 */
import { db, designAuditsRepo } from "@/storage";
import type { DesignAudit } from "@/types";

export type AuditSort = "created-desc" | "created-asc" | "score-desc" | "score-asc";

export type AuditDateRange = "any" | "today" | "week" | "month";

export interface AuditFilters {
  search?: string;
  projectId?: string | "__any" | "__none";
  minScore?: number;
  dateRange?: AuditDateRange;
  sort?: AuditSort;
}

function hostname(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

function matchesSearch(a: DesignAudit, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  return (
    a.title.toLowerCase().includes(n) ||
    a.url.toLowerCase().includes(n) ||
    hostname(a.url).toLowerCase().includes(n)
  );
}

function sinceForRange(range: AuditDateRange): number {
  const d = 24 * 60 * 60 * 1000;
  switch (range) {
    case "today": return Date.now() - d;
    case "week": return Date.now() - 7 * d;
    case "month": return Date.now() - 30 * d;
    default: return 0;
  }
}

function sortAudits(items: DesignAudit[], sort: AuditSort): DesignAudit[] {
  const arr = [...items];
  switch (sort) {
    case "created-asc": return arr.sort((a, b) => a.createdAt - b.createdAt);
    case "score-desc": return arr.sort((a, b) => b.overall - a.overall);
    case "score-asc": return arr.sort((a, b) => a.overall - b.overall);
    case "created-desc":
    default: return arr.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export const designAuditRepository = {
  async getAll(): Promise<DesignAudit[]> {
    return db.designAudits.orderBy("createdAt").reverse().toArray();
  },

  async getById(id: string): Promise<DesignAudit | undefined> {
    return designAuditsRepo.get(id);
  },

  async query(filters: AuditFilters = {}): Promise<DesignAudit[]> {
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
      if (typeof filters.minScore === "number" && a.overall < filters.minScore) return false;
      if (since && a.createdAt < since) return false;
      if (!matchesSearch(a, (filters.search ?? "").trim())) return false;
      return true;
    });
    return sortAudits(filtered, filters.sort ?? "created-desc");
  },

  async create(
    data: Omit<DesignAudit, "id" | "createdAt" | "updatedAt">,
  ): Promise<DesignAudit> {
    return designAuditsRepo.create(data);
  },

  async update(id: string, patch: Partial<DesignAudit>): Promise<void> {
    return designAuditsRepo.update(id, patch);
  },

  async remove(id: string): Promise<void> {
    return designAuditsRepo.remove(id);
  },

  async removeMany(ids: string[]): Promise<void> {
    await db.designAudits.bulkDelete(ids);
  },

  async listRecent(limit = 5): Promise<DesignAudit[]> {
    return db.designAudits.orderBy("createdAt").reverse().limit(limit).toArray();
  },

  async listByReport(reportId: string): Promise<DesignAudit[]> {
    return db.designAudits.where("reportId").equals(reportId).reverse().sortBy("createdAt");
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
    const scores = all.map((a) => a.overall);
    const gradeCounts: Record<string, number> = {};
    for (const a of all) gradeCounts[a.grade] = (gradeCounts[a.grade] ?? 0) + 1;
    return {
      total: all.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      gradeCounts,
    };
  },
};
