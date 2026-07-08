/**
 * Typography Inspector — runs in the target page.
 * Buckets computed styles by HTML tag (h1..h6, p, small) so the module
 * can present a real type hierarchy.
 */
import type { InspectedStyle } from "../types";

export function inspectHierarchyInPage(): InspectedStyle[] {
  const stripQ = (s: string) => s.trim().replace(/^["']|["']$/g, "");
  const primary = (stack: string) => stripQ(stack.split(",")[0] ?? "");

  const TAGS: Array<{ sel: string; tag: InspectedStyle["tag"] }> = [
    { sel: "h1", tag: "h1" },
    { sel: "h2", tag: "h2" },
    { sel: "h3", tag: "h3" },
    { sel: "h4", tag: "h4" },
    { sel: "h5", tag: "h5" },
    { sel: "h6", tag: "h6" },
    { sel: "p", tag: "body" },
    { sel: "small", tag: "small" },
  ];

  interface Bucket {
    tag: InspectedStyle["tag"];
    sizes: number[];
    weights: number[];
    lineHeights: number[];
    letterSpacings: number[];
    families: string[];
    samples: string[];
    count: number;
  }

  const isVisible = (el: Element) => {
    const r = (el as HTMLElement).getBoundingClientRect?.();
    if (!r) return false;
    return r.width > 0 && r.height > 0;
  };

  const results: InspectedStyle[] = [];

  for (const { sel, tag } of TAGS) {
    const nodes = Array.from(document.querySelectorAll(sel)).slice(0, 400);
    const bucket: Bucket = {
      tag, sizes: [], weights: [], lineHeights: [], letterSpacings: [],
      families: [], samples: [], count: 0,
    };
    for (const el of nodes) {
      const text = (el as HTMLElement).textContent?.trim();
      if (!text) continue;
      if (!isVisible(el)) continue;
      const cs = getComputedStyle(el);
      const sz = parseFloat(cs.fontSize);
      const lh = parseFloat(cs.lineHeight);
      const ls = parseFloat(cs.letterSpacing);
      const w = parseInt(cs.fontWeight, 10);
      if (!Number.isNaN(sz)) bucket.sizes.push(sz);
      if (!Number.isNaN(w)) bucket.weights.push(w);
      if (!Number.isNaN(lh)) bucket.lineHeights.push(lh / (sz || 1));
      if (!Number.isNaN(ls)) bucket.letterSpacings.push(ls / (sz || 1));
      bucket.families.push(primary(cs.fontFamily));
      if (bucket.samples.length < 3) bucket.samples.push(text.slice(0, 80));
      bucket.count++;
    }

    if (bucket.count === 0) continue;
    const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
    const modeStr = (a: string[]) => {
      const m = new Map<string, number>();
      for (const v of a) m.set(v, (m.get(v) ?? 0) + 1);
      return [...m.entries()].sort((x, y) => y[1] - x[1])[0]?.[0] ?? "";
    };

    results.push({
      tag,
      fontFamily: modeStr(bucket.families),
      fontWeight: Math.round(avg(bucket.weights.length ? bucket.weights : [400])),
      fontSize: Math.round(avg(bucket.sizes) * 10) / 10,
      lineHeight: Math.round(avg(bucket.lineHeights.length ? bucket.lineHeights : [1.5]) * 100) / 100,
      letterSpacing: Math.round(avg(bucket.letterSpacings.length ? bucket.letterSpacings : [0]) * 1000) / 1000,
      sample: bucket.samples[0] ?? "",
      count: bucket.count,
    });
  }

  return results;
}
