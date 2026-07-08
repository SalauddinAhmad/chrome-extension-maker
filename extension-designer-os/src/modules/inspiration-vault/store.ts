import { create } from "zustand";
import { toast } from "sonner";
import { inspirationRepository } from "./repository";
import {
  DEFAULT_COLLECTIONS,
  normalizeCollectionId,
  type CollectionDef,
} from "./logic/collections";
import { captureActivePage, parseTags } from "./logic/capture";
import { inspirationFormSchema } from "./logic/validation";
import type { Inspiration } from "@/types";
import type { VaultFilters, VaultTab, VaultView } from "./types";

interface DraftState {
  id?: string;                 // set when editing
  title: string;
  url: string;
  thumbnail?: string;
  tagsRaw: string;
  notes: string;
  collection: string;          // "" = none
  projectId: string;           // "" = none
  favorite: boolean;
}

const emptyDraft: DraftState = {
  title: "",
  url: "",
  thumbnail: undefined,
  tagsRaw: "",
  notes: "",
  collection: "",
  projectId: "",
  favorite: false,
};

const defaultFilters: VaultFilters = {
  search: "",
  projectId: "__any",
  collection: "__any",
  favoritesOnly: false,
  since: "any",
};

interface VaultState {
  tab: VaultTab;
  view: VaultView;
  draft: DraftState;
  fieldErrors: Partial<Record<keyof DraftState, string>>;
  isCapturing: boolean;
  isSaving: boolean;
  filters: VaultFilters;
  editOpen: boolean;
  customCollections: CollectionDef[];

  setTab: (tab: VaultTab) => void;
  setView: (view: VaultView) => void;
  setFilters: (patch: Partial<VaultFilters>) => void;
  resetFilters: () => void;
  setDraft: (patch: Partial<DraftState>) => void;
  resetDraft: () => void;
  capture: () => Promise<void>;
  save: () => Promise<Inspiration | null>;
  remove: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  moveToProject: (id: string, projectId: string | undefined) => Promise<void>;
  openEdit: (id: string) => Promise<void>;
  closeEdit: () => void;
  addCustomCollection: (name: string) => string;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  tab: "save",
  view: "grid",
  draft: { ...emptyDraft },
  fieldErrors: {},
  isCapturing: false,
  isSaving: false,
  filters: { ...defaultFilters },
  editOpen: false,
  customCollections: [],

  setTab: (tab) => set({ tab, fieldErrors: {} }),
  setView: (view) => set({ view }),
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),
  setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch }, fieldErrors: {} })),
  resetDraft: () => set({ draft: { ...emptyDraft }, fieldErrors: {} }),

  async capture() {
    set({ isCapturing: true });
    try {
      const page = await captureActivePage();
      set((s) => ({
        draft: {
          ...s.draft,
          title: s.draft.title || page.title,
          url: s.draft.url || page.url,
          thumbnail: page.thumbnail ?? s.draft.thumbnail,
        },
      }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Capture failed");
    } finally {
      set({ isCapturing: false });
    }
  },

  async save() {
    const { draft } = get();
    const parsed = inspirationFormSchema.safeParse({
      title: draft.title,
      url: draft.url,
      notes: draft.notes,
      tagsRaw: draft.tagsRaw,
      collection: draft.collection,
      projectId: draft.projectId,
      favorite: draft.favorite,
      thumbnail: draft.thumbnail,
    });
    if (!parsed.success) {
      const errs: Partial<Record<keyof DraftState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof DraftState | undefined;
        if (key && !errs[key]) errs[key] = issue.message;
      }
      set({ fieldErrors: errs });
      return null;
    }

    set({ isSaving: true, fieldErrors: {} });
    try {
      const payload = {
        title: parsed.data.title,
        url: parsed.data.url,
        notes: parsed.data.notes,
        thumbnail: draft.thumbnail,
        tags: parseTags(draft.tagsRaw),
        collection: draft.collection || undefined,
        projectId: draft.projectId || undefined,
        favorite: draft.favorite || undefined,
      };
      let saved: Inspiration;
      if (draft.id) {
        await inspirationRepository.update(draft.id, payload);
        saved = { ...(await inspirationRepository.getById(draft.id))! };
        toast.success("Inspiration updated");
      } else {
        saved = await inspirationRepository.create(payload);
        toast.success("Saved to vault");
      }
      set({ draft: { ...emptyDraft }, editOpen: false });
      return saved;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
      return null;
    } finally {
      set({ isSaving: false });
    }
  },

  async remove(id) {
    try {
      await inspirationRepository.remove(id);
      toast.success("Deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  },

  async toggleFavorite(id) {
    try {
      await inspirationRepository.toggleFavorite(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  },

  async moveToProject(id, projectId) {
    try {
      await inspirationRepository.moveToProject(id, projectId);
      toast.success(projectId ? "Moved to project" : "Removed from project");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Move failed");
    }
  },

  async openEdit(id) {
    try {
      const item = await inspirationRepository.getById(id);
      if (!item) {
        toast.error("Inspiration not found");
        return;
      }
      set({
        draft: {
          id: item.id,
          title: item.title,
          url: item.url,
          thumbnail: item.thumbnail,
          tagsRaw: item.tags.join(", "),
          notes: item.notes ?? "",
          collection: item.collection ?? "",
          projectId: item.projectId ?? "",
          favorite: item.favorite ?? false,
        },
        editOpen: true,
        fieldErrors: {},
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    }
  },

  closeEdit: () => set({ editOpen: false, draft: { ...emptyDraft }, fieldErrors: {} }),

  addCustomCollection: (name) => {
    const id = normalizeCollectionId(name);
    if (!id) return "";
    const state = get();
    const exists =
      DEFAULT_COLLECTIONS.some((c) => c.id === id) ||
      state.customCollections.some((c) => c.id === id);
    if (!exists) {
      set({
        customCollections: [...state.customCollections, { id, name: name.trim() }],
      });
    }
    return id;
  },
}));
