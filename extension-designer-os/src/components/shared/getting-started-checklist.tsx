/**
 * Getting Started checklist — derives progress live from repository counts so
 * completion is always accurate. The user's only persisted state is whether
 * they dismissed the card (see settings.checklistDismissed).
 */
import { useLiveQuery } from "dexie-react-hooks";
import { Check, ChevronRight, Sparkles, X } from "lucide-react";
import { CHECKLIST_STEPS, type ChecklistStep } from "@/types";
import type { ModuleId } from "@/lib/modules";
import { projectRepository } from "@/modules/projects/repository";
import { inspirationRepository } from "@/modules/inspiration-vault/repository";
import { assetRepository } from "@/modules/asset-extractor/repository";
import { colorRepository } from "@/modules/color-studio/repository";
import { typographyRepository } from "@/modules/typography-studio/repository";
import { designInspectorRepository } from "@/modules/design-inspector/repository";
import { designAuditRepository } from "@/modules/design-audit/repository";
import { useProjectStore } from "@/stores/project-store";
import { useUIStore } from "@/stores/ui-store";
import { updateSettings } from "@/storage";
import { cn } from "@/lib/cn";

interface StepConfig {
  id: ChecklistStep;
  label: string;
  module: ModuleId;
  action?: () => void;
}

export function GettingStartedChecklist({ dismissed }: { dismissed: boolean }) {
  const setActiveModule = useUIStore((s) => s.setActiveModule);
  const requestNewProject = useProjectStore((s) => s.requestNewProject);

  const projectCount = useLiveQuery(() => projectRepository.countActive(), [], 0);
  const inspirationCount = useLiveQuery(
    () => inspirationRepository.getAll().then((r) => r.length),
    [],
    0,
  );
  const assetCount = useLiveQuery(
    () => assetRepository.getAll().then((r) => r.length),
    [],
    0,
  );
  const colorCount = useLiveQuery(
    () => colorRepository.getAll().then((r) => r.length),
    [],
    0,
  );
  const fontCount = useLiveQuery(
    () => typographyRepository.getAll().then((r) => r.length),
    [],
    0,
  );
  const reportCount = useLiveQuery(
    () => designInspectorRepository.listRecent(1).then((r) => r.length),
    [],
    0,
  );
  const auditCount = useLiveQuery(
    () => designAuditRepository.listRecent(1).then((r) => r.length),
    [],
    0,
  );

  const status: Record<ChecklistStep, boolean> = {
    "create-project": projectCount > 0,
    "save-inspiration": inspirationCount > 0,
    "save-asset": assetCount > 0,
    "save-color": colorCount > 0,
    "save-font": fontCount > 0,
    "run-inspection": reportCount > 0,
    "run-audit": auditCount > 0,
  };

  const done = CHECKLIST_STEPS.filter((s) => status[s]).length;
  const total = CHECKLIST_STEPS.length;
  const percent = Math.round((done / total) * 100);
  const allDone = done === total;

  if (dismissed || allDone) return null;

  const steps: StepConfig[] = [
    {
      id: "create-project",
      label: "Create your first project",
      module: "projects",
      action: () => {
        setActiveModule("projects");
        requestNewProject();
      },
    },
    { id: "save-inspiration", label: "Save an inspiration", module: "inspiration-vault" },
    { id: "save-asset", label: "Capture an asset", module: "asset-extractor" },
    { id: "save-color", label: "Save a color", module: "color-studio" },
    { id: "save-font", label: "Save a font", module: "typography-studio" },
    { id: "run-inspection", label: "Inspect a website", module: "design-inspector" },
    { id: "run-audit", label: "Run a design audit", module: "design-audit" },
  ];

  const nextStep = steps.find((s) => !status[s.id]);

  return (
    <section
      aria-labelledby="checklist-heading"
      className="rounded-lg border bg-gradient-to-br from-primary/5 via-card to-card p-3"
    >
      <header className="flex items-center gap-2">
        <div className="grid h-6 w-6 place-items-center rounded-md bg-primary/15 text-primary">
          <Sparkles className="h-3 w-3" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="checklist-heading" className="text-xs font-semibold leading-tight">
            Getting Started
          </h2>
          <div className="text-[10px] text-muted-foreground">
            {done} of {total} complete
          </div>
        </div>
        <button
          onClick={() => void updateSettings({ checklistDismissed: true })}
          aria-label="Dismiss Getting Started checklist"
          className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </header>

      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Checklist ${percent}% complete`}
        className="mt-2 h-1 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="mt-2.5 space-y-1">
        {steps.map((s) => {
          const complete = status[s.id];
          const isNext = !complete && s.id === nextStep?.id;
          return (
            <li key={s.id}>
              <button
                onClick={() => (s.action ? s.action() : setActiveModule(s.module))}
                aria-label={`${complete ? "Completed" : "Go to"}: ${s.label}`}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-[11px] transition-colors",
                  complete
                    ? "border-transparent bg-transparent text-muted-foreground line-through decoration-1"
                    : isNext
                      ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
                      : "border-border bg-card hover:bg-muted/40",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                    complete
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40 text-transparent",
                  )}
                >
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span className="flex-1 truncate">{s.label}</span>
                {!complete && (
                  <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
