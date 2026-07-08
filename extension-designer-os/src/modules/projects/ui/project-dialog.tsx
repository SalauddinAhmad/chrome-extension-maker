import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { ImagePlus, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProjectStore, DuplicateProjectNameError } from "@/stores/project-store";
import { cn } from "@/lib/cn";
import {
  projectFormSchema,
  validateCoverImageFile,
  type ProjectFormValues,
} from "../logic/validation";

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

type FieldErrors = Partial<Record<keyof ProjectFormValues | "cover", string>>;

export function ProjectDialog({ open, onOpenChange, projectId }: Props) {
  const getProject = useProjectStore((s) => s.getProject);
  const createProject = useProjectStore((s) => s.createProject);
  const updateProject = useProjectStore((s) => s.updateProject);

  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [coverImage, setCoverImage] = useState<string | undefined>();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (projectId) {
      getProject(projectId)
        .then((p) => {
          if (!p) return;
          setName(p.name);
          setClientName(p.clientName ?? "");
          setDescription(p.description ?? "");
          setColor(p.color ?? PALETTE[0]);
          setCoverImage(p.coverImage);
        })
        .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load project"));
    } else {
      setName("");
      setClientName("");
      setDescription("");
      setColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      setCoverImage(undefined);
    }
  }, [open, projectId, getProject]);

  function pickCover() {
    fileRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const err = validateCoverImageFile(file);
    if (err) {
      setErrors((prev) => ({ ...prev, cover: err.message }));
      toast.error(err.message);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => {
      const msg = "Could not read image file";
      setErrors((prev) => ({ ...prev, cover: msg }));
      toast.error(msg);
    };
    reader.onload = () => {
      setCoverImage(reader.result as string);
      setErrors((prev) => ({ ...prev, cover: undefined }));
    };
    reader.readAsDataURL(file);
  }

  async function submit() {
    const values: ProjectFormValues = {
      name,
      clientName: clientName || undefined,
      description: description || undefined,
      color,
      coverImage,
    };

    const parsed = projectFormSchema.safeParse(values);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ProjectFormValues | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        name: parsed.data.name,
        clientName: parsed.data.clientName,
        description: parsed.data.description,
        color: parsed.data.color,
        coverImage: parsed.data.coverImage,
      };
      if (projectId) {
        await updateProject(projectId, payload);
        toast.success("Project updated");
      } else {
        await createProject(payload);
        toast.success("Project created");
      }
      onOpenChange(false);
    } catch (err) {
      if (err instanceof DuplicateProjectNameError) {
        setErrors({ name: err.message });
        return;
      }
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
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
            <FieldGroup label="Cover" error={errors.cover}>
              {coverImage ? (
                <div className="relative overflow-hidden rounded-md border">
                  <img src={coverImage} alt="" className="h-20 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImage(undefined)}
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-foreground shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={pickCover}
                  className="flex h-16 w-full items-center justify-center gap-1.5 rounded-md border border-dashed text-[10px] text-muted-foreground hover:bg-muted/40"
                >
                  <ImagePlus className="h-3.5 w-3.5" /> Add cover image (max 2MB)
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
            </FieldGroup>

            <FieldGroup label="Name" required error={errors.name}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rooh School"
                className={cn("mt-1 text-xs", errors.name && "border-destructive")}
                autoFocus
                maxLength={80}
              />
              <div className="mt-0.5 text-[9px] text-muted-foreground">{name.length}/60</div>
            </FieldGroup>

            <FieldGroup label="Client" error={errors.clientName}>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Optional"
                className={cn("mt-1 text-xs", errors.clientName && "border-destructive")}
                maxLength={120}
              />
            </FieldGroup>

            <FieldGroup label="Description" error={errors.description}>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short brief or note"
                className={cn("mt-1 min-h-[60px] text-xs", errors.description && "border-destructive")}
                maxLength={520}
              />
              <div className="mt-0.5 text-[9px] text-muted-foreground">{description.length}/500</div>
            </FieldGroup>

            <FieldGroup label="Accent">
              <div className="mt-1 flex flex-wrap gap-1.5">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
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
            </FieldGroup>
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

function FieldGroup({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children}
      {error && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
}
