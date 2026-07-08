import { useLiveQuery } from "dexie-react-hooks";
import {
  Camera,
  Loader2,
  Save,
  RefreshCw,
  Star,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";
import { useVaultStore } from "../store";
import { parseTags } from "../logic/capture";
import { DEFAULT_COLLECTIONS } from "../logic/collections";
import { projectRepository } from "@/modules/projects/repository";

export function SavePanel() {
  const {
    draft,
    fieldErrors,
    isCapturing,
    isSaving,
    customCollections,
    capture,
    save,
    setDraft,
    addCustomCollection,
  } = useVaultStore();
  const [newCollection, setNewCollection] = useState("");

  const projects = useLiveQuery(
    () => projectRepository.query({ sort: "name-asc" }),
    [],
    [],
  );
  const previewTags = parseTags(draft.tagsRaw);
  const collections = [...DEFAULT_COLLECTIONS, ...customCollections];

  function addCollection() {
    const id = addCustomCollection(newCollection);
    if (id) setDraft({ collection: id });
    setNewCollection("");
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-md border bg-muted/30">
        {draft.thumbnail ? (
          <img src={draft.thumbnail} alt="Page preview" className="h-32 w-full object-cover" />
        ) : (
          <div className="flex h-32 items-center justify-center text-[11px] text-muted-foreground">
            No preview captured yet
          </div>
        )}
        <div className="flex items-center justify-between border-t bg-background/60 p-2">
          <span className="truncate pr-2 text-[10px] text-muted-foreground">
            {draft.url || "Not captured"}
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void capture()}
            disabled={isCapturing}
            className="h-7 gap-1.5 text-[11px]"
          >
            {isCapturing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : draft.url ? (
              <RefreshCw className="h-3 w-3" />
            ) : (
              <Camera className="h-3 w-3" />
            )}
            {draft.url ? "Recapture" : "Capture tab"}
          </Button>
        </div>
      </div>

      <Field label="Title" required error={fieldErrors.title}>
        <Input
          value={draft.title}
          onChange={(e) => setDraft({ title: e.target.value })}
          placeholder="Page title"
          className={cn("h-8 text-xs", fieldErrors.title && "border-destructive")}
          maxLength={220}
        />
      </Field>

      <Field label="URL" required error={fieldErrors.url}>
        <Input
          value={draft.url}
          onChange={(e) => setDraft({ url: e.target.value })}
          placeholder="https://…"
          className={cn("h-8 text-xs", fieldErrors.url && "border-destructive")}
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Project">
          <select
            value={draft.projectId}
            onChange={(e) => setDraft({ projectId: e.target.value })}
            className="h-8 w-full rounded-md border bg-background px-2 text-xs"
          >
            <option value="">Unassigned</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Collection">
          <select
            value={draft.collection}
            onChange={(e) => setDraft({ collection: e.target.value })}
            className="h-8 w-full rounded-md border bg-background px-2 text-xs"
          >
            <option value="">None</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex gap-1.5">
        <Input
          value={newCollection}
          onChange={(e) => setNewCollection(e.target.value)}
          placeholder="Add custom collection"
          className="h-7 text-[11px]"
          maxLength={40}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-7"
          onClick={addCollection}
          disabled={!newCollection.trim()}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <Field label="Tags" error={fieldErrors.tagsRaw}>
        <Input
          value={draft.tagsRaw}
          onChange={(e) => setDraft({ tagsRaw: e.target.value })}
          placeholder="portfolio, dark, brutalist"
          className="h-8 text-xs"
          maxLength={300}
        />
        {previewTags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {previewTags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </Field>

      <Field label="Notes" error={fieldErrors.notes}>
        <Textarea
          value={draft.notes}
          onChange={(e) => setDraft({ notes: e.target.value })}
          placeholder="Why this inspires you…"
          className={cn("min-h-[60px] text-xs", fieldErrors.notes && "border-destructive")}
          maxLength={1020}
        />
        <div className="mt-0.5 text-right text-[9px] text-muted-foreground">
          {draft.notes.length}/1000
        </div>
      </Field>

      <label className="flex items-center gap-1.5 text-[11px]">
        <input
          type="checkbox"
          checked={draft.favorite}
          onChange={(e) => setDraft({ favorite: e.target.checked })}
          className="h-3.5 w-3.5"
        />
        <Star className={cn("h-3 w-3", draft.favorite && "fill-yellow-500 text-yellow-500")} />
        Mark as favorite
      </label>

      <Button onClick={() => void save()} disabled={isSaving} className="w-full gap-2" size="sm">
        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        {draft.id ? "Save changes" : "Save to vault"}
      </Button>
    </div>
  );
}

function Field({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-[10px] text-destructive">
          <AlertCircle className="h-3 w-3" />{error}
        </div>
      )}
    </div>
  );
}
