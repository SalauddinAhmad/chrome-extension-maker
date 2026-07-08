import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Command, Search, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { Input } from "@/components/ui/input";
import { MODULES, MODULE_GROUPS, type ModuleGroup } from "@/lib/modules";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import { db } from "@/storage";
import { cn } from "@/lib/cn";

interface AppShellProps {
  children: ReactNode;
  variant: "popup" | "sidepanel";
}

/**
 * Grouped-nav app shell used by both popup and side panel.
 * Popup: fixed 400x600 with collapsible sidebar (default collapsed → icon rail).
 * Sidepanel: full-height, sidebar always expanded.
 */
export function AppShell({ children, variant }: AppShellProps) {
  const { activeModule, setActiveModule, setCommandOpen } = useUIStore();
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const openProjectDetail = useProjectStore((s) => s.openProjectDetail);
  const [collapsed, setCollapsed] = useState(variant === "popup");

  const activeProject = useLiveQuery(
    () => (activeProjectId ? db.projects.get(activeProjectId) : Promise.resolve(undefined)),
    [activeProjectId],
    undefined,
  );

  const isPopup = variant === "popup";
  const containerCls = isPopup
    ? "relative flex h-[600px] w-[400px] bg-background text-foreground"
    : "relative flex h-screen w-full bg-background text-foreground";

  const sidebarWidth = collapsed ? "w-[52px]" : isPopup ? "w-[164px]" : "w-[220px]";

  return (
    <div className={containerCls}>
      <aside className={cn("flex shrink-0 flex-col border-r bg-card/40 transition-[width] duration-200", sidebarWidth)}>
        <div className="flex h-11 items-center gap-2 border-b px-2.5">
          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <Command className="h-3 w-3" />
          </div>
          {!collapsed && (
            <div className="flex-1 truncate text-[12px] font-semibold tracking-tight">Designer OS</div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-1">
          {MODULE_GROUPS.map((group) => {
            const mods = MODULES.filter((m) => m.group === group.id);
            if (mods.length === 0) return null;
            return (
              <div key={group.id} className="mb-1">
                {!collapsed && (
                  <div className="px-2.5 pb-0.5 pt-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </div>
                )}
                {mods.map((m) => {
                  const Icon = m.icon;
                  const active = activeModule === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setActiveModule(m.id);
                        if (m.id !== "projects") openProjectDetail(null);
                      }}
                      title={collapsed ? m.name : undefined}
                      className={cn(
                        "mx-1 flex w-[calc(100%-8px)] items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {!collapsed && <span className="flex-1 truncate text-left">{m.name}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="border-t px-2.5 py-2 text-[9px] text-muted-foreground">
            v1.0 · offline · local
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-11 items-center gap-2 border-b px-3">
          <ActiveModuleCrumb />
          <div className="ml-auto flex items-center gap-1.5">
            {activeProject && (
              <ActiveProjectPill
                name={activeProject.name}
                color={activeProject.color}
                onClick={() => { setActiveModule("projects"); openProjectDetail(activeProject.id); }}
              />
            )}
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground"
              title="Command palette"
            >
              <Search className="h-3 w-3" />
              <span>Search…</span>
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[9px]">⌘K</kbd>
            </button>
          </div>
        </header>

        <motion.main
          key={activeModule}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.14 }}
          className="flex-1 overflow-y-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

function ActiveModuleCrumb() {
  const activeModule = useUIStore((s) => s.activeModule);
  const mod = MODULES.find((m) => m.id === activeModule);
  if (!mod) return null;
  const group = MODULE_GROUPS.find((g) => g.id === mod.group);
  return (
    <div className="flex min-w-0 items-center gap-1 text-[11px]">
      <span className="text-muted-foreground">{group?.label}</span>
      <ChevronRight className="h-3 w-3 text-muted-foreground" />
      <span className="truncate font-medium">{mod.name}</span>
    </div>
  );
}

function ActiveProjectPill({ name, color, onClick }: { name: string; color?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-[10px] hover:bg-muted"
      title={`Active project: ${name}`}
    >
      <span
        className="h-2.5 w-2.5 rounded-full border"
        style={{ background: color ?? "hsl(var(--muted))" }}
      />
      <span className="max-w-[100px] truncate font-medium">{name}</span>
    </button>
  );
}

// keep old Input import used somewhere via barrel? no, silence
void Input;

// keep ModuleGroup type used to enforce grouping
export type { ModuleGroup };
