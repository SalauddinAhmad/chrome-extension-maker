import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
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
import { assetRepository } from "@/modules/asset-extractor/repository";
import { useLibraryStore } from "@/modules/asset-extractor/library-store";
import { colorRepository } from "@/modules/color-studio/repository";
import { useColorLibraryStore } from "@/modules/color-studio/library-store";
import { useColorStudioStore } from "@/modules/color-studio/store";
import { typographyRepository } from "@/modules/typography-studio/repository";
import { useTypographyLibraryStore } from "@/modules/typography-studio/library-store";
import { useTypeStore } from "@/modules/typography-studio/store";
import { designAuditRepository } from "@/modules/design-audit/repository";
import { ASSET_TYPE_LABEL, FONT_CATEGORY_LABEL } from "@/types";
import type { Project, Inspiration, Asset, AssetType, StoredFont, FontCategory, DesignAudit } from "@/types";

const QUICK_ACTIONS: Array<{ id: ModuleId; label: string; icon: typeof Palette }> = [
  { id: "color-studio", label: "Pick color", icon: Palette },
  { id: "typography-studio", label: "Scan fonts", icon: Type },
  { id: "screenshot", label: "Screenshot", icon: Camera },
  { id: "design-inspector", label: "Analyze site", icon: Search },
  { id: "asset-extractor", label: "Extract", icon: ImageIcon },
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

      {/* Recent + favorite inspirations */}
      <InspirationSummary onOpen={() => setActiveModule("inspiration-vault")} />

      {/* Recent + favorite inspirations */}
      <InspirationSummary onOpen={() => setActiveModule("inspiration-vault")} />

      {/* Asset library summary */}
      <AssetSummary onOpen={() => setActiveModule("asset-extractor")} />

      {/* Color library summary */}
      <ColorSummary onOpen={() => setActiveModule("color-studio")} />

      {/* Typography library summary */}
      <FontSummary onOpen={() => setActiveModule("typography-studio")} />

      {/* Design audits summary */}
      <AuditSummary onOpen={() => setActiveModule("design-audit")} />

      {/* Collections */}
      <CollectionStats onOpen={() => setActiveModule("inspiration-vault")} />
    </div>
  );
}

function InspirationSummary({ onOpen }: { onOpen: () => void }) {
  const setFilters = useVaultStore((s) => s.setFilters);
  const setTab = useVaultStore((s) => s.setTab);

  const recent = useLiveQuery(() => inspirationRepository.listRecent(4), [], []);
  const favorites = useLiveQuery(() => inspirationRepository.listFavorites(4), [], []);

  if (recent.length === 0 && favorites.length === 0) return null;

  const goFavorites = () => {
    setTab("vault");
    setFilters({ favoritesOnly: true });
    onOpen();
  };

  return (
    <div className="space-y-3">
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <SectionLabel icon={Bookmark}>Recent inspirations</SectionLabel>
            <OpenLink onClick={() => { setTab("vault"); onOpen(); }} />
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {recent.map((i) => <InspirationChip key={i.id} item={i} />)}
          </div>
        </div>
      )}
      {favorites.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <SectionLabel icon={Bookmark}>Favorites</SectionLabel>
            <OpenLink onClick={goFavorites} />
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {favorites.map((i) => <InspirationChip key={i.id} item={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function InspirationChip({ item }: { item: Inspiration }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 overflow-hidden rounded-md border bg-card p-1.5 text-left hover:border-primary/40"
    >
      {item.thumbnail ? (
        <img src={item.thumbnail} alt="" className="h-8 w-10 shrink-0 rounded object-cover" />
      ) : (
        <div className="h-8 w-10 shrink-0 rounded bg-muted" />
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[10px] font-medium">{item.title}</div>
        {item.collection && (
          <div className="truncate text-[9px] text-muted-foreground">
            {collectionLabel(item.collection)}
          </div>
        )}
      </div>
    </a>
  );
}

function CollectionStats({ onOpen }: { onOpen: () => void }) {
  const setFilters = useVaultStore((s) => s.setFilters);
  const setTab = useVaultStore((s) => s.setTab);
  const stats = useLiveQuery(() => inspirationRepository.collectionStats(), [], {} as Record<string, number>);

  const goCollection = (id: string) => {
    setTab("vault");
    setFilters({ collection: id });
    onOpen();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <SectionLabel icon={Bookmark}>Collections</SectionLabel>
        <OpenLink onClick={() => { setTab("vault"); onOpen(); }} />
      </div>
      <div className="mt-1.5 grid grid-cols-3 gap-1.5">
        {DEFAULT_COLLECTIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => goCollection(c.id)}
            className="rounded-md border bg-card px-2 py-2 text-left transition-colors hover:border-primary/40 hover:bg-accent/40"
          >
            <div className="text-[10px] font-medium">{c.name}</div>
            <div className="text-[9px] text-muted-foreground">{stats[c.id] ?? 0} saved</div>
          </button>
        ))}
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

function AssetSummary({ onOpen }: { onOpen: () => void }) {
  const setFilters = useLibraryStore((s) => s.setFilters);
  const recent = useLiveQuery(() => assetRepository.listRecent(4), [], []);
  const favorites = useLiveQuery(() => assetRepository.listFavorites(4), [], []);
  const typeStats = useLiveQuery(() => assetRepository.typeStats(), [], {} as Record<string, number>);

  if (recent.length === 0 && favorites.length === 0) return null;

  const topTypes = (Object.entries(typeStats) as Array<[AssetType, number]>)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const goFavorites = () => {
    setFilters({ favoritesOnly: true });
    onOpen();
  };
  const goType = (type: AssetType) => {
    setFilters({ type });
    onOpen();
  };

  return (
    <div className="space-y-3">
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <SectionLabel icon={ImageIcon}>Recent assets</SectionLabel>
            <OpenLink onClick={onOpen} />
          </div>
          <div className="mt-1.5 grid grid-cols-4 gap-1.5">
            {recent.map((a) => <AssetChip key={a.id} asset={a} />)}
          </div>
        </div>
      )}
      {favorites.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <SectionLabel icon={ImageIcon}>Favorite assets</SectionLabel>
            <OpenLink onClick={goFavorites} />
          </div>
          <div className="mt-1.5 grid grid-cols-4 gap-1.5">
            {favorites.map((a) => <AssetChip key={a.id} asset={a} />)}
          </div>
        </div>
      )}
      {topTypes.length > 0 && (
        <div>
          <SectionLabel icon={ImageIcon}>Asset statistics</SectionLabel>
          <div className="mt-1.5 grid grid-cols-4 gap-1.5">
            {topTypes.map(([type, n]) => (
              <button
                key={type}
                onClick={() => goType(type)}
                className="rounded-md border bg-card px-2 py-2 text-left hover:border-primary/40 hover:bg-accent/40"
              >
                <div className="text-sm font-semibold leading-tight">{n}</div>
                <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
                  {ASSET_TYPE_LABEL[type]}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AssetChip({ asset }: { asset: Asset }) {
  const openDetail = useLibraryStore((s) => s.openDetail);
  const setActiveModule = useUIStore((s) => s.setActiveModule);
  const previewable = asset.thumbnail || ["png","jpg","jpeg","webp","svg","gif"].includes(asset.type);
  return (
    <button
      onClick={() => { setActiveModule("asset-extractor"); openDetail(asset.id); }}
      className="group relative aspect-square overflow-hidden rounded-md border bg-muted/40 hover:border-primary/50"
      title={asset.name}
    >
      {previewable ? (
        <img src={asset.thumbnail ?? asset.url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center text-[9px] font-semibold uppercase text-muted-foreground">
          {ASSET_TYPE_LABEL[asset.type]}
        </div>
      )}
    </button>
  );
}

function ColorSummary({ onOpen }: { onOpen: () => void }) {
  const setColorTab = useColorStudioStore((s) => s.setTab);
  const setColorFilters = useColorLibraryStore((s) => s.setFilters);
  const recent = useLiveQuery(() => colorRepository.listRecent(8), [], []);
  const favorites = useLiveQuery(() => colorRepository.listFavorites(8), [], []);
  const sourceStats = useLiveQuery(() => colorRepository.sourceStats(), [], {} as Record<string, number>);
  const paletteCount = useLiveQuery(() => colorRepository.paletteCount(), [], 0);

  if (recent.length === 0 && favorites.length === 0) return null;

  const openLibrary = () => { setColorTab("library"); onOpen(); };
  const openFavorites = () => {
    setColorTab("library");
    setColorFilters({ favoritesOnly: true });
    onOpen();
  };
  const openBySource = (src: string) => {
    setColorTab("library");
    setColorFilters({ source: src as never });
    onOpen();
  };

  const topSources = Object.entries(sourceStats)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-3">
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <SectionLabel icon={Palette}>Recent colors</SectionLabel>
            <OpenLink onClick={openLibrary} />
          </div>
          <div className="mt-1.5 flex overflow-hidden rounded-md border">
            {recent.map((c) => (
              <button
                key={c.id}
                onClick={openLibrary}
                className="h-8 flex-1"
                style={{ background: c.hex }}
                title={c.name ?? c.hex}
              />
            ))}
          </div>
        </div>
      )}
      {favorites.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <SectionLabel icon={Palette}>Favorite colors</SectionLabel>
            <OpenLink onClick={openFavorites} />
          </div>
          <div className="mt-1.5 flex overflow-hidden rounded-md border">
            {favorites.map((c) => (
              <button
                key={c.id}
                onClick={openFavorites}
                className="h-8 flex-1"
                style={{ background: c.hex }}
                title={c.name ?? c.hex}
              />
            ))}
          </div>
        </div>
      )}
      {topSources.length > 0 && (
        <div>
          <SectionLabel icon={Palette}>Color statistics</SectionLabel>
          <div className="mt-1.5 grid grid-cols-4 gap-1.5">
            {topSources.map(([src, n]) => (
              <button
                key={src}
                onClick={() => openBySource(src)}
                className="rounded-md border bg-card px-2 py-2 text-left hover:border-primary/40 hover:bg-accent/40"
              >
                <div className="text-sm font-semibold leading-tight">{n}</div>
                <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
                  {src}
                </div>
              </button>
            ))}
            {paletteCount > 0 && (
              <button
                onClick={openLibrary}
                className="rounded-md border bg-card px-2 py-2 text-left hover:border-primary/40 hover:bg-accent/40"
              >
                <div className="text-sm font-semibold leading-tight">{paletteCount}</div>
                <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
                  Palettes
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FontSummary({ onOpen }: { onOpen: () => void }) {
  const setLibFilters = useTypographyLibraryStore((s) => s.setFilters);
  const setTypeTab = useTypeStore((s) => s.setTab);
  const recent = useLiveQuery(() => typographyRepository.listRecent(6), [], []);
  const favorites = useLiveQuery(() => typographyRepository.listFavorites(6), [], []);
  const catStats = useLiveQuery(() => typographyRepository.categoryStats(), [], {} as Record<string, number>);

  if (recent.length === 0 && favorites.length === 0) return null;

  const openLibrary = () => { setTypeTab("library"); onOpen(); };
  const openFavorites = () => {
    setTypeTab("library");
    setLibFilters({ favoritesOnly: true });
    onOpen();
  };
  const openByCat = (c: FontCategory) => {
    setTypeTab("library");
    setLibFilters({ category: c });
    onOpen();
  };

  const topCats = (Object.entries(catStats) as Array<[FontCategory, number]>)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-3">
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <SectionLabel icon={Type}>Recent fonts</SectionLabel>
            <OpenLink onClick={openLibrary} />
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {recent.map((f) => <FontChip key={f.id} font={f} onClick={openLibrary} />)}
          </div>
        </div>
      )}
      {favorites.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <SectionLabel icon={Type}>Favorite fonts</SectionLabel>
            <OpenLink onClick={openFavorites} />
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {favorites.map((f) => <FontChip key={f.id} font={f} onClick={openFavorites} />)}
          </div>
        </div>
      )}
      {topCats.length > 0 && (
        <div>
          <SectionLabel icon={Type}>Typography statistics</SectionLabel>
          <div className="mt-1.5 grid grid-cols-4 gap-1.5">
            {topCats.map(([cat, n]) => (
              <button
                key={cat}
                onClick={() => openByCat(cat)}
                className="rounded-md border bg-card px-2 py-2 text-left hover:border-primary/40 hover:bg-accent/40"
              >
                <div className="text-sm font-semibold leading-tight">{n}</div>
                <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
                  {FONT_CATEGORY_LABEL[cat]}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FontChip({ font, onClick }: { font: StoredFont; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 overflow-hidden rounded-md border bg-card p-2 text-left hover:border-primary/40"
      title={font.family}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] leading-tight" style={{ fontFamily: `"${font.family}", sans-serif` }}>
          {font.family}
        </div>
        {font.category && (
          <div className="truncate text-[9px] text-muted-foreground">
            {FONT_CATEGORY_LABEL[font.category]}
          </div>
        )}
      </div>
    </button>
  );
}


function AuditSummary({ onOpen }: { onOpen: () => void }) {
  const [recent, setRecent] = useState<DesignAudit[]>([]);
  const [stats, setStats] = useState<{
    total: number; averageScore: number; bestScore: number; worstScore: number;
    gradeCounts: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [r, s] = await Promise.all([
        designAuditRepository.listRecent(4),
        designAuditRepository.statistics(),
      ]);
      if (!alive) return;
      setRecent(r);
      setStats(s);
    })().catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!stats || stats.total === 0) return null;

  return (
    <section className="rounded-xl border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="text-xs font-semibold">Design Audits</div>
          <div className="text-[10px] text-muted-foreground">avg {stats.averageScore}</div>
        </div>
        <button onClick={onOpen} className="text-[10px] text-muted-foreground hover:text-foreground">
          Open →
        </button>
      </div>

      <div className="mb-2 grid grid-cols-4 gap-1.5">
        <StatChip label="Total" value={stats.total} />
        <StatChip label="Avg" value={stats.averageScore} />
        <StatChip label="Best" value={stats.bestScore} />
        <StatChip label="Worst" value={stats.worstScore} />
      </div>

      <div className="space-y-1">
        {recent.map((a) => (
          <button
            key={a.id}
            onClick={onOpen}
            className="flex w-full items-center gap-2 rounded border bg-background/50 px-2 py-1.5 text-left hover:bg-muted"
          >
            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-bold tabular-nums">
              {a.overall}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs">{a.title}</div>
              <div className="truncate text-[10px] text-muted-foreground">{a.url}</div>
            </div>
            <div className="shrink-0 text-[10px] font-semibold text-muted-foreground">{a.grade}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background/50 p-1.5 text-center">
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
