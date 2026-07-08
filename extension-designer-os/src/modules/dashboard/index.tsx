import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import {
  Bookmark,
  Camera,
  Cpu,
  FolderKanban,
  Image as ImageIcon,
  LayoutDashboard,
  Palette,
  Search,
  Sparkles,
  StickyNote,
  Type,
  Clock,
} from "lucide-react";
import { db } from "@/storage";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import type { ModuleId } from "@/lib/modules";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/shared/empty-state";
import { fetchRecentActivity, type ActivityItem } from "@/modules/projects/logic/activity";
import { computeProjectStats, EMPTY_STATS } from "@/modules/projects/logic/stats";
import { inspirationRepository } from "@/modules/inspiration-vault/repository";
import { useVaultStore } from "@/modules/inspiration-vault/store";
import { DEFAULT_COLLECTIONS, collectionLabel } from "@/modules/inspiration-vault/logic/collections";
import type { Project, Inspiration } from "@/types";

const QUICK_ACTIONS: Array<{ id: ModuleId; label: string; icon: typeof Palette }> = [
  { id: "color-studio", label: "Pick color", icon: Palette },
  { id: "typography-studio", label: "Scan fonts", icon: Type },
  { id: "screenshot", label: "Screenshot", icon: Camera },
  { id: "design-inspector", label: "Analyze site", icon: Search },
  { id: "asset-extractor", label: "Extract", icon: ImageIcon },
  { id: "tech-stack", label: "Tech stack", icon: Cpu },
];

const COLLECTIONS = [
  { name: "Landing Pages", tag: "landing" },
  { name: "Dashboards", tag: "dashboard" },
  { name: "Branding", tag: "branding" },
  { name: "Ecommerce", tag: "ecommerce" },
  { name: "Mobile Apps", tag: "mobile" },
  { name: "Islamic Design", tag: "islamic" },
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

const KIND_ICON = {
  color: Palette,
  font: Type,
  inspiration: Bookmark,
  asset: ImageIcon,
  note: StickyNote,
  project: FolderKanban,
} as const;

export default function Dashboard() {
  const setActiveModule = useUIStore((s) => s.setActiveModule);
  const openProjectDetail = useProjectStore((s) => s.openProjectDetail);
  const requestNewProject = useProjectStore((s) => s.requestNewProject);
  const activeProject = useProjectStore((s) => s.activeProjectId);

  const totals = {
    projects: useLiveQuery(() => db.projects.filter((p) => !p.archived).count(), [], 0),
    inspirations: useLiveQuery(() => db.inspirations.count(), [], 0),
    assets: useLiveQuery(() => db.assets.count(), [], 0),
    colors: useLiveQuery(() => db.colors.count(), [], 0),
    fonts: useLiveQuery(() => db.fonts.count(), [], 0),
    notes: useLiveQuery(() => db.notes.count(), [], 0),
  };

  const recentProjects = useLiveQuery(
    () => db.projects.filter((p) => !p.archived).reverse().sortBy("createdAt").then((r) => r.slice(0, 4)),
    [],
    [],
  );

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const activityTick = totals.colors + totals.fonts + totals.inspirations + totals.assets + totals.notes + totals.projects;

  useEffect(() => {
    fetchRecentActivity(8).then(setActivity).catch(() => setActivity([]));
  }, [activityTick]);

  const isEmpty = activityTick === 0;
  const hasNoProjects = totals.projects === 0;

  function createProject() {
    setActiveModule("projects");
    requestNewProject();
  }

  return (
    <div className="space-y-4 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <LayoutDashboard className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Home</div>
          <div className="text-[10px] text-muted-foreground">
            {isEmpty ? "Your creative workspace" : "What's new in your library"}
          </div>
        </div>
      </header>

      {/* Workspace overview stats */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: "Projects", value: totals.projects, module: "projects" as ModuleId },
          { label: "Inspiration", value: totals.inspirations, module: "inspiration-vault" as ModuleId },
          { label: "Assets", value: totals.assets, module: "asset-extractor" as ModuleId },
          { label: "Colors", value: totals.colors, module: "color-studio" as ModuleId },
          { label: "Fonts", value: totals.fonts, module: "typography-studio" as ModuleId },
          { label: "Notes", value: totals.notes, module: "notes" as ModuleId },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setActiveModule(s.module)}
            className="rounded-md border bg-card p-2 text-left transition-colors hover:border-primary/40 hover:bg-accent/40"
          >
            <div className="text-sm font-semibold leading-tight">{s.value}</div>
            <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <SectionLabel>Quick actions</SectionLabel>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
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

      {hasNoProjects ? (
        <div className="rounded-lg border bg-gradient-to-br from-primary/10 via-card to-card p-4 text-center">
          <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="mt-2 text-sm font-semibold">Welcome to Designer OS</div>
          <div className="mx-auto mt-1 max-w-[280px] text-[11px] leading-snug text-muted-foreground">
            Create your first project to start organizing inspirations, assets, colors, fonts, and notes.
          </div>
          <button
            onClick={createProject}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            <FolderKanban className="h-3 w-3" /> Create Project
          </button>
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={Sparkles}
          title="Your library is empty"
          description="Pick a color, scan a page, save an inspiration — everything you capture appears here."
        />
      ) : null}

      {/* Recent projects */}
      {recentProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <SectionLabel icon={FolderKanban}>Recent projects</SectionLabel>
            <OpenLink onClick={() => setActiveModule("projects")} />
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {recentProjects.map((p) => (
              <RecentProjectCard
                key={p.id}
                project={p}
                isActive={activeProject === p.id}
                onOpen={() => { setActiveModule("projects"); openProjectDetail(p.id); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {activity.length > 0 && (
        <div>
          <SectionLabel icon={Clock}>Recent activity</SectionLabel>
          <div className="mt-1.5 space-y-1">
            {activity.map((a) => {
              const Icon = KIND_ICON[a.kind];
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-2 rounded border bg-card px-2 py-1.5"
                >
                  {a.color ? (
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded border"
                      style={{ background: a.color }}
                    />
                  ) : (
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-[11px]">{a.label}</span>
                  {a.detail && (
                    <span className="shrink-0 truncate rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
                      {a.detail}
                    </span>
                  )}
                  <span className="shrink-0 text-[9px] text-muted-foreground">{timeAgo(a.ts)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Collections */}
      <div>
        <div className="flex items-center justify-between">
          <SectionLabel icon={Bookmark}>Collections</SectionLabel>
          <OpenLink onClick={() => setActiveModule("inspiration-vault")} />
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {COLLECTIONS.map((c) => (
            <button
              key={c.tag}
              onClick={() => {
                setActiveModule("inspiration-vault");
                toast(`Filter: ${c.name}`, { description: "Filter by tag inside Vault." });
              }}
              className="rounded-md border bg-card px-2 py-2 text-left text-[10px] font-medium transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, children }: { icon?: typeof Palette; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
      {Icon && <Icon className="h-3 w-3" />}
      <span>{children}</span>
    </div>
  );
}

function OpenLink({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-[10px] font-medium text-muted-foreground hover:text-foreground">
      Open →
    </button>
  );
}

function RecentProjectCard({
  project,
  isActive,
  onOpen,
}: {
  project: Project;
  isActive: boolean;
  onOpen: () => void;
}) {
  const stats = useLiveQuery(() => computeProjectStats(project.id), [project.id], EMPTY_STATS);
  return (
    <button
      onClick={onOpen}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card p-2 text-left hover:border-primary/40",
        isActive && "border-primary/60",
      )}
    >
      <div
        className="h-8 w-8 shrink-0 rounded-md border"
        style={{
          background: project.coverImage
            ? `url(${project.coverImage}) center/cover`
            : project.color ?? "hsl(var(--muted))",
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[11px] font-medium">{project.name}</div>
        <div className="truncate text-[9px] text-muted-foreground">
          {stats.total === 0 ? (project.clientName ?? "empty") : `${stats.total} items`}
        </div>
      </div>
    </button>
  );
}
