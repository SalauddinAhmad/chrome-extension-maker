import { Camera, Loader2, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useVaultStore } from "../store";
import { parseTags } from "../logic/capture";

export function SavePanel() {
  const { draft, isCapturing, isSaving, error, capture, save, setDraft } =
    useVaultStore();

  const previewTags = parseTags(draft.tagsRaw);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-md border bg-muted/30">
        {draft.thumbnail ? (
          <img
            src={draft.thumbnail}
            alt="Page preview"
            className="h-32 w-full object-cover"
          />
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

      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Title
        </label>
        <Input
          value={draft.title}
          onChange={(e) => setDraft({ title: e.target.value })}
          placeholder="Page title"
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          URL
        </label>
        <Input
          value={draft.url}
          onChange={(e) => setDraft({ url: e.target.value })}
          placeholder="https://…"
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Tags
        </label>
        <Input
          value={draft.tagsRaw}
          onChange={(e) => setDraft({ tagsRaw: e.target.value })}
          placeholder="portfolio, dark, brutalist"
          className="h-8 text-xs"
        />
        {previewTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
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
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Notes
        </label>
        <Textarea
          value={draft.notes}
          onChange={(e) => setDraft({ notes: e.target.value })}
          placeholder="Why this inspires you…"
          className="min-h-[60px] text-xs"
        />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
          {error}
        </div>
      )}

      <Button
        onClick={() => void save()}
        disabled={isSaving}
        className="w-full gap-2"
        size="sm"
      >
        {isSaving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Save className="h-3.5 w-3.5" />
        )}
        Save to vault
      </Button>
    </div>
  );
}
