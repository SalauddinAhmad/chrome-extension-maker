import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Bookmark,
  Camera,
  Cpu,
  Image as ImageIcon,
  LayoutDashboard,
  Layers,
  Palette,
  Search,
  Settings as SettingsIcon,
  StickyNote,
  Type,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/storage";
import { MODULES, type ModuleId } from "@/lib/modules";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/cn";

interface Action {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  keywords?: string;
  perform: () => void;
}

const MODULE_ICON: Record<ModuleId, LucideIcon> = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  "color-studio": Palette,
  "typography-studio": Type,
  "inspiration-vault": Bookmark,
  notes: StickyNote,
  "asset-extractor": ImageIcon,
  screenshot: Camera,
  "design-inspector": Search,
  "tech-stack": Cpu,
  "resource-hub": Layers,
  settings: SettingsIcon,
};

export function CommandPalette() {
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const setActiveModule = useUIStore((s) => s.setActiveModule);
  const [search, setSearch] = useState("");

  // Global ⌘K / Ctrl+K toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const close = () => setOpen(false);
  const run = (fn: () => void) => {
    fn();
    close();
  };

  // Live data (only when palette is open to keep it cheap)
  const colors = useLiveQuery(
    () => (open ? db.colors.orderBy("createdAt").reverse().limit(20).toArray() : Promise.resolve([])),
    [open],
    [],
  );
  const fonts = useLiveQuery(
    () => (open ? db.fonts.orderBy("createdAt").reverse().limit(20).toArray() : Promise.resolve([])),
    [open],
    [],
  );
  const inspirations = useLiveQuery(
    () => (open ? db.inspirations.orderBy("createdAt").reverse().limit(30).toArray() : Promise.resolve([])),
    [open],
    [],
  );
  const notes = useLiveQuery(
    () => (open ? db.notes.orderBy("updatedAt").reverse().limit(30).toArray() : Promise.resolve([])),
    [open],
    [],
  );

  const navActions = useMemo<Action[]>(
    () =>
      MODULES.map((m) => ({
        id: `nav:${m.id}`,
        label: m.name,
        hint: m.tagline,
        icon: MODULE_ICON[m.id],
        keywords: `${m.name} ${m.tagline} ${m.id}`,
        perform: () => setActiveModule(m.id),
      })),
    [setActiveModule],
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[380px] -translate-x-1/2 -translate-y-1/2",
            "overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-2xl",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          )}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search modules, saved colors, fonts, inspirations, and notes.
          </Dialog.Description>

          <Command
            loop
            filter={(value, search, keywords) => {
              const hay = `${value} ${keywords ?? ""}`.toLowerCase();
              return hay.includes(search.toLowerCase()) ? 1 : 0;
            }}
          >
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Jump to module, search saved…"
                className="flex h-10 w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                esc
              </kbd>
            </div>

            <Command.List className="max-h-[360px] overflow-y-auto p-1">
              <Command.Empty className="py-6 text-center text-[11px] text-muted-foreground">
                No matches.
              </Command.Empty>

              <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground">
                {navActions.map((a) => (
                  <Item key={a.id} action={a} onRun={run} />
                ))}
              </Command.Group>

              {colors.length > 0 && (
                <Command.Group heading="Colors" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground">
                  {colors.map((c) => (
                    <Command.Item
                      key={c.id}
                      value={`color-${c.hex}-${c.name ?? ""}`}
                      keywords={[c.hex, c.name ?? ""].join(" ")}
                      onSelect={() =>
                        run(() => navigator.clipboard.writeText(c.hex))
                      }
                      className={itemCls}
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded border"
                        style={{ background: c.hex }}
                      />
                      <span className="flex-1 truncate">{c.name ?? "Color"}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {c.hex}
                      </span>
                      <span className="text-[9px] text-muted-foreground/70">copy</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {fonts.length > 0 && (
                <Command.Group heading="Fonts" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground">
                  {fonts.map((f) => (
                    <Command.Item
                      key={f.id}
                      value={`font-${f.family}`}
                      keywords={f.family}
                      onSelect={() =>
                        run(() => navigator.clipboard.writeText(f.family))
                      }
                      className={itemCls}
                    >
                      <Type className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span
                        className="flex-1 truncate"
                        style={{ fontFamily: `"${f.family}", sans-serif` }}
                      >
                        {f.family}
                      </span>
                      <span className="text-[9px] text-muted-foreground/70">copy</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {inspirations.length > 0 && (
                <Command.Group heading="Inspiration" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground">
                  {inspirations.map((i) => (
                    <Command.Item
                      key={i.id}
                      value={`insp-${i.id}`}
                      keywords={`${i.title} ${i.url} ${i.tags.join(" ")}`}
                      onSelect={() =>
                        run(() => window.open(i.url, "_blank", "noreferrer"))
                      }
                      className={itemCls}
                    >
                      <Bookmark className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{i.title}</span>
                      <span className="text-[9px] text-muted-foreground/70">open</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {notes.length > 0 && (
                <Command.Group heading="Notes" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground">
                  {notes.map((n) => (
                    <Command.Item
                      key={n.id}
                      value={`note-${n.id}`}
                      keywords={`${n.title} ${n.body} ${n.tags.join(" ")}`}
                      onSelect={() => run(() => setActiveModule("notes"))}
                      className={itemCls}
                    >
                      <StickyNote className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">
                        {n.title || "Untitled"}
                      </span>
                      <span className="text-[9px] text-muted-foreground/70">edit</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>

            <div className="flex items-center justify-between border-t px-3 py-1.5 text-[9px] text-muted-foreground">
              <span>Designer OS</span>
              <div className="flex items-center gap-2">
                <span>
                  <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↑↓</kbd> navigate
                </span>
                <span>
                  <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↵</kbd> select
                </span>
              </div>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const itemCls =
  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground";

function Item({ action, onRun }: { action: Action; onRun: (fn: () => void) => void }) {
  const Icon = action.icon;
  return (
    <Command.Item
      value={action.id}
      keywords={action.keywords}
      onSelect={() => onRun(action.perform)}
      className={itemCls}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate">{action.label}</span>
      {action.hint && (
        <span className="truncate text-[10px] text-muted-foreground">
          {action.hint}
        </span>
      )}
    </Command.Item>
  );
}
