import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";
import {
  FolderKanban,
  Plus,
  Star,
  Archive,
  ArchiveRestore,
  Trash2,
  Grid3x3,
  List as ListIcon,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { useProjectStore } from "@/stores/project-store";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { ProjectDialog } from "./ui/project-dialog";
import { ProjectDetail } from "./detail";
import { computeProjectStats, EMPTY_STATS } from "./logic/stats";
import { projectRepository, SORT_LABELS, type ProjectSort } from "./repository";
import type { Project } from "@/types";

type View = "grid" | "list";

export default function Projects() {
  const detailProjectId = useProjectStore((s) => s.detailProjectId);
  const openProjectDetail = useProjectStore((s) => s.openProjectDetail);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const archiveProject = useProjectStore((s) => s.archiveProject);
  const newProjectRequestId = useProjectStore((s) => s.newProjectRequestId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [view, setView] = useState<View>("grid");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProjectSort>("updated-desc");

  const projects = useLiveQuery(() => projectRepository.getAll(), [], undefined);
  const isLoading = projects === undefined;

  useEffect(() => {
    if (newProjectRequestId > 0) {
      setEditId(null);
      setDialogOpen(true);
    }
  }, [newProjectRequestId]);

  const visible = useMemo(() => {
    if (!projects) return [];
    return applyQuery(projects, { includeArchived: showArchived, search, sort });
  }, [projects, showArchived, search, sort]);

  const totalCount = projects?.length ?? 0;
  const archivedCount = projects?.filter((p) => p.archived).length ?? 0;
  const nonArchivedCount = totalCount - archivedCount;

  if (detailProjectId) {
    return <ProjectDetail projectId={detailProjectId} onBack={() => openProjectDetail(null)} />;
  }

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <FolderKanban className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Projects</div>
          <div className="text-[10px] text-muted-foreground">
            {totalCount} total{activeProjectId ? " · active set" : ""}
          </div>
        </div>
        <div className="flex rounded-md border p-0.5">
          <ViewButton current={view} value="grid" onClick={setView} icon={Grid3x3} label="Grid" />
          <ViewButton current={view} value="list" onClick={setView} icon={ListIcon} label="List" />
        </div>
        <Button size="sm" onClick={() => { setEditId(null); setDialogOpen(true); }}>
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </header>

      {(totalCount > 0 || isLoading) && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="h-8 pl-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <div className="flex items-center gap-1 rounded-md border px-2 py-1">
              <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ProjectSort)}
                className="bg-transparent text-[10px] outline-none"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowArchived((v) => !v)}
              className={cn(
                "rounded-md border px-2 py-1 hover:bg-muted",
                showArchived ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {showArchived ? `Showing archived (${archivedCount})` : "Show archived"}
            </button>
            {activeProjectId && (
              <button
                onClick={() => { setActiveProject(null); toast.success("Cleared active project"); }}
                className="rounded-md border px-2 py-1 text-muted-foreground hover:bg-muted"
              >
                Clear active
              </button>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingGrid view={view} />
      ) : totalCount === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project to group inspirations, colors, fonts, assets, and notes for a single client or brief."
          action={
            <Button size="sm" onClick={() => { setEditId(null); setDialogOpen(true); }}>
              <Plus className="h-3.5 w-3.5" /> Create your first project
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        search.trim() ? (
          <EmptyState
            icon={Search}
            title="No matches"
            description={`Nothing matches “${search.trim()}”. Try a shorter or different query.`}
            action={<Button size="sm" variant="outline" onClick={() => setSearch("")}>Clear search</Button>}
          />
        ) : showArchived ? (
          <EmptyState
            icon={Archive}
            title="No archived projects"
            description="Archived projects will appear here."
          />
        ) : nonArchivedCount === 0 ? (
          <EmptyState
            icon={Archive}
            title="Everything is archived"
            description="Toggle “Show archived” to browse them."
            action={
              <Button size="sm" variant="outline" onClick={() => setShowArchived(true)}>
                Show archived
              </Button>
            }
          />
        ) : (
          <EmptyState icon={FolderKanban} title="Nothing to show" />
        )
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-2">
          {visible.map((p) => (
            <ProjectGridCard
              key={p.id}
              project={p}
              isActive={activeProjectId === p.id}
              onOpen={() => openProjectDetail(p.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {visible.map((p) => (
            <ProjectListCard
              key={p.id}
              project={p}
              isActive={activeProjectId === p.id}
              onOpen={() => openProjectDetail(p.id)}
              onSetActive={async () => {
                try {
                  setActiveProject(activeProjectId === p.id ? null : p.id);
                  toast.success(activeProjectId === p.id ? "Cleared active project" : `Active: ${p.name}`);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Failed to update");
                }
              }}
              onEdit={() => { setEditId(p.id); setDialogOpen(true); }}
              onArchive={async () => {
                try {
                  await archiveProject(p.id, !p.archived);
                  toast.success(p.archived ? "Restored" : "Archived");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Failed to archive");
                }
              }}
              onDelete={async () => {
                try {
                  await deleteProject(p.id);
                  toast.success("Project deleted");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Failed to delete");
                }
              }}
            />
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectId={editId}
      />
    </div>
  );
}

function applyQuery(
  projects: Project[],
  opts: { includeArchived: boolean; search: string; sort: ProjectSort },
): Project[] {
  const q = opts.search.trim().toLowerCase();
  const filtered = projects.filter((p) => {
    if (!opts.includeArchived && p.archived) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.clientName?.toLowerCase().includes(q) ?? false) ||
      (p.description?.toLowerCase().includes(q) ?? false)
    );
  });
  const arr = [...filtered];
  switch (opts.sort) {
    case "created-desc": return arr.sort((a, b) => b.createdAt - a.createdAt);
    case "name-asc": return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc": return arr.sort((a, b) => b.name.localeCompare(a.name));
    case "updated-desc":
    default: return arr.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

function ViewButton<T extends string>({
  current, value, onClick, icon: Icon, label,
}: {
  current: T; value: T; onClick: (v: T) => void; icon: typeof Grid3x3; label: string;
}) {
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "grid h-6 w-6 place-items-center rounded",
        current === value ? "bg-muted text-foreground" : "text-muted-foreground",
      )}
      title={label}
    >
      <Icon className="h-3 w-3" />
    </button>
  );
}

function LoadingGrid({ view }: { view: View }) {
  const count = 4;
  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border bg-card">
            <Skeleton className="h-16 w-full rounded-none" />
            <div className="space-y-1.5 p-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-2 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-2.5 rounded-lg border bg-card p-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2 w-2/3" />
            <Skeleton className="h-2 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function useStats(projectId: string) {
  return useLiveQuery(() => computeProjectStats(projectId), [projectId], EMPTY_STATS);
}

function ProjectGridCard({
  project, isActive, onOpen,
}: {
  project: Project; isActive: boolean; onOpen: () => void;
}) {
  const stats = useStats(project.id);
  return (
    <button
      onClick={onOpen}
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-card text-left transition-colors hover:border-primary/50",
        isActive && "border-primary/60 ring-1 ring-primary/30",
        project.archived && "opacity-60",
      )}
    >
      <div
        className="relative h-16 w-full"
        style={{
          background: project.coverImage
            ? `url(${project.coverImage}) center/cover`
            : project.color ?? "hsl(var(--muted))",
        }}
      >
        {isActive && (
          <span className="absolute right-1 top-1 rounded bg-background/90 px-1 py-0.5 text-[8px] font-semibold text-primary">
            ACTIVE
          </span>
        )}
        {project.archived && (
          <span className="absolute left-1 top-1 rounded bg-background/90 px-1 py-0.5 text-[8px] font-semibold text-muted-foreground">
            ARCHIVED
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 p-2">
        <div className="truncate text-[11px] font-semibold">{project.name}</div>
        {project.clientName && (
          <div className="truncate text-[9px] text-muted-foreground">{project.clientName}</div>
        )}
        <div className="mt-1.5 text-[9px] text-muted-foreground">
          {stats.total === 0 ? "empty" : `${stats.total} items`}
        </div>
      </div>
    </button>
  );
}

function ProjectListCard({
  project, isActive, onOpen, onSetActive, onEdit, onArchive, onDelete,
}: {
  project: Project;
  isActive: boolean;
  onOpen: () => void;
  onSetActive: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const stats = useStats(project.id);

  return (
    <div
      className={cn(
        "group rounded-lg border bg-card p-3 transition-colors",
        isActive && "border-primary/60 ring-1 ring-primary/30",
        project.archived && "opacity-60",
      )}
    >
      <button onClick={onOpen} className="flex w-full items-start gap-2.5 text-left">
        <div
          className="mt-0.5 h-10 w-10 shrink-0 rounded-md border bg-cover bg-center"
          style={{
            background: project.coverImage
              ? `url(${project.coverImage}) center/cover`
              : project.color ?? "hsl(var(--muted))",
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="truncate text-xs font-semibold">{project.name}</div>
            {isActive && (
              <span className="rounded-sm bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary">
                ACTIVE
              </span>
            )}
            {project.archived && (
              <span className="rounded-sm bg-muted px-1 py-0.5 text-[9px] font-medium text-muted-foreground">
                ARCHIVED
              </span>
            )}
          </div>
          {project.clientName && (
            <div className="truncate text-[10px] text-muted-foreground">{project.clientName}</div>
          )}
          {project.description && (
            <div className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
              {project.description}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] text-muted-foreground">
            <Chip label="Insp" value={stats.inspirations} />
            <Chip label="Colors" value={stats.colors} />
            <Chip label="Fonts" value={stats.fonts} />
            <Chip label="Assets" value={stats.assets} />
            <Chip label="Notes" value={stats.notes} />
            {stats.total === 0 && <span>empty</span>}
            <span className="ml-auto">Updated {timeAgo(project.updatedAt)}</span>
          </div>
        </div>
      </button>
      <div className="mt-2 flex items-center justify-end gap-1 border-t pt-2 opacity-0 transition-opacity group-hover:opacity-100">
        <IconAction title={isActive ? "Unset active" : "Set active"} onClick={onSetActive}>
          <Star className={cn("h-3 w-3", isActive && "fill-primary text-primary")} />
        </IconAction>
        <IconAction title="Edit" onClick={onEdit}>
          <span className="text-[10px] font-medium">Edit</span>
        </IconAction>
        <IconAction title={project.archived ? "Restore" : "Archive"} onClick={onArchive}>
          {project.archived ? <ArchiveRestore className="h-3 w-3" /> : <Archive className="h-3 w-3" />}
        </IconAction>
        <IconAction title="Delete" onClick={onDelete}>
          <Trash2 className="h-3 w-3 text-destructive" />
        </IconAction>
      </div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  return <span className="rounded bg-muted px-1.5 py-0.5">{value} {label}</span>;
}

function IconAction({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button title={title} onClick={onClick} className="flex h-6 items-center gap-1 rounded px-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
      {children}
    </button>
  );
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
