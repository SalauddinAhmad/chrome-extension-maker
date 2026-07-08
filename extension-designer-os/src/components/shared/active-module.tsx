import { lazy, Suspense } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useTheme } from "@/hooks/use-theme";
import type { ModuleId } from "@/lib/modules";
import { Dashboard } from "@/modules/dashboard";

// Lazy-load feature modules so the popup boots < 1 s.
const Color = lazy(() => import("@/modules/color-studio"));
const Typography = lazy(() => import("@/modules/typography-studio"));
const Inspector = lazy(() => import("@/modules/design-inspector"));
const Vault = lazy(() => import("@/modules/inspiration-vault"));
const Assets = lazy(() => import("@/modules/asset-extractor"));
const Resources = lazy(() => import("@/modules/resource-hub"));
const Notes = lazy(() => import("@/modules/notes"));
const Tech = lazy(() => import("@/modules/tech-stack"));
const Screenshot = lazy(() => import("@/modules/screenshot"));

const REGISTRY: Record<ModuleId, React.ComponentType> = {
  dashboard: Dashboard,
  "color-studio": Color,
  "typography-studio": Typography,
  "design-inspector": Inspector,
  "inspiration-vault": Vault,
  "asset-extractor": Assets,
  "resource-hub": Resources,
  notes: Notes,
  "tech-stack": Tech,
  screenshot: Screenshot,
};

export function ActiveModule() {
  const id = useUIStore((s) => s.activeModule);
  useTheme();
  const Component = REGISTRY[id];
  return (
    <Suspense fallback={<div className="p-4 text-xs text-muted-foreground">Loading…</div>}>
      <Component />
    </Suspense>
  );
}
