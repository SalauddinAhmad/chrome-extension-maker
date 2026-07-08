import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { Copy, Download } from "lucide-react";
import { db } from "@/storage";
import { useProjectStore } from "@/stores/project-store";
import { exportFontsCss, exportFontsJson } from "../logic/scale";
import { cn } from "@/lib/cn";

type Format = "css" | "json";

export function FontExportPanel() {
  const [format, setFormat] = useState<Format>("css");
  const [onlyProject, setOnlyProject] = useState(true);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  const fonts = useLiveQuery(async () => {
    const all = await db.fonts.orderBy("createdAt").toArray();
    if (activeProjectId && onlyProject) return all.filter((f) => f.projectId === activeProjectId);
    return all;
  }, [activeProjectId, onlyProject], []);

  const output = format === "css" ? exportFontsCss(fonts) : exportFontsJson(fonts);

  function copy() { navigator.clipboard.writeText(output); toast.success("Copied"); }
  function download() {
    const blob = new Blob([output], { type: format === "css" ? "text/css" : "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fonts.${format}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1 rounded-md border bg-muted/40 p-1">
        {(["css", "json"] as Format[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={cn(
              "rounded px-2 py-1 text-[10px] font-medium",
              format === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {f.toUpperCase()}
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
