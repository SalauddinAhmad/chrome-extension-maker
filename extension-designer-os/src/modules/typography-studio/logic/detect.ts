import type { DetectedFont } from "../types";

const SYSTEM_FAMILIES = new Set(
  [
    "arial", "helvetica", "helvetica neue", "times", "times new roman",
    "georgia", "courier", "courier new", "verdana", "tahoma", "trebuchet ms",
    "system-ui", "-apple-system", "blinkmaclsystemfont", "segoe ui",
    "roboto", "ubuntu", "cantarell", "sans-serif", "serif", "monospace",
    "menlo", "monaco", "consolas", "sf pro text", "sf pro display",
  ].map((s) => s.toLowerCase()),
);

/**
 * Runs inside the target page via chrome.scripting.executeScript.
 * Must be self-contained (no outer closures / imports).
 */
export function detectFontsInPage(): DetectedFont[] {
  const systemSet = new Set([
    "arial", "helvetica", "helvetica neue", "times", "times new roman",
    "georgia", "courier", "courier new", "verdana", "tahoma", "trebuchet ms",
    "system-ui", "-apple-system", "blinkmacsystemfont", "segoe ui",
    "roboto", "ubuntu", "cantarell", "sans-serif", "serif", "monospace",
    "menlo", "monaco", "consolas", "sf pro text", "sf pro display",
  ]);

  const stripQuotes = (s: string) => s.trim().replace(/^["']|["']$/g, "");
  const parsePrimary = (stack: string) => stripQuotes(stack.split(",")[0] ?? "");

  interface Bucket {
    family: string;
    stack: string;
    weights: Set<number>;
    sizes: Set<number>;
    sampleTag: string;
    count: number;
  }
  const map = new Map<string, Bucket>();

  const isVisible = (el: Element) => {
    const r = (el as HTMLElement).getBoundingClientRect?.();
    if (!r) return false;
    return r.width > 0 && r.height > 0;
  };

  const nodes = document.body?.querySelectorAll(
    "h1,h2,h3,h4,h5,h6,p,span,a,li,button,label,td,th,figcaption,blockquote,div",
  );
  if (!nodes) return [];

  let sampled = 0;
  for (const el of Array.from(nodes)) {
    if (sampled > 4000) break;
    if (!(el as HTMLElement).textContent?.trim()) continue;
    if (!isVisible(el)) continue;
    sampled++;

    const cs = getComputedStyle(el);
    const stack = cs.fontFamily;
    if (!stack) continue;
    const family = parsePrimary(stack);
    if (!family) continue;

    const key = family.toLowerCase();
    let bucket = map.get(key);
    if (!bucket) {
      bucket = {
        family,
        stack,
        weights: new Set(),
        sizes: new Set(),
        sampleTag: el.tagName.toLowerCase(),
        count: 0,
      };
      map.set(key, bucket);
    }
    bucket.count++;
    const w = Number.parseInt(cs.fontWeight, 10);
    if (!Number.isNaN(w)) bucket.weights.add(w);
    const sz = Math.round(parseFloat(cs.fontSize));
    if (!Number.isNaN(sz)) bucket.sizes.add(sz);
  }

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)
    .map<DetectedFont>((b) => ({
      family: b.family,
      stack: b.stack,
      weights: Array.from(b.weights).sort((a, b) => a - b),
      sizes: Array.from(b.sizes).sort((a, b) => b - a).slice(0, 6),
      sampleTag: b.sampleTag,
      count: b.count,
      isSystem: systemSet.has(b.family.toLowerCase()),
    }));
}

export function classifyFamily(family: string): "system" | "google" | "custom" {
  return SYSTEM_FAMILIES.has(family.toLowerCase()) ? "system" : "custom";
}
