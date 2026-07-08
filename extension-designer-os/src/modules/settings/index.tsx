import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { Download, Upload, Trash2, Sun, Moon, Monitor, Palette, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useThemeStore } from "@/stores/theme-store";
import { getSettings, updateSettings, db } from "@/storage";
import { cn } from "@/lib/cn";
import type { ThemeMode, Settings } from "@/types";
import {
  exportAll,
  downloadBackup,
  importAll,
  clearAll,
  type BackupFile,
} from "./logic/backup";

const THEMES: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: "light", label: "Light", icon: Sun },
  { mode: "dark", label: "Dark", icon: Moon },
  { mode: "system", label: "System", icon: Monitor },
];

const FORMATS: Settings["colorFormat"][] = ["hex", "rgb", "hsl", "oklch"];

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-2">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground/70">{hint}</div>}
    </div>
  );
}

export default function SettingsModule() {
  const { mode, setMode } = useThemeStore();
  const settings = useLiveQuery(() => getSettings(), []);
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const counts = useLiveQuery(async () => {
    const [colors, palettes, fonts, insp, assets, notes] = await Promise.all([
      db.colors.count(),
      db.palettes.count(),
      db.fonts.count(),
      db.inspirations.count(),
      db.assets.count(),
      db.notes.count(),
    ]);
    return { colors, palettes, fonts, insp, assets, notes };
  }, []);

  async function handleExport() {
    setBusy(true);
    try {
      const file = await exportAll();
      downloadBackup(file);
      setStatus("Backup downloaded.");
      toast.success("Backup downloaded");
    } catch (e) {
      const msg = (e as Error).message;
      setStatus(`Export failed: ${msg}`);
      toast.error("Export failed", { description: msg });
    } finally {
      setBusy(false);
    }
  }

  async function handleImportPick(mergeMode: "merge" | "replace") {
    const el = fileRef.current;
    if (!el) return;
    el.dataset.mode = mergeMode;
    el.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const modeAttr = (e.currentTarget.dataset.mode as "merge" | "replace") ?? "merge";
    setBusy(true);
    try {
      const text = await f.text();
      const parsed = JSON.parse(text) as BackupFile;
      const res = await importAll(parsed, modeAttr);
      setStatus(`Imported ${res.imported} rows (${modeAttr}).`);
      toast.success(`Imported ${res.imported} rows`, { description: `Mode: ${modeAttr}` });
    } catch (err) {
      const msg = (err as Error).message;
      setStatus(`Import failed: ${msg}`);
      toast.error("Import failed", { description: msg });
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function handleClear() {
    if (!confirm("Delete ALL local data? Settings will be preserved. This cannot be undone.")) return;
    setBusy(true);
    try {
      await clearAll();
      setStatus("All data cleared.");
      toast.success("All data cleared");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-5 space-y-5">
      <header>
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
        <p className="text-xs text-muted-foreground">
          Local preferences, theme, and data backup. Everything stays on this device.
        </p>
      </header>

      {/* Theme */}
      <Card className="p-4">
        <SectionHeader title="Appearance" hint="Theme applies to popup & side panel." />
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(({ mode: m, label, icon: Icon }) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => void setMode(m)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-md border py-3 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Color format + motion */}
      <Card className="p-4 space-y-4">
        <div>
          <SectionHeader title="Color format" hint="Default output when copying colors." />
          <div className="flex flex-wrap gap-1.5">
            {FORMATS.map((f) => {
              const active = settings?.colorFormat === f;
              return (
                <button
                  key={f}
                  onClick={() => void updateSettings({ colorFormat: f })}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-[11px] font-mono uppercase transition-colors",
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-center justify-between gap-3 pt-1">
          <div>
            <div className="text-xs font-medium">Reduce motion</div>
            <div className="text-[11px] text-muted-foreground">
              Minimize transitions and animated flourishes.
            </div>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={settings?.reduceMotion ?? false}
            onChange={(e) => void updateSettings({ reduceMotion: e.target.checked })}
          />
        </label>
      </Card>

      {/* Data */}
      <Card className="p-4 space-y-3">
        <SectionHeader
          title="Data backup"
          hint="Export a JSON of every color, font, note, and inspiration."
        />

        {counts && (
          <div className="grid grid-cols-3 gap-2 rounded-md bg-muted/40 p-2.5 text-[11px]">
            <Stat label="Colors" value={counts.colors} />
            <Stat label="Palettes" value={counts.palettes} />
            <Stat label="Fonts" value={counts.fonts} />
            <Stat label="Inspiration" value={counts.insp} />
            <Stat label="Assets" value={counts.assets} />
            <Stat label="Notes" value={counts.notes} />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleExport} disabled={busy}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export JSON
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleImportPick("merge")}
            disabled={busy}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import (merge)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleImportPick("replace")}
            disabled={busy}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import (replace)
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        <Button
          size="sm"
          variant="destructive"
          onClick={handleClear}
          disabled={busy}
          className="w-full sm:w-auto"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Clear all data
        </Button>

        {status && (
          <div className="flex items-start gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-2 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            {status}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <SectionHeader title="About" />
        <div className="space-y-1 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3 w-3" />
            Designer OS · v{settings?.lastSeenVersion ?? "1.0.0"}
          </div>
          <div>Local-first, offline, no telemetry.</div>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-sm font-semibold text-foreground">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
