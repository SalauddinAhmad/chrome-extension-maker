import { Download, Heart, MoreVertical, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadFile } from "@/lib/chrome";
import { safeFilename } from "../logic/download";
import { useLibraryStore } from "../library-store";
import { ASSET_TYPE_LABEL, type Asset } from "@/types";

interface Props {
  asset: Asset;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
}

function Thumb({ asset }: { asset: Asset }) {
  const previewable = asset.thumbnail || (["png", "jpg", "jpeg", "webp", "svg", "gif"].includes(asset.type));
  if (!previewable) {
    return (
      <div className="grid h-full w-full place-items-center bg-muted text-[10px] font-semibold uppercase text-muted-foreground">
        {ASSET_TYPE_LABEL[asset.type]}
      </div>
    );
  }
  return (
    <img
      src={asset.thumbnail ?? asset.url}
      alt={asset.name}
      loading="lazy"
      className="h-full w-full object-contain"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.opacity = "0.15";
      }}
    />
  );
}

export function AssetCard({ asset, selected, onToggleSelect, onOpen }: Props) {
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-md border bg-card transition-all",
        selected && "ring-2 ring-primary",
      )}
    >
      <button
        onClick={onOpen}
        className="block h-20 w-full bg-muted/40"
        title={asset.name}
      >
        <Thumb asset={asset} />
      </button>

      {/* Select checkbox */}
      <label
        className="absolute left-1 top-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded bg-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="h-3 w-3 cursor-pointer"
        />
      </label>

      {/* Favorite */}
      <button
        onClick={(e) => { e.stopPropagation(); void toggleFavorite(asset.id); }}
        className={cn(
          "absolute right-1 top-1 rounded bg-black/50 p-1 text-white transition-opacity",
          asset.favorite ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
        title={asset.favorite ? "Unfavorite" : "Favorite"}
      >
        <Star
          className={cn("h-3 w-3", asset.favorite && "fill-yellow-400 text-yellow-400")}
        />
      </button>

      <div className="flex items-center justify-between gap-1 px-1.5 py-1">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[10px] font-medium">{asset.name}</div>
          <div className="truncate text-[9px] text-muted-foreground">
            <span className="uppercase">{ASSET_TYPE_LABEL[asset.type]}</span>
            {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); void downloadFile(asset.url, safeFilename(asset.name)); }}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Download"
        >
          <Download className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
