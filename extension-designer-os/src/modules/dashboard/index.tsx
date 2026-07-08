import { MODULES } from "@/lib/modules";
import { useUIStore } from "@/stores/ui-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";

/**
 * Dashboard — Phase 1 scaffold.
 * Home screen shell only. Recent Colors/Fonts/Assets/Inspirations wiring
 * happens when their owning modules ship (Phase 2+).
 */
export function Dashboard() {
  const setActiveModule = useUIStore((s) => s.setActiveModule);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Welcome back</h1>
        <p className="text-xs text-muted-foreground">
          Everything a designer needs — right in your browser.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {MODULES.filter((m) => m.id !== "dashboard").map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={cn(
                "group rounded-lg border bg-card p-3 text-left transition-colors",
                "hover:border-primary/40 hover:bg-accent/40",
              )}
            >
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs font-semibold">{m.name}</div>
              </div>
              <div className="mt-1 truncate text-[10px] text-muted-foreground">{m.tagline}</div>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storage · local only</CardTitle>
          <CardDescription>
            All data lives in IndexedDB on this device. No accounts. No sync. No tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-[11px] text-muted-foreground">
          Collections: colors · palettes · fonts · inspirations · assets · notes · projects.
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
