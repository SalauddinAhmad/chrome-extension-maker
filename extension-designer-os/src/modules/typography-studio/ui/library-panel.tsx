import { useLiveQuery } from "dexie-react-hooks";
import { Copy, Trash2 } from "lucide-react";
import { db } from "@/storage";
import { useTypeStore } from "../store";

export function LibraryPanel() {
  const fonts = useLiveQuery(
    () => db.fonts.orderBy("createdAt").reverse().toArray(),
    [],
    [],
  );
  const { removeFont } = useTypeStore();

  if (fonts.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
        Library is empty.
        <br />
        Save a detected font to start building it.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {fonts.map((f) => (
        <div key={f.id} className="group rounded-md border bg-card p-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div
                className="truncate text-base leading-tight"
                style={{ fontFamily: `"${f.family}", ${f.source === "system" ? "system-ui" : "sans-serif"}` }}
              >
                {f.family}
              </div>
              <div className="mt-0.5 flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                <span className="rounded bg-muted px-1 py-0.5">{f.source}</span>
                {f.weights.length > 0 && <span>{f.weights.join(", ")}</span>}
              </div>
            </div>
            <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => navigator.clipboard.writeText(f.family)}
                className="rounded border p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="Copy family name"
              >
                <Copy className="h-3 w-3" />
              </button>
              <button
                onClick={() => void removeFont(f.id)}
                className="rounded border p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
