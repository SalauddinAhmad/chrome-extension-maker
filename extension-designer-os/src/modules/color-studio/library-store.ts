/**
 * Library store — owns saved-color library UI state.
 * Picker/tab state stays in ./store.ts. This is analogous to the
 * Asset Manager's library-store split.
 */
import { create } from "zustand";
import { toast } from "sonner";
import { colorRepository, type ColorFilters, type ColorSort } from "./repository";
import type { StoredColor } from "@/types";

export type LibraryView = "grid" | "list" | "palette";

const defaultFilters: ColorFilters = {
  search: "",
  projectId: "__any",
  source: "__any",
  favoritesOnly: false,
  dateRange: "any",
  sort: "created-desc",
};

interface LibraryState {
  view: LibraryView;
  filters: ColorFilters;
  selected: Set<string>;
  detailId: string | null;

  setView: (view: LibraryView) => void;
  setFilters: (patch: Partial<ColorFilters>) => void;
  resetFilters: () => void;
  setSort: (sort: ColorSort) => void;

  toggleSelected: (id: string) => void;
  clearSelection: () => void;

  openDetail: (id: string) => void;
  closeDetail: () => void;

  createColor: (
    data: Omit<StoredColor, "id" | "createdAt" | "updatedAt">,
  ) => Promise<StoredColor | null>;
  updateColor: (id: string, patch: Partial<StoredColor>) => Promise<void>;
  deleteColor: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  moveToProject: (id: string, projectId: string | undefined) => Promise<void>;
  bulkDelete: () => Promise<void>;
}

export const useColorLibraryStore = create<LibraryState>((set, get) => ({
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

  async createColor(data) {
    try { return await colorRepository.create(data); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); return null; }
  },
  async updateColor(id, patch) {
    try { await colorRepository.update(id, patch); toast.success("Color updated"); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Update failed"); }
  },
  async deleteColor(id) {
    try {
      await colorRepository.remove(id);
      const sel = new Set(get().selected); sel.delete(id);
      set({ selected: sel, detailId: get().detailId === id ? null : get().detailId });
      toast.success("Color deleted");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Delete failed"); }
  },
  async toggleFavorite(id) {
    try { await colorRepository.toggleFavorite(id); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  },
  async moveToProject(id, projectId) {
    try {
      await colorRepository.moveToProject(id, projectId);
      toast.success(projectId ? "Moved to project" : "Removed from project");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Move failed"); }
  },
  async bulkDelete() {
    const ids = Array.from(get().selected);
    if (!ids.length) return;
    try {
      await colorRepository.removeMany(ids);
      set({ selected: new Set() });
      toast.success(`Deleted ${ids.length} color${ids.length === 1 ? "" : "s"}`);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Delete failed"); }
  },
}));
