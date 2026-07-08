import { create } from "zustand";
import type { ModuleId } from "@/lib/modules";

interface UIState {
  activeModule: ModuleId;
  commandOpen: boolean;
  query: string;
  setActiveModule: (id: ModuleId) => void;
  setCommandOpen: (open: boolean) => void;
  setQuery: (q: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModule: "dashboard",
  commandOpen: false,
  query: "",
  setActiveModule: (id) => set({ activeModule: id }),
  setCommandOpen: (open) => set({ commandOpen: open }),
  setQuery: (q) => set({ query: q }),
}));
