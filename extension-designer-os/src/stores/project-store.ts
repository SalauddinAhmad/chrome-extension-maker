import { create } from "zustand";
import { projectsRepo, db } from "@/storage";
import type { Project } from "@/types";

interface ProjectState {
  activeProjectId: string | null;
  detailProjectId: string | null;
  newProjectRequestId: number;
  setActiveProject: (id: string | null) => void;
  openProjectDetail: (id: string | null) => void;
  requestNewProject: () => void;

  // Repository-layer actions (do not hit Dexie from components)
  createProject: (
    data: Omit<Project, "id" | "createdAt" | "updatedAt" | "archived"> &
      Partial<Pick<Project, "archived">>,
  ) => Promise<Project>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string, archived: boolean) => Promise<void>;
  getProject: (id: string) => Promise<Project | undefined>;
  getProjects: (opts?: { includeArchived?: boolean }) => Promise<Project[]>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  activeProjectId: null,
  detailProjectId: null,
  newProjectRequestId: 0,
  setActiveProject: (id) => set({ activeProjectId: id }),
  openProjectDetail: (id) => set({ detailProjectId: id }),
  requestNewProject: () =>
    set((s) => ({ newProjectRequestId: s.newProjectRequestId + 1 })),

  createProject: (data) =>
    projectsRepo.create({ archived: false, ...data }),
  updateProject: (id, patch) => projectsRepo.update(id, patch),
  deleteProject: async (id) => {
    await projectsRepo.remove(id);
    if (get().activeProjectId === id) set({ activeProjectId: null });
    if (get().detailProjectId === id) set({ detailProjectId: null });
  },
  archiveProject: (id, archived) => projectsRepo.update(id, { archived }),
  getProject: (id) => projectsRepo.get(id),
  getProjects: async ({ includeArchived = false } = {}) => {
    const all = await db.projects.orderBy("createdAt").reverse().toArray();
    return includeArchived ? all : all.filter((p) => !p.archived);
  },
}));
