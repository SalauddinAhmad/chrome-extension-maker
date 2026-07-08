import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ResourceState {
  category: string;              // "all" | ResourceCategory
  query: string;
  favorites: string[];           // resource ids
  freeOnly: boolean;
  setCategory: (c: string) => void;
  setQuery: (q: string) => void;
  toggleFree: () => void;
  toggleFavorite: (id: string) => void;
}

export const useResourceStore = create<ResourceState>()(
  persist(
    (set, get) => ({
      category: "all",
      query: "",
      favorites: [],
      freeOnly: false,
      setCategory: (category) => set({ category }),
      setQuery: (query) => set({ query }),
      toggleFree: () => set({ freeOnly: !get().freeOnly }),
      toggleFavorite: (id) => {
        const cur = get().favorites;
        set({
          favorites: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
        });
      },
    }),
    { name: "designer-os:resource-hub" },
  ),
);
