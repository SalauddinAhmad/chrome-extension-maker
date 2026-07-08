import { Download, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadFile } from "@/lib/chrome";
import { safeFilename } from "../logic/download";
import { useLibraryStore } from "../library-store";
import { formatBytes } from "../logic/validation";
import { ASSET_TYPE_LABEL, type Asset } from "@/types";

interface Props {
  asset: Asset;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
}

export function AssetListItem({ asset, selected, onToggleSelect, onOpen }: Props) {
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card px-2 py-1.5 transition-colors hover:bg-accent/40",
        selected && "border-primary/60 bg-accent/40",
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelect}
        className="h-3 w-3"
      />
      <button
        onClick={onOpen}
        className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded border bg-muted/40"
      >
        {asset.thumbnail ? (
          <img
            src={asset.thumbnail}
            alt=""
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-[9px] font-semibold uppercase text-muted-foreground">
            {ASSET_TYPE_LABEL[asset.type]}
          </span>
        )}
      </button>
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="truncate text-[11px] font-medium">{asset.name}</div>
        <div className="flex items-center gap-1.5 truncate text-[9px] text-muted-foreground">
          <span className="uppercase">{ASSET_TYPE_LABEL[asset.type]}</span>
          {asset.width && asset.height && <span>· {asset.width}×{asset.height}</span>}
          <span>· {formatBytes(asset.size)}</span>
        </div>
      </button>
      <button
        onClick={() => void toggleFavorite(asset.id)}
        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        title={asset.favorite ? "Unfavorite" : "Favorite"}
      >
        <Star className={cn("h-3 w-3", asset.favorite && "fill-yellow-400 text-yellow-400")} />
      </button>
      <button
        onClick={() => void downloadFile(asset.url, safeFilename(asset.name))}
        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        title="Download"
      >
        <Download className="h-3 w-3" />
      </button>
    </div>
  );
}
