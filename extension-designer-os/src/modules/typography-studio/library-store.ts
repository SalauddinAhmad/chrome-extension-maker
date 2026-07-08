/**
 * Library store — owns Font Library UI state (view, filters, selection,
 * detail dialog). Detection / picker state stays in ./store.ts.
 */
import { create } from "zustand";
import { toast } from "sonner";
import {
  typographyRepository,
  type FontFilters,
  type FontSort,
} from "./repository";
import type { StoredFont, TypographySystem, TypographyStyle } from "@/types";

export type LibraryView = "grid" | "list";

const defaultFilters: FontFilters = {
  search: "",
  projectId: "__any",
  category: "__any",
  source: "__any",
  favoritesOnly: false,
  dateRange: "any",
  sort: "created-desc",
};

interface LibraryState {
  view: LibraryView;
  filters: FontFilters;
  selected: Set<string>;
  detailId: string | null;

  setView: (view: LibraryView) => void;
  setFilters: (patch: Partial<FontFilters>) => void;
  resetFilters: () => void;
  setSort: (sort: FontSort) => void;

  toggleSelected: (id: string) => void;
  clearSelection: () => void;

  openDetail: (id: string) => void;
  closeDetail: () => void;

  createFont: (
    data: Omit<StoredFont, "id" | "createdAt" | "updatedAt">,
  ) => Promise<StoredFont | null>;
  updateFont: (id: string, patch: Partial<StoredFont>) => Promise<void>;
  deleteFont: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  moveToProject: (id: string, projectId: string | undefined) => Promise<void>;
  bulkDelete: () => Promise<void>;

  createSystem: (
    data: Omit<TypographySystem, "id" | "createdAt" | "updatedAt">,
  ) => Promise<TypographySystem | null>;
  updateSystem: (id: string, patch: Partial<TypographySystem>) => Promise<void>;
  deleteSystem: (id: string) => Promise<void>;
  toggleSystemFavorite: (id: string) => Promise<void>;
}

export const useTypographyLibraryStore = create<LibraryState>((set, get) => ({
  view: "grid",
  filters: { ...defaultFilters },
  selected: new Set(),
  detailId: null,

  setView: (view) => set({ view }),
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),
  setSort: (sort) => set((s) => ({ filters: { ...s.filters, sort } })),

  toggleSelected: (id) => {
    const next = new Set(get().selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ selected: next });
  },
  clearSelection: () => set({ selected: new Set() }),

  openDetail: (id) => set({ detailId: id }),
  closeDetail: () => set({ detailId: null }),

  async createFont(data) {
    try { const f = await typographyRepository.createFont(data); toast.success("Font saved"); return f; }
    catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); return null; }
  },
  async updateFont(id, patch) {
    try { await typographyRepository.updateFont(id, patch); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Update failed"); }
  },
  async deleteFont(id) {
    try {
      await typographyRepository.deleteFont(id);
      const sel = new Set(get().selected); sel.delete(id);
      set({ selected: sel, detailId: get().detailId === id ? null : get().detailId });
      toast.success("Font deleted");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Delete failed"); }
  },
  async toggleFavorite(id) {
    try { await typographyRepository.toggleFavorite(id); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  },
  async moveToProject(id, projectId) {
    try {
      await typographyRepository.moveToProject(id, projectId);
      toast.success(projectId ? "Moved to project" : "Removed from project");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Move failed"); }
  },
  async bulkDelete() {
    const ids = Array.from(get().selected);
    if (!ids.length) return;
    try {
      await typographyRepository.removeMany(ids);
      set({ selected: new Set() });
      toast.success(`Deleted ${ids.length} font${ids.length === 1 ? "" : "s"}`);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Delete failed"); }
  },

  async createSystem(data) {
    try { const s = await typographyRepository.createSystem(data); toast.success("System created"); return s; }
    catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); return null; }
  },
  async updateSystem(id, patch) {
    try { await typographyRepository.updateSystem(id, patch); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Update failed"); }
  },
  async deleteSystem(id) {
    try { await typographyRepository.deleteSystem(id); toast.success("System deleted"); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Delete failed"); }
  },
  async toggleSystemFavorite(id) {
    try { await typographyRepository.toggleSystemFavorite(id); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  },
}));

export type { TypographyStyle };
