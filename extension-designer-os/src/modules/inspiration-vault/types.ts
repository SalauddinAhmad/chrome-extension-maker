export type VaultTab = "save" | "vault";
export type VaultView = "grid" | "list";

export interface VaultFilters {
  search: string;
  projectId: string | "__any" | "__unassigned";
  collection: string | "__any";
  favoritesOnly: boolean;
  since: "any" | "7d" | "30d" | "90d";
}
