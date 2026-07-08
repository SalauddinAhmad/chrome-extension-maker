import type { A11yScanData } from "@/types";

/**
 * Runs inside the target page via chrome.scripting.executeScript.
 * Fully self-contained — no imports or closures.
 */
export function scanA11y(): A11yScanData {
  const rgbToRgb = (input: string): { r: number; g: number; b: number; a: number } | null => {
    const m = input.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(",").map((s) => parseFloat(s.trim()));
    const [r, g, b, a = 1] = p;
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return { r, g, b, a };
  };
  const relLum = (c: { r: number; g: number; b: number }) => {
    const f = (n: number) => {
      const s = n / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const contrast = (a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) => {
    const la = relLum(a), lb = relLum(b);
    const [hi, lo] = la > lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
  };
  const toHex = (c: { r: number; g: number; b: number }) => {
    const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${h(c.r)}${h(c.g)}${h(c.b)}`.toUpperCase();
  };

  // Resolve effective background by walking up ancestors until non-transparent.
  const effectiveBg = (el: Element): { r: number; g: number; b: number } | null => {
    let cur: Element | null = el;
    while (cur) {
      const cs = getComputedStyle(cur);
      const c = rgbToRgb(cs.backgroundColor);
      if (c && c.a > 0.05) return { r: c.r, g: c.g, b: c.b };
      cur = cur.parentElement;
    }
    return { r: 255, g: 255, b: 255 };
  };

  /* ---------- contrast ---------- */
  const aaFails: A11yScanData["contrast"]["aaFails"] = [];
  let aaaFails = 0;
  let samples = 0;
  const textEls = document.body?.querySelectorAll(
    "p, span, a, li, td, th, label, button, input, h1, h2, h3, h4, h5, h6",
  ) ?? [];
  for (const el of Array.from(textEls)) {
    if (samples >= 400) break;
    const html = el as HTMLElement;
    if (!html.textContent || html.textContent.trim().length < 2) continue;
    const rect = html.getBoundingClientRect?.();
    if (!rect || rect.width < 4 || rect.height < 4) continue;
    const cs = getComputedStyle(html);
    const fg = rgbToRgb(cs.color);
    const bg = effectiveBg(html);
    if (!fg || !bg) continue;
    samples++;
    const ratio = contrast({ r: fg.r, g: fg.g, b: fg.b }, bg);
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const aaThreshold = large ? 3 : 4.5;
    const aaaThreshold = large ? 4.5 : 7;
    if (ratio < aaThreshold) {
      if (aaFails.length < 20) {
        aaFails.push({
          ratio: Math.round(ratio * 100) / 100,
          fg: toHex(fg),
          bg: toHex(bg),
          text: (html.textContent || "").trim().slice(0, 60),
        });
      }
    }
    if (ratio < aaaThreshold) aaaFails++;
  }

  /* ---------- headings ---------- */
  const headingEls = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  const counts: Record<string, number> = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
  const order: string[] = [];
  const skipped: Array<{ from: string; to: string }> = [];
  let prevLevel = 0;
  for (const h of headingEls) {
    const tag = h.tagName.toLowerCase();
    counts[tag] = (counts[tag] ?? 0) + 1;
    order.push(tag);
    const lvl = parseInt(tag[1], 10);
    if (prevLevel && lvl > prevLevel + 1) {
      skipped.push({ from: `h${prevLevel}`, to: tag });
    }
    prevLevel = lvl;
  }

  /* ---------- images ---------- */
  const imgs = Array.from(document.querySelectorAll("img"));
  let missingAlt = 0, emptyAlt = 0, decorative = 0;
  for (const img of imgs) {
    if (!img.hasAttribute("alt")) {
      missingAlt++;
    } else {
      const alt = img.getAttribute("alt") ?? "";
      if (alt.trim() === "") {
        // empty alt is decorative — count both but grade as decorative
        decorative++;
        if (img.getAttribute("role") !== "presentation") emptyAlt++;
      }
    }
  }

  /* ---------- forms ---------- */
  const inputs = Array.from(
    document.querySelectorAll("input, textarea, select"),
  ) as HTMLElement[];
  let missingLabel = 0, missingPlaceholder = 0, missingDescription = 0;
  for (const inp of inputs) {
    const type = (inp.getAttribute("type") ?? "").toLowerCase();
    if (["hidden", "submit", "button", "reset", "image"].includes(type)) continue;
    const id = inp.id;
    const hasLabel =
      !!(id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
      !!inp.closest("label") ||
      !!inp.getAttribute("aria-label") ||
      !!inp.getAttribute("aria-labelledby") ||
      !!inp.getAttribute("title");
    if (!hasLabel) missingLabel++;
    if (!inp.getAttribute("placeholder") && (inp.tagName === "INPUT" || inp.tagName === "TEXTAREA")) {
      missingPlaceholder++;
    }
    if (!inp.getAttribute("aria-describedby")) missingDescription++;
  }

  /* ---------- links ---------- */
  const links = Array.from(document.querySelectorAll("a")) as HTMLAnchorElement[];
  let emptyLinks = 0, missingName = 0;
  for (const a of links) {
    const text = (a.textContent || "").trim();
    const label = a.getAttribute("aria-label") || a.getAttribute("title");
    const hasImgAlt = Array.from(a.querySelectorAll("img")).some(
      (i) => (i.getAttribute("alt") ?? "").trim().length > 0,
    );
    if (!a.href || a.href === "#" || a.href === location.href + "#") emptyLinks++;
    if (!text && !label && !hasImgAlt) missingName++;
  }

  /* ---------- structure ---------- */
  const mains = document.querySelectorAll("main, [role='main']").length;
  const hasNav = document.querySelectorAll("nav, [role='navigation']").length > 0;
  const hasHeader = document.querySelectorAll("header, [role='banner']").length > 0;
  const hasFooter = document.querySelectorAll("footer, [role='contentinfo']").length > 0;
  const landmarkCount = document.querySelectorAll(
    "main, nav, header, footer, aside, section, [role='main'], [role='navigation'], [role='banner'], [role='contentinfo'], [role='complementary']",
  ).length;
  const blockLevel = document.querySelectorAll("div, section, article, header, footer, main, nav, aside").length || 1;
  const semantic = document.querySelectorAll("section, article, header, footer, main, nav, aside").length;

  return {
    url: location.href,
    title: document.title || location.hostname,
    favicon:
      (document.querySelector('link[rel~="icon"]') as HTMLLinkElement | null)?.href ??
      `${location.origin}/favicon.ico`,
    contrast: { samples, aaFails, aaaFails },
    headings: {
      counts,
      order,
      missingH1: counts.h1 === 0,
      multipleH1: counts.h1 > 1,
      skipped,
    },
    images: {
      total: imgs.length,
      missingAlt,
      emptyAlt,
      decorative,
    },
    forms: {
      totalInputs: inputs.length,
      missingLabel,
      missingPlaceholder,
      missingDescription,
    },
    links: {
      total: links.length,
      empty: emptyLinks,
      missingName,
    },
    structure: {
      hasMain: mains > 0,
      mainCount: mains,
      hasNav,
      hasHeader,
      hasFooter,
      landmarkCount,
      semanticRatio: Math.round((semantic / blockLevel) * 100) / 100,
    },
  };
}
