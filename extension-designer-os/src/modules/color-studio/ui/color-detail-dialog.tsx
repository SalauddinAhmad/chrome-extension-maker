import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useLiveQuery } from "dexie-react-hooks";
import { Copy, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/storage";
import { cn } from "@/lib/cn";
import { bestTextOn, formatHsl, formatRgb, hexToRgb } from "../logic";
import { colorRepository } from "../repository";
import { useColorLibraryStore } from "../library-store";
import { COLOR_SOURCE_LABEL, type StoredColor } from "@/types";

export function ColorDetailDialog() {
  const detailId = useColorLibraryStore((s) => s.detailId);
  const closeDetail = useColorLibraryStore((s) => s.closeDetail);

  return (
    <Dialog.Root open={Boolean(detailId)} onOpenChange={(o) => !o && closeDetail()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[92vw] max-w-[380px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border bg-popover p-4 text-popover-foreground shadow-2xl">
          <Dialog.Title className="sr-only">Color details</Dialog.Title>
          <Dialog.Description className="sr-only">
            Preview and edit a saved color's name, tags, and project.
          </Dialog.Description>
          {detailId && <DetailBody id={detailId} onClose={closeDetail} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DetailBody({ id, onClose }: { id: string; onClose: () => void }) {
  const [color, setColor] = useState<StoredColor | null>(null);
  const [name, setName] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const projects = useLiveQuery(
    () => db.projects.filter((p) => !p.archived).sortBy("name"),
    [],
    [],
  );
  const toggleFavorite = useColorLibraryStore((s) => s.toggleFavorite);
  const deleteColor = useColorLibraryStore((s) => s.deleteColor);

  useEffect(() => {
    let cancelled = false;
    colorRepository.getById(id).then((c) => {
      if (cancelled) return;
      if (!c) { toast.error("Color not found"); onClose(); return; }
      setColor(c);
      setName(c.name ?? "");
      setTagsRaw((c.tags ?? []).join(", "));
      setProjectId(c.projectId ?? "");
    });
    return () => { cancelled = true; };
  }, [id, onClose]);

  if (!color) return null;

  const fg = bestTextOn(hexToRgb(color.hex));
  const rgbStr = formatRgb(color.rgb);
  const hslStr = formatHsl(color.hsl);

  function copy(v: string, label: string) {
    navigator.clipboard.writeText(v);
    toast.success(`Copied ${label}`);
  }

  async function save() {
    if (!color) return;
    setSaving(true);
    try {
      await colorRepository.update(color.id, {
        name: name.trim() || null,
        tags: tagsRaw.split(/[,\n]/).map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 20),
        projectId: projectId || undefined,
      });
      toast.success("Color updated");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {COLOR_SOURCE_LABEL[color.source ?? "manual"]}
          </div>
          <div className="truncate text-sm font-semibold">{color.name ?? color.hex}</div>
        </div>
        <button
          onClick={() => void toggleFavorite(color.id)}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title={color.favorite ? "Unfavorite" : "Favorite"}
        >
          <Star className={cn("h-4 w-4", color.favorite && "fill-yellow-400 text-yellow-400")} />
        </button>
        <Dialog.Close asChild>
          <button className="rounded p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </Dialog.Close>
      </div>

      <div
        className="flex h-32 items-end rounded-md border p-3 shadow-inner"
        style={{ background: color.hex, color: fg }}
      >
        <div>
          <div className="font-mono text-lg font-semibold">{color.hex}</div>
          <div className="text-[10px] opacity-80">{rgbStr}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1">
        <Row label="HEX" value={color.hex} onCopy={() => copy(color.hex, color.hex)} />
        <Row label="RGB" value={rgbStr} onCopy={() => copy(rgbStr, "RGB")} />
        <Row label="HSL" value={hslStr} onCopy={() => copy(hslStr, "HSL")} />
        <Row
          label="Project"
          value={projects.find((p) => p.id === color.projectId)?.name ?? "Unassigned"}
        />
        <Row label="Created" value={new Date(color.createdAt).toLocaleString()} />
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
          placeholder="brand, hero, cta"
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
          {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
      </div>

      <div className="flex items-center gap-1.5 pt-1">
        <Button size="sm" className="flex-1" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            if (!confirm("Delete this color?")) return;
            await deleteColor(color.id);
            onClose();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border bg-card px-2 py-1">
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 truncate text-right font-mono text-[11px]">{value}</span>
      {onCopy && (
        <button
          onClick={onCopy}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title={`Copy ${label}`}
        >
          <Copy className="h-3 w-3" />
        </button>
      )}
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
