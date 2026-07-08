import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { FolderKanban, Plus, Star, ArrowLeft, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db, projectsRepo } from "@/storage";
import { useProjectStore } from "@/stores/project-store";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ProjectDialog } from "./ui/project-dialog";
import { ProjectDetail } from "./detail";

export default function Projects() {
  const detailProjectId = useProjectStore((s) => s.detailProjectId);
  const openProjectDetail = useProjectStore((s) => s.openProjectDetail);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const projects = useLiveQuery(
    () => db.projects.orderBy("createdAt").reverse().toArray(),
    [],
    [],
  );

  if (detailProjectId) {
    return <ProjectDetail projectId={detailProjectId} onBack={() => openProjectDetail(null)} />;
  }

  const visible = projects.filter((p) => showArchived || !p.archived);

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <FolderKanban className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Projects</div>
          <div className="text-[10px] text-muted-foreground">
            {projects.length} total{activeProjectId ? " · active set" : ""}
          </div>
        </div>
        <Button size="sm" onClick={() => { setEditId(null); setDialogOpen(true); }}>
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </header>

      {projects.length > 0 && (
        <div className="flex items-center gap-2 text-[10px]">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="rounded-md border px-2 py-1 text-muted-foreground hover:bg-muted"
          >
            {showArchived ? "Hide archived" : "Show archived"}
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
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={projects.length === 0 ? "No projects yet" : "Nothing to show"}
          description={
            projects.length === 0
              ? "Create a project to group inspirations, colors, fonts, assets, and notes for a single client or brief."
              : "Toggle archived projects to see them here."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {visible.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              isActive={activeProjectId === p.id}
              onOpen={() => openProjectDetail(p.id)}
              onSetActive={() => {
                setActiveProject(activeProjectId === p.id ? null : p.id);
                toast.success(activeProjectId === p.id ? "Cleared active project" : `Active: ${p.name}`);
              }}
              onEdit={() => { setEditId(p.id); setDialogOpen(true); }}
              onArchive={async () => {
                await projectsRepo.update(p.id, { archived: !p.archived });
                toast.success(p.archived ? "Restored" : "Archived");
              }}
              onDelete={async () => {
                await projectsRepo.remove(p.id);
                if (activeProjectId === p.id) setActiveProject(null);
                toast.success("Project deleted");
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

function ProjectCard({
  project,
  isActive,
  onOpen,
  onSetActive,
  onEdit,
  onArchive,
  onDelete,
}: {
  project: import("@/types").Project;
  isActive: boolean;
  onOpen: () => void;
  onSetActive: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const counts = useLiveQuery(
    async () => {
      const [inspirations, colors, fonts, assets, notes] = await Promise.all([
        db.inspirations.filter((i) => i.projectId === project.id).count(),
        db.colors.filter((c) => c.projectId === project.id).count(),
        db.fonts.filter((f) => f.projectId === project.id).count(),
        db.assets.filter((a) => a.projectId === project.id).count(),
        db.notes.filter((n) => n.projectId === project.id).count(),
      ]);
      return { inspirations, colors, fonts, assets, notes };
    },
    [project.id],
    { inspirations: 0, colors: 0, fonts: 0, assets: 0, notes: 0 },
  );

  const total = counts.inspirations + counts.colors + counts.fonts + counts.assets + counts.notes;

  return (
    <div
      className={cn(
        "group rounded-lg border bg-card p-3 transition-colors",
        isActive && "border-primary/60 ring-1 ring-primary/30",
        project.archived && "opacity-60",
      )}
    >
      <button
        onClick={onOpen}
        className="flex w-full items-start gap-2.5 text-left"
      >
        <div
          className="mt-0.5 h-8 w-8 shrink-0 rounded-md border"
          style={{ background: project.color ?? "hsl(var(--muted))" }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="truncate text-xs font-semibold">{project.name}</div>
            {isActive && (
              <span className="rounded-sm bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary">
                ACTIVE
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
            <Chip label="Insp" value={counts.inspirations} />
            <Chip label="Colors" value={counts.colors} />
            <Chip label="Fonts" value={counts.fonts} />
            <Chip label="Assets" value={counts.assets} />
            <Chip label="Notes" value={counts.notes} />
            {total === 0 && <span className="text-[9px]">empty</span>}
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
  return (
    <span className="rounded bg-muted px-1.5 py-0.5">
      {value} {label}
    </span>
  );
}

function IconAction({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="flex h-6 items-center gap-1 rounded px-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _icon = ArrowLeft; // ensure import kept for detail
