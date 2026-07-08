import type { DesignReport } from "@/types";

export function AnalysisSummary({ report }: { report: DesignReport }) {
  const { statistics, layout } = report;
  const items: Array<[string, string | number]> = [
    ["Colors", statistics.uniqueColors],
    ["Fonts", statistics.uniqueFonts],
    ["Components", statistics.componentCount],
    ["Images", statistics.imageCount],
    ["SVGs", statistics.svgCount],
    ["Scanned", statistics.scannedElements],
    ["Sections", layout.sectionCount],
    ["Grid / Flex", `${layout.gridCount} / ${layout.flexCount}`],
  ];
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-md border bg-card p-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums">{v}</div>
        </div>
      ))}
    </div>
  );
}

export function ComponentExplorer({ report }: { report: DesignReport }) {
  if (report.components.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-center text-[11px] text-muted-foreground">
        No structural components detected.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {report.components.map((c) => (
        <div key={c.kind} className="rounded-md border bg-card p-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium capitalize">{c.kind}</div>
            <div className="font-mono text-[10px] text-muted-foreground">{c.count}×</div>
          </div>
          {c.sample && (
            <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[10px] text-muted-foreground">
              {c.sample.background && <div className="truncate">bg: {c.sample.background}</div>}
              {c.sample.color && <div className="truncate">fg: {c.sample.color}</div>}
              {c.sample.borderRadius && <div className="truncate">radius: {c.sample.borderRadius}</div>}
              {c.sample.padding && <div className="truncate">pad: {c.sample.padding}</div>}
              {c.sample.fontSize && <div className="truncate">size: {c.sample.fontSize}</div>}
              {c.sample.fontWeight && <div className="truncate">weight: {c.sample.fontWeight}</div>}
              {c.sample.boxShadow && c.sample.boxShadow !== "none" && (
                <div className="col-span-2 truncate">shadow: {c.sample.boxShadow}</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
