import { useLiveQuery } from "dexie-react-hooks";
import { Copy, Trash2 } from "lucide-react";
import { colorRepository } from "../repository";
import { useColorStudioStore } from "../store";
import { bestTextOn, hexToRgb } from "../logic";

export function SavedColors() {
  const colors = useLiveQuery(
    () => colorRepository.getAll(),
    [],
    [],
  );
  const { setCurrent, removeColor } = useColorStudioStore();

  if (!colors.length) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
        No saved colors yet.
        <br />
        Pick a color and hit the save button.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {colors.map((c) => {
        const fg = bestTextOn(hexToRgb(c.hex));
        return (
          <div
            key={c.id}
            className="group relative overflow-hidden rounded-md border shadow-sm"
          >
            <button
              onClick={() => setCurrent(c.hex)}
              className="flex aspect-square w-full flex-col justify-between p-2 text-left"
              style={{ background: c.hex, color: fg }}
              title={c.name ?? c.hex}
            >
              <span className="truncate text-[10px] font-medium opacity-80">
                {c.name ?? "—"}
              </span>
              <span className="font-mono text-[10px] opacity-90">{c.hex}</span>
            </button>
            <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => navigator.clipboard.writeText(c.hex)}
                className="rounded bg-black/40 p-1 text-white hover:bg-black/60"
                title="Copy hex"
              >
                <Copy className="h-3 w-3" />
              </button>
              <button
                onClick={() => removeColor(c.id)}
                className="rounded bg-black/40 p-1 text-white hover:bg-red-500/80"
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
