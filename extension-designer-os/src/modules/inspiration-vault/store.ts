import { create } from "zustand";
import { inspirationsRepo } from "@/storage";
import { captureActivePage, parseTags } from "./logic/capture";
import type { VaultTab } from "./types";

interface DraftState {
  title: string;
  url: string;
  thumbnail?: string;
  tagsRaw: string;
  notes: string;
}

interface VaultState {
  tab: VaultTab;
  draft: DraftState;
  isCapturing: boolean;
  isSaving: boolean;
  query: string;
  error: string | null;
  setTab: (tab: VaultTab) => void;
  setQuery: (q: string) => void;
  setDraft: (patch: Partial<DraftState>) => void;
  capture: () => Promise<void>;
  save: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  resetDraft: () => void;
}

const emptyDraft: DraftState = {
  title: "",
  url: "",
  thumbnail: undefined,
  tagsRaw: "",
  notes: "",
};

export const useVaultStore = create<VaultState>((set, get) => ({
  tab: "save",
  draft: { ...emptyDraft },
  isCapturing: false,
  isSaving: false,
  query: "",
  error: null,

  setTab: (tab) => set({ tab, error: null }),
  setQuery: (query) => set({ query }),
  setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  resetDraft: () => set({ draft: { ...emptyDraft } }),

  async capture() {
    set({ isCapturing: true, error: null });
    try {
      const page = await captureActivePage();
      set((s) => ({
        draft: {
          ...s.draft,
          title: page.title,
          url: page.url,
          thumbnail: page.thumbnail,
        },
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ isCapturing: false });
    }
  },

  async save() {
    const { draft } = get();
    if (!draft.url.trim() || !draft.title.trim()) {
      set({ error: "Title and URL are required." });
      return;
    }
    set({ isSaving: true, error: null });
    try {
      await inspirationsRepo.create({
        title: draft.title.trim(),
        url: draft.url.trim(),
        thumbnail: draft.thumbnail,
        tags: parseTags(draft.tagsRaw),
        notes: draft.notes.trim() || undefined,
      });
      set({ draft: { ...emptyDraft }, tab: "vault" });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ isSaving: false });
    }
  },

  async remove(id) {
    await inspirationsRepo.remove(id);
  },
}));
