import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useColorStudioStore } from "../store";
import { generateHarmony, generateTailwindScale, type HarmonyKind } from "../logic/palette";
import { bestTextOn, hexToRgb, rgbToHsl } from "../logic";
import { colorRepository } from "../repository";
import { useProjectStore } from "@/stores/project-store";
import { cn } from "@/lib/cn";

const HARMONIES: Array<{ id: HarmonyKind; label: string }> = [
  { id: "complementary", label: "Complement" },
  { id: "analogous", label: "Analogous" },
  { id: "triadic", label: "Triadic" },
  { id: "split-complementary", label: "Split-comp" },
  { id: "tetradic", label: "Tetradic" },
  { id: "monochromatic", label: "Mono" },
];

export function PalettePanel() {
  const { currentHex, setCurrent } = useColorStudioStore();
  const [kind, setKind] = useState<HarmonyKind>("analogous");
  const harmony = generateHarmony(currentHex, kind);
  const scale = generateTailwindScale(currentHex);
  const projectId = useProjectStore((s) => s.activeProjectId);

  async function saveAll(list: string[]) {
    const items = list.map((hex) => {
      const rgb = hexToRgb(hex);
      return {
        hex,
        rgb,
        hsl: rgbToHsl(rgb),
        name: null,
        source: "manual" as const,
        tags: ["palette", kind],
        projectId: projectId ?? undefined,
      };
    });
    const n = await colorRepository.createMany(items);
    toast.success(`Saved ${n} colors`);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-md border" style={{ background: currentHex }} />
        <div className="text-[10px] text-muted-foreground">Base color · pick or edit in the Picker tab.</div>
      </div>

      <section className="space-y-1.5">
        <div className="flex items-center justify-between">
          <SectionLabel>Harmony</SectionLabel>
          <button
            onClick={() => saveAll(harmony)}
            className="flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Save className="h-3 w-3" /> Save all
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {HARMONIES.map((h) => (
            <button
              key={h.id}
              onClick={() => setKind(h.id)}
              className={cn(
                "rounded-md border px-2 py-1 text-[10px]",
                kind === h.id ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {h.label}
            </button>
          ))}
        </div>
        <div className="mt-1.5 flex overflow-hidden rounded-md border">
          {harmony.map((hex, i) => (
            <button
              key={`${hex}-${i}`}
              onClick={() => { setCurrent(hex); navigator.clipboard.writeText(hex); toast.success(`Copied ${hex}`); }}
              className="flex h-14 flex-1 flex-col justify-end p-1.5 text-left"
              style={{ background: hex, color: bestTextOn(hexToRgb(hex)) }}
              title={hex}
            >
              <span className="font-mono text-[9px] opacity-90">{hex}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-1.5">
        <div className="flex items-center justify-between">
          <SectionLabel>Tailwind scale</SectionLabel>
          <button
            onClick={() => saveAll(Object.values(scale))}
            className="flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Save className="h-3 w-3" /> Save all
          </button>
        </div>
        <div className="grid grid-cols-11 overflow-hidden rounded-md border">
          {Object.entries(scale).map(([k, hex]) => (
            <button
              key={k}
              onClick={() => { setCurrent(hex); navigator.clipboard.writeText(hex); toast.success(`Copied ${hex}`); }}
              className="flex h-10 flex-col items-center justify-end pb-0.5"
              style={{ background: hex, color: bestTextOn(hexToRgb(hex)) }}
              title={`${k} · ${hex}`}
            >
              <span className="font-mono text-[8px] opacity-90">{k}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}
