import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/salat")({
  head: () => ({
    meta: [
      { title: "Salat OS — নামাজের সময়সূচি" },
      {
        name: "description",
        content:
          "বাংলা-ফার্স্ট, ডিজাইন-ফরওয়ার্ড প্রেয়ার টাইমস অ্যাপ। শান্ত, এলিগ্যান্ট, অফলাইন-ফার্স্ট।",
      },
    ],
  }),
  component: SalatHome,
});

/* ---------- helpers ---------- */

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBn = (s: string | number) =>
  String(s).replace(/\d/g, (d) => bnDigits[Number(d)]);

type Prayer = {
  key: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  bn: string;
  ar: string;
  en: string;
  h: number;
  m: number;
};

const PRAYERS: Prayer[] = [
  { key: "fajr",    bn: "ফজর",     ar: "الفجر",    en: "Dawn",     h: 4,  m: 32 },
  { key: "dhuhr",   bn: "যোহর",    ar: "الظهر",    en: "Noon",     h: 12, m: 4  },
  { key: "asr",     bn: "আসর",     ar: "العصر",    en: "Afternoon",h: 16, m: 28 },
  { key: "maghrib", bn: "মাগরিব",  ar: "المغرب",   en: "Sunset",   h: 18, m: 42 },
  { key: "isha",    bn: "এশা",     ar: "العشاء",   en: "Night",    h: 20, m: 5  },
];

const fmtTime = (h: number, m: number) => {
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${toBn(hh)}:${toBn(String(m).padStart(2, "0"))}`;
};

const fmtDiff = (ms: number) => {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${toBn(m)} মিনিট`;
  return `${toBn(h)} ঘণ্টা ${toBn(m)} মিনিট`;
};

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/* ---------- ornaments ---------- */

function Ornament({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 240 20"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      aria-hidden
    >
      <line x1="0" y1="10" x2="100" y2="10" />
      <line x1="140" y1="10" x2="240" y2="10" />
      <g transform="translate(120 10)">
        <circle r="6" />
        <circle r="2.4" fill="currentColor" stroke="none" />
        <line x1="-14" y1="0" x2="-8" y2="0" />
        <line x1="8" y1="0" x2="14" y2="0" />
        <path d="M 0 -10 L 3 -6 L 0 -2 L -3 -6 Z" />
        <path d="M 0 10 L 3 6 L 0 2 L -3 6 Z" />
      </g>
    </svg>
  );
}


function CornerMark({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="0.6" aria-hidden>
      <path d="M0 20 L0 0 L20 0" />
      <path d="M8 0 L8 8 L0 8" opacity="0.5" />
      <circle cx="14" cy="14" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}


function Mihrab({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 400 520" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="mgold" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M 40 520 L 40 200 Q 40 40 200 40 Q 360 40 360 200 L 360 520"
        stroke="url(#mgold)"
        strokeWidth="0.8"
      />
      <path
        d="M 70 520 L 70 210 Q 70 70 200 70 Q 330 70 330 210 L 330 520"
        stroke="currentColor"
        strokeOpacity="0.14"
        strokeWidth="0.6"
      />
      <path
        d="M 200 40 L 200 90 M 180 60 L 220 60"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="0.6"
      />
    </svg>
  );
}

/* ---------- progress arc ---------- */

function ProgressArc({ progress }: { progress: number }) {
  // progress: 0 → 1
  const R = 46;
  const C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24">
      <circle cx="60" cy="60" r={R} stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" fill="none" />
      <circle
        cx="60"
        cy="60"
        r={R}
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - progress)}
        transform="rotate(-90 60 60)"
        style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
      <circle cx="60" cy="14" r="2" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

/* ---------- component ---------- */

function SalatHome() {
  const now = useNow(1000);

  const todayPrayers = useMemo(
    () =>
      PRAYERS.map((p) => {
        const d = new Date(now);
        d.setHours(p.h, p.m, 0, 0);
        return { ...p, at: d };
      }),
    // recompute per minute for the "at" timestamps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [now.getMinutes(), now.getHours(), now.getDate()],
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

  // progress from previous prayer → next
  const prev = currentIdx >= 0 ? todayPrayers[currentIdx] : null;
  const window =
    (next.at.getTime() - (prev ? prev.at.getTime() : now.getTime() - 3600000)) || 1;
  const elapsed = now.getTime() - (prev ? prev.at.getTime() : now.getTime());
  const progress = Math.max(0, Math.min(1, elapsed / window));

  const nowH = now.getHours();
  const nowM = now.getMinutes();
  const nowS = now.getSeconds();
  const clock = fmtTime(nowH === 0 ? 12 : nowH, nowM);
  const meridiem = nowH < 12 ? "AM" : "PM";

  const hijri = "১৫ জমাদিউস সানী ১৪৪৭";
  const greg = now.toLocaleDateString("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className="paper-grain relative min-h-screen overflow-hidden"
      style={{ background: "var(--paper)", color: "var(--ink)" }}
    >
      {/* Ambient mihrab silhouette */}
      <Mihrab
        className="breathe pointer-events-none absolute top-0 left-1/2 h-[92vh] w-[min(90vw,720px)] -translate-x-1/2 opacity-60"
        // gold tint
        // @ts-expect-error inline style
        style={{ color: "var(--gold)" }}
      />

      {/* Corner marks */}
      <CornerMark className="absolute top-6 left-6 h-8 w-8 opacity-40" style={{ color: "var(--gold)" } as any} />
      <CornerMark className="absolute top-6 right-6 h-8 w-8 -scale-x-100 opacity-40" style={{ color: "var(--gold)" } as any} />
      <CornerMark className="absolute bottom-6 left-6 h-8 w-8 -scale-y-100 opacity-40" style={{ color: "var(--gold)" } as any} />
      <CornerMark className="absolute right-6 bottom-6 h-8 w-8 -scale-100 opacity-40" style={{ color: "var(--gold)" } as any} />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-8 pt-12 pb-14 md:px-16 md:pt-16">
        {/* ── Masthead ─────────────────────────────────────────────── */}
        <header className="rise grid grid-cols-3 items-center gap-6 text-[12px]">
          <div className="font-bangla" style={{ color: "var(--muted-foreground)" }}>
            <div className="text-[10px] tracking-[0.28em] uppercase shimmer" style={{ color: "var(--gold)" }}>
              Est. MMXXVI
            </div>
            <div className="mt-1.5">{hijri}</div>
          </div>

          <div className="text-center">
            <div
              className="gold-text font-serif text-2xl tracking-[0.22em] italic md:text-[26px]"
              style={{ letterSpacing: "0.28em" }}
            >
              Salat &nbsp;OS
            </div>
            <div
              className="mt-1 text-[10px] tracking-[0.32em] uppercase"
              style={{ color: "var(--muted-foreground)" }}
            >
              Vol. I · No. 001
            </div>
          </div>

          <div
            className="font-bangla text-right"
            style={{ color: "var(--muted-foreground)" }}
          >
            <div className="text-[10px] tracking-[0.28em] uppercase" style={{ color: "var(--gold)" }}>
              Dhaka · 23.81°N
            </div>
            <div className="mt-1.5">{greg}</div>
          </div>
        </header>

        <div className="rise mt-8 flex justify-center" style={{ color: "var(--gold)", animationDelay: "120ms" }}>
          <Ornament className="h-4 w-64 opacity-70" />
        </div>

        {/* ── Hero clock ──────────────────────────────────────────── */}
        <section className="mt-16 text-center md:mt-20">
          <div
            className="rise text-[10px] tracking-[0.4em] uppercase"
            style={{ color: "var(--muted-foreground)", animationDelay: "200ms" }}
          >
            The Present Hour
          </div>
          <div
            className="rise tabular font-serif mt-4 leading-none tracking-[-0.04em]"
            style={{ animationDelay: "280ms" }}
          >
            <span className="text-[128px] md:text-[184px]">{clock}</span>
            <span
              className="ml-4 align-top text-[22px] tracking-[0.24em] md:text-[28px]"
              style={{ color: "var(--gold)" }}
            >
              {meridiem}
            </span>
          </div>
          <div
            className="rise tabular mt-3 text-[11px] tracking-[0.3em] uppercase"
            style={{ color: "var(--muted-foreground)", animationDelay: "340ms" }}
          >
            {toBn(String(nowS).padStart(2, "0"))} sec · local mean time
          </div>
        </section>

        {/* ── Next prayer feature ─────────────────────────────────── */}
        <section
          className="rise relative mt-20 grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_auto_1fr]"
          style={{ animationDelay: "420ms" }}
        >
          {/* Left: label */}
          <div className="text-center md:text-right">
            <div
              className="text-[10px] tracking-[0.4em] uppercase"
              style={{ color: "var(--gold)" }}
            >
              Awaiting
            </div>
            <div className="font-serif mt-3 text-6xl leading-[0.95] tracking-tight md:text-7xl">
              {next.bn}
            </div>
            <div
              className="font-arabic mt-4 text-4xl md:text-5xl"
              style={{ color: "var(--gold)" }}
            >
              {next.ar}
            </div>
            <div
              className="mt-3 font-serif text-sm italic tracking-wide"
              style={{ color: "var(--muted-foreground)" }}
            >
              — the {next.en.toLowerCase()} prayer
            </div>
          </div>

          {/* Center: arc + countdown */}
          <div className="relative flex flex-col items-center" style={{ color: "var(--gold)" }}>
            <ProgressArc progress={progress} />
            <div
              className="tabular font-serif absolute inset-0 flex items-center justify-center text-xl"
              style={{ color: "var(--ink)" }}
            >
              {toBn(Math.round(progress * 100))}
              <span className="ml-0.5 text-xs opacity-60">%</span>
            </div>
          </div>

          {/* Right: time */}
          <div className="text-center md:text-left">
            <div
              className="tabular gold-text font-serif text-5xl tracking-tight md:text-6xl"
            >
              {fmtTime(next.h, next.m)}
            </div>
            <div
              className="font-bangla mt-3 text-sm tracking-wide"
              style={{ color: "var(--muted-foreground)" }}
            >
              বাকি রয়েছে
            </div>
            <div
              className="tabular font-serif mt-1 text-2xl italic"
              style={{ color: "var(--ink)" }}
            >
              {fmtDiff(next.at.getTime() - now.getTime())}
            </div>
          </div>
        </section>

        {/* ── Prayer schedule (magazine ledger) ───────────────────── */}
        <section className="mt-24">
          <div className="rise mb-8 flex items-baseline justify-between">
            <div
              className="text-[10px] tracking-[0.4em] uppercase"
              style={{ color: "var(--muted-foreground)" }}
            >
              The Day's Ledger
            </div>
            <div
              className="font-serif text-sm italic"
              style={{ color: "var(--muted-foreground)" }}
            >
              five appointments with the divine
            </div>
          </div>

          <ul>
            {todayPrayers.map((p, i) => {
              const isCurrent = i === currentIdx;
              const isPassed = p.at.getTime() < now.getTime() && !isCurrent;
              return (
                <li
                  key={p.key}
                  className="rise group relative grid grid-cols-[auto_1fr_auto] items-center gap-6 border-t py-6 md:gap-10 md:py-7"
                  style={{
                    animationDelay: `${520 + i * 80}ms`,
                    borderColor: "var(--rule)",
                    borderBottomWidth: i === todayPrayers.length - 1 ? 1 : 0,
                    opacity: isPassed ? 0.38 : 1,
                  }}
                >
                  {isCurrent && (
                    <>
                      <span
                        aria-hidden
                        className="shimmer absolute top-1/2 left-[-24px] h-10 w-[3px] -translate-y-1/2 md:left-[-36px]"
                        style={{ background: "var(--gold)" }}
                      />
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-[2px]"
                        style={{ background: "var(--gold)" }}
                      />
                    </>
                  )}

                  {/* Roman numeral */}
                  <span
                    className="tabular font-serif w-10 text-lg italic"
                    style={{ color: isCurrent ? "var(--gold)" : "var(--muted-foreground)" }}
                  >
                    {["I", "II", "III", "IV", "V"][i]}
                  </span>

                  <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                    <span className="font-serif text-3xl tracking-tight md:text-[34px]">
                      {p.bn}
                    </span>
                    <span
                      className="font-arabic text-xl md:text-2xl"
                      style={{ color: "var(--gold)" }}
                    >
                      {p.ar}
                    </span>
                    <span
                      className="text-[10px] tracking-[0.32em] uppercase"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      · {p.en}
                    </span>
                  </div>

                  <span
                    className="tabular font-serif text-3xl tracking-tight md:text-4xl"
                    style={{
                      color: isCurrent ? "var(--gold)" : "var(--ink)",
                    }}
                  >
                    {fmtTime(p.h, p.m)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Ayah quote ──────────────────────────────────────────── */}
        <section className="rise mt-24" style={{ animationDelay: "900ms" }}>
          <div className="flex justify-center" style={{ color: "var(--gold)" }}>
            <Ornament className="h-4 w-56 opacity-70" />
          </div>
          <blockquote className="mx-auto mt-10 max-w-2xl text-center">
            <p
              className="font-arabic text-3xl leading-[2] md:text-[36px]"
              style={{ color: "var(--ink)" }}
            >
              إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا
            </p>
            <p
              className="font-serif mt-6 text-lg italic tracking-wide md:text-xl"
              style={{ color: "var(--muted-foreground)" }}
            >
              "Indeed, prayer has been decreed upon the believers a decree of specified times."
            </p>
            <footer
              className="mt-4 text-[10px] tracking-[0.4em] uppercase"
              style={{ color: "var(--gold)" }}
            >
              An-Nisāʾ · ৪:১০৩
            </footer>
          </blockquote>
        </section>

        {/* ── Colophon ────────────────────────────────────────────── */}
        <footer
          className="mt-auto grid grid-cols-3 items-end gap-4 pt-24 text-[10px] tracking-[0.32em] uppercase"
          style={{ color: "var(--muted-foreground)" }}
        >
          <div>Set in Instrument · Amiri · Hind</div>
          <div className="text-center" style={{ color: "var(--gold)" }}>
            ✦ Salat OS ✦
          </div>
          <div className="text-right">Phase I · Design Preview</div>
        </footer>
      </div>
    </div>
  );
}
