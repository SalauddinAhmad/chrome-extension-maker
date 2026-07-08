/**
 * Library store — owns the saved-asset library UI state.
 * The extraction (scan) store lives separately in ./store.ts.
 */
import { create } from "zustand";
import { toast } from "sonner";
import { downloadFile } from "@/lib/chrome";
import { useProjectStore } from "@/stores/project-store";
import { assetRepository, type AssetFilters, type AssetSort } from "./repository";
import { fileToAssetPayload, scannedToAssetPayload } from "./logic/import";
import { safeFilename } from "./logic/download";
import type { ScannedAsset } from "./types";
import type { Asset } from "@/types";

export type LibraryView = "grid" | "list";

const defaultFilters: AssetFilters = {
  search: "",
  projectId: "__any",
  type: "__any",
  source: "__any",
  favoritesOnly: false,
  dateRange: "any",
  sort: "created-desc",
};

interface LibraryState {
  view: LibraryView;
  filters: AssetFilters;
  selected: Set<string>;
  detailId: string | null;

  setView: (view: LibraryView) => void;
  setFilters: (patch: Partial<AssetFilters>) => void;
  resetFilters: () => void;
  setSort: (sort: AssetSort) => void;

  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  openDetail: (id: string) => void;
  closeDetail: () => void;

  toggleFavorite: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  update: (id: string, patch: Partial<Asset>) => Promise<void>;
  moveToProject: (id: string, projectId: string | undefined) => Promise<void>;

  bulkDownload: () => Promise<void>;
  bulkDelete: () => Promise<void>;
  bulkMove: (projectId: string | undefined) => Promise<void>;

  saveScanned: (items: ScannedAsset[], pageUrl?: string) => Promise<number>;
  uploadFiles: (files: FileList | File[]) => Promise<number>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
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
  selectAll: (ids) => set({ selected: new Set(ids) }),
  clearSelection: () => set({ selected: new Set() }),

  openDetail: (id) => set({ detailId: id }),
  closeDetail: () => set({ detailId: null }),

  async toggleFavorite(id) {
    try { await assetRepository.toggleFavorite(id); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  },
  async remove(id) {
    try {
      await assetRepository.remove(id);
      const sel = new Set(get().selected); sel.delete(id);
      set({ selected: sel, detailId: get().detailId === id ? null : get().detailId });
      toast.success("Asset deleted");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Delete failed"); }
  },
  async update(id, patch) {
    try { await assetRepository.update(id, patch); toast.success("Asset updated"); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Update failed"); }
  },
  async moveToProject(id, projectId) {
    try {
      await assetRepository.moveToProject(id, projectId);
      toast.success(projectId ? "Moved to project" : "Removed from project");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Move failed"); }
  },

  async bulkDownload() {
    const ids = Array.from(get().selected);
    if (!ids.length) return;
    let done = 0;
    for (const id of ids) {
      const a = await assetRepository.getById(id);
      if (!a) continue;
      try {
        await downloadFile(a.url, safeFilename(a.name));
        done += 1;
      } catch { /* ignore */ }
    }
    toast.success(`Downloaded ${done} asset${done === 1 ? "" : "s"}`);
  },
  async bulkDelete() {
    const ids = Array.from(get().selected);
    if (!ids.length) return;
    try {
      await assetRepository.removeMany(ids);
      set({ selected: new Set() });
      toast.success(`Deleted ${ids.length} asset${ids.length === 1 ? "" : "s"}`);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Delete failed"); }
  },
  async bulkMove(projectId) {
    const ids = Array.from(get().selected);
    if (!ids.length) return;
    try {
      await assetRepository.moveManyToProject(ids, projectId);
      set({ selected: new Set() });
      toast.success(`Moved ${ids.length} asset${ids.length === 1 ? "" : "s"}`);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Move failed"); }
  },

  async saveScanned(items, pageUrl) {
    if (!items.length) return 0;
    const projectId = useProjectStore.getState().activeProjectId ?? undefined;
    let saved = 0;
    for (const s of items) {
      try {
        const payload = scannedToAssetPayload(s, projectId, pageUrl);
        await assetRepository.create(payload);
        saved += 1;
      } catch { /* skip failures */ }
    }
    if (saved > 0) {
      toast.success(
        projectId
          ? `Saved ${saved} asset${saved === 1 ? "" : "s"} to active project`
          : `Saved ${saved} asset${saved === 1 ? "" : "s"} to library`,
      );
    }
    return saved;
  },

  async uploadFiles(files) {
    const list = Array.from(files);
    if (!list.length) return 0;
    const projectId = useProjectStore.getState().activeProjectId ?? undefined;
    let saved = 0;
    for (const file of list) {
      try {
        const payload = await fileToAssetPayload(file, projectId);
        await assetRepository.create(payload);
        saved += 1;
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof Error ? err.message : "Failed"}`);
      }
    }
    if (saved > 0) toast.success(`Uploaded ${saved} file${saved === 1 ? "" : "s"}`);
    return saved;
  },
}));
