import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Trash2, Star, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/storage";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useProjectStore } from "@/stores/project-store";
import { useTypographyLibraryStore } from "../library-store";
import {
  defaultStyles,
  makeStyle,
  exportSystemCss,
  exportSystemScss,
  exportSystemJson,
  exportSystemTailwind,
} from "../logic/system";
import type { TypographyStyle, TypographySystem } from "@/types";

type ExportFmt = "css" | "scss" | "json" | "tailwind";

export function SystemBuilder() {
  const projectId = useProjectStore((s) => s.activeProjectId) ?? undefined;
  const systems = useLiveQuery(() => db.typographySystems.orderBy("createdAt").reverse().toArray(), [], []);
  const fonts = useLiveQuery(() => db.fonts.orderBy("createdAt").toArray(), [], []);

  const createSystem = useTypographyLibraryStore((s) => s.createSystem);
  const updateSystem = useTypographyLibraryStore((s) => s.updateSystem);
  const deleteSystem = useTypographyLibraryStore((s) => s.deleteSystem);
  const toggleFav = useTypographyLibraryStore((s) => s.toggleSystemFavorite);

  const [name, setName] = useState("New System");
  const [heading, setHeading] = useState("Inter");
  const [body, setBody] = useState("Inter");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [fmt, setFmt] = useState<ExportFmt>("css");

  const active = systems.find((s) => s.id === activeId) ?? null;

  async function handleCreate() {
    const trimmed = name.trim();
    if (trimmed.length < 2) return toast.error("Name required");
    const sys = await createSystem({
      name: trimmed,
      projectId,
      styles: defaultStyles(heading, body),
    });
    if (sys) setActiveId(sys.id);
  }

  function patchStyle(sys: TypographySystem, styleId: string, patch: Partial<TypographyStyle>) {
    const styles = sys.styles.map((st) => (st.id === styleId ? { ...st, ...patch } : st));
    void updateSystem(sys.id, { styles });
  }

  function addStyle(sys: TypographySystem) {
    void updateSystem(sys.id, { styles: [...sys.styles, makeStyle(`Style ${sys.styles.length + 1}`, body)] });
  }

  function removeStyle(sys: TypographySystem, styleId: string) {
    void updateSystem(sys.id, { styles: sys.styles.filter((st) => st.id !== styleId) });
  }

  function exportSystem(sys: TypographySystem) {
    const map: Record<ExportFmt, () => string> = {
      css: () => exportSystemCss(sys),
      scss: () => exportSystemScss(sys),
      json: () => exportSystemJson(sys),
      tailwind: () => exportSystemTailwind(sys),
    };
    const out = map[fmt]();
    navigator.clipboard.writeText(out);
    toast.success(`Copied ${fmt.toUpperCase()}`);
  }

  function downloadSystem(sys: TypographySystem) {
    const map: Record<ExportFmt, [() => string, string]> = {
      css: [() => exportSystemCss(sys), "text/css"],
      scss: [() => exportSystemScss(sys), "text/x-scss"],
      json: [() => exportSystemJson(sys), "application/json"],
      tailwind: [() => exportSystemTailwind(sys), "text/javascript"],
    };
    const [fn, mime] = map[fmt];
    const blob = new Blob([fn()], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${sys.name}.${fmt === "tailwind" ? "js" : fmt}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const familyOptions = Array.from(new Set(fonts.map((f) => f.family)));

  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-card p-2 space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">New system</div>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="System name" className="h-7 text-xs" />
        <div className="grid grid-cols-2 gap-2">
          <FamilySelect label="Heading" value={heading} onChange={setHeading} options={familyOptions} />
          <FamilySelect label="Body" value={body} onChange={setBody} options={familyOptions} />
        </div>
        <button
          onClick={() => void handleCreate()}
          className="flex w-full items-center justify-center gap-1 rounded-md bg-primary px-2 py-1.5 text-[11px] font-medium text-primary-foreground"
        >
          <Plus className="h-3 w-3" /> Create system
        </button>
      </div>

      {systems.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Systems</div>
          {systems.map((sys) => (
            <div key={sys.id} className={cn("rounded-md border bg-card", activeId === sys.id && "border-primary/50")}>
              <button
                onClick={() => setActiveId(activeId === sys.id ? null : sys.id)}
                className="flex w-full items-center gap-2 p-2 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{sys.name}</div>
                  <div className="text-[9px] text-muted-foreground">{sys.styles.length} styles</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); void toggleFav(sys.id); }} className={cn("rounded p-1", sys.favorite && "text-yellow-500")}>
                  <Star className={cn("h-3 w-3", sys.favorite && "fill-current")} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); void deleteSystem(sys.id); }} className="rounded p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              </button>

              {active?.id === sys.id && (
                <div className="space-y-2 border-t p-2">
                  {sys.styles.map((st) => (
                    <StyleRow
                      key={st.id}
                      style={st}
                      familyOptions={familyOptions}
                      onChange={(patch) => patchStyle(sys, st.id, patch)}
                      onRemove={() => removeStyle(sys, st.id)}
                    />
                  ))}
                  <button
                    onClick={() => addStyle(sys)}
                    className="flex w-full items-center justify-center gap-1 rounded border border-dashed py-1 text-[10px] text-muted-foreground hover:bg-accent"
                  >
                    <Plus className="h-3 w-3" /> Add style
                  </button>

                  <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-1">
                    {(["css","scss","json","tailwind"] as ExportFmt[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFmt(f)}
                        className={cn(
                          "flex-1 rounded px-1 py-1 text-[9px] font-medium uppercase",
                          fmt === f ? "bg-background shadow-sm" : "text-muted-foreground",
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => exportSystem(sys)} className="flex flex-1 items-center justify-center gap-1 rounded border bg-background py-1 text-[10px] hover:bg-muted">
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                    <button onClick={() => downloadSystem(sys)} className="flex flex-1 items-center justify-center gap-1 rounded border bg-background py-1 text-[10px] hover:bg-muted">
                      <Download className="h-3 w-3" /> Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FamilySelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="space-y-1">
      <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        list={`fams-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full rounded-md border bg-background px-2 text-xs"
      />
      <datalist id={`fams-${label}`}>
        {options.map((o) => <option key={o} value={o} />)}
      </datalist>
    </label>
  );
}

function StyleRow({
  style,
  familyOptions,
  onChange,
  onRemove,
}: {
  style: TypographyStyle;
  familyOptions: string[];
  onChange: (patch: Partial<TypographyStyle>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded border bg-background p-2">
      <div className="flex items-center gap-1">
        <Input value={style.name} onChange={(e) => onChange({ name: e.target.value })} className="h-7 flex-1 text-xs" />
        <button onClick={onRemove} className="rounded p-1 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <p
        className="my-1.5 truncate text-muted-foreground"
        style={{
          fontFamily: `"${style.fontFamily}", sans-serif`,
          fontWeight: style.fontWeight,
          fontSize: Math.min(style.fontSize, 32),
          lineHeight: style.lineHeight,
          letterSpacing: `${style.letterSpacing}em`,
        }}
      >
        {style.name}
      </p>
      <div className="grid grid-cols-2 gap-1">
        <input list="all-fams" value={style.fontFamily} onChange={(e) => onChange({ fontFamily: e.target.value })} className="h-6 rounded border bg-background px-1.5 text-[10px]" placeholder="Family" />
        <input type="number" value={style.fontWeight} onChange={(e) => onChange({ fontWeight: Number(e.target.value) || 400 })} className="h-6 rounded border bg-background px-1.5 text-[10px]" placeholder="Weight" />
        <input type="number" value={style.fontSize} onChange={(e) => onChange({ fontSize: Number(e.target.value) || 16 })} className="h-6 rounded border bg-background px-1.5 text-[10px]" placeholder="Size px" />
        <input type="number" step={0.05} value={style.lineHeight} onChange={(e) => onChange({ lineHeight: Number(e.target.value) || 1.5 })} className="h-6 rounded border bg-background px-1.5 text-[10px]" placeholder="LH" />
        <input type="number" step={0.005} value={style.letterSpacing} onChange={(e) => onChange({ letterSpacing: Number(e.target.value) || 0 })} className="h-6 rounded border bg-background px-1.5 text-[10px]" placeholder="LS em" />
        <input value={style.usage ?? ""} onChange={(e) => onChange({ usage: e.target.value })} className="h-6 rounded border bg-background px-1.5 text-[10px]" placeholder="Usage" />
      </div>
      <datalist id="all-fams">
        {familyOptions.map((o) => <option key={o} value={o} />)}
      </datalist>
    </div>
  );
}
