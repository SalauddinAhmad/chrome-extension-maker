import { useLiveQuery } from "dexie-react-hooks";
import { useState, useEffect } from "react";
import { Copy, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useTypographyLibraryStore } from "../library-store";
import {
  FONT_CATEGORY_LABEL,
  FONT_SOURCE_LABEL,
  type FontCategory,
} from "@/types";

const CATEGORIES: FontCategory[] = ["sans-serif", "serif", "display", "monospace", "script", "handwriting"];

export function FontDetailDialog() {
  const id = useTypographyLibraryStore((s) => s.detailId);
  const close = useTypographyLibraryStore((s) => s.closeDetail);
  const updateFont = useTypographyLibraryStore((s) => s.updateFont);
  const deleteFont = useTypographyLibraryStore((s) => s.deleteFont);
  const toggleFavorite = useTypographyLibraryStore((s) => s.toggleFavorite);
  const moveToProject = useTypographyLibraryStore((s) => s.moveToProject);

  const font = useLiveQuery(() => (id ? db.fonts.get(id) : undefined), [id]);
  const projects = useLiveQuery(() => db.projects.filter((p) => !p.archived).toArray(), [], []);

  const [tagsInput, setTagsInput] = useState("");
  useEffect(() => { setTagsInput(font?.tags?.join(", ") ?? ""); }, [font?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!id || !font) return null;
  const stack = `"${font.family}", sans-serif`;

  const saveTags = () => {
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    void updateFont(font.id, { tags });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: stack }} className="truncate text-2xl">
            {font.family}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border bg-muted/30 p-3" style={{ fontFamily: stack }}>
            <div className="text-3xl leading-tight">Aa Bb Cc 123</div>
            <p className="mt-2 text-sm text-muted-foreground">
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="space-y-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Category</span>
              <select
                value={font.category ?? "sans-serif"}
                onChange={(e) => void updateFont(font.id, { category: e.target.value as FontCategory })}
                className="h-8 w-full rounded-md border bg-background px-2 text-xs"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{FONT_CATEGORY_LABEL[c]}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Source</span>
              <div className="flex h-8 items-center rounded-md border bg-muted/30 px-2 text-xs">
                {FONT_SOURCE_LABEL[font.source]}
              </div>
            </label>
            <label className="col-span-2 space-y-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Project</span>
              <select
                value={font.projectId ?? ""}
                onChange={(e) => void moveToProject(font.id, e.target.value || undefined)}
                className="h-8 w-full rounded-md border bg-background px-2 text-xs"
              >
                <option value="">— Unassigned —</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="col-span-2 space-y-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Tags (comma separated)</span>
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} onBlur={saveTags} className="h-8 text-xs" />
            </label>
          </div>

          <div className="text-[10px] text-muted-foreground">
            Weights: {font.weights.join(", ") || "—"} · Created {new Date(font.createdAt).toLocaleDateString()}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { navigator.clipboard.writeText(font.family); toast.success("Copied family"); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border bg-background px-2 py-1.5 text-xs hover:bg-muted"
            >
              <Copy className="h-3 w-3" /> Copy family
            </button>
            <button
              onClick={() => void toggleFavorite(font.id)}
              className={cn("flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs", font.favorite && "border-yellow-500/50 text-yellow-600")}
            >
              <Star className={cn("h-3 w-3", font.favorite && "fill-current")} /> Favorite
            </button>
            <button
              onClick={() => { void deleteFont(font.id); close(); }}
              className="flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
