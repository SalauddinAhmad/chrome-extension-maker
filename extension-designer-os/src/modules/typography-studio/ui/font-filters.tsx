import { useLiveQuery } from "dexie-react-hooks";
import { Search, X, Star } from "lucide-react";
import { db } from "@/storage";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useTypographyLibraryStore } from "../library-store";
import { FONT_CATEGORY_LABEL, FONT_SOURCE_LABEL } from "@/types";
import type { FontCategory, FontSource } from "@/types";
import type { FontSort } from "../repository";

const CATEGORIES: Array<FontCategory | "__any"> = ["__any", "sans-serif", "serif", "display", "monospace", "script", "handwriting"];
const SOURCES: Array<FontSource | "__any"> = ["__any", "website", "inspiration", "asset", "manual", "google", "system", "custom"];
const SORTS: Array<{ id: FontSort; label: string }> = [
  { id: "created-desc", label: "Newest" },
  { id: "created-asc", label: "Oldest" },
  { id: "name-asc", label: "A → Z" },
  { id: "name-desc", label: "Z → A" },
];

export function FontFilters() {
  const filters = useTypographyLibraryStore((s) => s.filters);
  const setFilters = useTypographyLibraryStore((s) => s.setFilters);
  const resetFilters = useTypographyLibraryStore((s) => s.resetFilters);

  const projects = useLiveQuery(() => db.projects.filter((p) => !p.archived).toArray(), [], []);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search ?? ""}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder="Search fonts, tags…"
          className="h-8 pl-6 text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <select
          value={filters.projectId as string}
          onChange={(e) => setFilters({ projectId: e.target.value as "__any" | "__none" | string })}
          className="h-7 rounded-md border bg-background px-1.5 text-[10px]"
        >
          <option value="__any">All projects</option>
          <option value="__none">Unassigned</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select
          value={filters.category as string}
          onChange={(e) => setFilters({ category: e.target.value as FontCategory | "__any" })}
          className="h-7 rounded-md border bg-background px-1.5 text-[10px]"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === "__any" ? "All categories" : FONT_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>

        <select
          value={filters.source as string}
          onChange={(e) => setFilters({ source: e.target.value as FontSource | "__any" })}
          className="h-7 rounded-md border bg-background px-1.5 text-[10px]"
        >
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s === "__any" ? "All sources" : FONT_SOURCE_LABEL[s]}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => setFilters({ sort: e.target.value as FontSort })}
          className="h-7 rounded-md border bg-background px-1.5 text-[10px]"
        >
          {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setFilters({ favoritesOnly: !filters.favoritesOnly })}
          className={cn(
            "flex items-center gap-1 rounded border px-2 py-1 text-[10px]",
            filters.favoritesOnly ? "border-yellow-500/60 bg-yellow-500/10 text-yellow-600" : "text-muted-foreground",
          )}
        >
          <Star className={cn("h-3 w-3", filters.favoritesOnly && "fill-current")} /> Favorites
        </button>
        <button onClick={resetFilters} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" /> Reset
        </button>
      </div>
    </div>
  );
}
