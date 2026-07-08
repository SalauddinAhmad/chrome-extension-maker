import { useLiveQuery } from "dexie-react-hooks";
import { Pencil, Pin, Trash2 } from "lucide-react";
import { db } from "@/storage";
import { cn } from "@/lib/cn";
import { useNotesStore } from "../store";
import type { Note } from "@/types";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function NoteList() {
  const notes = useLiveQuery(
    () => db.notes.orderBy("updatedAt").reverse().toArray(),
    [],
    [] as Note[],
  );
  const { query, editingId, edit, remove, togglePin } = useNotesStore();

  const q = query.trim().toLowerCase();
  const filtered = q
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          n.tags.some((t) => t.includes(q)),
      )
    : notes;

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });

  if (sorted.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
        {notes.length === 0 ? "No notes yet." : "No matches."}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {sorted.map((n) => {
        const active = editingId === n.id;
        return (
          <div
            key={n.id}
            className={cn(
              "group rounded-md border bg-card p-2 transition-colors",
              active && "ring-1 ring-ring",
            )}
          >
            <div className="flex items-start gap-2">
              <button
                onClick={() => void togglePin(n)}
                className={cn(
                  "mt-0.5 rounded p-0.5 transition-colors",
                  n.pinned
                    ? "text-primary"
                    : "text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100",
                )}
                title={n.pinned ? "Unpin" : "Pin"}
              >
                <Pin className={cn("h-3 w-3", n.pinned && "fill-current")} />
              </button>

              <button
                onClick={() => edit(n)}
                className="flex-1 min-w-0 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="truncate text-[12px] font-medium">
                    {n.title || "Untitled"}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {formatDate(n.updatedAt)}
                  </span>
                </div>
                {n.body && (
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                    {n.body}
                  </p>
                )}
                {n.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {n.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] text-accent-foreground"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </button>

              <div className="flex flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => edit(n)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Edit"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => void remove(n.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
