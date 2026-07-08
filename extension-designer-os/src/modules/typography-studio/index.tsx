import { Type } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTypeStore } from "./store";
import { DetectPanel } from "./ui/detect-panel";
import { LibraryPanel } from "./ui/library-panel";
import { PairsPanel } from "./ui/pairs-panel";
import type { TypeTab } from "./types";

const TABS: Array<{ id: TypeTab; label: string }> = [
  { id: "detect", label: "Detect" },
  { id: "library", label: "Library" },
  { id: "pairs", label: "Pairs" },
];

export default function TypographyStudio() {
  const tab = useTypeStore((s) => s.tab);
  const setTab = useTypeStore((s) => s.setTab);

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <Type className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Typography</div>
          <div className="text-[10px] text-muted-foreground">Detect · library · pairs</div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-1 rounded-md border bg-muted/40 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded px-2 py-1.5 text-[11px] font-medium transition-colors",
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "detect" && <DetectPanel />}
      {tab === "library" && <LibraryPanel />}
      {tab === "pairs" && <PairsPanel />}
    </div>
  );
}
