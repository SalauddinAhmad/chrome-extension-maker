import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { AssetLibrary } from "./ui/asset-library";
import { ExtractionPanel } from "./ui/extraction-panel";
import { UploadPanel } from "./ui/upload-panel";

type Tab = "library" | "extract" | "upload";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "library", label: "Library" },
  { id: "extract", label: "Extract" },
  { id: "upload", label: "Upload" },
];

export default function AssetManager() {
  const [tab, setTab] = useState<Tab>("library");

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <ImageIcon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Asset Manager</div>
          <div className="text-[10px] text-muted-foreground">Library · extraction · uploads</div>
        </div>
      </header>

      <div className="flex rounded-md border bg-card p-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded px-2 py-1 text-[11px] font-medium transition-colors",
              tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "library" && <AssetLibrary />}
      {tab === "extract" && <ExtractionPanel />}
      {tab === "upload" && <UploadPanel />}
    </div>
  );
}
