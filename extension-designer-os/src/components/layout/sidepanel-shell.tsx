import { Command, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { MODULES } from "@/lib/modules";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface SidepanelShellProps {
  children: ReactNode;
}

/**
 * Side panel shell — 320 px nav rail (icons + labels) + fluid content area.
 * Two-column layout, always visible in Chrome side panel.
 */
export function SidepanelShell({ children }: SidepanelShellProps) {
  const { activeModule, setActiveModule, query, setQuery } = useUIStore();

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* nav rail */}
      <aside className="flex w-[240px] shrink-0 flex-col border-r">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Command className="h-3.5 w-3.5" />
          </div>
          <div className="text-sm font-semibold tracking-tight">Designer OS</div>
        </div>

        <div className="border-b p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="pl-8 text-xs"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {MODULES.map((m) => {
            const Icon = m.icon;
            const active = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 truncate">{m.name}</span>
                <span className="text-[9px] font-mono uppercase text-muted-foreground/60">
                  P{m.phase}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="border-t px-4 py-2 text-[10px] text-muted-foreground">
          v1.0.0 · offline · local only
        </div>
      </aside>

      {/* content */}
      <motion.main
        key={activeModule}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        className="flex-1 overflow-y-auto"
      >
        {children}
      </motion.main>
    </div>
  );
}
