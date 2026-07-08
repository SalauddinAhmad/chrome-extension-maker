import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { Copy, Download } from "lucide-react";
import { colorRepository } from "../repository";
import { useProjectStore } from "@/stores/project-store";
import {
  exportCssVariables,
  exportJson,
  exportScssVariables,
  exportTailwindConfig,
} from "../logic/export";
import { cn } from "@/lib/cn";

type Format = "css" | "scss" | "json" | "tailwind";

const FORMATS: Array<{ id: Format; label: string; ext: string; mime: string }> = [
  { id: "css", label: "CSS", ext: "css", mime: "text/css" },
  { id: "scss", label: "SCSS", ext: "scss", mime: "text/x-scss" },
  { id: "json", label: "JSON", ext: "json", mime: "application/json" },
  { id: "tailwind", label: "Tailwind", ext: "js", mime: "application/javascript" },
];

export function ExportPanel() {
  const [format, setFormat] = useState<Format>("css");
  const [onlyProject, setOnlyProject] = useState(true);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  const colors = useLiveQuery(async () => {
    const all = await colorRepository.getAll();
    if (activeProjectId && onlyProject) return all.filter((c) => c.projectId === activeProjectId);
    return all;
  }, [activeProjectId, onlyProject], []);

  const output = (() => {
    if (colors.length === 0) return "// no colors saved yet";
    switch (format) {
      case "css": return exportCssVariables(colors);
      case "scss": return exportScssVariables(colors);
      case "json": return exportJson(colors);
      case "tailwind": return exportTailwindConfig(colors);
    }
  })();

  function copy() {
    navigator.clipboard.writeText(output).then(() => toast.success("Copied to clipboard"));
  }
  function download() {
    const fmt = FORMATS.find((f) => f.id === format)!;
    const blob = new Blob([output], { type: fmt.mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `designer-os-colors.${fmt.ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1 rounded-md border bg-muted/40 p-1">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFormat(f.id)}
            className={cn(
              "rounded px-1 py-1.5 text-[10px] font-medium transition-colors",
              format === f.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {activeProjectId && (
        <label className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <input type="checkbox" checked={onlyProject} onChange={(e) => setOnlyProject(e.target.checked)} />
          Only active project ({colors.length} colors)
        </label>
      )}

      <pre className="max-h-64 overflow-auto rounded-md border bg-card p-2 font-mono text-[10px] leading-relaxed">
        {output}
      </pre>

      <div className="flex gap-2">
        <button onClick={copy} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border bg-background px-2 py-1.5 text-[11px] font-medium hover:bg-muted">
          <Copy className="h-3 w-3" /> Copy
        </button>
        <button onClick={download} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border bg-background px-2 py-1.5 text-[11px] font-medium hover:bg-muted">
          <Download className="h-3 w-3" /> Download
        </button>
      </div>
    </div>
  );
}
