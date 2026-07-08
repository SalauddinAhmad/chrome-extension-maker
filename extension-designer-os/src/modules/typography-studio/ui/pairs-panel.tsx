import { useEffect } from "react";
import { Copy } from "lucide-react";
import { FONT_PAIRS, buildGoogleFontsHref } from "../logic/pairs";

const STYLE_ID = "designer-os-google-fonts";

function loadGoogleFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const families = Array.from(
    new Set(FONT_PAIRS.flatMap((p) => [p.heading, p.body])),
  );
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = buildGoogleFontsHref(families);
  document.head.appendChild(link);
}

export function PairsPanel() {
  useEffect(() => {
    loadGoogleFonts();
  }, []);

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground">
        Curated Google Fonts pairs. Fonts load only when you open this tab.
      </p>
      {FONT_PAIRS.map((p) => {
        const css = `font-family: "${p.heading}";\nfont-family: "${p.body}";`;
        return (
          <div key={p.id} className="group rounded-md border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-1">
                <div
                  className="truncate text-lg font-semibold leading-tight"
                  style={{ fontFamily: `"${p.heading}", serif` }}
                >
                  {p.heading}
                </div>
                <div
                  className="line-clamp-2 text-[12px] leading-snug text-muted-foreground"
                  style={{ fontFamily: `"${p.body}", sans-serif` }}
                >
                  {p.body} — the quick brown fox jumps over the lazy dog.
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                    {p.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {p.mood}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(css)}
                className="rounded border p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover:opacity-100"
                title="Copy CSS"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
