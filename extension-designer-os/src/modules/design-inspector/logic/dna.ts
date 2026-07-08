import type { ScanPayload } from "../types";

/**
 * Runs inside the target page via chrome.scripting.executeScript.
 * Fully self-contained — no imports or closures referenced at runtime.
 */
export function scanDesignDNA(): ScanPayload {
  const rgbToHex = (input: string): string | null => {
    const m = input.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
    const [r, g, b, a = 1] = parts;
    if (a < 0.05) return null;
    const toHex = (n: number) =>
      Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  const colors = new Map<string, { count: number; roles: Set<string> }>();
  const fonts = new Map<string, { count: number; weights: Set<number> }>();
  const fontSizes = new Map<number, number>();
  const radii = new Map<string, number>();
  const shadows = new Map<string, number>();
  const spacings = new Map<number, number>();
  const components = {
    button: 0,
    input: 0,
    form: 0,
    card: 0,
    nav: 0,
  };
  const componentSamples: Record<string, ReturnType<typeof sampleStyles> | null> = {
    button: null,
    input: null,
    form: null,
    card: null,
    nav: null,
  };
  const assets: Array<{
    kind: "image" | "svg" | "logo" | "icon";
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }> = [];
  const seenAssets = new Set<string>();

  let sectionCount = 0;
  let gridCount = 0;
  let flexCount = 0;
  let maxContentWidth = 0;

  function sampleStyles(el: Element) {
    const cs = getComputedStyle(el);
    return {
      background: cs.backgroundColor,
      color: cs.color,
      borderRadius: cs.borderRadius,
      padding: cs.padding,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      boxShadow: cs.boxShadow,
      border: cs.borderTopWidth !== "0px" ? `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}` : undefined,
    };
  }

  const pushColor = (raw: string | undefined, role: string) => {
    if (!raw) return;
    const hex = rgbToHex(raw);
    if (!hex) return;
    const b = colors.get(hex);
    if (b) { b.count++; b.roles.add(role); }
    else colors.set(hex, { count: 1, roles: new Set([role]) });
  };

  const isLikelyCard = (el: HTMLElement, cs: CSSStyleDeclaration): boolean => {
    if (cs.boxShadow && cs.boxShadow !== "none") {
      const r = parseFloat(cs.borderRadius);
      if (r >= 4) return true;
    }
    const cls = (el.className || "").toString().toLowerCase();
    return cls.includes("card") || cls.includes("tile");
  };

  const addAsset = (kind: "image" | "svg" | "logo" | "icon", url: string, alt?: string, w?: number, h?: number) => {
    if (!url) return;
    if (seenAssets.has(url)) return;
    seenAssets.add(url);
    if (assets.length >= 60) return;
    assets.push({ kind, url, alt, width: w, height: h });
  };

  const nodes = document.body?.querySelectorAll("*") ?? [];
  let scanned = 0;

  for (const el of Array.from(nodes)) {
    if (scanned > 4000) break;
    const html = el as HTMLElement;
    const rect = html.getBoundingClientRect?.();
    if (!rect || rect.width < 2 || rect.height < 2) continue;
    scanned++;

    const cs = getComputedStyle(el);
    const tag = html.tagName.toLowerCase();

    // colors
    pushColor(cs.color, "text");
    pushColor(cs.backgroundColor, "bg");
    if (cs.borderTopWidth !== "0px") pushColor(cs.borderTopColor, "border");

    // fonts
    const stack = cs.fontFamily;
    if (stack) {
      const primary = stack.split(",")[0].trim().replace(/^["']|["']$/g, "");
      if (primary) {
        const entry = fonts.get(primary) ?? { count: 0, weights: new Set<number>() };
        entry.count++;
        const w = parseInt(cs.fontWeight, 10);
        if (!Number.isNaN(w)) entry.weights.add(w);
        fonts.set(primary, entry);
      }
    }

    // font sizes
    const fs = Math.round(parseFloat(cs.fontSize));
    if (!Number.isNaN(fs) && fs >= 8 && fs <= 200) {
      fontSizes.set(fs, (fontSizes.get(fs) ?? 0) + 1);
    }

    // radius / shadow
    if (cs.borderRadius && cs.borderRadius !== "0px") {
      radii.set(cs.borderRadius, (radii.get(cs.borderRadius) ?? 0) + 1);
    }
    if (cs.boxShadow && cs.boxShadow !== "none") {
      shadows.set(cs.boxShadow, (shadows.get(cs.boxShadow) ?? 0) + 1);
    }

    // padding-based spacing
    for (const side of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"] as const) {
      const px = Math.round(parseFloat(cs[side] as string));
      if (!Number.isNaN(px) && px > 0 && px <= 160) {
        spacings.set(px, (spacings.get(px) ?? 0) + 1);
      }
    }

    // layout
    if (cs.display === "grid") gridCount++;
    if (cs.display === "flex") flexCount++;
    if (tag === "section" || tag === "article") sectionCount++;
    if (rect.width > maxContentWidth && rect.width < window.innerWidth + 4) {
      maxContentWidth = rect.width;
    }

    // components
    if (tag === "button" || html.getAttribute("role") === "button") {
      components.button++;
      if (!componentSamples.button) componentSamples.button = sampleStyles(el);
    } else if (tag === "input" || tag === "textarea" || tag === "select") {
      components.input++;
      if (!componentSamples.input) componentSamples.input = sampleStyles(el);
    } else if (tag === "form") {
      components.form++;
      if (!componentSamples.form) componentSamples.form = sampleStyles(el);
    } else if (tag === "nav" || html.getAttribute("role") === "navigation") {
      components.nav++;
      if (!componentSamples.nav) componentSamples.nav = sampleStyles(el);
    } else if (isLikelyCard(html, cs)) {
      components.card++;
      if (!componentSamples.card) componentSamples.card = sampleStyles(el);
    }

    // assets
    if (tag === "img") {
      const img = el as HTMLImageElement;
      const src = img.currentSrc || img.src;
      if (src && !src.startsWith("data:")) {
        const cls = (img.className || "").toString().toLowerCase();
        const alt = (img.alt || "").toLowerCase();
        const kind: "image" | "logo" | "icon" =
          cls.includes("logo") || alt.includes("logo") ? "logo" :
          (img.naturalWidth && img.naturalWidth <= 48) ? "icon" : "image";
        addAsset(kind, src, img.alt, img.naturalWidth, img.naturalHeight);
      }
    }
    if (tag === "svg") {
      try {
        const outer = html.outerHTML;
        if (outer && outer.length < 20000) {
          const url = "data:image/svg+xml;utf8," + encodeURIComponent(outer);
          addAsset("svg", url, undefined, Math.round(rect.width), Math.round(rect.height));
        }
      } catch { /* noop */ }
    }
  }

  const topColors = Array.from(colors.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 32)
    .map(([hex, v]) => ({ hex, count: v.count, roles: Array.from(v.roles) }));

  const topFonts = Array.from(fonts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([family, v]) => ({ family, count: v.count, weights: Array.from(v.weights).sort((a, b) => a - b) }));

  const topSizes = Array.from(fontSizes.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 12)
    .map(([px, count]) => ({ px, count }));

  const topRadii = Array.from(radii.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([value, count]) => ({ value, count }));

  const topShadows = Array.from(shadows.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([value, count]) => ({ value, count }));

  const topSpacings = Array.from(spacings.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 12)
    .map(([px, count]) => ({ px, count }));

  const componentList = (["button", "input", "form", "card", "nav"] as const)
    .map((kind) => ({
      kind,
      count: components[kind],
      sample: componentSamples[kind] ?? undefined,
    }))
    .filter((c) => c.count > 0);

  const svgCount = assets.filter((a) => a.kind === "svg").length;
  const imageCount = assets.length - svgCount;

  return {
    url: location.href,
    title: document.title || location.hostname,
    favicon:
      (document.querySelector('link[rel~="icon"]') as HTMLLinkElement | null)?.href ??
      `${location.origin}/favicon.ico`,
    colors: topColors,
    fonts: topFonts,
    fontSizes: topSizes,
    radii: topRadii,
    shadows: topShadows,
    spacings: topSpacings,
    components: componentList,
    layout: {
      containerWidth: window.innerWidth,
      contentWidth: Math.round(maxContentWidth) || undefined,
      sectionCount,
      gridCount,
      flexCount,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    },
    assets,
    statistics: {
      scannedElements: scanned,
      uniqueColors: topColors.length,
      uniqueFonts: topFonts.length,
      componentCount: componentList.reduce((a, c) => a + c.count, 0),
      imageCount,
      svgCount,
    },
  };
}
