import { db } from "@/storage";
import type { ProjectStats } from "@/types";

export const EMPTY_STATS: ProjectStats = {
  inspirations: 0,
  assets: 0,
  colors: 0,
  fonts: 0,
  notes: 0,
  total: 0,
};

export async function computeProjectStats(projectId: string): Promise<ProjectStats> {
  const [inspirations, colors, fonts, assets, notes] = await Promise.all([
    db.inspirations.filter((i) => i.projectId === projectId).count(),
    db.colors.filter((c) => c.projectId === projectId).count(),
    db.fonts.filter((f) => f.projectId === projectId).count(),
    db.assets.filter((a) => a.projectId === projectId).count(),
    db.notes.filter((n) => n.projectId === projectId).count(),
  ]);
  return {
    inspirations,
    colors,
    fonts,
    assets,
    notes,
    total: inspirations + colors + fonts + assets + notes,
  };
}
