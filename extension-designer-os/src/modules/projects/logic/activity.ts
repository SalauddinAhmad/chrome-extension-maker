import { colorRepository } from "@/modules/color-studio/repository";
import { typographyRepository } from "@/modules/typography-studio/repository";
import { inspirationRepository } from "@/modules/inspiration-vault/repository";
import { assetRepository } from "@/modules/asset-extractor/repository";
import { noteRepository } from "@/modules/notes/repository";
import { projectRepository } from "@/modules/projects/repository";

export type ActivityKind =
  | "color"
  | "font"
  | "inspiration"
  | "asset"
  | "note"
  | "project";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  label: string;
  detail?: string;
  color?: string;
  ts: number;
}

export async function fetchRecentActivity(limit = 12): Promise<ActivityItem[]> {
  const [colors, fonts, insp, assets, notes, projects] = await Promise.all([
    colorRepository.listRecent(limit),
    typographyRepository.listRecent(limit),
    inspirationRepository.listRecent(limit),
    assetRepository.listRecent(limit),
    noteRepository.listRecent(limit),
    projectRepository.getAll().then((r) => r.slice(0, limit)),
  ]);

  const items: ActivityItem[] = [];

  for (const c of colors) {
    items.push({
      id: `c-${c.id}`,
      kind: "color",
      label: c.name ?? c.hex,
      detail: c.hex,
      color: c.hex,
      ts: c.createdAt,
    });
  }
  for (const f of fonts) {
    items.push({
      id: `f-${f.id}`,
      kind: "font",
      label: f.family,
      detail: f.source,
      ts: f.createdAt,
    });
  }
  for (const i of insp) {
    items.push({
      id: `i-${i.id}`,
      kind: "inspiration",
      label: i.title,
      detail: safeHost(i.url),
      ts: i.createdAt,
    });
  }
  for (const a of assets) {
    items.push({
      id: `a-${a.id}`,
      kind: "asset",
      label: a.name ?? a.filename ?? "Untitled asset",
      detail: a.type ?? a.kind,
      ts: a.createdAt,
    });
  }
  for (const n of notes) {
    items.push({
      id: `n-${n.id}`,
      kind: "note",
      label: n.title || "Untitled note",
      ts: n.updatedAt,
    });
  }
  for (const p of projects) {
    items.push({
      id: `p-${p.id}`,
      kind: "project",
      label: p.name,
      detail: p.clientName,
      color: p.color,
      ts: p.createdAt,
    });
  }

  return items.sort((a, b) => b.ts - a.ts).slice(0, limit);
}

function safeHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
