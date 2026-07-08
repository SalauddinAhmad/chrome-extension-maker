import { Palette } from "lucide-react";
import { cn } from "@/lib/cn";
import { useColorStudioStore } from "./store";
import { ColorPicker } from "./ui/color-picker";
import { SavedColors } from "./ui/saved-colors";
import { GradientLab } from "./ui/gradient-lab";
import { PalettePanel } from "./ui/palette-panel";
import { ContrastPanel } from "./ui/contrast-panel";
import { ExportPanel } from "./ui/export-panel";
import type { StudioTab } from "./types";

const TABS: Array<{ id: StudioTab; label: string }> = [
  { id: "picker", label: "Pick" },
  { id: "palette", label: "Palette" },
  { id: "gradient", label: "Gradient" },
  { id: "contrast", label: "Contrast" },
  { id: "saved", label: "Saved" },
  { id: "export", label: "Export" },
];

export default function ColorStudio() {
  const tab = useColorStudioStore((s) => s.tab);
  const setTab = useColorStudioStore((s) => s.setTab);

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <Palette className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Color Studio</div>
          <div className="text-[10px] text-muted-foreground">Pick · palette · contrast · export</div>
        </div>
      </header>

      <div className="grid grid-cols-6 gap-1 rounded-md border bg-muted/40 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded px-1 py-1.5 text-[10px] font-medium transition-colors",
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "picker" && <ColorPicker />}
      {tab === "palette" && <PalettePanel />}
      {tab === "gradient" && <GradientLab />}
      {tab === "contrast" && <ContrastPanel />}
      {tab === "saved" && <SavedColors />}
      {tab === "export" && <ExportPanel />}
    </div>
  );
}
