import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { db } from "@/storage";
import { useLibraryStore } from "../library-store";
import { ASSET_TYPE_LABEL, ASSET_SOURCE_LABEL } from "@/types";
import type { AssetSort, AssetDateRange } from "../repository";
import type { AssetType, AssetSource } from "@/types";

const TYPE_OPTIONS: Array<{ id: AssetType | "__any"; label: string }> = [
  { id: "__any", label: "All types" },
  { id: "png", label: "PNG" },
  { id: "jpg", label: "JPG" },
  { id: "webp", label: "WebP" },
  { id: "svg", label: "SVG" },
  { id: "gif", label: "GIF" },
  { id: "pdf", label: "PDF" },
  { id: "mp4", label: "MP4" },
  { id: "lottie", label: "Lottie" },
  { id: "other", label: "Other" },
];

const SOURCE_OPTIONS: Array<{ id: AssetSource | "__any"; label: string }> = [
  { id: "__any", label: "All sources" },
  { id: "extraction", label: ASSET_SOURCE_LABEL.extraction },
  { id: "upload", label: ASSET_SOURCE_LABEL.upload },
  { id: "screenshot", label: ASSET_SOURCE_LABEL.screenshot },
  { id: "inspiration", label: ASSET_SOURCE_LABEL.inspiration },
];

const DATE_OPTIONS: Array<{ id: AssetDateRange; label: string }> = [
  { id: "any", label: "Any date" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

const SORT_OPTIONS: Array<{ id: AssetSort; label: string }> = [
  { id: "created-desc", label: "Newest" },
  { id: "created-asc", label: "Oldest" },
  { id: "name-asc", label: "Name A→Z" },
  { id: "size-desc", label: "Largest" },
];

export function AssetFiltersBar() {
  const { filters, setFilters, resetFilters } = useLibraryStore();
  const projects = useLiveQuery(
    () => db.projects.filter((p) => !p.archived).sortBy("name"),
    [],
    [],
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.projectId && filters.projectId !== "__any") n += 1;
    if (filters.type && filters.type !== "__any") n += 1;
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
          placeholder="Search by name or tag"
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
        <SelectPill
          value={String(filters.projectId ?? "__any")}
          onChange={(v) => setFilters({ projectId: v as never })}
        >
          <option value="__any">All projects</option>
          <option value="__none">Unassigned</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </SelectPill>

        <SelectPill
          value={String(filters.type ?? "__any")}
          onChange={(v) => setFilters({ type: v as never })}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </SelectPill>

        <SelectPill
          value={String(filters.source ?? "__any")}
          onChange={(v) => setFilters({ source: v as never })}
        >
          {SOURCE_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </SelectPill>

        <SelectPill
          value={String(filters.dateRange ?? "any")}
          onChange={(v) => setFilters({ dateRange: v as AssetDateRange })}
        >
          {DATE_OPTIONS.map((d) => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </SelectPill>
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
        <SelectPill
          className="flex-1"
          value={String(filters.sort ?? "created-desc")}
          onChange={(v) => setFilters({ sort: v as AssetSort })}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </SelectPill>
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

function SelectPill({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        "h-7 rounded-md border bg-card px-1.5 text-[11px] outline-none focus:border-primary " +
        (className ?? "")
      }
    >
      {children}
    </select>
  );
}
