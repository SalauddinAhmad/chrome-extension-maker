import { Pipette, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useColorStudioStore } from "../store";
import { ColorPreview } from "./color-preview";

export function ColorPicker() {
  const { currentHex, setCurrent, pickFromPage, saveCurrent, isPicking, error } =
    useColorStudioStore();

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => void pickFromPage()} disabled={isPicking}>
          <Pipette className="h-4 w-4" />
          {isPicking ? "Picking…" : "Pick from page"}
        </Button>
        <Button variant="outline" size="icon" onClick={() => void saveCurrent()} title="Save color">
          <Save className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="h-9 w-9 shrink-0 rounded-md border shadow-inner"
          style={{ background: currentHex }}
        />
        <Input
          value={currentHex}
          onChange={(e) => setCurrent(e.target.value)}
          className="font-mono text-xs uppercase"
          spellCheck={false}
        />
        <input
          type="color"
          aria-label="System color picker"
          value={currentHex}
          onChange={(e) => setCurrent(e.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-md border bg-transparent"
        />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
          {error}
        </div>
      )}

      <ColorPreview hex={currentHex} />
    </div>
  );
}
