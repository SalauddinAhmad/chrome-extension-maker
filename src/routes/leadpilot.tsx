import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

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
  { id: "1", name: "Sylhet Grand Dental", category: "Dental Clinic", city: "Sylhet", rating: 4.8, reviews: 214, website: null, ssl: false, score: 94, temp: "hot", opps: ["No website", "No SEO", "No socials"], phone: "+880 1711-000001", email: null },
  { id: "2", name: "Zaman Restaurant", category: "Restaurant", city: "Dhaka", rating: 4.2, reviews: 1820, website: "zaman.com.bd", ssl: false, score: 87, temp: "hot", opps: ["No SSL", "Old design", "Slow site"], phone: "+880 1711-000002", email: "info@zaman.com.bd" },
  { id: "3", name: "Blue Ocean Realty", category: "Real Estate", city: "Dubai", rating: 4.6, reviews: 342, website: "blueocean.ae", ssl: true, score: 76, temp: "warm", opps: ["Weak SEO", "No blog"], phone: "+971 4 000 0003", email: "hello@blueocean.ae" },
  { id: "4", name: "North London Legal", category: "Law Firm", city: "London", rating: 4.9, reviews: 87, website: "nllegal.co.uk", ssl: true, score: 68, temp: "warm", opps: ["No mobile menu", "No socials"], phone: "+44 20 0000 0004", email: null },
  { id: "5", name: "Iron & Oak Gym", category: "Fitness", city: "Toronto", rating: 4.5, reviews: 512, website: "ironoak.ca", ssl: true, score: 54, temp: "warm", opps: ["No reviews plugin"], phone: "+1 416 000 0005", email: "team@ironoak.ca" },
  { id: "6", name: "Bright Smile Clinic", category: "Dental Clinic", city: "New York", rating: 4.7, reviews: 623, website: "brightsmile.nyc", ssl: true, score: 41, temp: "cold", opps: ["Minor a11y issues"], phone: "+1 212 000 0006", email: "care@brightsmile.nyc" },
  { id: "7", name: "Chittagong Auto Care", category: "Auto Repair", city: "Chittagong", rating: 4.3, reviews: 128, website: null, ssl: false, score: 91, temp: "hot", opps: ["No website", "No GMB hours"], phone: "+880 1711-000007", email: null },
  { id: "8", name: "Kyoto Sushi Bar", category: "Restaurant", city: "Tokyo", rating: 4.9, reviews: 2043, website: "kyotosushi.jp", ssl: true, score: 32, temp: "cold", opps: ["Nothing critical"], phone: "+81 3 0000 0008", email: "yo@kyotosushi.jp" },
];

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: IconGrid },
  { key: "finder", label: "Lead Finder", icon: IconSearch, badge: "AI" },
  { key: "saved", label: "Saved Leads", icon: IconBookmark },
  { key: "crm", label: "CRM", icon: IconKanban },
  { key: "competitors", label: "Competitors", icon: IconTarget },
  { key: "audits", label: "Website Audits", icon: IconGauge },
  { key: "outreach", label: "AI Outreach", icon: IconMail },
  { key: "reports", label: "Reports", icon: IconBarChart },
  { key: "team", label: "Team", icon: IconUsers },
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

  const activeLead = LEADS.find((l) => l.id === selected) ?? LEADS[0];

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
            {NAV.map(({ key, label, icon: Icon, badge }) => {
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
                  {badge && (
                    <span
                      className="rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wider"
                      style={{ background: T.brandSoft, color: T.brand }}
                    >
                      {badge}
                    </span>
                  )}
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

            {active === "crm" && <CRMView />}
            {active === "audits" && <AuditsView />}
            {active === "outreach" && <OutreachView />}

            {(active === "saved" || active === "competitors" || active === "reports" || active === "team" || active === "settings") && (
              <ModulePlaceholder title={NAV.find((n) => n.key === active)?.label ?? ""} />
            )}

            <p className="mt-6 text-center text-[10.5px] uppercase tracking-[0.24em]" style={{ color: T.faint }}>
              LeadPilot AI · v0.2 · Finder · CRM · Audit · Outreach
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
