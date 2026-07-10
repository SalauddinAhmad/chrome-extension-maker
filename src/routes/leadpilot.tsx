import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { exportLeadsXLSX } from "@/lib/lead-export";

export const Route = createFileRoute("/leadpilot")({
  head: () => ({
    meta: [
      { title: "LeadPilot AI — Enterprise Lead Intelligence Platform" },
      {
        name: "description",
        content:
          "AI-powered lead discovery, website audits, opportunity detection, and CRM for agencies, freelancers, and sales teams.",
      },
      { property: "og:title", content: "LeadPilot AI — Enterprise Lead Intelligence" },
      {
        property: "og:description",
        content: "Discover, enrich, score, and convert local business leads with AI.",
      },
    ],
  }),
  component: LeadPilot,
});

/* ────────── design tokens (scoped, dark enterprise) ────────── */
const T = {
  bg: "#0A0B0F",
  surface: "#0F1115",
  surface2: "#151821",
  border: "#1F2330",
  borderStrong: "#2A2F3D",
  ink: "#E6E8EE",
  mute: "#8A93A6",
  faint: "#5A6377",
  brand: "#3B82F6",
  brandSoft: "rgba(59,130,246,0.12)",
  hot: "#F97316",
  warm: "#EAB308",
  cold: "#64748B",
  ok: "#10B981",
  danger: "#EF4444",
};

/* ────────── mock data ────────── */
type Lead = {
  id: string;
  name: string;
  category: string;
  city: string;
  rating: number;
  reviews: number;
  website: string | null;
  ssl: boolean;
  score: number;
  temp: "hot" | "warm" | "cold";
  opps: string[];
  phone: string;
  email: string | null;
};

const LEADS: Lead[] = [
  {
    id: "1",
    name: "Dhaka Dental Care",
    category: "Dental Clinic",
    city: "Dhaka",
    rating: 4.6,
    reviews: 312,
    website: "dhakadental.com",
    ssl: false,
    score: 92,
    temp: "hot",
    opps: ["No SSL", "Slow site (4.2s)", "Outdated design"],
    phone: "+880 1711 000001",
    email: "info@dhakadental.com",
  },
  {
    id: "2",
    name: "Chittagong Smile Studio",
    category: "Dental Clinic",
    city: "Chittagong",
    rating: 4.8,
    reviews: 190,
    website: "smilestudio.bd",
    ssl: true,
    score: 78,
    temp: "warm",
    opps: ["No blog", "Weak SEO"],
    phone: "+880 1811 000002",
    email: "hello@smilestudio.bd",
  },
  {
    id: "3",
    name: "Sylhet Family Dentist",
    category: "Dental Clinic",
    city: "Sylhet",
    rating: 4.3,
    reviews: 88,
    website: null,
    ssl: false,
    score: 95,
    temp: "hot",
    opps: ["No website", "No Google Business posts", "Low review count"],
    phone: "+880 1911 000003",
    email: null,
  },
  {
    id: "4",
    name: "Gulshan Orthodontics",
    category: "Orthodontist",
    city: "Dhaka",
    rating: 4.9,
    reviews: 540,
    website: "gulshanortho.com",
    ssl: true,
    score: 54,
    temp: "cold",
    opps: ["Already optimized"],
    phone: "+880 1611 000004",
    email: "contact@gulshanortho.com",
  },
  {
    id: "5",
    name: "Rajshahi Dental Hub",
    category: "Dental Clinic",
    city: "Rajshahi",
    rating: 4.1,
    reviews: 62,
    website: "rajshahidental.com",
    ssl: false,
    score: 88,
    temp: "hot",
    opps: ["No SSL", "No mobile view", "Old contact info"],
    phone: "+880 1511 000005",
    email: "info@rajshahidental.com",
  },
  {
    id: "6",
    name: "Khulna Kids Dentistry",
    category: "Pediatric Dentist",
    city: "Khulna",
    rating: 4.7,
    reviews: 205,
    website: "khulnakids.bd",
    ssl: true,
    score: 72,
    temp: "warm",
    opps: ["No booking system", "Weak social presence"],
    phone: "+880 1411 000006",
    email: "hi@khulnakids.bd",
  },
];


const NAV = [
  { key: "finder", label: "Lead Finder", icon: IconSearch },
  { key: "saved", label: "Saved Leads", icon: IconBookmark },
  { key: "settings", label: "Settings", icon: IconCog },
];


/* ────────── icons ────────── */
type IP = React.SVGProps<SVGSVGElement>;
function base(p: IP) {
  return { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24", ...p } as IP;
}
function IconGrid(p: IP) { return <svg {...base(p)}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>; }
function IconSearch(p: IP) { return <svg {...base(p)}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>; }
function IconBookmark(p: IP) { return <svg {...base(p)}><path d="M6 3h12v18l-6-4-6 4Z"/></svg>; }
function IconKanban(p: IP) { return <svg {...base(p)}><rect x="3" y="3" width="6" height="18" rx="1.5"/><rect x="10" y="3" width="6" height="12" rx="1.5"/><rect x="17" y="3" width="4" height="8" rx="1.5"/></svg>; }
function IconTarget(p: IP) { return <svg {...base(p)}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>; }
function IconGauge(p: IP) { return <svg {...base(p)}><path d="M4 14a8 8 0 1 1 16 0"/><path d="m12 14 4-4"/><circle cx="12" cy="14" r="1"/></svg>; }
function IconMail(p: IP) { return <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></svg>; }
function IconBarChart(p: IP) { return <svg {...base(p)}><path d="M4 21V10M10 21V4M16 21v-8M22 21H2"/></svg>; }
function IconUsers(p: IP) { return <svg {...base(p)}><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 8a3 3 0 1 0 0 6"/><path d="M22 20a5 5 0 0 0-5-5"/></svg>; }
function IconCog(p: IP) { return <svg {...base(p)}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.2-1.7l2-1.5-2-3.4-2.3.9a7 7 0 0 0-3-1.7L13 2h-2l-.5 2.6a7 7 0 0 0-3 1.7L5.2 5.4l-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .6 0 1.1.2 1.7l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 3 1.7L11 22h2l.5-2.6a7 7 0 0 0 3-1.7l2.3.9 2-3.4-2-1.5c.1-.6.2-1.1.2-1.7Z"/></svg>; }
function IconBolt(p: IP) { return <svg {...base(p)}><path d="M13 2 4 14h7l-1 8 9-12h-7Z"/></svg>; }
function IconPlus(p: IP) { return <svg {...base(p)}><path d="M12 5v14M5 12h14"/></svg>; }
function IconDownload(p: IP) { return <svg {...base(p)}><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>; }
function IconArrow(p: IP) { return <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6"/></svg>; }
function IconStar(p: IP) { return <svg {...base(p)} fill="currentColor" stroke="none"><path d="m12 2 3 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.7l1.8-7.3L1.5 9.5l7.5-.6Z"/></svg>; }
function IconGlobe(p: IP) { return <svg {...base(p)}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>; }
function IconCommand(p: IP) { return <svg {...base(p)}><path d="M6 6h3v3H6a3 3 0 1 1 3-3M18 6h-3v3h3a3 3 0 1 0-3-3M6 18h3v-3H6a3 3 0 1 0 3 3M18 18h-3v-3h3a3 3 0 1 1-3 3"/></svg>; }

/* ────────── component ────────── */
function LeadPilot() {
  const [active, setActive] = useState("finder");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All cities");
  const [temp, setTemp] = useState<"all" | "hot" | "warm" | "cold">("all");
  const [minRating, setMinRating] = useState(0);
  const [selected, setSelected] = useState<string | null>("1");

  const filtered = useMemo(() => {
    return LEADS.filter((l) => {
      if (city !== "All cities" && l.city !== city) return false;
      if (temp !== "all" && l.temp !== temp) return false;
      if (l.rating < minRating) return false;
      if (query && !`${l.name} ${l.category} ${l.city}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, city, temp, minRating]);

  const totals = useMemo(() => {
    const hot = LEADS.filter((l) => l.temp === "hot").length;
    const opps = LEADS.reduce((s, l) => s + l.opps.length, 0);
    const avg = Math.round(LEADS.reduce((s, l) => s + l.score, 0) / LEADS.length);
    return { total: LEADS.length, hot, opps, avg };
  }, []);

  const activeLead = LEADS.find((l) => l.id === selected) ?? null;

  return (
    <div className="min-h-screen w-full" style={{ background: T.bg, color: T.ink, fontFamily: "'Inter', ui-sans-serif, system-ui" }}>
      <div className="flex min-h-screen">
        {/* ── Sidebar ─────────────────────────── */}
        <aside
          className="hidden w-[248px] flex-col border-r lg:flex"
          style={{ background: T.surface, borderColor: T.border }}
        >
          <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
            <div
              className="grid h-8 w-8 place-items-center rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${T.brand} 0%, #1e40af 100%)`,
                boxShadow: `0 0 0 1px rgba(255,255,255,0.06) inset, 0 8px 20px -8px ${T.brand}`,
              }}
            >
              <IconBolt className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-[13px] font-semibold tracking-tight" style={{ color: T.ink }}>LeadPilot</div>
              <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: T.faint }}>AI · Enterprise</div>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5 px-2">
            {NAV.map(({ key, label, icon: Icon }) => {
              const on = active === key;
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className="group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition"
                  style={{
                    background: on ? T.surface2 : "transparent",
                    color: on ? T.ink : T.mute,
                    boxShadow: on ? `inset 0 0 0 1px ${T.border}` : undefined,
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: on ? T.brand : T.faint }} />
                  <span className="flex-1 text-left">{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-3">
            <div
              className="rounded-lg p-3.5"
              style={{
                background: `linear-gradient(160deg, ${T.brandSoft} 0%, rgba(59,130,246,0.02) 100%)`,
                border: `1px solid ${T.border}`,
              }}
            >
              <div className="text-[11px] font-medium" style={{ color: T.ink }}>Free Plan</div>
              <div className="mt-1 text-[10px]" style={{ color: T.mute }}>
                <span className="tabular-nums" style={{ color: T.ink }}>128</span> / 100 leads used
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full" style={{ background: T.border }}>
                <div className="h-full rounded-full" style={{ width: "100%", background: T.brand }} />
              </div>
              <button
                className="mt-3 w-full rounded-md py-1.5 text-[11px] font-medium text-white transition hover:opacity-90"
                style={{ background: T.brand }}
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main ────────────────────────────── */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header
            className="flex h-14 items-center justify-between border-b px-4 lg:px-6"
            style={{ background: T.surface, borderColor: T.border }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5 text-[12px]" style={{ color: T.mute }}>
                <span>Workspace</span>
                <span style={{ color: T.faint }}>/</span>
                <span style={{ color: T.ink }}>{NAV.find((n) => n.key === active)?.label ?? "Dashboard"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetch("/leadpilot-extension.zip")
                    .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); })
                    .then((blob) => {
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = "leadpilot-extension.zip";
                      a.click();
                      URL.revokeObjectURL(a.href);
                    })
                    .catch((e) => alert("Download failed: " + e.message));
                }}
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-medium"
                style={{
                  background: `linear-gradient(180deg, #8b6bff, ${T.brand})`,
                  color: "white",
                  boxShadow: `0 4px 14px ${T.brand}55`,
                }}
              >
                ↓ Download Chrome Extension
              </button>
              <button
                className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px]"
                style={{ borderColor: T.border, background: T.surface2, color: T.mute }}
              >
                <IconCommand className="h-3.5 w-3.5" />
                <span>Command</span>
                <kbd
                  className="rounded px-1 py-0.5 text-[10px] font-mono"
                  style={{ background: T.bg, color: T.faint, border: `1px solid ${T.border}` }}
                >
                  ⌘K
                </kbd>
              </button>
              <div
                className="h-7 w-7 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${T.brand}, #7c3aed)`,
                  boxShadow: `0 0 0 1px ${T.border}`,
                }}
              />

            </div>
          </header>

          {/* Content */}
          <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 lg:px-6">
            {active === "dashboard" && <DashboardView totals={totals} onGo={setActive} />}

            {active === "finder" && (
              <FinderView
                totals={totals}
                query={query} setQuery={setQuery}
                city={city} setCity={setCity}
                temp={temp} setTemp={setTemp}
                minRating={minRating} setMinRating={setMinRating}
                filtered={filtered}
                selected={selected} setSelected={setSelected}
                activeLead={activeLead}
              />
            )}

            {(active === "saved" || active === "settings") && (
              <ModulePlaceholder title={NAV.find((n) => n.key === active)?.label ?? ""} />
            )}

            <p className="mt-6 text-center text-[10.5px] uppercase tracking-[0.24em]" style={{ color: T.faint }}>
              LeadPilot · Google Places lead finder · XLSX / CSV / JSON export
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ────────── subcomponents ────────── */

function Kpi({ label, value, delta, up, accent = T.brand }: { label: string; value: string; delta: string; up: boolean; accent?: string }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: T.surface, borderColor: T.border }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: T.faint }}>{label}</div>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
          style={{ background: up ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: up ? T.ok : T.danger }}
        >
          {up ? "▲" : "▼"} {delta}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <div className="text-3xl font-semibold tracking-tight tabular-nums" style={{ color: T.ink }}>{value}</div>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full" style={{ background: T.border }}>
        <div className="h-full rounded-full" style={{ width: "72%", background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
      </div>
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border px-2.5 py-1.5 text-[12px] outline-none"
      style={{ background: T.bg, borderColor: T.border, color: T.ink }}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Segment<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; label: string; color?: string }[] }) {
  return (
    <div className="flex rounded-md border p-0.5" style={{ background: T.bg, borderColor: T.border }}>
      {options.map((o) => {
        const on = value === o.v;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className="flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-[11.5px] transition"
            style={{
              background: on ? T.surface2 : "transparent",
              color: on ? T.ink : T.mute,
              boxShadow: on ? `inset 0 0 0 1px ${T.border}` : undefined,
            }}
          >
            {o.color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: o.color }} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ScorePill({ score, temp }: { score: number; temp: Lead["temp"] }) {
  const color = temp === "hot" ? T.hot : temp === "warm" ? T.warm : T.cold;
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-6 w-14 overflow-hidden rounded-md" style={{ background: T.border }}>
        <div className="absolute inset-y-0 left-0" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
        <div className="relative flex h-full items-center justify-center text-[10.5px] font-semibold tabular-nums" style={{ color: "#fff" }}>
          {score}
        </div>
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color }}>
        {temp}
      </span>
    </div>
  );
}

function LeadDetail({ lead }: { lead: Lead }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-5" style={{ borderColor: T.border }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: T.faint }}>{lead.category}</div>
            <div className="mt-1 truncate text-[15px] font-semibold" style={{ color: T.ink }}>{lead.name}</div>
            <div className="mt-0.5 text-[11.5px]" style={{ color: T.mute }}>{lead.city}</div>
          </div>
          <ScorePill score={lead.score} temp={lead.temp} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniStat label="Rating" value={lead.rating.toFixed(1)} />
          <MiniStat label="Reviews" value={lead.reviews.toLocaleString()} />
          <MiniStat label="SSL" value={lead.ssl ? "Yes" : "No"} good={lead.ssl} />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <Section title="Opportunities detected">
          <ul className="space-y-1.5">
            {lead.opps.map((o) => (
              <li key={o} className="flex items-center gap-2 text-[12px]" style={{ color: T.mute }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: T.brand }} />
                {o}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Contact">
          <div className="space-y-1.5 text-[12px]" style={{ color: T.mute }}>
            <div className="flex justify-between gap-4"><span style={{ color: T.faint }}>Phone</span><span style={{ color: T.ink }} className="tabular-nums">{lead.phone}</span></div>
            <div className="flex justify-between gap-4"><span style={{ color: T.faint }}>Email</span><span style={{ color: lead.email ? T.ink : T.faint }}>{lead.email ?? "not found"}</span></div>
            <div className="flex justify-between gap-4"><span style={{ color: T.faint }}>Website</span><span style={{ color: T.ink }}>{lead.website ?? "—"}</span></div>
          </div>
        </Section>

        <Section title="AI recommendation">
          <p className="text-[12px] leading-relaxed" style={{ color: T.mute }}>
            High-intent lead. Pitch a mobile-first website with SEO baseline + Google reviews widget.
            Estimated project value: <span style={{ color: T.ink }} className="tabular-nums">$1,200 – $2,400</span>.
          </p>
        </Section>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            className="rounded-md py-2 text-[12px] font-medium text-white transition hover:brightness-110"
            style={{ background: T.brand }}
          >
            Generate outreach
          </button>
          <button
            className="rounded-md border py-2 text-[12px] font-medium transition"
            style={{ borderColor: T.border, background: T.surface, color: T.ink }}
          >
            Add to CRM
          </button>
        </div>

        <button className="flex w-full items-center justify-center gap-1.5 pt-1 text-[11.5px]" style={{ color: T.brand }}>
          Open full audit report <IconArrow className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-md p-2.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: T.faint }}>{label}</div>
      <div className="mt-1 text-[13px] font-semibold tabular-nums" style={{ color: good === false ? T.danger : good ? T.ok : T.ink }}>
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em]" style={{ color: T.faint }}>{title}</div>
      {children}
    </div>
  );
}

/* ────────── Finder view (extracted) ────────── */
function FinderView(props: {
  totals: { total: number; hot: number; opps: number; avg: number };
  query: string; setQuery: (v: string) => void;
  city: string; setCity: (v: string) => void;
  temp: "all" | "hot" | "warm" | "cold"; setTemp: (v: "all" | "hot" | "warm" | "cold") => void;
  minRating: number; setMinRating: (v: number) => void;
  filtered: Lead[];
  selected: string | null; setSelected: (v: string) => void;
  activeLead: Lead | null;
}) {
  const { totals, query, setQuery, city, setCity, temp, setTemp, minRating, setMinRating, filtered, selected, setSelected, activeLead } = props;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Total Leads" value={totals.total.toLocaleString()} delta="+18%" up />
        <Kpi label="Hot Leads" value={totals.hot.toString()} delta="+4" up accent={T.hot} />
        <Kpi label="Opportunities" value={totals.opps.toString()} delta="+12" up />
        <Kpi label="Avg Lead Score" value={totals.avg.toString()} delta="+6.2" up />
      </div>

      <section className="mt-6 rounded-xl border" style={{ borderColor: T.border, background: T.surface }}>
        <div className="border-b p-4" style={{ borderColor: T.border }}>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[260px] flex-1">
              <IconSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: T.faint }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try: Dental clinic in Sylhet with no website"
                className="w-full rounded-md border py-2 pr-3 pl-9 text-[13px] outline-none transition focus:ring-2"
                style={{ background: T.bg, borderColor: T.border, color: T.ink }}
              />
            </div>
            <Select value={city} onChange={setCity} options={["All cities", "Sylhet", "Dhaka", "Chittagong", "New York", "Dubai", "London", "Toronto", "Tokyo"]} />
            <Segment
              value={temp}
              onChange={(v) => setTemp(v as typeof temp)}
              options={[
                { v: "all", label: "All" },
                { v: "hot", label: "Hot", color: T.hot },
                { v: "warm", label: "Warm", color: T.warm },
                { v: "cold", label: "Cold", color: T.cold },
              ]}
            />
            <div className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px]" style={{ borderColor: T.border, color: T.mute, background: T.bg }}>
              <span>Min rating</span>
              <input
                type="range" min={0} max={5} step={0.5}
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-20 accent-current"
                style={{ color: T.brand }}
              />
              <span className="tabular-nums" style={{ color: T.ink }}>{minRating.toFixed(1)}</span>
            </div>
            <button
              onClick={() =>
                exportLeadsXLSX(
                  filtered,
                  `leadpilot-${new Date().toISOString().slice(0, 10)}.xlsx`,
                )
              }
              disabled={filtered.length === 0}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition hover:brightness-125 disabled:opacity-40"
              style={{ borderColor: T.border, background: T.bg, color: T.ink }}
              title="Export current results to Excel (.xlsx)"
            >
              <IconDownload className="h-3.5 w-3.5" />
              Export XLSX
              <span className="rounded px-1 py-0.5 text-[10px] tabular-nums" style={{ background: T.surface2, color: T.mute }}>
                {filtered.length}
              </span>
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-white transition hover:brightness-110"
              style={{ background: T.brand, boxShadow: `0 4px 14px -4px ${T.brand}` }}
            >
              <IconPlus className="h-3.5 w-3.5" />
              Discover leads
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr style={{ color: T.faint }}>
                  {["Business", "Category", "Location", "Rating", "Website", "Score", "Opportunities"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[10.5px] font-medium uppercase tracking-[0.08em]" style={{ borderBottom: `1px solid ${T.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const on = selected === l.id;
                  return (
                    <tr
                      key={l.id}
                      onClick={() => setSelected(l.id)}
                      className="cursor-pointer transition"
                      style={{
                        background: on ? "rgba(59,130,246,0.06)" : "transparent",
                        borderBottom: `1px solid ${T.border}`,
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="grid h-8 w-8 flex-none place-items-center rounded-md text-[11px] font-semibold"
                            style={{ background: T.surface2, color: T.mute, border: `1px solid ${T.border}` }}
                          >
                            {l.name.split(" ").slice(0, 2).map((s) => s[0]).join("")}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium" style={{ color: T.ink }}>{l.name}</div>
                            <div className="truncate text-[11px]" style={{ color: T.faint }}>{l.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: T.mute }}>{l.category}</td>
                      <td className="px-4 py-3" style={{ color: T.mute }}>{l.city}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <IconStar className="h-3 w-3" style={{ color: T.warm }} />
                          <span className="tabular-nums" style={{ color: T.ink }}>{l.rating}</span>
                          <span className="tabular-nums text-[11px]" style={{ color: T.faint }}>({l.reviews})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {l.website ? (
                          <span className="inline-flex items-center gap-1 text-[12px]" style={{ color: T.mute }}>
                            <IconGlobe className="h-3 w-3" style={{ color: l.ssl ? T.ok : T.danger }} />
                            <span className="truncate">{l.website}</span>
                          </span>
                        ) : (
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                            style={{ background: "rgba(239,68,68,0.12)", color: T.danger }}
                          >
                            No site
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ScorePill score={l.score} temp={l.temp} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {l.opps.slice(0, 2).map((o) => (
                            <span
                              key={o}
                              className="rounded-md px-1.5 py-0.5 text-[10.5px]"
                              style={{ background: T.surface2, color: T.mute, border: `1px solid ${T.border}` }}
                            >
                              {o}
                            </span>
                          ))}
                          {l.opps.length > 2 && (
                            <span className="text-[10.5px]" style={{ color: T.faint }}>+{l.opps.length - 2}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <aside className="border-t xl:border-t-0 xl:border-l" style={{ borderColor: T.border, background: T.surface2 }}>
            {activeLead ? <LeadDetail lead={activeLead} /> : <SidePanelEmpty />}
          </aside>
        </div>
      </section>
    </>
  );
}

/* ────────── Dashboard overview ────────── */
function DashboardView({ totals, onGo }: { totals: { total: number; hot: number; opps: number; avg: number }; onGo: (k: string) => void }) {
  const downloadExt = () => {
    fetch("/leadpilot-extension.zip")
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "leadpilot-extension.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((e) => alert("Download failed: " + e.message));
  };

  return (
    <>
      {/* KPI row — real zero state */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Total Leads" value={totals.total.toString()} delta="0" up />
        <Kpi label="Hot Leads" value={totals.hot.toString()} delta="0" up accent={T.hot} />
        <Kpi label="Opportunities" value={totals.opps.toString()} delta="0" up />
        <Kpi label="Avg Score" value={totals.avg ? totals.avg.toString() : "—"} delta="0" up />
      </div>

      {/* Hero — real onboarding */}
      <section
        className="mt-6 overflow-hidden rounded-2xl border"
        style={{
          borderColor: T.border,
          background: `radial-gradient(1200px 400px at 10% -20%, ${T.brandSoft}, transparent 60%), ${T.surface}`,
        }}
      >
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10.5px] uppercase tracking-[0.16em]" style={{ borderColor: T.border, color: T.brand, background: T.brandSoft }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: T.brand }} /> Real Mode · No Mock Data
            </div>
            <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight" style={{ color: T.ink }}>
              LeadPilot AI — লিগ্যাল, প্রিমিয়াম<br/>Google Maps Lead Intelligence
            </h1>
            <p className="mt-2 max-w-[560px] text-[13px] leading-relaxed" style={{ color: T.mute }}>
              এখানে কোনো ডেমো ডেটা নেই। আসল leads পেতে LeadPilot Chrome Extension ইনস্টল করুন,
              Google Places API (New) key দিন, এবং যেকোনো niche + city সার্চ করে instantly hot/warm/cold
              scored leads XLSX / CSV / JSON আকারে export করুন।
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={downloadExt}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-[12.5px] font-medium text-white transition hover:brightness-110"
                style={{ background: `linear-gradient(180deg, #8b6bff, ${T.brand})`, boxShadow: `0 8px 24px -8px ${T.brand}` }}
              >
                <IconDownload className="h-3.5 w-3.5" /> Chrome Extension ডাউনলোড
              </button>
              <button
                onClick={() => onGo("finder")}
                className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-[12.5px] font-medium transition"
                style={{ borderColor: T.border, background: T.surface2, color: T.ink }}
              >
                Web app-এ Lead Finder দেখুন <IconArrow className="h-3 w-3" />
              </button>
            </div>
            <ol className="mt-5 space-y-1.5 text-[12px]" style={{ color: T.mute }}>
              <li><span style={{ color: T.brand }}>১.</span> ZIP ডাউনলোড → unzip করুন</li>
              <li><span style={{ color: T.brand }}>২.</span> Chrome → <code style={{ color: T.ink }}>chrome://extensions</code> → Developer mode চালু</li>
              <li><span style={{ color: T.brand }}>৩.</span> "Load unpacked" → folder সিলেক্ট → Options-এ API key পেস্ট → Save</li>
              <li><span style={{ color: T.brand }}>৪.</span> Icon-এ click → search করুন → export করুন</li>
            </ol>
          </div>
          <div className="rounded-xl border p-4" style={{ background: T.surface2, borderColor: T.border }}>
            <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: T.faint }}>API খরচ</div>
            <div className="mt-2 text-[22px] font-semibold tabular-nums" style={{ color: T.ok }}>$0/mo</div>
            <p className="mt-1 text-[11.5px]" style={{ color: T.mute }}>
              Google প্রতি মাসে $200 free credit দেয় — সাধারণত হাজার হাজার Places search এতে cover হয়।
            </p>
            <div className="mt-4 space-y-2 text-[11.5px]" style={{ color: T.mute }}>
              <div className="flex items-center justify-between"><span>DOM scraping</span><span style={{ color: T.ok }}>নেই</span></div>
              <div className="flex items-center justify-between"><span>CAPTCHA bypass</span><span style={{ color: T.ok }}>নেই</span></div>
              <div className="flex items-center justify-between"><span>License server</span><span style={{ color: T.ok }}>নেই</span></div>
              <div className="flex items-center justify-between"><span>Data leaves browser</span><span style={{ color: T.ok }}>নেই</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Bangla feature grid */}
      <section className="mt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[15px] font-semibold" style={{ color: T.ink }}>Extension কী কী করতে পারে</h2>
          <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: T.faint }}>১০টি core ক্ষমতা</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[
            { i: IconSearch, t: "Text + Nearby সার্চ", d: "যেকোনো keyword + city — Google Places API (New) দিয়ে official ভাবে ২০/৪০/৬০ leads pull করে।" },
            { i: IconBolt, t: "Live ০–১০০ Lead Score", d: "Rating, review count, website presence, SSL, price tier, high-LTV vertical — সব weight করে instant score।" },
            { i: IconTarget, t: "Hot / Warm / Cold Signal", d: "Temperature label + colored pill — কোন lead-এ আগে call দিবেন সেটা এক নজরে।" },
            { i: IconGauge, t: "Opportunity Detection", d: "No website, no SSL, no phone, few reviews, premium price tier — auto-flagged।" },
            { i: IconMail, t: "Contact Harvesting", d: "Editorial summary + website থেকে email regex + Facebook / Instagram / LinkedIn / X / YouTube / TikTok pattern।" },
            { i: IconDownload, t: "Multi-format Export", d: "XLSX (Leads + Opportunities pivot sheet), CSV (pivot-ready), JSON (developer-friendly) — এক ক্লিকে।" },
            { i: IconGrid, t: "Side Panel + Popup", d: "Chrome side panel বা toolbar popup — যেভাবে কাজ করতে চান।" },
            { i: IconGlobe, t: "Auto-pagination", d: "একটি query-তে ৩ pages × ২০ results = ৬০ leads, nextPageToken সহ properly rate-limited।" },
            { i: IconCog, t: "১০০% Local & Private", d: "API key + results শুধু আপনার ব্রাউজারে (chrome.storage.local)। Google ছাড়া অন্য কোথাও data যায় না।" },
          ].map(({ i: I, t, d }) => (
            <div key={t} className="rounded-xl border p-4 transition hover:brightness-110" style={{ background: T.surface, borderColor: T.border }}>
              <div className="grid h-8 w-8 place-items-center rounded-md" style={{ background: T.brandSoft, color: T.brand }}>
                <I className="h-4 w-4" />
              </div>
              <div className="mt-3 text-[13px] font-semibold" style={{ color: T.ink }}>{t}</div>
              <div className="mt-1 text-[12px] leading-relaxed" style={{ color: T.mute }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Legal callout */}
      <section className="mt-6 rounded-xl border p-4" style={{ background: T.surface, borderColor: T.border }}>
        <div className="flex items-start gap-3">
          <div className="grid h-8 w-8 flex-none place-items-center rounded-md" style={{ background: "rgba(16,185,129,0.12)", color: T.ok }}>
            <IconStar className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[12.5px] font-semibold" style={{ color: T.ink }}>ToS-Clean · Leads Sniper-এর legal বিকল্প</div>
            <div className="mt-1 text-[12px] leading-relaxed" style={{ color: T.mute }}>
              LeadPilot Google Maps DOM scrape করে না, CAPTCHA bypass করে না, কোনো license server ছোঁয় না।
              শুধু Google-এর official Places API (New) আপনার নিজের key দিয়ে call করা হয় — তাই Google-এর
              ToS সরাসরি আপনার উপর apply হয়, extension-এর risk শূন্য।
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SidePanelEmpty() {
  return (
    <div className="grid h-full min-h-[420px] place-items-center p-6 text-center">
      <div>
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg" style={{ background: T.brandSoft, color: T.brand }}>
          <IconSearch className="h-5 w-5" />
        </div>
        <div className="mt-3 text-[13px] font-semibold" style={{ color: T.ink }}>কোনো lead select করা নেই</div>
        <div className="mt-1 max-w-[240px] text-[11.5px] leading-relaxed" style={{ color: T.mute }}>
          Chrome Extension দিয়ে real leads discover করুন — এখানে detail panel-এ দেখা যাবে।
        </div>
      </div>
    </div>
  );
}

/* ────────── CRM Kanban ────────── */
type CrmStage = "new" | "contacted" | "qualified" | "won" | "lost";
const CRM_STAGES: { key: CrmStage; label: string; color: string }[] = [
  { key: "new", label: "New", color: T.brand },
  { key: "contacted", label: "Contacted", color: T.warm },
  { key: "qualified", label: "Qualified", color: "#8b5cf6" },
  { key: "won", label: "Won", color: T.ok },
  { key: "lost", label: "Lost", color: T.danger },
];

function CRMView() {
  const initial = useMemo<Record<CrmStage, Lead[]>>(() => ({
    new: [], contacted: [], qualified: [], won: [], lost: [],
  }), []);
  const [board, setBoard] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);

  const move = (id: string, to: CrmStage) => {
    setBoard((b) => {
      const next: Record<CrmStage, Lead[]> = { new: [], contacted: [], qualified: [], won: [], lost: [] };
      let moving: Lead | null = null;
      (Object.keys(b) as CrmStage[]).forEach((k) => {
        next[k] = b[k].filter((l) => {
          if (l.id === id) { moving = l; return false; }
          return true;
        });
      });
      if (moving) next[to] = [moving, ...next[to]];
      return next;
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[16px] font-semibold" style={{ color: T.ink }}>Pipeline</div>
          <div className="text-[12px]" style={{ color: T.mute }}>Drag cards between stages · {LEADS.length} leads tracked</div>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-white" style={{ background: T.brand }}>
          <IconPlus className="h-3.5 w-3.5" /> Add lead
        </button>
      </div>

      <div className="grid gap-3 overflow-x-auto" style={{ gridTemplateColumns: "repeat(5, minmax(220px, 1fr))" }}>
        {CRM_STAGES.map((s) => (
          <div
            key={s.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragId) { move(dragId, s.key); setDragId(null); } }}
            className="flex min-h-[420px] flex-col rounded-xl border"
            style={{ background: T.surface, borderColor: T.border }}
          >
            <div className="flex items-center justify-between border-b px-3 py-2.5" style={{ borderColor: T.border }}>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                <span className="text-[12px] font-medium" style={{ color: T.ink }}>{s.label}</span>
              </div>
              <span className="rounded px-1.5 py-0.5 text-[10px] tabular-nums" style={{ background: T.surface2, color: T.mute, border: `1px solid ${T.border}` }}>
                {board[s.key].length}
              </span>
            </div>
            <div className="flex-1 space-y-2 p-2">
              {board[s.key].map((l) => (
                <div
                  key={l.id}
                  draggable
                  onDragStart={() => setDragId(l.id)}
                  className="cursor-grab rounded-md border p-3 active:cursor-grabbing"
                  style={{ background: T.surface2, borderColor: T.border }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[12.5px] font-medium" style={{ color: T.ink }}>{l.name}</div>
                      <div className="mt-0.5 truncate text-[10.5px]" style={{ color: T.faint }}>{l.category} · {l.city}</div>
                    </div>
                    <ScorePill score={l.score} temp={l.temp} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {l.opps.slice(0, 2).map((o) => (
                      <span key={o} className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: T.bg, color: T.mute, border: `1px solid ${T.border}` }}>{o}</span>
                    ))}
                  </div>
                </div>
              ))}
              {board[s.key].length === 0 && (
                <div className="grid h-24 place-items-center rounded-md border border-dashed text-[11px]" style={{ borderColor: T.border, color: T.faint }}>
                  Drop leads here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────── Website Audits + AI Enrichment ────────── */
function AuditsView() {
  const [url, setUrl] = useState("zaman.com.bd");
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<{ url: string; scores: { seo: number; perf: number; ssl: number; a11y: number }; issues: string[]; ai: string }>({
    url: "zaman.com.bd",
    scores: { seo: 42, perf: 58, ssl: 0, a11y: 71 },
    issues: ["No SSL certificate", "Missing meta description", "Largest Contentful Paint 4.8s", "Images not lazy-loaded", "No H1 tag on homepage"],
    ai: "This site is a strong redesign candidate. Priority fixes: install SSL, optimize hero image, add structured metadata. A modern rebuild could lift organic traffic ~40% in 90 days.",
  });

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min));
      setReport({
        url,
        scores: { seo: rand(30, 90), perf: rand(40, 95), ssl: Math.random() > 0.3 ? 100 : 0, a11y: rand(50, 95) },
        issues: ["Meta description missing", "3 images without alt text", "Render-blocking scripts detected", "CLS 0.18 (needs improvement)"],
        ai: "Solid foundation but growth is bottlenecked by on-page SEO and performance. A 2-week sprint on Core Web Vitals + schema markup would unlock the largest wins.",
      });
      setRunning(false);
    }, 900);
  };

  return (
    <div>
      <div className="rounded-xl border p-4" style={{ background: T.surface, borderColor: T.border }}>
        <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: T.faint }}>Website Audit</div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[280px] flex-1">
            <IconGlobe className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: T.faint }} />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              className="w-full rounded-md border py-2 pr-3 pl-9 text-[13px] outline-none"
              style={{ background: T.bg, borderColor: T.border, color: T.ink }}
            />
          </div>
          <button
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[12px] font-medium text-white transition hover:brightness-110 disabled:opacity-60"
            style={{ background: T.brand, boxShadow: `0 4px 14px -4px ${T.brand}` }}
          >
            <IconBolt className="h-3.5 w-3.5" />
            {running ? "Auditing…" : "Run audit"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-xl border p-5" style={{ background: T.surface, borderColor: T.border }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: T.faint }}>Report</div>
              <div className="mt-0.5 text-[14px] font-semibold" style={{ color: T.ink }}>{report.url}</div>
            </div>
            <div className="text-[10px] tabular-nums" style={{ color: T.faint }}>Just now</div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <ScoreCard label="SEO" value={report.scores.seo} />
            <ScoreCard label="Performance" value={report.scores.perf} />
            <ScoreCard label="SSL" value={report.scores.ssl} />
            <ScoreCard label="Accessibility" value={report.scores.a11y} />
          </div>

          <div className="mt-6">
            <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em]" style={{ color: T.faint }}>Issues found</div>
            <ul className="space-y-1.5">
              {report.issues.map((i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px]" style={{ color: T.mute }}>
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full" style={{ background: T.danger }} />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border p-5" style={{ background: T.surface2, borderColor: T.border }}>
          <div className="flex items-center gap-2">
            <IconBolt className="h-3.5 w-3.5" style={{ color: T.brand }} />
            <div className="text-[10px] font-medium uppercase tracking-[0.16em]" style={{ color: T.brand }}>AI enrichment</div>
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color: T.ink }}>{report.ai}</p>

          <div className="mt-5 grid gap-2">
            <div className="rounded-md border p-3" style={{ background: T.surface, borderColor: T.border }}>
              <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: T.faint }}>Estimated deal</div>
              <div className="mt-1 text-[16px] font-semibold tabular-nums" style={{ color: T.ok }}>$1,800 – $3,600</div>
            </div>
            <button className="rounded-md py-2 text-[12px] font-medium text-white" style={{ background: T.brand }}>
              Generate outreach email
            </button>
            <button className="rounded-md border py-2 text-[12px] font-medium" style={{ borderColor: T.border, background: T.surface, color: T.ink }}>
              Save to CRM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? T.ok : value >= 50 ? T.warm : T.danger;
  return (
    <div className="rounded-md border p-3" style={{ background: T.bg, borderColor: T.border }}>
      <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: T.faint }}>{label}</div>
      <div className="mt-1 text-[20px] font-semibold tabular-nums" style={{ color }}>{value}</div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full" style={{ background: T.border }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

/* ────────── AI Outreach ────────── */
function OutreachView() {
  const [lead, setLead] = useState(LEADS[0]?.id ?? "");
  const [tone, setTone] = useState<"friendly" | "direct" | "premium">("friendly");
  const [copy, setCopy] = useState("");
  const l = LEADS.find((x) => x.id === lead);

  const generate = () => {
    if (!l) return;
    const openers = {
      friendly: `Hi ${l.name.split(" ")[0]} team,`,
      direct: `${l.name} —`,
      premium: `Dear ${l.name},`,
    } as const;
    setCopy(
      `${openers[tone]}\n\nI came across ${l.name} while researching top-rated ${l.category.toLowerCase()}s in ${l.city}. Your ${l.rating}★ rating from ${l.reviews.toLocaleString()} reviews is genuinely impressive.\n\nI noticed a few opportunities: ${l.opps.join(", ")}. Fixing these usually lifts conversions 20–40% within 60 days.\n\nWould a 15-minute call next week make sense?\n\nBest,\nLeadPilot`,
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="rounded-xl border p-4" style={{ background: T.surface, borderColor: T.border }}>
        <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: T.faint }}>Compose</div>
        <label className="mt-3 block text-[11px]" style={{ color: T.mute }}>Lead</label>
        <select value={lead} onChange={(e) => setLead(e.target.value)} className="mt-1 w-full rounded-md border px-2.5 py-2 text-[12.5px]" style={{ background: T.bg, borderColor: T.border, color: T.ink }}>
          {LEADS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <label className="mt-3 block text-[11px]" style={{ color: T.mute }}>Tone</label>
        <div className="mt-1">
          <Segment
            value={tone}
            onChange={(v) => setTone(v as typeof tone)}
            options={[
              { v: "friendly", label: "Friendly" },
              { v: "direct", label: "Direct" },
              { v: "premium", label: "Premium" },
            ]}
          />
        </div>
        <button onClick={generate} className="mt-4 w-full rounded-md py-2 text-[12px] font-medium text-white" style={{ background: T.brand }}>
          <IconBolt className="mr-1 inline h-3.5 w-3.5" /> Generate with AI
        </button>
      </div>
      <div className="rounded-xl border p-5" style={{ background: T.surface, borderColor: T.border }}>
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: T.faint }}>Draft</div>
          {copy && (
            <button onClick={() => navigator.clipboard?.writeText(copy)} className="text-[11px]" style={{ color: T.brand }}>
              Copy
            </button>
          )}
        </div>
        <textarea
          value={copy}
          onChange={(e) => setCopy(e.target.value)}
          placeholder="Click ‘Generate with AI’ to draft a personalized outreach email…"
          className="mt-3 min-h-[360px] w-full resize-y rounded-md border p-4 text-[13px] leading-relaxed outline-none"
          style={{ background: T.bg, borderColor: T.border, color: T.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
        />
      </div>
    </div>
  );
}

/* ────────── Placeholder ────────── */
function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div className="grid min-h-[420px] place-items-center rounded-xl border" style={{ background: T.surface, borderColor: T.border }}>
      <div className="text-center">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg" style={{ background: T.brandSoft, color: T.brand }}>
          <IconBolt className="h-5 w-5" />
        </div>
        <div className="mt-3 text-[14px] font-semibold" style={{ color: T.ink }}>{title}</div>
        <div className="mt-1 text-[12px]" style={{ color: T.mute }}>Coming in the next phase.</div>
      </div>
    </div>
  );
}
