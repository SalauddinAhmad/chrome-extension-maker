import { create } from "zustand";
import { projectRepository } from "@/modules/projects/repository";
import type { Project } from "@/types";

export class DuplicateProjectNameError extends Error {
  constructor(name: string) {
    super(`A project named "${name}" already exists.`);
    this.name = "DuplicateProjectNameError";
  }
}

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

  createProject: async (data) => {
    if (await projectRepository.isNameTaken(data.name)) {
      throw new DuplicateProjectNameError(data.name);
    }
    return projectRepository.create({ archived: false, ...data });
  },
  updateProject: async (id, patch) => {
    if (patch.name && (await projectRepository.isNameTaken(patch.name, id))) {
      throw new DuplicateProjectNameError(patch.name);
    }
    return projectRepository.update(id, patch);
  },
  deleteProject: async (id) => {
    await projectRepository.remove(id);
    if (get().activeProjectId === id) set({ activeProjectId: null });
    if (get().detailProjectId === id) set({ detailProjectId: null });
  },
  archiveProject: (id, archived) => projectRepository.archive(id, archived),
  getProject: (id) => projectRepository.getById(id),
  getProjects: ({ includeArchived = false } = {}) =>
    projectRepository.query({ includeArchived }),
}));
