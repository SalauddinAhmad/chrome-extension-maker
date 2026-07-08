import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { db } from "@/storage";
import { useColorLibraryStore } from "../library-store";
import { COLOR_SOURCE_LABEL, type ColorSource } from "@/types";
import type { ColorSort, ColorDateRange } from "../repository";

const SOURCE_OPTIONS: Array<{ id: ColorSource | "__any"; label: string }> = [
  { id: "__any", label: "All sources" },
  { id: "picker", label: COLOR_SOURCE_LABEL.picker },
  { id: "website", label: COLOR_SOURCE_LABEL.website },
  { id: "inspiration", label: COLOR_SOURCE_LABEL.inspiration },
  { id: "asset", label: COLOR_SOURCE_LABEL.asset },
  { id: "manual", label: COLOR_SOURCE_LABEL.manual },
];

const DATE_OPTIONS: Array<{ id: ColorDateRange; label: string }> = [
  { id: "any", label: "Any date" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

const SORT_OPTIONS: Array<{ id: ColorSort; label: string }> = [
  { id: "created-desc", label: "Newest" },
  { id: "created-asc", label: "Oldest" },
  { id: "name-asc", label: "Name A→Z" },
  { id: "hue-asc", label: "Hue" },
];

export function ColorFiltersBar() {
  const { filters, setFilters, resetFilters } = useColorLibraryStore();
  const projects = useLiveQuery(
    () => db.projects.filter((p) => !p.archived).sortBy("name"),
    [],
    [],
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.projectId && filters.projectId !== "__any") n += 1;
    if (filters.source && filters.source !== "__any") n += 1;
    if (filters.favoritesOnly) n += 1;
    if (filters.dateRange && filters.dateRange !== "any") n += 1;
    return n;
  }, [filters]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search ?? ""}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder="Search name, hex, or tag"
          className="h-7 pl-6 pr-6 text-[11px]"
        />
        {filters.search && (
          <button
            onClick={() => setFilters({ search: "" })}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <Sel value={String(filters.projectId ?? "__any")} onChange={(v) => setFilters({ projectId: v as never })}>
          <option value="__any">All projects</option>
          <option value="__none">Unassigned</option>
          {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </Sel>
        <Sel value={String(filters.source ?? "__any")} onChange={(v) => setFilters({ source: v as never })}>
          {SOURCE_OPTIONS.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
        </Sel>
        <Sel value={String(filters.dateRange ?? "any")} onChange={(v) => setFilters({ dateRange: v as ColorDateRange })}>
          {DATE_OPTIONS.map((d) => (<option key={d.id} value={d.id}>{d.label}</option>))}
        </Sel>
        <Sel value={String(filters.sort ?? "created-desc")} onChange={(v) => setFilters({ sort: v as ColorSort })}>
          {SORT_OPTIONS.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
        </Sel>
      </div>

      <div className="flex items-center gap-1.5">
        <label className="flex flex-1 items-center gap-1.5 rounded-md border bg-card px-2 py-1 text-[11px]">
          <input
            type="checkbox"
            checked={Boolean(filters.favoritesOnly)}
            onChange={(e) => setFilters({ favoritesOnly: e.target.checked })}
            className="h-3 w-3"
          />
          Favorites only
        </label>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted"
            title="Reset filters"
          >
            <Filter className="h-3 w-3" />
            Reset · {activeFilterCount}
          </button>
        )}
      </div>
    </div>
  );
}

function Sel({
  value, onChange, children,
}: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 rounded-md border bg-card px-1.5 text-[11px] outline-none focus:border-primary"
    >
      {children}
    </select>
  );
}
