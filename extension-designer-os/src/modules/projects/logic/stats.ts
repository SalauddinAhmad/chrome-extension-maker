import { inspirationRepository } from "@/modules/inspiration-vault/repository";
import { colorRepository } from "@/modules/color-studio/repository";
import { typographyRepository } from "@/modules/typography-studio/repository";
import { assetRepository } from "@/modules/asset-extractor/repository";
import { noteRepository } from "@/modules/notes/repository";
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
    inspirationRepository.projectStats(projectId),
    colorRepository.query({ projectId }).then((r) => r.length),
    typographyRepository.query({ projectId }).then((r) => r.length),
    assetRepository.query({ projectId }).then((r) => r.length),
    noteRepository.countForProject(projectId),
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
