import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  CheckSquare, Copy, Download, Loader2, RefreshCw, Save, Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { getActiveTab, isExtension } from "@/lib/chrome";
import { db } from "@/storage";
import { useProjectStore } from "@/stores/project-store";
import { useAssetStore } from "../store";
import { useLibraryStore } from "../library-store";
import type { AssetTab, ScannedKind } from "../types";
import { toast } from "sonner";

const TABS: Array<{ id: AssetTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "image", label: "Images" },
  { id: "svg", label: "SVG" },
  { id: "background", label: "BG" },
  { id: "icon", label: "Icons" },
  { id: "video", label: "Video" },
];

function ThumbFor({ url, kind }: { url: string; kind: ScannedKind }) {
  if (kind === "video") {
    return (
      <div className="grid h-full w-full place-items-center bg-muted text-[10px] text-muted-foreground">
        video
      </div>
    );
  }
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      className="h-full w-full object-contain"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.2"; }}
    />
  );
}

export function ExtractionPanel() {
  const {
    tab, assets, selected, isScanning, error,
    scan, toggle, download, downloadSelected, clearSelection,
  } = useAssetStore();
  const saveScanned = useLibraryStore((s) => s.saveScanned);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const projects = useLiveQuery(() => db.projects.filter((p) => !p.archived).sortBy("name"), [], []);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(
    () => (tab === "all" ? assets : assets.filter((a) => a.kind === tab)),
    [tab, assets],
  );
  const selectedCount = selected.size;
  const activeProject = projects.find((p) => p.id === activeProjectId);

  async function saveSelected() {
    if (!selectedCount) return;
    setSaving(true);
    try {
      const picks = filtered.filter((a) => selected.has(a.id));
      const tab = isExtension ? await getActiveTab() : null;
      const pageUrl = tab?.url;
      const count = await saveScanned(picks, pageUrl);
      if (count > 0) clearSelection();
    } finally {
      setSaving(false);
    }
  }

  async function saveAll() {
    if (!filtered.length) return;
    setSaving(true);
    try {
      const tab = isExtension ? await getActiveTab() : null;
      await saveScanned(filtered, tab?.url);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => void scan()}
          disabled={isScanning}
          size="sm"
          className="flex-1 gap-2"
        >
          {isScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {assets.length > 0 ? "Rescan" : "Scan page"}
        </Button>
        {selectedCount > 0 && (
          <Button
            onClick={() => void downloadSelected()}
            variant="secondary"
            size="sm"
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            {selectedCount}
          </Button>
        )}
      </div>

      {assets.length > 0 && (
        <div className="rounded-md border bg-muted/30 px-2 py-1.5 text-[10px] text-muted-foreground">
          {activeProject
            ? <>Saving to <span className="font-semibold text-foreground">{activeProject.name}</span></>
            : <>No active project — assets will be saved unassigned. Set an active project from Projects.</>}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
          {error}
        </div>
      )}

      {assets.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => {
            const count = t.id === "all" ? assets.length : assets.filter((a) => a.kind === t.id).length;
            if (count === 0 && t.id !== "all") return null;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => useAssetStore.getState().setTab(t.id)}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                  active ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {t.label} · {count}
              </button>
            );
          })}
          {selectedCount > 0 && (
            <button
              onClick={clearSelection}
              className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted"
            >
              clear
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 && !isScanning ? (
        <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
          {assets.length === 0
            ? "Click scan to extract assets from the current tab."
            : "No assets of this type."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((a) => {
              const picked = selected.has(a.id);
              return (
                <div
                  key={a.id}
                  className={cn(
                    "group relative overflow-hidden rounded-md border bg-muted/30",
                    picked && "ring-2 ring-primary",
                  )}
                >
                  <button
                    onClick={() => toggle(a.id)}
                    className="block h-20 w-full"
                    title={a.url}
                  >
                    <ThumbFor url={a.url} kind={a.kind} />
                  </button>
                  <button
                    onClick={() => toggle(a.id)}
                    className="absolute left-1 top-1 rounded bg-black/50 p-0.5 text-white"
                    title={picked ? "Deselect" : "Select"}
                  >
                    {picked ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />}
                  </button>
                  <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => { navigator.clipboard.writeText(a.url); toast.success("URL copied"); }}
                      className="rounded bg-black/50 p-1 text-white hover:bg-black/70"
                      title="Copy URL"
                    ><Copy className="h-3 w-3" /></button>
                    <button
                      onClick={() => void download(a)}
                      className="rounded bg-black/50 p-1 text-white hover:bg-primary"
                      title="Download"
                    ><Download className="h-3 w-3" /></button>
                  </div>
                  <div className="truncate bg-background/80 px-1.5 py-1 text-[9px] text-muted-foreground">
                    {a.width && a.height ? `${a.width}×${a.height} · ` : ""}
                    {a.filename}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              className="flex-1 gap-1.5"
              disabled={saving || selectedCount === 0}
              onClick={() => void saveSelected()}
            >
              <Save className="h-3 w-3" />
              Save selected ({selectedCount})
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={saving || filtered.length === 0}
              onClick={() => void saveAll()}
            >
              Save all
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
