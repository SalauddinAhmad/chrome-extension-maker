import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Bookmark, Palette, Type, Image as ImageIcon, StickyNote, Star } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/storage";
import { useProjectStore } from "@/stores/project-store";
import { useUIStore } from "@/stores/ui-store";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { computeProjectStats, EMPTY_STATS } from "./logic/stats";
import type { ModuleId } from "@/lib/modules";

function ProjectStatsRow({ projectId }: { projectId: string }) {
  const stats = useLiveQuery(() => computeProjectStats(projectId), [projectId], EMPTY_STATS);
  const items: Array<{ label: string; value: number; icon: typeof Palette }> = [
    { label: "Insp", value: stats.inspirations, icon: Bookmark },
    { label: "Colors", value: stats.colors, icon: Palette },
    { label: "Fonts", value: stats.fonts, icon: Type },
    { label: "Assets", value: stats.assets, icon: ImageIcon },
    { label: "Notes", value: stats.notes, icon: StickyNote },
  ];
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {items.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="rounded-md border bg-card p-1.5 text-center">
            <Icon className="mx-auto h-3 w-3 text-muted-foreground" />
            <div className="mt-0.5 text-xs font-semibold leading-none">{s.value}</div>
            <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

type Tab = "inspirations" | "colors" | "fonts" | "assets" | "notes";

const TABS: Array<{ id: Tab; label: string; icon: typeof Palette; module: ModuleId }> = [
  { id: "inspirations", label: "Inspiration", icon: Bookmark, module: "inspiration-vault" },
  { id: "colors", label: "Colors", icon: Palette, module: "color-studio" },
  { id: "fonts", label: "Fonts", icon: Type, module: "typography-studio" },
  { id: "assets", label: "Assets", icon: ImageIcon, module: "asset-extractor" },
  { id: "notes", label: "Notes", icon: StickyNote, module: "notes" },
];

export function ProjectDetail({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("inspirations");
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const setActiveModule = useUIStore((s) => s.setActiveModule);

  const project = useLiveQuery(() => db.projects.get(projectId), [projectId], undefined);

  if (project === undefined) {
    return (
      <div className="space-y-3 p-3">
        <BackHeader onBack={onBack} />
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="h-20 w-full animate-pulse bg-muted" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-3 p-3">
        <BackHeader onBack={onBack} />
        <EmptyState title="Project not found" description="It may have been deleted." />
      </div>
    );
  }

  const isActive = activeProjectId === project.id;

  return (
    <div className="space-y-3 p-3">
      <BackHeader onBack={onBack} />

      <div className="overflow-hidden rounded-lg border bg-card">
        {project.coverImage && (
          <div
            className="h-20 w-full"
            style={{ background: `url(${project.coverImage}) center/cover` }}
          />
        )}
        <div className="p-3">
          <div className="flex items-start gap-2.5">
            <div
              className="h-9 w-9 shrink-0 rounded-md border"
              style={{ background: project.color ?? "hsl(var(--muted))" }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{project.name}</div>
              {project.clientName && (
                <div className="truncate text-[10px] text-muted-foreground">{project.clientName}</div>
              )}
              {project.description && (
                <div className="mt-1 line-clamp-3 text-[10px] leading-snug text-muted-foreground">
                  {project.description}
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => {
                setActiveProject(isActive ? null : project.id);
                toast.success(isActive ? "Cleared active project" : `Active: ${project.name}`);
              }}
            >
              <Star className={cn("h-3.5 w-3.5", isActive && "fill-current")} />
              {isActive ? "Active" : "Set active"}
            </Button>
          </div>
        </div>
      </div>

      <ProjectStatsRow projectId={project.id} />

      <div className="grid grid-cols-5 gap-1 rounded-md border bg-muted/40 p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded px-1 py-1.5 text-[10px] font-medium transition-colors",
                tab === t.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <TabContent tab={tab} projectId={project.id} onOpenModule={() => setActiveModule(TABS.find((t) => t.id === tab)!.module)} />
    </div>
  );
}

function BackHeader({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> All projects
    </button>
  );
}

function TabContent({ tab, projectId, onOpenModule }: { tab: Tab; projectId: string; onOpenModule: () => void }) {
  const items = useLiveQuery(async () => {
    switch (tab) {
      case "inspirations":
        return db.inspirations.filter((i) => i.projectId === projectId).reverse().sortBy("createdAt");
      case "colors":
        return db.colors.filter((c) => c.projectId === projectId).reverse().sortBy("createdAt");
      case "fonts":
        return db.fonts.filter((f) => f.projectId === projectId).reverse().sortBy("createdAt");
      case "assets":
        return db.assets.filter((a) => a.projectId === projectId).reverse().sortBy("createdAt");
      case "notes":
        return db.notes.filter((n) => n.projectId === projectId).reverse().sortBy("updatedAt");
    }
  }, [tab, projectId], []);

  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center">
        <div className="text-[11px] text-muted-foreground">
          No {tab} yet in this project.
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground/70">
          Set this project as active, then save items from the {TABS.find((t) => t.id === tab)?.label} module.
        </div>
        <Button size="sm" variant="outline" className="mt-2" onClick={onOpenModule}>
          Open module
        </Button>
      </div>
    );
  }

  if (tab === "colors") {
    return (
      <div className="grid grid-cols-6 gap-1">
        {(items as import("@/types").StoredColor[]).map((c) => (
          <button
            key={c.id}
            onClick={() => { navigator.clipboard.writeText(c.hex); toast.success(`Copied ${c.hex}`); }}
            className="aspect-square rounded-md border shadow-sm"
            style={{ background: c.hex }}
            title={c.name ?? c.hex}
          />
        ))}
      </div>
    );
  }

  if (tab === "fonts") {
    return (
      <div className="space-y-1">
        {(items as import("@/types").StoredFont[]).map((f) => (
          <div key={f.id} className="rounded border bg-card px-2 py-1.5 text-xs" style={{ fontFamily: `"${f.family}", sans-serif` }}>
            {f.family}
          </div>
        ))}
      </div>
    );
  }

  if (tab === "inspirations") {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {(items as import("@/types").Inspiration[]).map((i) => (
          <a key={i.id} href={i.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-md border bg-card">
            {i.thumbnail ? (
              <img src={i.thumbnail} alt={i.title} className="h-16 w-full object-cover" />
            ) : (
              <div className="grid h-16 place-items-center bg-muted text-[9px] text-muted-foreground">no preview</div>
            )}
            <div className="truncate p-1.5 text-[10px] font-medium">{i.title}</div>
          </a>
        ))}
      </div>
    );
  }

  if (tab === "assets") {
    return (
      <div className="space-y-1">
        {(items as import("@/types").Asset[]).map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded border bg-card px-2 py-1.5">
            <span className="truncate text-[11px]">{a.filename}</span>
            <span className="rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">{a.kind}</span>
          </div>
        ))}
      </div>
    );
  }

  // notes
  return (
    <div className="space-y-1">
      {(items as import("@/types").Note[]).map((n) => (
        <div key={n.id} className="rounded border bg-card p-2">
          <div className="text-[11px] font-medium">{n.title || "Untitled"}</div>
          {n.body && <div className="line-clamp-2 text-[10px] text-muted-foreground">{n.body}</div>}
        </div>
      ))}
    </div>
  );
}
