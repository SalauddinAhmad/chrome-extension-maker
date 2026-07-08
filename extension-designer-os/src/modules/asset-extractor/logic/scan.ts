import type { ScannedAsset } from "../types";

/**
 * Runs inside the target page via chrome.scripting.executeScript.
 * Must be fully self-contained (no closures, no imports).
 */
export function scanPageAssets(): ScannedAsset[] {
  const abs = (u: string) => {
    try {
      return new URL(u, location.href).toString();
    } catch {
      return "";
    }
  };

  const fileFromUrl = (u: string) => {
    if (u.startsWith("data:")) {
      const mime = u.slice(5, u.indexOf(";"));
      const ext = mime.split("/")[1] ?? "bin";
      return `inline-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    }
    try {
      const url = new URL(u);
      const last = url.pathname.split("/").filter(Boolean).pop();
      return last || url.hostname;
    } catch {
      return "asset";
    }
  };

  const guessMime = (u: string): string | undefined => {
    if (u.startsWith("data:")) return u.slice(5, u.indexOf(";"));
    const m = u.toLowerCase().match(/\.(png|jpe?g|gif|webp|avif|svg|mp4|webm|ico|bmp)(?:\?|#|$)/);
    if (!m) return undefined;
    const ext = m[1] === "jpg" ? "jpeg" : m[1];
    if (["mp4", "webm"].includes(ext)) return `video/${ext}`;
    if (ext === "svg") return "image/svg+xml";
    return `image/${ext}`;
  };

  const results = new Map<string, ScannedAsset>();
  const push = (a: Omit<ScannedAsset, "id"> & { id?: string }) => {
    const id = a.id ?? `${a.kind}::${a.url}`;
    if (!a.url || results.has(id)) return;
    results.set(id, { ...a, id });
  };

  // <img>
  document.querySelectorAll<HTMLImageElement>("img[src]").forEach((img) => {
    const url = abs(img.currentSrc || img.src);
    if (!url) return;
    push({
      kind: "image",
      url,
      filename: fileFromUrl(url),
      width: img.naturalWidth || undefined,
      height: img.naturalHeight || undefined,
      alt: img.alt || undefined,
      mimeGuess: guessMime(url),
    });
  });

  // <picture> / srcset
  document.querySelectorAll<HTMLSourceElement>("source[srcset]").forEach((src) => {
    src.srcset.split(",").forEach((part) => {
      const u = abs(part.trim().split(/\s+/)[0] ?? "");
      if (!u) return;
      push({
        kind: "image",
        url: u,
        filename: fileFromUrl(u),
        mimeGuess: guessMime(u),
      });
    });
  });

  // inline <svg>
  document.querySelectorAll<SVGSVGElement>("svg").forEach((svg, i) => {
    if (svg.closest("[aria-hidden='true']")) return;
    const r = svg.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    if (!clone.getAttribute("xmlns"))
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const raw = new XMLSerializer().serializeToString(clone);
    const url = `data:image/svg+xml;utf8,${encodeURIComponent(raw)}`;
    push({
      id: `svg::inline::${i}::${raw.length}`,
      kind: "svg",
      url,
      filename: `inline-svg-${i + 1}.svg`,
      width: Math.round(r.width),
      height: Math.round(r.height),
      mimeGuess: "image/svg+xml",
    });
  });

  // background-image
  document.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundImage;
    if (!bg || bg === "none") return;
    const matches = bg.matchAll(/url\((["']?)(.*?)\1\)/g);
    for (const m of matches) {
      const u = abs(m[2]);
      if (!u) continue;
      push({
        kind: "background",
        url: u,
        filename: fileFromUrl(u),
        mimeGuess: guessMime(u),
      });
    }
  });

  // <video> + poster
  document.querySelectorAll<HTMLVideoElement>("video").forEach((v) => {
    if (v.src) {
      const u = abs(v.src);
      push({
        kind: "video",
        url: u,
        filename: fileFromUrl(u),
        width: v.videoWidth || undefined,
        height: v.videoHeight || undefined,
        mimeGuess: guessMime(u),
      });
    }
    if (v.poster) {
      const u = abs(v.poster);
      push({ kind: "image", url: u, filename: fileFromUrl(u), mimeGuess: guessMime(u) });
    }
    v.querySelectorAll("source[src]").forEach((s) => {
      const u = abs((s as HTMLSourceElement).src);
      push({
        kind: "video",
        url: u,
        filename: fileFromUrl(u),
        mimeGuess: guessMime(u),
      });
    });
  });

  // favicons + apple-touch icons
  document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach((l) => {
    if (!l.href) return;
    const u = abs(l.href);
    push({
      kind: "icon",
      url: u,
      filename: fileFromUrl(u),
      mimeGuess: guessMime(u),
    });
  });

  return Array.from(results.values());
}
