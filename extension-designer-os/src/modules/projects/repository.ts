/**
 * Project repository — the ONLY module allowed to touch `db.projects`.
 * All other code (stores, components, other modules) must go through here.
 */
import { db, projectsRepo } from "@/storage";
import type { Project } from "@/types";

export type ProjectSort =
  | "updated-desc"
  | "created-desc"
  | "name-asc"
  | "name-desc";

export interface ProjectQueryOptions {
  includeArchived?: boolean;
  search?: string;
  sort?: ProjectSort;
}

function matchesSearch(p: Project, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    p.name.toLowerCase().includes(needle) ||
    (p.clientName?.toLowerCase().includes(needle) ?? false) ||
    (p.description?.toLowerCase().includes(needle) ?? false)
  );
}

function sortProjects(list: Project[], sort: ProjectSort): Project[] {
  const arr = [...list];
  switch (sort) {
    case "created-desc":
      return arr.sort((a, b) => b.createdAt - a.createdAt);
    case "name-asc":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return arr.sort((a, b) => b.name.localeCompare(a.name));
    case "updated-desc":
    default:
      return arr.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export const projectRepository = {
  async getAll(): Promise<Project[]> {
    return db.projects.orderBy("createdAt").reverse().toArray();
  },

  async getById(id: string): Promise<Project | undefined> {
    return projectsRepo.get(id);
  },

  async query(opts: ProjectQueryOptions = {}): Promise<Project[]> {
    const { includeArchived = false, search = "", sort = "updated-desc" } = opts;
    const all = await this.getAll();
    const filtered = all.filter(
      (p) => (includeArchived || !p.archived) && matchesSearch(p, search),
    );
    return sortProjects(filtered, sort);
  },

  /** Case-insensitive uniqueness check across all (including archived). */
  async isNameTaken(name: string, excludeId?: string): Promise<boolean> {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return false;
    const all = await this.getAll();
    return all.some(
      (p) => p.id !== excludeId && p.name.trim().toLowerCase() === trimmed,
    );
  },

  async create(data: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    return projectsRepo.create(data);
  },

  async update(id: string, patch: Partial<Project>): Promise<void> {
    return projectsRepo.update(id, patch);
  },

  async remove(id: string): Promise<void> {
    return projectsRepo.remove(id);
  },

  async archive(id: string, archived: boolean): Promise<void> {
    return projectsRepo.update(id, { archived });
  },
};

export const SORT_LABELS: Record<ProjectSort, string> = {
  "updated-desc": "Recently updated",
  "created-desc": "Recently created",
  "name-asc": "Name A → Z",
  "name-desc": "Name Z → A",
};
