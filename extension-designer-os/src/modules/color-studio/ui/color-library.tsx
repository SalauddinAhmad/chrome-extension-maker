import { useLiveQuery } from "dexie-react-hooks";
import { Grid3x3, LayoutList, Layers, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/shared/empty-state";
import { Palette } from "lucide-react";
import { colorRepository } from "../repository";
import { useColorLibraryStore } from "../library-store";
import { bestTextOn, hexToRgb } from "../logic";
import { ColorFiltersBar } from "./color-filters";
import { ColorCard } from "./color-card";
import { ColorListItem } from "./color-list-item";
import { ColorDetailDialog } from "./color-detail-dialog";
import type { LibraryView } from "../library-store";

export function ColorLibrary() {
  const {
    view, filters, selected, setView,
    toggleSelected, clearSelection, openDetail, bulkDelete,
  } = useColorLibraryStore();

  const colors = useLiveQuery(
    () => colorRepository.query(filters),
    [JSON.stringify(filters)],
    null as never,
  );

  const loading = colors === null;
  const items = colors ?? [];
  const selectedCount = selected.size;

  return (
    <div className="space-y-3">
      <ColorFiltersBar />

      <div className="flex items-center justify-between gap-1.5">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {loading ? "Loading…" : `${items.length} color${items.length === 1 ? "" : "s"}`}
        </div>
        <ViewToggle current={view} onChange={setView} />
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-accent/40 px-2 py-1.5">
          <span className="text-[10px] font-medium">{selectedCount} selected</span>
          <div className="flex-1" />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 gap-1 px-2 text-destructive"
            onClick={async () => {
              if (!confirm(`Delete ${selectedCount} color(s)?`)) return;
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
        <div className={view === "list" ? "space-y-1" : "grid grid-cols-3 gap-2"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={view === "list" ? "h-10" : "aspect-square"} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="No colors yet"
          description="Use the Picker to grab colors, generate palettes, or extract from a webpage."
        />
      ) : view === "palette" ? (
        <PaletteView />
      ) : view === "grid" ? (
        <div className="grid grid-cols-3 gap-2">
          {items.map((c) => (
            <ColorCard
              key={c.id}
              color={c}
              selected={selected.has(c.id)}
              onToggleSelect={() => toggleSelected(c.id)}
              onOpen={() => openDetail(c.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((c) => (
            <ColorListItem
              key={c.id}
              color={c}
              selected={selected.has(c.id)}
              onToggleSelect={() => toggleSelected(c.id)}
              onOpen={() => openDetail(c.id)}
            />
          ))}
        </div>
      )}

      <ColorDetailDialog />
    </div>
  );
}

function PaletteView() {
  const filters = useColorLibraryStore((s) => s.filters);
  const openDetail = useColorLibraryStore((s) => s.openDetail);
  const colors = useLiveQuery(() => colorRepository.query(filters), [JSON.stringify(filters)], []);
  if (colors.length === 0) return null;

  return (
    <div className="flex h-32 overflow-hidden rounded-lg border shadow-sm">
      {colors.map((c) => {
        const fg = bestTextOn(hexToRgb(c.hex));
        return (
          <button
            key={c.id}
            onClick={() => openDetail(c.id)}
            className="flex flex-1 flex-col justify-between p-2 text-left transition-transform hover:flex-[1.4]"
            style={{ background: c.hex, color: fg }}
            title={c.name ?? c.hex}
          >
            <span className="truncate text-[9px] font-medium opacity-90">
              {c.name ?? "—"}
            </span>
            <span className="font-mono text-[9px] opacity-90">{c.hex}</span>
          </button>
        );
      })}
    </div>
  );
}

function ViewToggle({
  current, onChange,
}: { current: LibraryView; onChange: (v: LibraryView) => void }) {
  const opts: Array<{ id: LibraryView; icon: typeof Grid3x3; label: string }> = [
    { id: "grid", icon: Grid3x3, label: "Grid" },
    { id: "list", icon: LayoutList, label: "List" },
    { id: "palette", icon: Layers, label: "Palette" },
  ];
  return (
    <div className="flex rounded-md border bg-card p-0.5">
      {opts.map((o) => {
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "grid h-5 w-5 place-items-center rounded",
              current === o.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
            title={o.label}
          >
            <Icon className="h-3 w-3" />
          </button>
        );
      })}
    </div>
  );
}
