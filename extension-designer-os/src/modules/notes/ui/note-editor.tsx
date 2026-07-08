import { Loader2, Pin, PinOff, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNotesStore } from "../store";

export function NoteEditor() {
  const {
    editingId,
    title,
    body,
    tagsRaw,
    pinned,
    isSaving,
    error,
    setField,
    save,
    cancel,
  } = useNotesStore();

  return (
    <div className="space-y-2 rounded-md border bg-card p-2">
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setField({ title: e.target.value })}
          placeholder="Note title"
          className="h-8 flex-1 border-0 bg-transparent px-1 text-sm font-medium shadow-none focus-visible:ring-0"
        />
        <button
          onClick={() => setField({ pinned: !pinned })}
          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          title={pinned ? "Unpin" : "Pin"}
        >
          {pinned ? (
            <Pin className="h-3.5 w-3.5 fill-current" />
          ) : (
            <PinOff className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <Textarea
        value={body}
        onChange={(e) => setField({ body: e.target.value })}
        placeholder="Write your thoughts… markdown supported"
        className="min-h-[140px] resize-none border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
      />

      <Input
        value={tagsRaw}
        onChange={(e) => setField({ tagsRaw: e.target.value })}
        placeholder="#brief #idea"
        className="h-7 border-0 bg-transparent px-1 text-[11px] shadow-none focus-visible:ring-0"
      />

      {error && (
        <div className="rounded border border-destructive/40 bg-destructive/10 p-1.5 text-[11px] text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-1 border-t pt-2">
        {editingId && (
          <Button size="sm" variant="ghost" onClick={cancel} className="h-7 gap-1 text-[11px]">
            <X className="h-3 w-3" /> Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => void save()}
          disabled={isSaving}
          className="h-7 gap-1 text-[11px]"
        >
          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          {editingId ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
}
