import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Toolhouse — Design-forward tools & extensions" },
      {
        name: "description",
        content:
          "A curated collection of design-forward tools, browser extensions and AI workspaces — Durud Reminder, Salat OS, Designer OS, LeadPilot, AI Nexus Hub and more.",
      },
      { property: "og:title", content: "Toolhouse — Tools & Extensions" },
      {
        property: "og:description",
        content:
          "Design-forward tools, browser extensions and AI workspaces. Free, private, beautifully crafted.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type Tool = {
  slug: string;
  to: string;
  name: string;
  tagline: string;
  category: string;
  accent: string; // css gradient
  glyph: string;
  status?: "live" | "beta" | "new";
};

const TOOLS: Tool[] = [
  {
    slug: "durud",
    to: "/durud",
    name: "Durud Reminder",
    tagline: "নবীজি (সাঃ)-এর প্রতি দুরুদ পাঠের শান্ত রিমাইন্ডার। তাসবিহ, স্ট্রিক, শুক্রবার মোড।",
    category: "Chrome Extension · Islamic",
    accent: "linear-gradient(135deg,#0f6b60,#3fa898)",
    glyph: "﷽",
    status: "live",
  },
  {
    slug: "salat",
    to: "/salat",
    name: "Salat OS",
    tagline: "বাংলা-ফার্স্ট, ডিজাইন-ফরওয়ার্ড প্রেয়ার টাইমস। অফলাইন, ট্র্যাকিং-ফ্রি।",
    category: "PWA · Islamic",
    accent: "linear-gradient(135deg,#1c3d5a,#d4a574)",
    glyph: "☾",
    status: "beta",
  },
  {
    slug: "designer-os",
    to: "/designer-os",
    name: "Designer OS",
    tagline: "Open-source creative workspace। Color, typography, inspector, WCAG audit — সব ব্রাউজারে।",
    category: "Chrome Extension · Design",
    accent: "linear-gradient(135deg,#6d28d9,#ec4899)",
    glyph: "◨",
    status: "live",
  },
  {
    slug: "leadpilot",
    to: "/leadpilot",
    name: "LeadPilot AI",
    tagline: "Enterprise lead intelligence। Google Places + Firecrawl দিয়ে legal lead extraction।",
    category: "Extension · Sales",
    accent: "linear-gradient(135deg,#0ea5e9,#111827)",
    glyph: "◈",
    status: "beta",
  },
  {
    slug: "ai-nexus-hub",
    to: "/ai-nexus-hub",
    name: "AI Nexus Hub",
    tagline: "১৬টি AI provider এক ছাদের নিচে। Chat, image, video, code — নিজের API key দিয়ে।",
    category: "Web App · AI",
    accent: "linear-gradient(135deg,#111827,#4f46e5)",
    glyph: "✦",
    status: "new",
  },
  {
    slug: "ai-studio",
    to: "/ai-studio",
    name: "AI Studio",
    tagline: "Multimodal AI playground — creative experimentation এর জন্য একটা মিনিমাল studio।",
    category: "Web App · AI",
    accent: "linear-gradient(135deg,#7c3aed,#22d3ee)",
    glyph: "◉",
    status: "beta",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl font-serif text-lg font-semibold text-primary-foreground"
            style={{ background: "linear-gradient(135deg,var(--primary),color-mix(in oklab, var(--primary) 60%, #000))" }}
          >
            ✦
          </div>
          <div>
            <div className="font-serif text-base font-semibold tracking-tight">Toolhouse</div>
            <div className="text-xs text-muted-foreground">Design-forward tools</div>
          </div>
        </div>
        <a
          href="#tools"
          className="text-sm text-muted-foreground transition hover:text-primary"
        >
          সব টুল দেখুন ↓
        </a>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16 lg:pt-16">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {TOOLS.length}টি টুল · একই ছাদের নিচে
        </div>
        <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] font-semibold tracking-tight lg:text-6xl">
          সুন্দর, শান্ত, এবং <span className="text-primary">কাজের</span> টুল —
          <br />
          একজায়গায়।
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
          ডিজাইন-ফরওয়ার্ড ব্রাউজার এক্সটেনশন, ইসলামিক অ্যাপ, এবং AI ওয়ার্কস্পেসের একটা কিউরেটেড সংগ্রহ।
          প্রতিটা টুলের কার্ডে ক্লিক করলে সেই টুলের বিস্তারিত পেজে যাবেন।
        </p>
      </section>

      <section id="tools" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-2 text-xs tracking-[0.2em] text-primary uppercase">
              টুল সংগ্রহ
            </div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight lg:text-4xl">
              সব টুল
            </h2>
          </div>
          <div className="hidden text-xs text-muted-foreground sm:block">
            কার্ডে ক্লিক করুন → বিস্তারিত পেজ
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <Link
              key={t.slug}
              to={t.to}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
            >
              <div
                className="absolute inset-x-0 top-0 h-24 opacity-90"
                style={{ background: t.accent }}
                aria-hidden
              />
              <div
                className="absolute inset-x-0 top-0 h-24"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 40%, var(--card) 100%)",
                }}
                aria-hidden
              />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div
                    className="grid h-14 w-14 place-items-center rounded-xl border border-white/20 font-serif text-2xl text-white shadow-md backdrop-blur-sm"
                    style={{ background: t.accent }}
                  >
                    {t.glyph}
                  </div>
                  {t.status && (
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                        t.status === "new"
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : t.status === "beta"
                            ? "border-border bg-secondary text-muted-foreground"
                            : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      {t.status}
                    </span>
                  )}
                </div>

                <div className="mt-14 text-[11px] tracking-wider text-muted-foreground uppercase">
                  {t.category}
                </div>
                <h3 className="mt-1 font-serif text-xl font-semibold tracking-tight">
                  {t.name}
                </h3>
                <p className="mt-2 min-h-[3.75rem] text-sm leading-relaxed text-muted-foreground">
                  {t.tagline}
                </p>

                <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
                  বিস্তারিত দেখুন
                  <span aria-hidden className="transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Toolhouse · ভালোবাসা ও ইখলাসের সাথে তৈরি
      </footer>
    </div>
  );
}
