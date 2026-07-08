import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { projectsRepo, db } from "@/storage";
import { cn } from "@/lib/cn";

const PALETTE = [
  "#6366F1", "#8B5CF6", "#EC4899", "#EF4444",
  "#F97316", "#F59E0B", "#10B981", "#14B8A6",
  "#0EA5E9", "#3B82F6", "#64748B", "#111827",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
}

export function ProjectDialog({ open, onOpenChange, projectId }: Props) {
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (projectId) {
      db.projects.get(projectId).then((p) => {
        if (!p) return;
        setName(p.name);
        setClientName(p.clientName ?? "");
        setDescription(p.description ?? "");
        setColor(p.color ?? PALETTE[0]);
      });
    } else {
      setName("");
      setClientName("");
      setDescription("");
      setColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
    }
  }, [open, projectId]);

  async function submit() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (projectId) {
        await projectsRepo.update(projectId, {
          name: name.trim(),
          clientName: clientName.trim() || undefined,
          description: description.trim() || undefined,
          color,
        });
        toast.success("Project updated");
      } else {
        await projectsRepo.create({
          name: name.trim(),
          clientName: clientName.trim() || undefined,
          description: description.trim() || undefined,
          color,
          archived: false,
        });
        toast.success("Project created");
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-popover p-4 text-popover-foreground shadow-2xl">
          <Dialog.Title className="text-sm font-semibold">
            {projectId ? "Edit project" : "New project"}
          </Dialog.Title>
          <Dialog.Description className="mb-3 text-[10px] text-muted-foreground">
            Group your work by client, brief, or theme.
          </Dialog.Description>

          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rooh School"
                className="mt-1 text-xs"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Client
              </label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Optional"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short brief or note"
                className="mt-1 min-h-[60px] text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Accent
              </label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-6 w-6 rounded-md border transition-transform",
                      color === c && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                    )}
                    style={{ background: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit} disabled={saving}>
              {saving ? "Saving…" : projectId ? "Save" : "Create"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
