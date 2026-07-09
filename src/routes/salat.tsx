import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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

/* ---------- helpers (Phase 1 — hardcoded Dhaka) ---------- */

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBn = (s: string | number) =>
  String(s).replace(/\d/g, (d) => bnDigits[Number(d)]);

type Prayer = {
  key: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  bn: string;
  ar: string;
  h: number; // 24h
  m: number;
};

// Hardcoded Dhaka times (Phase 1 placeholder — real engine in Phase 2)
const PRAYERS: Prayer[] = [
  { key: "fajr",    bn: "ফজর",     ar: "الفجر",    h: 4,  m: 32 },
  { key: "dhuhr",   bn: "যোহর",    ar: "الظهر",    h: 12, m: 4  },
  { key: "asr",     bn: "আসর",     ar: "العصر",    h: 16, m: 28 },
  { key: "maghrib", bn: "মাগরিব",  ar: "المغرب",   h: 18, m: 42 },
  { key: "isha",    bn: "এশা",     ar: "العشاء",   h: 20, m: 5  },
];

const fmtTime = (h: number, m: number) => {
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${toBn(hh)}:${toBn(String(m).padStart(2, "0"))}`;
};

const fmtDiff = (ms: number) => {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${toBn(m)} মিনিট বাকি`;
  return `${toBn(h)} ঘণ্টা ${toBn(m)} মিনিট বাকি`;
};

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/* ---------- component ---------- */

function SalatHome() {
  const now = useNow(1000);

  const todayPrayers = PRAYERS.map((p) => {
    const d = new Date(now);
    d.setHours(p.h, p.m, 0, 0);
    return { ...p, at: d };
  });

  // Determine current / next
  const next = todayPrayers.find((p) => p.at.getTime() > now.getTime()) ?? {
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

  const nowH = now.getHours();
  const nowM = now.getMinutes();
  const clock = fmtTime(nowH === 0 ? 12 : nowH, nowM);
  const meridiem = nowH < 12 ? "AM" : "PM";

  // Hijri (static Phase 1)
  const hijri = "১৫ জমাদিউস সানী ১৪৪৭";
  const greg = now.toLocaleDateString("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--paper)", color: "var(--ink)" }}
    >
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 pt-10 pb-16 md:px-10 md:pt-14">
        {/* Top meta */}
        <header className="flex items-start justify-between text-[13px]">
          <div className="rise" style={{ animationDelay: "0ms" }}>
            <div
              className="font-bangla tracking-wide"
              style={{ color: "var(--muted-foreground)" }}
            >
              {hijri}
            </div>
            <div
              className="mt-1 text-[11px] uppercase tracking-[0.22em]"
              style={{ color: "var(--gold)" }}
            >
              Salat OS
            </div>
          </div>
          <div
            className="text-right font-bangla"
            style={{ color: "var(--muted-foreground)" }}
          >
            <div>{greg}</div>
            <div className="mt-1 text-[12px]">ঢাকা, বাংলাদেশ</div>
          </div>
        </header>

        {/* Clock */}
        <section className="mt-16 md:mt-24">
          <div
            className="rise font-serif tabular text-[96px] leading-none tracking-[-0.03em] md:text-[128px]"
            style={{ animationDelay: "120ms", color: "var(--ink)" }}
          >
            {clock}
            <span
              className="ml-4 align-top text-[22px] tracking-[0.18em] md:text-[26px]"
              style={{ color: "var(--muted-foreground)" }}
            >
              {meridiem}
            </span>
          </div>
        </section>

        {/* Next prayer card */}
        <section
          className="rise mt-10 border-t pt-8"
          style={{ animationDelay: "240ms", borderColor: "var(--rule)" }}
        >
          <div
            className="mb-3 text-[11px] uppercase tracking-[0.24em]"
            style={{ color: "var(--gold)" }}
          >
            পরবর্তী নামাজ
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-6">
            <div>
              <div className="font-serif text-5xl leading-none tracking-tight md:text-6xl">
                {next.bn}
              </div>
              <div
                className="font-arabic mt-3 text-3xl md:text-[34px]"
                style={{ color: "var(--muted-foreground)" }}
              >
                {next.ar}
              </div>
            </div>
            <div className="text-right">
              <div
                className="tabular font-serif text-4xl tracking-tight md:text-5xl"
                style={{ color: "var(--gold)" }}
              >
                {fmtTime(next.h, next.m)}
              </div>
              <div
                className="mt-2 font-bangla text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                {fmtDiff(next.at.getTime() - now.getTime())}
              </div>
            </div>
          </div>
        </section>

        {/* Prayer list */}
        <section className="mt-14">
          <div
            className="mb-5 text-[11px] uppercase tracking-[0.24em]"
            style={{ color: "var(--muted-foreground)" }}
          >
            আজকের সময়সূচি
          </div>
          <ul className="divide-y" style={{ borderColor: "var(--rule)" }}>
            {todayPrayers.map((p, i) => {
              const isCurrent = i === currentIdx;
              const isPassed = p.at.getTime() < now.getTime() && !isCurrent;
              return (
                <li
                  key={p.key}
                  className="rise relative flex items-center justify-between py-5"
                  style={{
                    animationDelay: `${360 + i * 90}ms`,
                    borderColor: "var(--rule)",
                    borderTopWidth: i === 0 ? 1 : 0,
                    borderBottomWidth: 1,
                    borderStyle: "solid",
                    opacity: isPassed ? 0.42 : 1,
                  }}
                >
                  {isCurrent && (
                    <span
                      aria-hidden
                      className="absolute top-1/2 left-[-14px] h-8 w-[2px] -translate-y-1/2 md:left-[-20px]"
                      style={{ background: "var(--gold)" }}
                    />
                  )}
                  <div className="flex items-baseline gap-5">
                    <span
                      className="tabular w-8 text-[13px]"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {toBn(i + 1).padStart(1)}
                    </span>
                    <span className="font-serif text-2xl tracking-tight">
                      {p.bn}
                    </span>
                    <span
                      className="font-arabic hidden text-lg md:inline"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {p.ar}
                    </span>
                  </div>
                  <span
                    className="tabular font-serif text-2xl tracking-tight"
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

        {/* Footer note */}
        <footer
          className="mt-auto pt-16 text-center text-[11px] tracking-[0.22em] uppercase"
          style={{ color: "var(--muted-foreground)" }}
        >
          Phase 1 · Design preview
        </footer>
      </div>
    </div>
  );
}
