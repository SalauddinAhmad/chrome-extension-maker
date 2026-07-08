import { useMemo } from "react";
import { ExternalLink, Layers, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { RESOURCES } from "./logic/catalog";
import { useResourceStore } from "./store";
import type { ResourceCategory } from "./types";

const CATEGORIES: Array<{ id: "all" | "favorites" | ResourceCategory; label: string }> = [
  { id: "all",           label: "All" },
  { id: "favorites",     label: "★ Faves" },
  { id: "icons",         label: "Icons" },
  { id: "fonts",         label: "Fonts" },
  { id: "stock",         label: "Stock" },
  { id: "mockups",       label: "Mockups" },
  { id: "illustrations", label: "Illust." },
  { id: "gradients",     label: "Gradient" },
  { id: "colors",        label: "Color" },
  { id: "inspiration",   label: "Inspo" },
  { id: "tools",         label: "Tools" },
];

export default function ResourceHub() {
  const { category, query, freeOnly, favorites, setCategory, setQuery, toggleFree, toggleFavorite } =
    useResourceStore();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      if (category === "favorites") {
        if (!favorites.includes(r.id)) return false;
      } else if (category !== "all" && r.category !== category) {
        return false;
      }
      if (freeOnly && !r.free) return false;
      if (q) {
        const hay = `${r.name} ${r.description} ${r.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [category, query, freeOnly, favorites]);

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <Layers className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Resource Hub</div>
          <div className="text-[10px] text-muted-foreground">
            {RESOURCES.length} curated designer resources
          </div>
        </div>
      </header>

      <div className="space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources…"
            className="h-8 pl-8 text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {c.label}
              </button>
            );
          })}
          <button
            onClick={toggleFree}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
              freeOnly
                ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            Free only
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
          {category === "favorites"
            ? "No favorites yet. Star a resource to save it."
            : "No resources match your filters."}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((r) => {
            const faved = favorites.includes(r.id);
            let host = r.url;
            try { host = new URL(r.url).host.replace(/^www\./, ""); } catch { /* keep raw */ }
            return (
              <div key={r.id} className="group flex items-start gap-2 rounded-md border bg-card p-2">
                <button
                  onClick={() => toggleFavorite(r.id)}
                  className={cn(
                    "mt-0.5 rounded p-0.5 transition-colors",
                    faved
                      ? "text-amber-500"
                      : "text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100",
                  )}
                  title={faved ? "Unfavorite" : "Favorite"}
                >
                  <Star className={cn("h-3 w-3", faved && "fill-current")} />
                </button>

                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[12px] font-medium">{r.name}</span>
                    {r.free ? (
                      <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                        free
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium text-amber-600 dark:text-amber-400">
                        paid
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-1 text-[11px] leading-snug text-muted-foreground">
                    {r.description}
                  </p>
                  <div className="mt-0.5 truncate text-[9px] text-muted-foreground/70">
                    {host}
                  </div>
                </a>

                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                  title="Open"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
