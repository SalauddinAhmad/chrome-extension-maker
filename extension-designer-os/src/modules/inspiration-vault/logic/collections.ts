/**
 * Inspiration collections — default preset + custom user collections.
 */
export interface CollectionDef {
  id: string;
  name: string;
  builtin?: boolean;
}

export const DEFAULT_COLLECTIONS: CollectionDef[] = [
  { id: "landing", name: "Landing Pages", builtin: true },
  { id: "dashboard", name: "Dashboards", builtin: true },
  { id: "branding", name: "Branding", builtin: true },
  { id: "ecommerce", name: "Ecommerce", builtin: true },
  { id: "mobile", name: "Mobile Apps", builtin: true },
  { id: "islamic", name: "Islamic Design", builtin: true },
];

export function normalizeCollectionId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function collectionLabel(id: string, custom: CollectionDef[] = []): string {
  const all = [...DEFAULT_COLLECTIONS, ...custom];
  return all.find((c) => c.id === id)?.name ?? id;
}
