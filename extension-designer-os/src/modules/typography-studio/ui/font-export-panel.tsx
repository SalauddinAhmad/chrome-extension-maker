import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { Copy, Download } from "lucide-react";
import { typographyRepository } from "../repository";
import { useProjectStore } from "@/stores/project-store";
import { exportFontsCss, exportFontsJson } from "../logic/scale";
import { exportFontsTailwind } from "../logic/system";
import type { StoredFont } from "@/types";
import { cn } from "@/lib/cn";

type Format = "css" | "scss" | "json" | "tailwind";

function exportFontsScss(fonts: StoredFont[]): string {
  if (fonts.length === 0) return "// no fonts saved";
  return fonts.map((f, i) => {
    const key = f.family.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `font-${i + 1}`;
    return `$font-${key}: "${f.family}", ${f.category === "monospace" ? "monospace" : f.category === "serif" ? "serif" : "sans-serif"};`;
  }).join("\n") + "\n";
}

export function FontExportPanel() {
  const [format, setFormat] = useState<Format>("css");
  const [onlyProject, setOnlyProject] = useState(true);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  const fonts = useLiveQuery(async () => {
    const all = await typographyRepository.getAll();
    if (activeProjectId && onlyProject) return all.filter((f) => f.projectId === activeProjectId);
    return all;
  }, [activeProjectId, onlyProject], []);

  const output =
    format === "css" ? exportFontsCss(fonts) :
    format === "scss" ? exportFontsScss(fonts) :
    format === "json" ? exportFontsJson(fonts) :
    exportFontsTailwind(fonts);

  const mime =
    format === "css" ? "text/css" :
    format === "scss" ? "text/x-scss" :
    format === "json" ? "application/json" : "text/javascript";

  const ext = format === "tailwind" ? "js" : format;

  function copy() { navigator.clipboard.writeText(output); toast.success("Copied"); }
  function download() {
    const blob = new Blob([output], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fonts.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1 rounded-md border bg-muted/40 p-1">
        {(["css", "scss", "json", "tailwind"] as Format[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={cn(
              "rounded px-2 py-1 text-[10px] font-medium uppercase",
              format === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {activeProjectId && (
        <label className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <input type="checkbox" checked={onlyProject} onChange={(e) => setOnlyProject(e.target.checked)} />
          Only active project ({fonts.length} fonts)
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
