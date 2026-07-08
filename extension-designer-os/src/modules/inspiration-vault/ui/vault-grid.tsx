import { useLiveQuery } from "dexie-react-hooks";
import { ExternalLink, Search, Trash2 } from "lucide-react";
import { db } from "@/storage";
import { Input } from "@/components/ui/input";
import { useVaultStore } from "../store";

export function VaultGrid() {
  const items = useLiveQuery(
    () => db.inspirations.orderBy("createdAt").reverse().toArray(),
    [],
    [],
  );
  const { query, setQuery, remove } = useVaultStore();

  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.url.toLowerCase().includes(q) ||
          i.tags.some((t) => t.includes(q)),
      )
    : items;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, url, tag…"
          className="h-8 pl-8 text-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
          {items.length === 0
            ? "Vault is empty. Save your first inspiration."
            : "No matches for that search."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((i) => (
            <div
              key={i.id}
              className="group relative overflow-hidden rounded-md border bg-card"
            >
              <a
                href={i.url}
                target="_blank"
                rel="noreferrer"
                className="block"
                title={i.url}
              >
                {i.thumbnail ? (
                  <img
                    src={i.thumbnail}
                    alt={i.title}
                    className="h-20 w-full object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-full place-items-center bg-muted text-[10px] text-muted-foreground">
                    No preview
                  </div>
                )}
                <div className="space-y-1 p-2">
                  <div className="truncate text-[11px] font-medium leading-tight">
                    {i.title}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {i.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] text-accent-foreground"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
              <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <a
                  href={i.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded bg-black/50 p-1 text-white hover:bg-black/70"
                  title="Open"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  onClick={() => void remove(i.id)}
                  className="rounded bg-black/50 p-1 text-white hover:bg-red-500/80"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
