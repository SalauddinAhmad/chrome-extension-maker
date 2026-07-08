import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useColorStudioStore } from "../store";
import { generateBrandPalette } from "../logic/palette";
import { bestTextOn, hexToRgb, rgbToHsl } from "../logic";
import { colorRepository } from "../repository";
import { useProjectStore } from "@/stores/project-store";
import { BRAND_ROLES, type BrandRole } from "@/types";

const ROLE_LABEL: Record<BrandRole, string> = {
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  success: "Success",
  warning: "Warning",
  danger: "Danger",
  neutral: "Neutral",
};

export function BrandBuilder() {
  const { currentHex, setCurrent } = useColorStudioStore();
  const projectId = useProjectStore((s) => s.activeProjectId);
  const [saving, setSaving] = useState(false);
  const palette = generateBrandPalette(currentHex);

  async function saveAll() {
    setSaving(true);
    try {
      const items = BRAND_ROLES.map((role) => {
        const hex = palette[role];
        const rgb = hexToRgb(hex);
        return {
          hex,
          rgb,
          hsl: rgbToHsl(rgb),
          name: ROLE_LABEL[role],
          source: "manual" as const,
          tags: ["brand", role],
          projectId: projectId ?? undefined,
        };
      });
      const n = await colorRepository.createMany(items);
      toast.success(`Saved ${n} brand color${n === 1 ? "" : "s"}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Primary color
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-9 w-9 shrink-0 rounded-md border shadow-inner" style={{ background: currentHex }} />
          <Input
            value={currentHex}
            onChange={(e) => setCurrent(e.target.value)}
            className="font-mono text-xs uppercase"
            spellCheck={false}
          />
          <input
            type="color"
            value={currentHex}
            onChange={(e) => setCurrent(e.target.value)}
            className="h-9 w-9 shrink-0 cursor-pointer rounded-md border bg-transparent"
            aria-label="Pick primary"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Generated brand system
          </div>
          <Button size="sm" onClick={() => void saveAll()} disabled={saving} className="h-6 gap-1 px-2 text-[10px]">
            <Save className="h-3 w-3" />
            Save all
          </Button>
        </div>
        <div className="grid grid-cols-7 overflow-hidden rounded-md border">
          {BRAND_ROLES.map((role) => {
            const hex = palette[role];
            const fg = bestTextOn(hexToRgb(hex));
            return (
              <button
                key={role}
                onClick={() => { navigator.clipboard.writeText(hex); toast.success(`Copied ${hex}`); }}
                className="flex h-16 flex-col items-center justify-end pb-1 text-[8px]"
                style={{ background: hex, color: fg }}
                title={`${ROLE_LABEL[role]} · ${hex}`}
              >
                <span className="opacity-80">{ROLE_LABEL[role].slice(0, 3)}</span>
                <span className="font-mono opacity-90">{hex}</span>
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-muted-foreground">
          {BRAND_ROLES.map((r) => (<div key={r}>{ROLE_LABEL[r]}</div>))}
        </div>
      </div>
    </div>
  );
}
