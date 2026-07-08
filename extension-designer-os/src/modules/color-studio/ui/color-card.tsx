import { Copy, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { bestTextOn, hexToRgb } from "../logic";
import { useColorLibraryStore } from "../library-store";
import type { StoredColor } from "@/types";

interface Props {
  color: StoredColor;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
}

export function ColorCard({ color, selected, onToggleSelect, onOpen }: Props) {
  const toggleFavorite = useColorLibraryStore((s) => s.toggleFavorite);
  const fg = bestTextOn(hexToRgb(color.hex));

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-md border shadow-sm",
        selected && "ring-2 ring-primary",
      )}
    >
      <button
        onClick={onOpen}
        className="flex aspect-square w-full flex-col justify-between p-2 text-left"
        style={{ background: color.hex, color: fg }}
        title={color.name ?? color.hex}
      >
        <span className="truncate text-[10px] font-medium opacity-90">
          {color.name ?? "—"}
        </span>
        <span className="font-mono text-[10px] opacity-90">{color.hex}</span>
      </button>

      <label
        className="absolute left-1 top-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded bg-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="h-3 w-3 cursor-pointer"
        />
      </label>

      <div className="absolute right-1 top-1 flex gap-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); void toggleFavorite(color.id); }}
          className={cn(
            "rounded bg-black/40 p-1 text-white transition-opacity hover:bg-black/60",
            color.favorite ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
          title={color.favorite ? "Unfavorite" : "Favorite"}
        >
          <Star className={cn("h-3 w-3", color.favorite && "fill-yellow-400 text-yellow-400")} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(color.hex);
            toast.success(`Copied ${color.hex}`);
          }}
          className="rounded bg-black/40 p-1 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
          title="Copy hex"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
