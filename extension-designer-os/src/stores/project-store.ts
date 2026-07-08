import { create } from "zustand";

interface ProjectState {
  activeProjectId: string | null;
  detailProjectId: string | null;
  setActiveProject: (id: string | null) => void;
  openProjectDetail: (id: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  activeProjectId: null,
  detailProjectId: null,
  setActiveProject: (id) => set({ activeProjectId: id }),
  openProjectDetail: (id) => set({ detailProjectId: id }),
}));
