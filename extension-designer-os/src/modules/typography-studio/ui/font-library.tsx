import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useEffect } from "react";
import { LayoutGrid, List, Trash2, Loader2, Type as TypeIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/shared/empty-state";
import { typographyRepository } from "../repository";
import { useTypographyLibraryStore } from "../library-store";
import { FontCard } from "./font-card";
import { FontListItem } from "./font-list-item";
import { FontFilters } from "./font-filters";
import { FontDetailDialog } from "./font-detail-dialog";

/** Injects a single <link> that lazy-loads visible library fonts from Google Fonts. */
function useGoogleFontLoader(families: string[]) {
  useEffect(() => {
    if (typeof document === "undefined" || families.length === 0) return;
    const id = "designer-os-library-fonts";
    const existing = document.getElementById(id) as HTMLLinkElement | null;
    const href = `https://fonts.googleapis.com/css2?${families
      .slice(0, 20)
      .map((f) => `family=${encodeURIComponent(f)}:wght@400;600;700`)
      .join("&")}&display=swap`;
    if (existing?.href === href) return;
    const link = existing ?? document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    if (!existing) document.head.appendChild(link);
  }, [families.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function FontLibrary() {
  const view = useTypographyLibraryStore((s) => s.view);
  const setView = useTypographyLibraryStore((s) => s.setView);
  const filters = useTypographyLibraryStore((s) => s.filters);
  const selected = useTypographyLibraryStore((s) => s.selected);
  const toggleSelected = useTypographyLibraryStore((s) => s.toggleSelected);
  const openDetail = useTypographyLibraryStore((s) => s.openDetail);
  const bulkDelete = useTypographyLibraryStore((s) => s.bulkDelete);
  const clearSelection = useTypographyLibraryStore((s) => s.clearSelection);

  const fonts = useLiveQuery(() => typographyRepository.query(filters), [JSON.stringify(filters)], undefined);
  const loading = fonts === undefined;
  const list = fonts ?? [];

  const families = useMemo(() => list.map((f) => f.family), [list]);
  useGoogleFontLoader(families);

  return (
    <div className="space-y-3">
      <FontFilters />

      <div className="flex items-center justify-between">
        <div className="text-[10px] text-muted-foreground">
          {loading ? "…" : `${list.length} font${list.length === 1 ? "" : "s"}`}
          {selected.size > 0 && ` · ${selected.size} selected`}
        </div>
        <div className="flex items-center gap-1">
          {selected.size > 0 && (
            <>
              <button
                onClick={() => void bulkDelete()}
                className="flex items-center gap-1 rounded border px-1.5 py-1 text-[10px] text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
              <button onClick={clearSelection} className="rounded border px-1.5 py-1 text-[10px] text-muted-foreground hover:bg-accent">
                Clear
              </button>
            </>
          )}
          <div className="ml-1 flex overflow-hidden rounded-md border">
            <button
              onClick={() => setView("grid")}
              className={cn("px-1.5 py-1", view === "grid" ? "bg-muted" : "text-muted-foreground")}
              title="Grid"
            >
              <LayoutGrid className="h-3 w-3" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("px-1.5 py-1", view === "list" ? "bg-muted" : "text-muted-foreground")}
              title="List"
            >
              <List className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={TypeIcon}
          title="No fonts yet"
          description="Detect fonts on a page, or save one manually to build your library."
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-2">
          {list.map((f) => (
            <FontCard
              key={f.id}
              font={f}
              selected={selected.has(f.id)}
              onOpen={() => openDetail(f.id)}
              onToggleSelect={() => toggleSelected(f.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {list.map((f) => (
            <FontListItem
              key={f.id}
              font={f}
              selected={selected.has(f.id)}
              onOpen={() => openDetail(f.id)}
              onToggleSelect={() => toggleSelected(f.id)}
            />
          ))}
        </div>
      )}

      <FontDetailDialog />
    </div>
  );
}
