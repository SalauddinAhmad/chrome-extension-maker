import { Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { FONT_CATEGORY_LABEL, FONT_SOURCE_LABEL, type StoredFont } from "@/types";
import { useTypographyLibraryStore } from "../library-store";

interface Props {
  font: StoredFont;
  selected: boolean;
  onOpen: () => void;
  onToggleSelect: () => void;
}

export function FontListItem({ font, selected, onOpen, onToggleSelect }: Props) {
  const toggleFavorite = useTypographyLibraryStore((s) => s.toggleFavorite);
  const deleteFont = useTypographyLibraryStore((s) => s.deleteFont);
  const stack = `"${font.family}", sans-serif`;

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md border bg-card p-2 transition-colors hover:border-primary/40",
        selected && "border-primary",
      )}
    >
      <input type="checkbox" checked={selected} onChange={onToggleSelect} className="h-3 w-3" />
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-medium" style={{ fontFamily: stack }}>
            {font.family}
          </div>
          {font.category && (
            <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
              {FONT_CATEGORY_LABEL[font.category]}
            </span>
          )}
          <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
            {FONT_SOURCE_LABEL[font.source]}
          </span>
        </div>
      </button>
      <button
        onClick={() => void toggleFavorite(font.id)}
        className={cn("rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-accent", font.favorite && "text-yellow-500 opacity-100")}
      >
        <Star className={cn("h-3 w-3", font.favorite && "fill-current")} />
      </button>
      <button onClick={() => void deleteFont(font.id)} className="rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}
