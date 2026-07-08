import { Copy, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { useColorLibraryStore } from "../library-store";
import { formatHsl, formatRgb } from "../logic";
import { COLOR_SOURCE_LABEL, type StoredColor } from "@/types";

interface Props {
  color: StoredColor;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
}

export function ColorListItem({ color, selected, onToggleSelect, onOpen }: Props) {
  const toggleFavorite = useColorLibraryStore((s) => s.toggleFavorite);
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card px-2 py-1.5 hover:bg-accent/40",
        selected && "border-primary/60 bg-accent/40",
      )}
    >
      <input type="checkbox" checked={selected} onChange={onToggleSelect} className="h-3 w-3" />
      <button
        onClick={onOpen}
        className="h-8 w-8 shrink-0 rounded-md border shadow-inner"
        style={{ background: color.hex }}
        title={color.hex}
      />
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="truncate text-[11px] font-medium">{color.name ?? color.hex}</div>
        <div className="truncate font-mono text-[9px] text-muted-foreground">
          {color.hex} · {formatRgb(color.rgb)} · {formatHsl(color.hsl)}
        </div>
      </button>
      <span className="rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
        {COLOR_SOURCE_LABEL[color.source ?? "manual"]}
      </span>
      <button
        onClick={() => void toggleFavorite(color.id)}
        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        title={color.favorite ? "Unfavorite" : "Favorite"}
      >
        <Star className={cn("h-3 w-3", color.favorite && "fill-yellow-400 text-yellow-400")} />
      </button>
      <button
        onClick={() => { navigator.clipboard.writeText(color.hex); toast.success(`Copied ${color.hex}`); }}
        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        title="Copy hex"
      >
        <Copy className="h-3 w-3" />
      </button>
    </div>
  );
}
