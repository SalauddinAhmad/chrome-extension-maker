import { MODULES_BY_ID, type ModuleId } from "@/lib/modules";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  moduleId: ModuleId;
}

/**
 * Placeholder rendered by every un-built module.
 * Business logic is intentionally omitted until each module's phase begins.
 */
export function ModulePlaceholder({ moduleId }: Props) {
  const meta = MODULES_BY_ID[moduleId];
  const Icon = meta.icon;

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-accent text-accent-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>{meta.name}</CardTitle>
            <CardDescription>{meta.tagline}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase">
              Phase {meta.phase}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase">
              {meta.status}
            </span>
          </div>
          <p>
            Architecture scaffolded. Types, storage schema, and UI shell are ready.
            Business logic will be built when this module's phase begins.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
