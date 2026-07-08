import { useLiveQuery } from "dexie-react-hooks";
import { Download, Grid3x3, LayoutList, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { projectRepository } from "@/modules/projects/repository";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/cn";
import { assetRepository } from "../repository";
import { useLibraryStore } from "../library-store";
import { AssetFiltersBar } from "./asset-filters";
import { AssetCard } from "./asset-card";
import { AssetListItem } from "./asset-list-item";
import { AssetDetailDialog } from "./asset-detail-panel";
import { ImageIcon } from "./icons";

export function AssetLibrary() {
  const {
    view, filters, selected, setView,
    toggleSelected, selectAll, clearSelection, openDetail,
    bulkDelete, bulkDownload, bulkMove,
  } = useLibraryStore();

  const assets = useLiveQuery(
    () => assetRepository.query(filters),
    [JSON.stringify(filters)],
    null as never,
  );

  const projects = useLiveQuery(
    () => projectRepository.listActive(),
    [],
    [],
  );

  const loading = assets === null;
  const items = assets ?? [];
  const selectedCount = selected.size;

  return (
    <div className="space-y-3">
      <AssetFiltersBar />

      <div className="flex items-center justify-between gap-1.5">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {loading ? "Loading…" : `${items.length} asset${items.length === 1 ? "" : "s"}`}
        </div>
        <div className="flex items-center gap-1">
          <ViewToggle current={view} onChange={setView} />
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-accent/40 px-2 py-1.5">
          <span className="text-[10px] font-medium">
            {selectedCount} selected
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" className="h-6 gap-1 px-2" onClick={() => void bulkDownload()}>
            <Download className="h-3 w-3" /> Download
          </Button>
          <select
            className="h-6 rounded-md border bg-card px-1 text-[10px]"
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value;
              if (!v) return;
              void bulkMove(v === "__none" ? undefined : v);
              e.currentTarget.value = "";
            }}
          >
            <option value="" disabled>Move…</option>
            <option value="__none">Unassigned</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 gap-1 px-2 text-destructive"
            onClick={async () => {
              if (!confirm(`Delete ${selectedCount} asset(s)?`)) return;
              await bulkDelete();
            }}
          >
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
          <Button size="sm" variant="ghost" className="h-6 px-2" onClick={clearSelection}>
            Clear
          </Button>
        </div>
      )}

      {loading ? (
        <div className={view === "grid" ? "grid grid-cols-3 gap-2" : "space-y-1"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={view === "grid" ? "h-24" : "h-12"} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No assets yet"
          description="Extract from a webpage, upload files, or capture inspirations to build your asset library."
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-3 gap-2">
          {items.map((a) => (
            <AssetCard
              key={a.id}
              asset={a}
              selected={selected.has(a.id)}
              onToggleSelect={() => toggleSelected(a.id)}
              onOpen={() => openDetail(a.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((a) => (
            <AssetListItem
              key={a.id}
              asset={a}
              selected={selected.has(a.id)}
              onToggleSelect={() => toggleSelected(a.id)}
              onOpen={() => openDetail(a.id)}
            />
          ))}
        </div>
      )}

      {items.length > 0 && selectedCount === 0 && (
        <button
          onClick={() => selectAll(items.map((i) => i.id))}
          className="w-full rounded-md border border-dashed py-1.5 text-[10px] text-muted-foreground hover:bg-muted"
        >
          Select all ({items.length})
        </button>
      )}

      <AssetDetailDialog />
    </div>
  );
}

function ViewToggle({
  current,
  onChange,
}: {
  current: "grid" | "list";
  onChange: (v: "grid" | "list") => void;
}) {
  return (
    <div className="flex rounded-md border bg-card p-0.5">
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "grid h-5 w-5 place-items-center rounded",
          current === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
        )}
        title="Grid view"
      >
        <Grid3x3 className="h-3 w-3" />
      </button>
      <button
        onClick={() => onChange("list")}
        className={cn(
          "grid h-5 w-5 place-items-center rounded",
          current === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
        )}
        title="List view"
      >
        <LayoutList className="h-3 w-3" />
      </button>
    </div>
  );
}
