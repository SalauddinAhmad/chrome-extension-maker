import { create } from "zustand";
import { notesRepo } from "@/storage";
import type { Note } from "@/types";

function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,\s]+/)
        .map((t) => t.trim().replace(/^#/, "").toLowerCase())
        .filter(Boolean),
    ),
  );
}

interface NotesState {
  editingId: string | null;
  title: string;
  body: string;
  tagsRaw: string;
  pinned: boolean;
  query: string;
  isSaving: boolean;
  error: string | null;
  setQuery: (q: string) => void;
  setField: (patch: Partial<Pick<NotesState, "title" | "body" | "tagsRaw" | "pinned">>) => void;
  newNote: () => void;
  edit: (note: Note) => void;
  save: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  togglePin: (note: Note) => Promise<void>;
  cancel: () => void;
}

const empty = { editingId: null, title: "", body: "", tagsRaw: "", pinned: false };

export const useNotesStore = create<NotesState>((set, get) => ({
  ...empty,
  query: "",
  isSaving: false,
  error: null,

  setQuery: (query) => set({ query }),
  setField: (patch) => set(patch as Partial<NotesState>),

  newNote: () => set({ ...empty, error: null }),

  edit: (note) =>
    set({
      editingId: note.id,
      title: note.title,
      body: note.body,
      tagsRaw: note.tags.map((t) => `#${t}`).join(" "),
      pinned: note.pinned,
      error: null,
    }),

  cancel: () => set({ ...empty, error: null }),

  async save() {
    const { editingId, title, body, tagsRaw, pinned } = get();
    if (!title.trim() && !body.trim()) {
      set({ error: "Note is empty." });
      return;
    }
    set({ isSaving: true, error: null });
    try {
      const payload = {
        title: title.trim() || "Untitled",
        body,
        tags: parseTags(tagsRaw),
        pinned,
      };
      if (editingId) {
        await notesRepo.update(editingId, payload);
      } else {
        await notesRepo.create(payload);
      }
      set({ ...empty });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ isSaving: false });
    }
  },

  async remove(id) {
    await notesRepo.remove(id);
    if (get().editingId === id) set({ ...empty });
  },

  async togglePin(note) {
    await notesRepo.update(note.id, { pinned: !note.pinned });
  },
}));
