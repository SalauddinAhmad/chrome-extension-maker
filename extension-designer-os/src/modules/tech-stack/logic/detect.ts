import type { TechReport, DetectedTech } from "../types";

/**
 * Runs inside the target page via chrome.scripting.executeScript.
 * Self-contained — no closures, no imports.
 */
export function detectTechStack(): TechReport {
  const items: DetectedTech[] = [];
  const seen = new Set<string>();
  const push = (t: DetectedTech) => {
    const k = `${t.category}::${t.name}`;
    if (seen.has(k)) return;
    seen.add(k);
    items.push(t);
  };

  const w = window as unknown as Record<string, unknown>;
  const html = document.documentElement.outerHTML;
  const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>("script[src]"));
  const scriptSrcs = scripts.map((s) => s.src);
  const metaGen = document.querySelector<HTMLMetaElement>('meta[name="generator"]')?.content ?? "";

  // ---------- Frameworks (window globals + script patterns) ----------
  if (w.React || document.querySelector("[data-reactroot], [data-reactid]") || /react(-dom)?[.@]/i.test(scriptSrcs.join(" "))) {
    push({ name: "React", category: "framework", evidence: "window.React or React DOM markers", confidence: "high" });
  }
  if (w.next || document.querySelector("#__next") || scriptSrcs.some((s) => /\/_next\//.test(s))) {
    push({ name: "Next.js", category: "framework", evidence: "#__next root / _next scripts", confidence: "high" });
  }
  if (w.__NUXT__ || document.querySelector("#__nuxt")) {
    push({ name: "Nuxt", category: "framework", evidence: "window.__NUXT__", confidence: "high" });
  }
  if (w.Vue || document.querySelector("[data-v-app]")) {
    push({ name: "Vue", category: "framework", evidence: "window.Vue or data-v-app", confidence: "high" });
  }
  if (w.ng || document.querySelector("[ng-version]")) {
    push({ name: "Angular", category: "framework", evidence: "[ng-version] attribute", confidence: "high" });
  }
  if (document.querySelector("[data-svelte-h], [data-sveltekit-preload-data]")) {
    push({ name: "SvelteKit", category: "framework", evidence: "data-sveltekit-* attributes", confidence: "high" });
  }
  if (w.jQuery || w.$?.toString?.().includes("jQuery")) {
    push({ name: "jQuery", category: "framework", evidence: "window.jQuery", confidence: "high" });
  }
  if (scriptSrcs.some((s) => /gatsby/i.test(s)) || document.querySelector("#___gatsby")) {
    push({ name: "Gatsby", category: "framework", evidence: "#___gatsby root", confidence: "high" });
  }
  if (document.querySelector('meta[name="astro-view-transitions-enabled"]') || scriptSrcs.some((s) => /astro/i.test(s))) {
    push({ name: "Astro", category: "framework", evidence: "astro meta / scripts", confidence: "medium" });
  }
  if (document.querySelector("[data-remix-run]") || scriptSrcs.some((s) => /remix/i.test(s))) {
    push({ name: "Remix", category: "framework", evidence: "data-remix-run attribute", confidence: "high" });
  }

  // ---------- CMS / builders / e-commerce ----------
  if (/wordpress/i.test(metaGen) || scriptSrcs.some((s) => /\/wp-(content|includes)\//.test(s))) {
    push({ name: "WordPress", category: "cms", evidence: "wp-content / meta generator", confidence: "high" });
  }
  if (/drupal/i.test(metaGen) || w.Drupal) {
    push({ name: "Drupal", category: "cms", evidence: "meta generator / window.Drupal", confidence: "high" });
  }
  if (w.Shopify || document.querySelector('meta[name="shopify-checkout-api-token"]')) {
    push({ name: "Shopify", category: "ecommerce", evidence: "window.Shopify", confidence: "high" });
  }
  if (w.Webflow || document.documentElement.getAttribute("data-wf-site")) {
    push({ name: "Webflow", category: "cms", evidence: "data-wf-site", confidence: "high" });
  }
  if (document.querySelector('meta[name="generator"][content*="Framer"]') || scriptSrcs.some((s) => /framerusercontent/i.test(s))) {
    push({ name: "Framer", category: "cms", evidence: "framerusercontent scripts", confidence: "high" });
  }
  if (/Squarespace/i.test(metaGen) || w.Static?.hasOwnProperty?.("SQUARESPACE_CONTEXT")) {
    push({ name: "Squarespace", category: "cms", evidence: "meta generator", confidence: "high" });
  }
  if (/Wix/i.test(metaGen) || scriptSrcs.some((s) => /static\.wixstatic\.com/.test(s))) {
    push({ name: "Wix", category: "cms", evidence: "wixstatic scripts", confidence: "high" });
  }
  if (scriptSrcs.some((s) => /cdn\.shopify\.com/.test(s))) {
    push({ name: "Shopify CDN", category: "cdn", evidence: "cdn.shopify.com", confidence: "medium" });
  }
  if (scriptSrcs.some((s) => /woocommerce/i.test(s))) {
    push({ name: "WooCommerce", category: "ecommerce", evidence: "woocommerce scripts", confidence: "high" });
  }

  // ---------- UI libs ----------
  const classSample = document.body?.className ?? "";
  const allClasses = document.querySelector("[class]")?.className ?? "";
  const hasTailwindMarkers = /(^|\s)(flex|grid|bg-|text-|p-\d|m-\d|rounded|shadow|hover:)/.test(
    document.body?.innerHTML.slice(0, 20000) ?? "",
  );
  if (hasTailwindMarkers && document.querySelectorAll("[class*='bg-'], [class*='text-']").length > 20) {
    push({ name: "Tailwind CSS", category: "ui", evidence: "utility-class density", confidence: "medium" });
  }
  if (/(^|\s)(container-fluid|col-md-|navbar-)/.test(classSample + " " + allClasses) || scriptSrcs.some((s) => /bootstrap/i.test(s))) {
    push({ name: "Bootstrap", category: "ui", evidence: "bootstrap classes", confidence: "medium" });
  }
  if (document.querySelector("[data-radix-portal], [data-radix-collection-item]")) {
    push({ name: "Radix UI", category: "ui", evidence: "data-radix-* attributes", confidence: "high" });
  }
  if (document.querySelector(".MuiButtonBase-root, [class*='MuiTypography']")) {
    push({ name: "Material UI", category: "ui", evidence: "Mui* classes", confidence: "high" });
  }
  if (/chakra-/.test(html)) {
    push({ name: "Chakra UI", category: "ui", evidence: "chakra-* classes", confidence: "medium" });
  }

  // ---------- Analytics & tag managers ----------
  if (w.gtag || w.dataLayer && scriptSrcs.some((s) => /googletagmanager/i.test(s))) {
    push({ name: "Google Tag Manager", category: "tag-manager", evidence: "googletagmanager script", confidence: "high" });
  }
  if (w.ga || scriptSrcs.some((s) => /google-analytics|gtag\/js/i.test(s))) {
    push({ name: "Google Analytics", category: "analytics", evidence: "gtag / analytics.js", confidence: "high" });
  }
  if (w.fbq || scriptSrcs.some((s) => /connect\.facebook\.net/.test(s))) {
    push({ name: "Meta Pixel", category: "analytics", evidence: "fbq / facebook pixel", confidence: "high" });
  }
  if (w.mixpanel || scriptSrcs.some((s) => /cdn\.mxpnl\.com/.test(s))) {
    push({ name: "Mixpanel", category: "analytics", evidence: "mixpanel snippet", confidence: "high" });
  }
  if (w.analytics && typeof (w.analytics as { load?: unknown }).load === "function") {
    push({ name: "Segment", category: "analytics", evidence: "window.analytics.load", confidence: "high" });
  }
  if (w.posthog) {
    push({ name: "PostHog", category: "analytics", evidence: "window.posthog", confidence: "high" });
  }
  if (w.Plausible || scriptSrcs.some((s) => /plausible\.io/.test(s))) {
    push({ name: "Plausible", category: "analytics", evidence: "plausible script", confidence: "high" });
  }
  if (scriptSrcs.some((s) => /hotjar/i.test(s)) || w.hj) {
    push({ name: "Hotjar", category: "analytics", evidence: "hotjar snippet", confidence: "high" });
  }

  // ---------- CDNs / hosting hints ----------
  const cdnMap: Array<[RegExp, string]> = [
    [/cloudflare|cdnjs\.cloudflare/i, "Cloudflare"],
    [/vercel|now\.sh/i, "Vercel"],
    [/netlify/i, "Netlify"],
    [/akamai/i, "Akamai"],
    [/fastly/i, "Fastly"],
    [/jsdelivr/i, "jsDelivr"],
    [/unpkg/i, "unpkg"],
    [/amazonaws\.com/i, "AWS"],
    [/gstatic|googleapis/i, "Google CDN"],
  ];
  for (const src of scriptSrcs) {
    for (const [re, name] of cdnMap) {
      if (re.test(src)) push({ name, category: "cdn", evidence: new URL(src).host, confidence: "medium" });
    }
  }

  // ---------- Fonts service ----------
  const fontLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"], link[rel="preconnect"]'));
  if (fontLinks.some((l) => /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(l.href))) {
    push({ name: "Google Fonts", category: "font", evidence: "fonts.googleapis.com", confidence: "high" });
  }
  if (fontLinks.some((l) => /use\.typekit\.net/.test(l.href))) {
    push({ name: "Adobe Fonts", category: "font", evidence: "use.typekit.net", confidence: "high" });
  }

  // Script hosts summary
  const scriptHosts = Array.from(
    new Set(
      scriptSrcs
        .map((s) => {
          try { return new URL(s).host; } catch { return ""; }
        })
        .filter(Boolean),
    ),
  ).slice(0, 30);

  return {
    url: location.href,
    title: document.title,
    items,
    scriptHosts,
    scannedAt: Date.now(),
  };
}
