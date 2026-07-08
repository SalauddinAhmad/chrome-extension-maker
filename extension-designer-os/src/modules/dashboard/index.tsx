import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import {
  Bookmark,
  Camera,
  Cpu,
  Image as ImageIcon,
  LayoutDashboard,
  Palette,
  Search,
  Sparkles,
  StickyNote,
  Type,
} from "lucide-react";
import { db } from "@/storage";
import { useUIStore } from "@/stores/ui-store";
import type { ModuleId } from "@/lib/modules";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/shared/empty-state";

const QUICK_ACTIONS: Array<{ id: ModuleId; label: string; icon: typeof Palette }> = [
  { id: "color-studio", label: "Pick color", icon: Palette },
  { id: "typography-studio", label: "Scan fonts", icon: Type },
  { id: "asset-extractor", label: "Extract", icon: ImageIcon },
  { id: "screenshot", label: "Screenshot", icon: Camera },
  { id: "design-inspector", label: "Inspect", icon: Search },
  { id: "tech-stack", label: "Tech stack", icon: Cpu },
];

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function SectionHeader({
  icon: Icon,
  title,
  count,
  onOpen,
}: {
  icon: typeof Palette;
  title: string;
  count: number;
  onOpen: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span>{title}</span>
        {count > 0 && <span className="text-muted-foreground/60">· {count}</span>}
      </div>
      <button
        onClick={onOpen}
        className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
      >
        Open →
      </button>
    </div>
  );
}

export default function Dashboard() {
  const setActiveModule = useUIStore((s) => s.setActiveModule);

  const colors = useLiveQuery(
    () => db.colors.orderBy("createdAt").reverse().limit(8).toArray(),
    [],
    [],
  );
  const fonts = useLiveQuery(
    () => db.fonts.orderBy("createdAt").reverse().limit(4).toArray(),
    [],
    [],
  );
  const inspirations = useLiveQuery(
    () => db.inspirations.orderBy("createdAt").reverse().limit(4).toArray(),
    [],
    [],
  );
  const notes = useLiveQuery(
    () => db.notes.orderBy("updatedAt").reverse().limit(3).toArray(),
    [],
    [],
  );

  const totals = {
    colors: useLiveQuery(() => db.colors.count(), [], 0),
    fonts: useLiveQuery(() => db.fonts.count(), [], 0),
    inspirations: useLiveQuery(() => db.inspirations.count(), [], 0),
    notes: useLiveQuery(() => db.notes.count(), [], 0),
  };

  const isEmpty =
    totals.colors + totals.fonts + totals.inspirations + totals.notes === 0;

  return (
    <div className="space-y-4 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <LayoutDashboard className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Home</div>
          <div className="text-[10px] text-muted-foreground">
            {isEmpty ? "Start building your design library" : "Your recent work"}
          </div>
        </div>
      </header>

      {/* Quick actions */}
      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Quick actions
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => setActiveModule(a.id)}
                className="flex flex-col items-center gap-1 rounded-md border bg-card px-2 py-2.5 text-[10px] font-medium transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {isEmpty && (
        <EmptyState
          icon={Sparkles}
          title="Your library is empty"
          description="Pick a color, scan a page, or save an inspiration — everything you capture appears here."
        />
      )}

      {/* Recent colors */}
      {totals.colors > 0 && (
        <div className="space-y-1.5">
          <SectionHeader
            icon={Palette}
            title="Recent colors"
            count={totals.colors}
            onOpen={() => setActiveModule("color-studio")}
          />
          <div className="grid grid-cols-8 gap-1">
            {colors.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  navigator.clipboard.writeText(c.hex);
                  toast.success(`Copied ${c.hex}`);
                }}
                className={cn(
                  "aspect-square rounded-md border shadow-sm transition-transform hover:scale-105",
                )}
                style={{ background: c.hex }}
                title={`${c.name ?? c.hex} · click to copy`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent fonts */}
      {totals.fonts > 0 && (
        <div className="space-y-1.5">
          <SectionHeader
            icon={Type}
            title="Recent fonts"
            count={totals.fonts}
            onOpen={() => setActiveModule("typography-studio")}
          />
          <div className="space-y-1">
            {fonts.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  navigator.clipboard.writeText(f.family);
                  toast.success(`Copied ${f.family}`);
                }}
                className="flex w-full items-center justify-between rounded border bg-card px-2 py-1.5 text-left hover:bg-muted"
              >
                <span
                  className="truncate text-xs"
                  style={{ fontFamily: `"${f.family}", sans-serif` }}
                >
                  {f.family}
                </span>
                <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
                  {f.source}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent inspirations */}
      {totals.inspirations > 0 && (
        <div className="space-y-1.5">
          <SectionHeader
            icon={Bookmark}
            title="Recent inspiration"
            count={totals.inspirations}
            onOpen={() => setActiveModule("inspiration-vault")}
          />
          <div className="grid grid-cols-2 gap-1.5">
            {inspirations.map((i) => (
              <a
                key={i.id}
                href={i.url}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-md border bg-card"
                title={i.url}
              >
                {i.thumbnail ? (
                  <img
                    src={i.thumbnail}
                    alt={i.title}
                    className="h-16 w-full object-cover"
                  />
                ) : (
                  <div className="grid h-16 w-full place-items-center bg-muted text-[9px] text-muted-foreground">
                    No preview
                  </div>
                )}
                <div className="truncate p-1.5 text-[10px] font-medium leading-tight">
                  {i.title}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Recent notes */}
      {totals.notes > 0 && (
        <div className="space-y-1.5">
          <SectionHeader
            icon={StickyNote}
            title="Recent notes"
            count={totals.notes}
            onOpen={() => setActiveModule("notes")}
          />
          <div className="space-y-1">
            {notes.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveModule("notes")}
                className="w-full rounded border bg-card p-2 text-left hover:bg-muted"
              >
                <div className="flex items-center gap-2">
                  <span className="truncate text-[11px] font-medium">
                    {n.title || "Untitled"}
                  </span>
                  <span className="ml-auto shrink-0 text-[9px] text-muted-foreground">
                    {timeAgo(n.updatedAt)}
                  </span>
                </div>
                {n.body && (
                  <p className="line-clamp-1 text-[10px] leading-snug text-muted-foreground">
                    {n.body}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Library stats */}
      {!isEmpty && (
        <div className="grid grid-cols-4 gap-1.5 border-t pt-3">
          {[
            { label: "Colors", value: totals.colors },
            { label: "Fonts", value: totals.fonts },
            { label: "Saved", value: totals.inspirations },
            { label: "Notes", value: totals.notes },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-md border bg-card p-2 text-center"
            >
              <div className="text-sm font-semibold leading-tight">{s.value}</div>
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
