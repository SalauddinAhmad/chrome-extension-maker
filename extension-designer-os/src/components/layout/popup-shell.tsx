import { motion } from "framer-motion";
import { Search, Settings, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MODULES } from "@/lib/modules";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface PopupShellProps {
  children: ReactNode;
}

/**
 * Popup shell — 400 px wide, single column, module grid + slot for active view.
 * Header · search · module tiles · active module content.
 */
export function PopupShell({ children }: PopupShellProps) {
  const { activeModule, setActiveModule, query, setQuery } = useUIStore();

  return (
    <div className="flex h-[600px] w-[400px] flex-col bg-background text-foreground">
      {/* header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Command className="h-3.5 w-3.5" />
          </div>
          <div className="text-sm font-semibold tracking-tight">Designer OS</div>
        </div>
        <Button size="icon" variant="ghost" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </header>

      {/* search */}
      <div className="border-b p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="pl-8 pr-14 text-xs"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* module tiles */}
      <nav className="grid grid-cols-5 gap-1 border-b p-2">
        {MODULES.slice(0, 10).map((m) => {
          const Icon = m.icon;
          const active = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              title={m.name}
              className={cn(
                "group flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="w-full truncate">{m.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* active module */}
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
