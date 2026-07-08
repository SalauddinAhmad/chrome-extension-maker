import { db } from "@/storage";

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
    db.colors.orderBy("createdAt").reverse().limit(limit).toArray(),
    db.fonts.orderBy("createdAt").reverse().limit(limit).toArray(),
    db.inspirations.orderBy("createdAt").reverse().limit(limit).toArray(),
    db.assets.orderBy("createdAt").reverse().limit(limit).toArray(),
    db.notes.orderBy("updatedAt").reverse().limit(limit).toArray(),
    db.projects.orderBy("createdAt").reverse().limit(limit).toArray(),
  ]);

  const items: ActivityItem[] = [
    ...colors.map((c) => ({
      id: `c-${c.id}`,
      kind: "color" as const,
      label: c.name ?? c.hex,
      detail: c.hex,
      color: c.hex,
      ts: c.createdAt,
    })),
    ...fonts.map((f) => ({
      id: `f-${f.id}`,
      kind: "font" as const,
      label: f.family,
      detail: f.source,
      ts: f.createdAt,
    })),
    ...insp.map((i) => ({
      id: `i-${i.id}`,
      kind: "inspiration" as const,
      label: i.title,
      detail: safeHost(i.url),
      ts: i.createdAt,
    })),
    ...assets.map((a) => ({
      id: `a-${a.id}`,
      kind: "asset" as const,
      label: a.filename,
      detail: a.kind,
      ts: a.createdAt,
    })),
    ...notes.map((n) => ({
      id: `n-${n.id}`,
      kind: "note" as const,
      label: n.title || "Untitled note",
      ts: n.updatedAt,
    })),
    ...projects.map((p) => ({
      id: `p-${p.id}`,
      kind: "project" as const,
      label: p.name,
      detail: p.clientName,
      color: p.color,
      ts: p.createdAt,
    })),
  ];

  return items.sort((a, b) => b.ts - a.ts).slice(0, limit);
}

function safeHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
