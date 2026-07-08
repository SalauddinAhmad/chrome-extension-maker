/**
 * Notes Repository — the ONLY module allowed to touch `db.notes`.
 */
import { db, notesRepo } from "@/storage";
import type { Note } from "@/types";

export type NoteSort = "updated-desc" | "created-desc" | "title-asc";

export interface NoteFilters {
  search?: string;
  projectId?: string | "__any" | "__none";
  pinnedOnly?: boolean;
  sort?: NoteSort;
}

function matchesSearch(n: Note, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    n.title.toLowerCase().includes(needle) ||
    n.body.toLowerCase().includes(needle) ||
    n.tags.some((t) => t.toLowerCase().includes(needle))
  );
}

function sortNotes(items: Note[], sort: NoteSort): Note[] {
  const arr = [...items];
  switch (sort) {
    case "created-desc": return arr.sort((a, b) => b.createdAt - a.createdAt);
    case "title-asc": return arr.sort((a, b) => a.title.localeCompare(b.title));
    case "updated-desc":
    default: return arr.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export const noteRepository = {
  async getAll(): Promise<Note[]> {
    return db.notes.orderBy("updatedAt").reverse().toArray();
  },

  async getById(id: string): Promise<Note | undefined> {
    return notesRepo.get(id);
  },

  async query(filters: NoteFilters = {}): Promise<Note[]> {
    const all = await this.getAll();
    const filtered = all.filter((n) => {
      if (filters.projectId === "__none" && n.projectId) return false;
      if (
        filters.projectId &&
        filters.projectId !== "__any" &&
        filters.projectId !== "__none" &&
        n.projectId !== filters.projectId
      ) return false;
      if (filters.pinnedOnly && !n.pinned) return false;
      if (!matchesSearch(n, (filters.search ?? "").trim())) return false;
      return true;
    });
    return sortNotes(filtered, filters.sort ?? "updated-desc");
  },

  async listRecent(limit = 30): Promise<Note[]> {
    return db.notes.orderBy("updatedAt").reverse().limit(limit).toArray();
  },

  async listForProject(projectId: string): Promise<Note[]> {
    return db.notes.filter((n) => n.projectId === projectId).reverse().sortBy("updatedAt");
  },

  async countForProject(projectId: string): Promise<number> {
    return db.notes.filter((n) => n.projectId === projectId).count();
  },

  async count(): Promise<number> {
    return db.notes.count();
  },

  async create(data: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
    return notesRepo.create(data);
  },

  async update(id: string, patch: Partial<Note>): Promise<void> {
    return notesRepo.update(id, patch);
  },

  async remove(id: string): Promise<void> {
    return notesRepo.remove(id);
  },
};
