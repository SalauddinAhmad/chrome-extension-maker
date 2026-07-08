import { useLiveQuery } from "dexie-react-hooks";
import {
  ExternalLink,
  Trash2,
  Search,
  Star,
  Pencil,
  Grid3x3,
  List as ListIcon,
  Bookmark,
  Filter,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/cn";
import { useVaultStore } from "../store";
import { inspirationRepository, type InspirationFilters } from "../repository";
import { DEFAULT_COLLECTIONS, collectionLabel } from "../logic/collections";
import { projectRepository } from "@/modules/projects/repository";
import type { Inspiration } from "@/types";

const SINCE_MS: Record<"any" | "7d" | "30d" | "90d", number> = {
  any: 0,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  "90d": 90 * 24 * 60 * 60 * 1000,
};

export function VaultGrid() {
  const {
    view, setView, filters, setFilters, resetFilters,
    remove, toggleFavorite, openEdit, moveToProject, customCollections,
  } = useVaultStore();

  const repoFilters: InspirationFilters = {
    search: filters.search,
    projectId:
      filters.projectId === "__any"
        ? undefined
        : filters.projectId === "__unassigned"
          ? null
          : filters.projectId,
    collection: filters.collection === "__any" ? undefined : filters.collection,
    favoritesOnly: filters.favoritesOnly,
    since: filters.since === "any" ? undefined : Date.now() - SINCE_MS[filters.since],
    sort: "created-desc",
  };

  const items = useLiveQuery(
    () => inspirationRepository.query(repoFilters),
    [JSON.stringify(repoFilters)],
    undefined,
  );
  const totalCount = useLiveQuery(() => inspirationRepository.getAll().then((a) => a.length), [], 0);
  const projects = useLiveQuery(
    () => projectRepository.query({ sort: "name-asc" }),
    [],
    [],
  );

  const isLoading = items === undefined;
  const collections = [...DEFAULT_COLLECTIONS, ...customCollections];
  const hasFilters =
    filters.projectId !== "__any" ||
    filters.collection !== "__any" ||
    filters.favoritesOnly ||
    filters.since !== "any" ||
    filters.search.trim().length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Search title, url, notes, tags…"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <div className="flex rounded-md border p-0.5">
          <button
            onClick={() => setView("grid")}
            className={cn("grid h-6 w-6 place-items-center rounded",
              view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground")}
            title="Grid"
          ><Grid3x3 className="h-3 w-3" /></button>
          <button
            onClick={() => setView("list")}
            className={cn("grid h-6 w-6 place-items-center rounded",
              view === "list" ? "bg-muted text-foreground" : "text-muted-foreground")}
            title="List"
          ><ListIcon className="h-3 w-3" /></button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
        <FilterIcon />
        <select
          value={filters.projectId}
          onChange={(e) => setFilters({ projectId: e.target.value as never })}
          className="rounded-md border bg-background px-1.5 py-1 text-[10px]"
        >
          <option value="__any">All projects</option>
          <option value="__unassigned">Unassigned</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select
          value={filters.collection}
          onChange={(e) => setFilters({ collection: e.target.value })}
          className="rounded-md border bg-background px-1.5 py-1 text-[10px]"
        >
          <option value="__any">All collections</option>
          {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={filters.since}
          onChange={(e) => setFilters({ since: e.target.value as never })}
          className="rounded-md border bg-background px-1.5 py-1 text-[10px]"
        >
          <option value="any">Any time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        <button
          onClick={() => setFilters({ favoritesOnly: !filters.favoritesOnly })}
          className={cn(
            "flex items-center gap-1 rounded-md border px-1.5 py-1",
            filters.favoritesOnly ? "border-yellow-500/60 text-yellow-600" : "text-muted-foreground",
          )}
        >
          <Star className={cn("h-3 w-3", filters.favoritesOnly && "fill-current")} />
          Favorites
        </button>
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingGrid view={view} />
      ) : totalCount === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Vault is empty"
          description="Capture your current tab from the Save panel to add your first inspiration."
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches"
          description="Try clearing filters or searching for something else."
          action={<Button size="sm" variant="outline" onClick={resetFilters}>Reset filters</Button>}
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-2">
          {items.map((i) => (
            <GridCard
              key={i.id}
              item={i}
              projects={projects}
              customCollections={customCollections}
              onOpenEdit={() => void openEdit(i.id)}
              onDelete={() => void remove(i.id)}
              onFavorite={() => void toggleFavorite(i.id)}
              onMove={(pid) => void moveToProject(i.id, pid || undefined)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((i) => (
            <ListCard
              key={i.id}
              item={i}
              projects={projects}
              customCollections={customCollections}
              onOpenEdit={() => void openEdit(i.id)}
              onDelete={() => void remove(i.id)}
              onFavorite={() => void toggleFavorite(i.id)}
              onMove={(pid) => void moveToProject(i.id, pid || undefined)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterIcon() {
  return <Filter className="h-3 w-3 text-muted-foreground" />;
}

function LoadingGrid({ view }: { view: "grid" | "list" }) {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-md border bg-card">
            <Skeleton className="h-20 w-full rounded-none" />
            <div className="space-y-1.5 p-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-2 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

type CardProps = {
  item: Inspiration;
  projects: Array<{ id: string; name: string }>;
  customCollections: Array<{ id: string; name: string }>;
  onOpenEdit: () => void;
  onDelete: () => void;
  onFavorite: () => void;
  onMove: (projectId: string) => void;
};

function GridCard({ item, projects, customCollections, onOpenEdit, onDelete, onFavorite, onMove }: CardProps) {
  return (
    <div className="group relative overflow-hidden rounded-md border bg-card">
      <a href={item.url} target="_blank" rel="noreferrer" className="block" title={item.url}>
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="h-20 w-full object-cover" />
        ) : (
          <div className="grid h-20 w-full place-items-center bg-muted text-[10px] text-muted-foreground">
            No preview
          </div>
        )}
        <div className="space-y-1 p-2">
          <div className="truncate text-[11px] font-medium leading-tight">{item.title}</div>
          <div className="flex flex-wrap gap-1">
            {item.collection && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                {collectionLabel(item.collection, customCollections)}
              </span>
            )}
            {item.tags.slice(0, 2).map((t) => (
              <span key={t} className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] text-accent-foreground">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </a>
      <button
        onClick={onFavorite}
        className={cn(
          "absolute left-1 top-1 rounded bg-black/50 p-1 text-white hover:bg-black/70",
          item.favorite && "bg-yellow-500/90 hover:bg-yellow-500",
        )}
        title="Favorite"
      >
        <Star className={cn("h-3 w-3", item.favorite && "fill-current")} />
      </button>
      <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <a href={item.url} target="_blank" rel="noreferrer" className="rounded bg-black/50 p-1 text-white hover:bg-black/70" title="Open">
          <ExternalLink className="h-3 w-3" />
        </a>
        <button onClick={onOpenEdit} className="rounded bg-black/50 p-1 text-white hover:bg-black/70" title="Edit">
          <Pencil className="h-3 w-3" />
        </button>
        <button onClick={onDelete} className="rounded bg-black/50 p-1 text-white hover:bg-red-500/80" title="Delete">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <div className="border-t bg-muted/30 p-1">
        <select
          value={item.projectId ?? ""}
          onChange={(e) => onMove(e.target.value)}
          className="w-full bg-transparent text-[9px] outline-none"
          title="Move to project"
        >
          <option value="">Unassigned</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
    </div>
  );
}

function ListCard({ item, projects, customCollections, onOpenEdit, onDelete, onFavorite, onMove }: CardProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card p-2">
      {item.thumbnail ? (
        <img src={item.thumbnail} alt="" className="h-10 w-14 shrink-0 rounded object-cover" />
      ) : (
        <div className="h-10 w-14 shrink-0 rounded bg-muted" />
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[11px] font-medium">{item.title}</div>
        <div className="truncate text-[9px] text-muted-foreground">{item.url}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[9px] text-muted-foreground">
          {item.collection && (
            <span className="rounded bg-primary/10 px-1 py-0.5 text-primary">
              {collectionLabel(item.collection, customCollections)}
            </span>
          )}
          {item.tags.slice(0, 3).map((t) => <span key={t}>#{t}</span>)}
        </div>
      </div>
      <select
        value={item.projectId ?? ""}
        onChange={(e) => onMove(e.target.value)}
        className="h-6 rounded-md border bg-background px-1 text-[9px]"
        title="Move to project"
      >
        <option value="">Unassigned</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <button onClick={onFavorite} className="rounded p-1 text-muted-foreground hover:bg-muted" title="Favorite">
        <Star className={cn("h-3 w-3", item.favorite && "fill-yellow-500 text-yellow-500")} />
      </button>
      <a href={item.url} target="_blank" rel="noreferrer" className="rounded p-1 text-muted-foreground hover:bg-muted" title="Open">
        <ExternalLink className="h-3 w-3" />
      </a>
      <button onClick={onOpenEdit} className="rounded p-1 text-muted-foreground hover:bg-muted" title="Edit">
        <Pencil className="h-3 w-3" />
      </button>
      <button onClick={onDelete} className="rounded p-1 text-destructive hover:bg-destructive/10" title="Delete">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}
