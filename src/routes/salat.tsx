import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/salat")({
  head: () => ({
    meta: [
      { title: "Salat OS · Deen Muslim — নামাজের সময়সূচি" },
      {
        name: "description",
        content:
          "বাংলা-ফার্স্ট, ডিজাইন-ফরওয়ার্ড প্রেয়ার টাইমস অ্যাপ। উষ্ণ, শান্ত, প্রিমিয়াম।",
      },
    ],
  }),
  component: SalatHome,
});

/* ---------------- helpers ---------------- */

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBn = (s: string | number) =>
  String(s).replace(/\d/g, (d) => bnDigits[Number(d)]);
const pad = (n: number) => String(n).padStart(2, "0");

type Prayer = {
  key: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  bn: string;
  ar: string;
  en: string;
  h: number;
  m: number;
};

const PRAYERS: Prayer[] = [
  { key: "fajr",    bn: "ফজর",    ar: "الفجر",   en: "Fajr",    h: 4,  m: 32 },
  { key: "dhuhr",   bn: "যোহর",   ar: "الظهر",   en: "Dhuhr",   h: 12, m: 4  },
  { key: "asr",     bn: "আসর",    ar: "العصر",   en: "Asr",     h: 16, m: 28 },
  { key: "maghrib", bn: "মাগরিব", ar: "المغرب",  en: "Maghrib", h: 18, m: 42 },
  { key: "isha",    bn: "এশা",    ar: "العشاء",  en: "Isha",    h: 20, m: 5  },
];

const SURAHS = [
  { no: 1, ar: "الفاتحة",  en: "Al Fatiha",  ayahs: 7 },
  { no: 2, ar: "البقرة",   en: "Al Baqarah", ayahs: 286 },
  { no: 3, ar: "آل عمران", en: "Ali Imran",  ayahs: 200 },
  { no: 4, ar: "النساء",   en: "An Nisa",    ayahs: 176 },
  { no: 5, ar: "المائدة",  en: "Al Maidah",  ayahs: 120 },
];

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/* ---------------- ornaments ---------------- */

function MosqueSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 500" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="dome" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e8a34a" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#d98b2b" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#c47a1e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="halo" x1="0.5" x2="0.5" y1="0" y2="1">
          <stop offset="0%" stopColor="#f5c987" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f5c987" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* halo */}
      <ellipse cx="400" cy="260" rx="360" ry="240" fill="url(#halo)" opacity="0.35" />
      {/* main silhouette */}
      <g fill="url(#dome)">
        {/* left minaret */}
        <rect x="120" y="240" width="26" height="240" rx="4" />
        <path d="M 118 244 Q 133 210 148 244 Z" />
        <circle cx="133" cy="200" r="10" />
        <rect x="130" y="176" width="6" height="26" />
        {/* right minaret */}
        <rect x="654" y="240" width="26" height="240" rx="4" />
        <path d="M 652 244 Q 667 210 682 244 Z" />
        <circle cx="667" cy="200" r="10" />
        <rect x="664" y="176" width="6" height="26" />
        {/* small side domes */}
        <path d="M 200 480 L 200 340 Q 200 270 260 270 Q 320 270 320 340 L 320 480 Z" />
        <path d="M 480 480 L 480 340 Q 480 270 540 270 Q 600 270 600 340 L 600 480 Z" />
        {/* big central dome + arch */}
        <path d="M 320 480 L 320 320 Q 320 180 400 180 Q 480 180 480 320 L 480 480 Z" />
        <path d="M 340 210 Q 400 100 460 210" opacity="0.7" />
        {/* crescent finial */}
        <path
          d="M 400 130 a 14 14 0 1 0 6 26 a 11 11 0 1 1 -6 -26 Z"
          fill="#c47a1e"
          opacity="0.75"
        />
      </g>
    </svg>
  );
}

function IconAlarm(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 9v4l2 2" />
      <path d="M5 3 3 5M19 3l2 2M6 20l-2 2M18 20l2 2" />
    </svg>
  );
}
function IconBulb(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.7.6 1 1.5 1 2.3v1h6v-1c0-.8.3-1.7 1-2.3A7 7 0 0 0 12 2Z" />
    </svg>
  );
}
function IconFlask(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 3h6M10 3v6L4.5 18a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9V3" />
      <path d="M7 14h10" />
    </svg>
  );
}
function IconChat(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z" />
      <path d="M9 12h.01M13 12h.01M17 12h.01" />
    </svg>
  );
}
function IconBook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  );
}
function IconGift(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="8" width="18" height="5" rx="1" />
      <path d="M12 8v13M5 13v8h14v-8" />
      <path d="M12 8S10 3 7.5 3a2.5 2.5 0 0 0 0 5H12ZM12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5H12Z" />
    </svg>
  );
}
function IconMenu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}>
      <path d="M4 7h16M4 12h12M4 17h16" />
    </svg>
  );
}
function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

const QUICK = [
  { key: "reminder", label: "Reminder", bn: "রিমাইন্ডার", Icon: IconAlarm,  tint: "#f7d3b0" },
  { key: "memorize", label: "Memorize", bn: "মুখস্থ",     Icon: IconBulb,   tint: "#f2d089" },
  { key: "ruqiyah",  label: "Ruqiyah",  bn: "রুকিয়াহ",    Icon: IconFlask,  tint: "#e6c7ec" },
  { key: "dua",      label: "Dua Q&A",  bn: "দোয়া",       Icon: IconChat,   tint: "#c8dcf0" },
  { key: "books",    label: "Books",    bn: "বই",         Icon: IconBook,   tint: "#f4c98a" },
  { key: "donate",   label: "Donate",   bn: "দান",        Icon: IconGift,   tint: "#f2a89a" },
];

/* ---------------- component ---------------- */

function SalatHome() {
  const now = useNow(1000);

  const todayPrayers = useMemo(
    () =>
      PRAYERS.map((p) => {
        const d = new Date(now);
        d.setHours(p.h, p.m, 0, 0);
        return { ...p, at: d };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [now.getDate()],
  );

  const nextIdx = todayPrayers.findIndex((p) => p.at.getTime() > now.getTime());
  const next =
    nextIdx >= 0
      ? todayPrayers[nextIdx]
      : {
          ...todayPrayers[0],
          at: (() => {
            const d = new Date(now);
            d.setDate(d.getDate() + 1);
            d.setHours(PRAYERS[0].h, PRAYERS[0].m, 0, 0);
            return d;
          })(),
        };

  const currentIdx = (() => {
    for (let i = todayPrayers.length - 1; i >= 0; i--) {
      if (todayPrayers[i].at.getTime() <= now.getTime()) return i;
    }
    return -1;
  })();

  // countdown h:m:s
  const diffMs = Math.max(0, next.at.getTime() - now.getTime());
  const totalSec = Math.floor(diffMs / 1000);
  const cH = Math.floor(totalSec / 3600);
  const cM = Math.floor((totalSec % 3600) / 60);
  const cS = totalSec % 60;

  const gregDate = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).toUpperCase();

  return (
    <div
      className="paper-grain relative min-h-screen w-full"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, #fff3dc 0%, #fbe4c0 28%, #f7d3a0 55%, #f2c286 78%, #ecb46e 100%)",
        color: "#3a2a17",
      }}
    >
      {/* subtle top glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 0%, rgba(255,240,210,0.9), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-[440px] flex-col px-6 pt-8 pb-16">
        {/* ── Top bar ─────────────────────────── */}
        <header className="rise flex items-center justify-between">
          <button
            aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/40 backdrop-blur-md transition hover:bg-white/60"
            style={{ color: "#5a3d1c" }}
          >
            <IconMenu className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div
              className="font-serif text-[15px] tracking-[0.42em]"
              style={{ color: "#4a2f14" }}
            >
              DEEN MUSLIM
            </div>
          </div>
          <button
            aria-label="Search"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/40 backdrop-blur-md transition hover:bg-white/60"
            style={{ color: "#5a3d1c" }}
          >
            <IconSearch className="h-5 w-5" />
          </button>
        </header>

        {/* ── Hero: mosque + big countdown ────── */}
        <section className="relative mt-6 h-[360px]">
          <MosqueSilhouette className="breathe absolute inset-x-0 top-2 mx-auto h-[340px] w-full" />

          {/* crescent moon between digits */}
          <div className="pointer-events-none absolute inset-x-0 top-[70px] flex justify-center">
            <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
              <path
                d="M28 20a10 10 0 1 1-8-9.8A8 8 0 0 0 28 20Z"
                fill="#c47a1e"
                opacity="0.85"
              />
            </svg>
          </div>

          <div className="relative flex h-full flex-col items-center justify-center pt-6">
            <div
              className="tabular flex items-center gap-6 font-serif leading-none"
              style={{ color: "#3a2510", letterSpacing: "-0.04em" }}
            >
              <span className="rise text-[112px]">{toBn(pad(cH || 18))}</span>
              <span className="w-8" />
              <span className="rise text-[112px]" style={{ animationDelay: "80ms" }}>
                {toBn(pad(cM || 36))}
              </span>
            </div>

            {/* meta row */}
            <div className="mt-10 grid w-full grid-cols-2 gap-8 px-4">
              <div className="text-left">
                <div className="text-[10px] tracking-[0.32em] uppercase" style={{ color: "#8a5a20" }}>
                  Remaining Time
                </div>
                <div
                  className="tabular font-serif mt-1 text-2xl"
                  style={{ color: "#3a2510" }}
                >
                  {next.bn} {toBn(cH)}:{toBn(pad(cM))}:{toBn(pad(cS))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] tracking-[0.32em] uppercase" style={{ color: "#8a5a20" }}>
                  {gregDate}
                </div>
                <div
                  className="font-serif mt-1 text-2xl"
                  style={{ color: "#3a2510" }}
                >
                  Sylhet, Bangladesh
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick actions grid ──────────────── */}
        <section
          className="rise mt-6 rounded-[28px] p-5"
          style={{
            background: "rgba(255,247,232,0.72)",
            backdropFilter: "blur(14px)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.9) inset, 0 20px 40px -24px rgba(120,70,20,0.35)",
            animationDelay: "240ms",
          }}
        >
          <div className="grid grid-cols-3 gap-4">
            {QUICK.map(({ key, label, bn, Icon, tint }, i) => (
              <button
                key={key}
                className="group flex flex-col items-center gap-2 rounded-2xl p-3 transition hover:-translate-y-0.5"
              >
                <span
                  className="grid h-14 w-14 place-items-center rounded-2xl transition group-hover:scale-105"
                  style={{
                    background: `linear-gradient(160deg, ${tint} 0%, color-mix(in oklab, ${tint} 60%, white) 100%)`,
                    boxShadow:
                      "0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 16px -8px rgba(120,70,20,0.35)",
                    color: "#5a3d1c",
                    animationDelay: `${300 + i * 60}ms`,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <div className="text-center leading-tight">
                  <div className="text-[13px] font-medium" style={{ color: "#3a2510" }}>
                    {label}
                  </div>
                  <div className="font-bangla text-[11px]" style={{ color: "#8a5a20" }}>
                    {bn}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Prayer ledger ───────────────────── */}
        <section className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <div
              className="font-serif text-lg"
              style={{ color: "#3a2510" }}
            >
              Today's Prayers
            </div>
            <div
              className="font-bangla text-[11px] tracking-wide"
              style={{ color: "#8a5a20" }}
            >
              পাঁচ ওয়াক্ত
            </div>
          </div>

          <ul className="space-y-2">
            {todayPrayers.map((p, i) => {
              const isCurrent = i === currentIdx;
              const isPassed = p.at.getTime() < now.getTime() && !isCurrent;
              return (
                <li
                  key={p.key}
                  className="rise flex items-center justify-between rounded-2xl px-4 py-3 transition"
                  style={{
                    background: isCurrent
                      ? "linear-gradient(90deg, #f7c98a 0%, #f5b96b 100%)"
                      : "rgba(255,247,232,0.55)",
                    boxShadow: isCurrent
                      ? "0 12px 24px -14px rgba(180,110,30,0.55)"
                      : "0 1px 0 rgba(255,255,255,0.7) inset",
                    opacity: isPassed ? 0.5 : 1,
                    animationDelay: `${420 + i * 60}ms`,
                    color: "#3a2510",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-full font-serif text-sm"
                      style={{
                        background: isCurrent ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)",
                        color: "#7a4a14",
                      }}
                    >
                      {toBn(i + 1)}
                    </span>
                    <div>
                      <div className="font-serif text-lg leading-tight">{p.bn}</div>
                      <div className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "#7a4a14" }}>
                        {p.en}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-arabic text-xl" style={{ color: "#7a4a14" }}>
                      {p.ar}
                    </span>
                    <span className="tabular font-serif text-xl">
                      {toBn(p.h > 12 ? p.h - 12 : p.h)}:{toBn(pad(p.m))}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Al Quran section ────────────────── */}
        <section
          className="rise mt-8 rounded-[28px] p-5"
          style={{
            background: "rgba(255,247,232,0.78)",
            backdropFilter: "blur(14px)",
            boxShadow: "0 20px 40px -24px rgba(120,70,20,0.35)",
            animationDelay: "620ms",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="font-serif text-xl" style={{ color: "#3a2510" }}>
              Al Quran
            </div>
            <div
              className="flex rounded-full p-0.5 text-[11px]"
              style={{ background: "rgba(120,70,20,0.08)" }}
            >
              {["Surah", "Juz", "Page"].map((t, i) => (
                <button
                  key={t}
                  className="rounded-full px-3 py-1 transition"
                  style={{
                    background: i === 0 ? "#f5b96b" : "transparent",
                    color: i === 0 ? "#3a2510" : "#7a4a14",
                    fontWeight: i === 0 ? 600 : 500,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Last read card */}
          <div
            className="mb-4 flex items-center justify-between rounded-2xl px-4 py-3"
            style={{
              background: "linear-gradient(100deg, #f7c98a 0%, #f5b96b 100%)",
              color: "#3a2510",
            }}
          >
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#7a4a14" }}>
                Last Read
              </div>
              <div className="font-serif mt-0.5 text-2xl italic">Al-Fatiah</div>
              <div className="text-[11px]" style={{ color: "#7a4a14" }}>
                Ayah No: 1
              </div>
            </div>
            <span className="font-arabic text-3xl" style={{ color: "#7a4a14" }}>
              الفاتحة
            </span>
          </div>

          <ul className="divide-y" style={{ borderColor: "rgba(120,70,20,0.12)" }}>
            {SURAHS.map((s) => (
              <li
                key={s.no}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="tabular font-serif w-8 text-sm"
                    style={{ color: "#8a5a20" }}
                  >
                    {String(s.no).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="font-serif text-lg" style={{ color: "#3a2510" }}>
                      {s.en}
                    </div>
                    <div className="text-[11px]" style={{ color: "#8a5a20" }}>
                      {s.ayahs} Ayahs
                    </div>
                  </div>
                </div>
                <span className="font-arabic text-2xl" style={{ color: "#7a4a14" }}>
                  {s.ar}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Footer ──────────────────────────── */}
        <footer
          className="mt-10 text-center text-[10px] tracking-[0.32em] uppercase"
          style={{ color: "#8a5a20" }}
        >
          Salat OS · Deen Muslim · Vol. I
        </footer>
      </div>
    </div>
  );
}
