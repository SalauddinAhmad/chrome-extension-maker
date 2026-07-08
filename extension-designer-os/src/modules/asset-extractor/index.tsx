import { Image as ImageIcon } from "lucide-react";
import { AssetGrid } from "./ui/asset-grid";

export default function AssetExtractor() {
  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <ImageIcon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Asset Extractor</div>
          <div className="text-[10px] text-muted-foreground">Images · SVG · icons · video</div>
        </div>
      </header>

      <AssetGrid />
    </div>
  );
}
