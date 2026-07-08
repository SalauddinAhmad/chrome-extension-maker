import { Star, Trash2, Move } from "lucide-react";
import { cn } from "@/lib/cn";
import { FONT_CATEGORY_LABEL, FONT_SOURCE_LABEL, type StoredFont } from "@/types";
import { useTypographyLibraryStore } from "../library-store";

interface Props {
  font: StoredFont;
  selected: boolean;
  onOpen: () => void;
  onToggleSelect: () => void;
}

export function FontCard({ font, selected, onOpen, onToggleSelect }: Props) {
  const toggleFavorite = useTypographyLibraryStore((s) => s.toggleFavorite);
  const deleteFont = useTypographyLibraryStore((s) => s.deleteFont);
  const stack = `"${font.family}", ${font.category === "monospace" ? "monospace" : font.category === "serif" ? "serif" : "sans-serif"}`;

  return (
    <div
      className={cn(
        "group relative rounded-md border bg-card p-3 transition-colors hover:border-primary/50",
        selected && "border-primary ring-1 ring-primary/40",
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelect}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-1.5 top-1.5 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 data-[on=true]:opacity-100"
        data-on={selected ? "true" : "false"}
      />
      <button onClick={onOpen} className="block w-full text-left">
        <div className="truncate text-lg leading-tight" style={{ fontFamily: stack }} title={font.family}>
          {font.family}
        </div>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground" style={{ fontFamily: stack }}>
          The quick brown fox jumps over the lazy dog
        </p>
        <div className="mt-2 flex flex-wrap gap-1 text-[9px] text-muted-foreground">
          {font.category && (
            <span className="rounded bg-muted px-1 py-0.5">{FONT_CATEGORY_LABEL[font.category]}</span>
          )}
          <span className="rounded bg-muted px-1 py-0.5">{FONT_SOURCE_LABEL[font.source]}</span>
          {font.weights.length > 0 && <span className="rounded bg-muted px-1 py-0.5">{font.weights.join("·")}</span>}
        </div>
      </button>
      <div className="absolute right-1.5 top-1.5 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => void toggleFavorite(font.id)}
          className={cn("rounded border p-1 hover:bg-accent", font.favorite && "text-yellow-500")}
          title="Favorite"
        >
          <Star className={cn("h-3 w-3", font.favorite && "fill-current")} />
        </button>
        <button onClick={() => void deleteFont(font.id)} className="rounded border p-1 hover:bg-destructive/10 hover:text-destructive" title="Delete">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      {font.favorite && (
        <Star className="pointer-events-none absolute right-1.5 top-1.5 h-3 w-3 fill-yellow-500 text-yellow-500 opacity-100 group-hover:opacity-0" />
      )}
      {font.projectId === undefined && (
        <Move className="pointer-events-none absolute bottom-1.5 right-1.5 h-2.5 w-2.5 text-muted-foreground/40" />
      )}
    </div>
  );
}
