import { lazy, Suspense } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useTheme } from "@/hooks/use-theme";
import type { ModuleId } from "@/lib/modules";
import Dashboard from "@/modules/dashboard";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-load feature modules so the popup boots < 1 s.
const Color = lazy(() => import("@/modules/color-studio"));
const Typography = lazy(() => import("@/modules/typography-studio"));
const Inspector = lazy(() => import("@/modules/design-inspector"));
const Audit = lazy(() => import("@/modules/design-audit"));
const A11y = lazy(() => import("@/modules/accessibility"));
const Vault = lazy(() => import("@/modules/inspiration-vault"));
const Assets = lazy(() => import("@/modules/asset-extractor"));
const Resources = lazy(() => import("@/modules/resource-hub"));
const Notes = lazy(() => import("@/modules/notes"));
const Tech = lazy(() => import("@/modules/tech-stack"));
const Screenshot = lazy(() => import("@/modules/screenshot"));
const SettingsMod = lazy(() => import("@/modules/settings"));
const Projects = lazy(() => import("@/modules/projects"));

const REGISTRY: Record<ModuleId, React.ComponentType> = {
  dashboard: Dashboard,
  projects: Projects,
  "color-studio": Color,
  "typography-studio": Typography,
  "design-inspector": Inspector,
  "design-audit": Audit,
  accessibility: A11y,
  "inspiration-vault": Vault,
  "asset-extractor": Assets,
  "resource-hub": Resources,
  notes: Notes,
  "tech-stack": Tech,
  screenshot: Screenshot,
  settings: SettingsMod,
};

function ModuleSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <div className="grid grid-cols-3 gap-2 pt-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export function ActiveModule() {
  const id = useUIStore((s) => s.activeModule);
  useTheme();
  const Component = REGISTRY[id];
  return (
    <ErrorBoundary resetKey={id}>
      <Suspense fallback={<ModuleSkeleton />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}
