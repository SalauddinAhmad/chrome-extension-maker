import { Plus, Search, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotesStore } from "./store";
import { NoteEditor } from "./ui/note-editor";
import { NoteList } from "./ui/note-list";

export default function Notes() {
  const { query, setQuery, editingId, title, body, newNote } = useNotesStore();
  const isDrafting = editingId !== null || title.length > 0 || body.length > 0;

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <StickyNote className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Notes</div>
          <div className="text-[10px] text-muted-foreground">Ideas · briefs · todos</div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={newNote}
          className="h-7 gap-1 text-[11px]"
        >
          <Plus className="h-3 w-3" /> New
        </Button>
      </header>

      {isDrafting && <NoteEditor />}

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes…"
          className="h-8 pl-8 text-xs"
        />
      </div>

      <NoteList />
    </div>
  );
}
