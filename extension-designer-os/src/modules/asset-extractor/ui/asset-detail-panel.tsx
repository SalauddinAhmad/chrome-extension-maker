import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useLiveQuery } from "dexie-react-hooks";
import { Copy, Download, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { projectRepository } from "@/modules/projects/repository";
import { downloadFile } from "@/lib/chrome";
import { safeFilename } from "../logic/download";
import { formatBytes, parseTags } from "../logic/validation";
import { assetRepository } from "../repository";
import { useLibraryStore } from "../library-store";
import { ASSET_SOURCE_LABEL, ASSET_TYPE_LABEL, type Asset } from "@/types";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

export function AssetDetailDialog() {
  const detailId = useLibraryStore((s) => s.detailId);
  const closeDetail = useLibraryStore((s) => s.closeDetail);

  return (
    <Dialog.Root open={Boolean(detailId)} onOpenChange={(o) => !o && closeDetail()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[92vw] max-w-[400px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border bg-popover p-4 text-popover-foreground shadow-2xl">
          <Dialog.Title className="sr-only">Asset details</Dialog.Title>
          <Dialog.Description className="sr-only">
            Preview an asset and edit its name, tags, and project.
          </Dialog.Description>
          {detailId && <DetailBody id={detailId} onClose={closeDetail} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DetailBody({ id, onClose }: { id: string; onClose: () => void }) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [name, setName] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const projects = useLiveQuery(
    () => projectRepository.listActive(),
    [],
    [],
  );
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const remove = useLibraryStore((s) => s.remove);

  useEffect(() => {
    let cancelled = false;
    assetRepository.getById(id).then((a) => {
      if (cancelled) return;
      if (!a) { toast.error("Asset not found"); onClose(); return; }
      setAsset(a);
      setName(a.name);
      setTagsRaw(a.tags.join(", "));
      setProjectId(a.projectId ?? "");
    });
    return () => { cancelled = true; };
  }, [id, onClose]);

  if (!asset) return null;

  async function save() {
    if (!asset) return;
    setSaving(true);
    try {
      await assetRepository.update(asset.id, {
        name: name.trim() || asset.name,
        tags: parseTags(tagsRaw),
        projectId: projectId || undefined,
      });
      toast.success("Asset updated");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const project = projects.find((p) => p.id === asset.projectId);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {ASSET_SOURCE_LABEL[asset.source]}
          </div>
          <div className="truncate text-sm font-semibold">{asset.name}</div>
        </div>
        <button
          onClick={() => void toggleFavorite(asset.id)}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title={asset.favorite ? "Unfavorite" : "Favorite"}
        >
          <Star className={cn("h-4 w-4", asset.favorite && "fill-yellow-400 text-yellow-400")} />
        </button>
        <Dialog.Close asChild>
          <button
            aria-label="Close asset details"
            className="rounded p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </Dialog.Close>
      </div>

      <div className="grid h-48 place-items-center overflow-hidden rounded-md border bg-muted/40">
        {asset.thumbnail || ["png","jpg","jpeg","webp","svg","gif"].includes(asset.type) ? (
          <img src={asset.thumbnail ?? asset.url} alt={asset.name} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-xs font-semibold uppercase text-muted-foreground">
            {ASSET_TYPE_LABEL[asset.type]} preview unavailable
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        <Fact label="Type">{ASSET_TYPE_LABEL[asset.type]}</Fact>
        <Fact label="Size">{formatBytes(asset.size)}</Fact>
        <Fact label="Dimensions">
          {asset.width && asset.height ? `${asset.width}×${asset.height}` : "—"}
        </Fact>
        <Fact label="Project">{project?.name ?? "Unassigned"}</Fact>
        <Fact label="Created">{new Date(asset.createdAt).toLocaleDateString()}</Fact>
        <Fact label="Source">{ASSET_SOURCE_LABEL[asset.source]}</Fact>
      </div>

      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-7 text-[11px]" />
      </div>

      <div className="space-y-1.5">
        <Label>Tags (comma separated)</Label>
        <Input
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          className="h-7 text-[11px]"
          placeholder="hero, banner, logo"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Project</Label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="h-7 w-full rounded-md border bg-card px-1.5 text-[11px] outline-none focus:border-primary"
        >
          <option value="">Unassigned</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <Button size="sm" onClick={() => void save()} disabled={saving} className="flex-1">
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => void downloadFile(asset.url, safeFilename(asset.name))}
        >
          <Download className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(asset.url);
            toast.success("URL copied");
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            if (!confirm("Delete this asset?")) return;
            await remove(asset.id);
            onClose();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-card px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="truncate font-medium">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}
