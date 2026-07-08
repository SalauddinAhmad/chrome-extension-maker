import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes } from "adhan";

export const Route = createFileRoute("/newtab-preview")({
  head: () => ({
    meta: [
      { title: "নতুন ট্যাব ডিজাইন প্রিভিউ — Durud Reminder" },
      {
        name: "description",
        content:
          "Durud Reminder Chrome এক্সটেনশনের প্রস্তাবিত নতুন ট্যাব ডিজাইন প্রিভিউ।",
      },
      { property: "og:title", content: "নতুন ট্যাব ডিজাইন প্রিভিউ" },
      {
        property: "og:description",
        content: "প্রস্তাবিত premium নতুন ট্যাব ডিজাইন।",
      },
    ],
  }),
  component: NewTabPreview,
});

const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

const bnMonths = [
  "জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন",
  "জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর",
];
const bnDays = [
  "রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার",
];

const sampleDurud = {
  name: "দুরুদে ইব্রাহিম",
  arabic:
    "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
  reference: "সহীহ বুখারী – ৩৩৭০",
};


const PRAYER_LABELS: Record<string, { bn: string; en: string }> = {
  fajr: { bn: "ফজর", en: "Fajr" },
  sunrise: { bn: "সূর্যোদয়", en: "Sunrise" },
  dhuhr: { bn: "যোহর", en: "Dhuhr" },
  asr: { bn: "আসর", en: "Asr" },
  maghrib: { bn: "মাগরিব", en: "Maghrib" },
  isha: { bn: "ইশা", en: "Isha" },
};
const PRAYER_ORDER = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;

function fmtTime(d: Date) {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return { hm: `${h}:${m}`, ap };
}
function fmtCountdown(ms: number) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function NewTabPreview() {
  const [now, setNow] = useState(new Date());
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Dhaka coordinates — Karachi method fits South Asia well
  const prayers = useMemo(() => {
    const coords = new Coordinates(23.8103, 90.4125);
    const params = CalculationMethod.Karachi();
    const today = new PrayerTimes(coords, now, params);
    const tomorrow = new PrayerTimes(
      coords,
      new Date(now.getTime() + 24 * 3600 * 1000),
      params,
    );
    const sunnah = new SunnahTimes(today);
    const list = PRAYER_ORDER.map((k) => ({
      key: k,
      time: (today as any)[k] as Date,
    }));
    // Find next prayer
    let nextKey: string = "fajr";
    let nextTime: Date = tomorrow.fajr;
    for (const p of list) {
      if (p.time > now) {
        nextKey = p.key;
        nextTime = p.time;
        break;
      }
    }
    let currentKey: string = "isha";
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].time <= now) {
        currentKey = list[i].key;
        break;
      }
    }
    return { list, nextKey, nextTime, currentKey, sunnah };
  }, [now]);

  const toggleAdhan = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const dateStr = `${bnDays[now.getDay()]} · ${toBn(now.getDate())} ${bnMonths[now.getMonth()]} ${toBn(now.getFullYear())}`;
  const h = now.getHours() % 12 || 12;
  const m = String(now.getMinutes()).padStart(2, "0");
  const ap = now.getHours() >= 12 ? "pm" : "am";

  return (
    <div className="min-h-screen" style={{ background: "#eef3ea" }}>
      {/* Top nav */}
      <div className="border-b" style={{ background: "#ffffff", borderColor: "#dae5d3" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-sm hover:underline" style={{ color: "#3d5638" }}>
            ← ল্যান্ডিং পেজে ফিরে যান
          </Link>
          <div className="text-xs" style={{ color: "#6b7a68" }}>
            নতুন ট্যাব প্রিভিউ · সবুজ মিস্ট থিম
          </div>
        </div>
      </div>

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-6 pt-10 pb-6 text-center">
        <h1
          className="text-3xl md:text-5xl mb-3"
          style={{
            fontFamily: '"Fraunces", serif',
            fontWeight: 700,
            color: "#1c2a20",
            letterSpacing: "-0.02em",
          }}
        >
          Durud Reminder — নতুন ট্যাব
        </h1>
        <p
          className="text-base"
          style={{
            fontFamily: '"Tiro Bangla", serif',
            color: "#5f7a5b",
            lineHeight: 1.7,
          }}
        >
          পাহাড়, মেঘ ও প্রশান্ত সবুজে সাজানো একটি ধ্যানের মতো নতুন ট্যাব —
          সময়, তারিখ, পরবর্তী দুরুদ ও দৈনিক অগ্রগতি এক দৃষ্টিতে।
        </p>
      </section>

      {/* Browser mockup */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "#ffffff",
            border: "1px solid #dae5d3",
            boxShadow: "0 25px 70px rgba(61, 86, 56, 0.18)",
          }}
        >
          {/* Fake browser chrome */}
          <div
            className="flex items-center gap-3 px-4 py-2 border-b"
            style={{ background: "#f4f7f1", borderColor: "#dae5d3" }}
          >
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
            </div>
            <div
              className="ml-2 px-3 py-1 rounded-t-md text-xs flex items-center gap-2"
              style={{ background: "#ffffff", border: "1px solid #dae5d3", borderBottom: "none", color: "#3d5638" }}
            >
              <span className="w-3 h-3 rounded-sm" style={{ background: "#7a9576" }} />
              Durud Reminder
              <span style={{ color: "#a8b5a4" }}>×</span>
            </div>
            <div
              className="flex-1 mx-3 px-4 py-1.5 rounded-full text-xs"
              style={{ background: "#ffffff", border: "1px solid #dae5d3", color: "#8fa389" }}
            >
              🔍 Search Google or type a URL
            </div>
          </div>

          {/* The actual new tab UI — misty sage aesthetic */}
          <div
            className="relative overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, #eef3ea 0%, #e4ecdf 55%, #dae5d3 100%)",
              minHeight: 640,
            }}
          >
            {/* Header decor (clouds / birds / sparkles from provided SVG) */}
            <img
              src="/pattern.svg"
              alt=""
              aria-hidden
              className="absolute top-0 left-0 w-full pointer-events-none select-none"
              style={{ opacity: 0.9, height: "auto", maxHeight: 260, objectFit: "cover", objectPosition: "top" }}
            />

            {/* Footer decor (mountains / grass from provided SVG) */}
            <img
              src="/footer-bg.svg"
              alt=""
              aria-hidden
              className="absolute bottom-0 left-0 w-full pointer-events-none select-none"
              style={{ opacity: 0.95, height: "auto", maxHeight: 220, objectFit: "cover", objectPosition: "bottom" }}
            />


            {/* Settings gear top-right */}
            <div className="absolute top-4 right-6" style={{ color: "#5f7a5b" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>

            <div className="relative px-8 pt-14 pb-32 max-w-5xl mx-auto">
              {/* Big time — 12.23 pm */}
              <div className="text-center mb-10">
                <div
                  style={{
                    fontFamily: '"Big Shoulders Text", "Fraunces", serif',
                    fontSize: 108,
                    fontWeight: 700,
                    color: "#1c2a20",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {h}
                  <span>.</span>
                  {m}
                  <span
                    style={{
                      fontSize: 22,
                      marginLeft: 6,
                      color: "#5f7a5b",
                      letterSpacing: "0.05em",
                      fontWeight: 500,
                    }}
                  >
                    {ap}
                  </span>
                </div>
              </div>

              {/* 2x2 card grid — matches reference exactly */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Location + Hijri card */}
                <div
                  className="relative rounded-2xl p-6 overflow-hidden"
                  style={{
                    background: "rgba(214,225,207,0.55)",
                    border: "1px solid rgba(122,149,118,0.2)",
                    minHeight: 170,
                  }}
                >
                  {/* mosque silhouette */}
                  <svg
                    className="absolute bottom-0 right-0"
                    width="220"
                    height="95"
                    viewBox="0 0 220 95"
                    fill="#b8ccb2"
                    opacity="0.55"
                    aria-hidden
                  >
                    <path d="M0 95 L0 72 L28 72 L28 55 Q28 42 40 42 Q52 42 52 55 L52 72 L74 72 L74 50 Q74 30 96 22 Q102 8 108 22 Q130 30 130 50 L130 72 L152 72 L152 55 Q152 42 164 42 Q176 42 176 55 L176 72 L220 72 L220 95 Z" />
                    <circle cx="102" cy="14" r="2.5" />
                  </svg>
                  {/* small birds */}
                  <svg className="absolute top-4 right-8" width="60" height="20" viewBox="0 0 60 20" stroke="#5f7a5b" strokeWidth="1.4" fill="none" strokeLinecap="round" aria-hidden>
                    <path d="M4 12 q4 -6 8 0 q4 -6 8 0" />
                    <path d="M28 6 q3 -4 6 0 q3 -4 6 0" opacity="0.7" />
                  </svg>

                  <div className="flex items-center gap-3 mb-4 relative">
                    <div className="w-10 h-10 rounded-full grid place-items-center" style={{ background: "rgba(255,255,255,0.7)", color: "#3d5638" }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 21s-7-6-7-12a7 7 0 1 1 14 0c0 6-7 12-7 12z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#6b7a68", fontFamily: '"Poppins", sans-serif' }}>Location</div>
                      <div style={{ fontSize: 15, color: "#1c2a20", fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>Dhaka, Bangladesh</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 relative">
                    <div className="w-10 h-10 rounded-full grid place-items-center" style={{ background: "rgba(255,255,255,0.7)", color: "#3d5638" }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M3 10h18M8 2v4M16 2v4" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#6b7a68", fontFamily: '"Poppins", sans-serif' }}>
                        {now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div style={{ fontSize: 15, color: "#1c2a20", fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>Sha'bān 21, 1446 AH</div>
                    </div>
                  </div>
                </div>

                {/* Prayer ring + list */}
                <div
                  className="rounded-2xl p-5 flex items-center gap-4"
                  style={{
                    background: "rgba(214,225,207,0.55)",
                    border: "1px solid rgba(122,149,118,0.2)",
                    minHeight: 170,
                  }}
                >
                  {/* Ring */}
                  <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r="60" stroke="rgba(122,149,118,0.3)" strokeWidth="6" fill="none" />
                      <circle
                        cx="70" cy="70" r="60"
                        stroke="#3d5638" strokeWidth="6" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={(() => {
                          const total = prayers.nextTime.getTime() - (prayers as any).currentStart?.getTime?.() || 6 * 3600 * 1000;
                          const remain = prayers.nextTime.getTime() - now.getTime();
                          const p = Math.max(0, Math.min(1, 1 - remain / total));
                          return 2 * Math.PI * 60 * (1 - p);
                        })()}
                        transform="rotate(-90 70 70)"
                      />
                      <circle cx="70" cy="10" r="5" fill="#ffffff" stroke="#3d5638" strokeWidth="2" />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div style={{ fontSize: 16, color: "#1c2a20", fontFamily: '"Poppins", sans-serif', fontWeight: 700 }}>
                          {PRAYER_LABELS[prayers.currentKey].en}
                        </div>
                        <div style={{ fontSize: 10, color: "#6b7a68", fontFamily: '"Poppins", sans-serif', marginTop: 3, letterSpacing: "0.02em" }}>Remaining Time</div>
                        <div style={{ fontSize: 14, color: "#3d5638", fontFamily: '"Poppins", sans-serif', fontWeight: 600, marginTop: 3 }}>
                          {fmtCountdown(prayers.nextTime.getTime() - now.getTime())}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Prayer list */}
                  <div className="flex-1 rounded-xl overflow-hidden">
                    {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((k) => {
                      const p = prayers.list.find((x) => x.key === k)!;
                      const isNext = k === prayers.nextKey;
                      const t = fmtTime(p.time);
                      return (
                        <div
                          key={k}
                          className="flex items-center justify-between px-3.5 py-1.5"
                          style={{
                            background: isNext ? "#3d5638" : "transparent",
                            color: isNext ? "#ffffff" : "#5a6b57",
                            borderRadius: isNext ? 8 : 0,
                            fontFamily: '"Poppins", sans-serif',
                            fontSize: 12,
                            fontWeight: isNext ? 600 : 500,
                            opacity: isNext ? 1 : 0.85,
                            marginBottom: 2,
                          }}
                        >
                          <span>{PRAYER_LABELS[k].en}</span>
                          <span style={{ opacity: isNext ? 1 : 0.75 }}>
                            {t.hm} {t.ap}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick action icons */}
                <div
                  className="rounded-2xl p-6 flex items-center justify-around"
                  style={{
                    background: "rgba(214,225,207,0.55)",
                    border: "1px solid rgba(122,149,118,0.2)",
                    minHeight: 130,
                  }}
                >
                  {[
                    {
                      label: "Quran Mazid",
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M4 4h9a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4z" />
                          <path d="M4 16a4 4 0 0 1 4-4h9" />
                        </svg>
                      ),
                    },
                    {
                      label: "Al Hadith",
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M12 3v18M5 7c2 0 5 1 7 2 2-1 5-2 7-2v11c-2 0-5 1-7 2-2-1-5-2-7-2V7z" />
                        </svg>
                      ),
                    },
                    {
                      label: "Dua Ruqyah",
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M9 11V6a2 2 0 1 1 4 0v5" />
                          <path d="M13 11V4a2 2 0 1 1 4 0v9" />
                          <path d="M17 12V7a2 2 0 1 1 4 0v9a6 6 0 0 1-6 6h-2a6 6 0 0 1-5.2-3l-3.3-5.7a2 2 0 0 1 3.4-2L9 13" />
                        </svg>
                      ),
                    },
                  ].map((a) => (
                    <div key={a.label} className="text-center">
                      <div
                        className="w-12 h-12 rounded-full grid place-items-center mx-auto mb-2"
                        style={{ background: "rgba(255,255,255,0.7)", color: "#3d5638" }}
                      >
                        {a.icon}
                      </div>
                      <div style={{ fontSize: 12, color: "#3d5638", fontFamily: '"Poppins", sans-serif', fontWeight: 500 }}>
                        {a.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Remaining Fasting Time */}
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: "rgba(214,225,207,0.55)",
                    border: "1px solid rgba(122,149,118,0.2)",
                    minHeight: 130,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: 12, color: "#5a6b57", fontFamily: '"Poppins", sans-serif' }}>Remaining Fasting Time</span>
                    <span style={{ fontSize: 12, color: "#3d5638", fontFamily: '"Poppins", sans-serif', fontWeight: 700 }}>
                      {(() => {
                        const iftar = prayers.list.find((x) => x.key === "maghrib")!.time.getTime();
                        return fmtCountdown(iftar - now.getTime());
                      })()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: "rgba(122,149,118,0.25)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: (() => {
                          const suhoor = prayers.list.find((x) => x.key === "fajr")!.time.getTime();
                          const iftar = prayers.list.find((x) => x.key === "maghrib")!.time.getTime();
                          const nowMs = now.getTime();
                          if (nowMs <= suhoor || nowMs >= iftar) return "0%";
                          return `${Math.min(100, Math.max(0, ((nowMs - suhoor) / (iftar - suhoor)) * 100))}%`;
                        })(),
                        background: "linear-gradient(90deg, #7a9576 0%, #3d5638 100%)",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-around">
                    {[
                      { label: "Suhoor", time: prayers.list.find((x) => x.key === "fajr")!.time, icon: "☾" },
                      { label: "Iftar", time: prayers.list.find((x) => x.key === "maghrib")!.time, icon: "☀" },
                    ].map((a) => {
                      const t = fmtTime(a.time);
                      return (
                        <div key={a.label} className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(255,255,255,0.7)", color: "#3d5638", fontSize: 14 }}>
                            {a.icon}
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: "#5a6b57", fontFamily: '"Poppins", sans-serif' }}>{a.label}</div>
                            <div style={{ fontSize: 13, color: "#1c2a20", fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                              {t.hm} {t.ap}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Hidden adhan audio (kept for reuse) */}
              <audio ref={audioRef} src="/adhan.mp3" onEnded={() => setPlaying(false)} preload="none" />
              {/* suppress unused warnings */}
              <span className="hidden">{playing ? "" : ""}{toggleAdhan.name}{sampleDurud.name}{dateStr}</span>
            </div>
          </div>
        </div>


        {/* Feature callouts */}
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {[
            { t: "মিস্ট সবুজ থিম", d: "পাহাড়, মেঘ, পাখি ও ঝিকিমিকি — চোখে প্রশান্তি।" },
            { t: "লাইভ ঘড়ি ও Hijri", d: "বাংলা সময় + শা'বান/রমজান সহ ইসলামিক তারিখ।" },
            { t: "পরবর্তী দুরুদ ও অগ্রগতি", d: "রিং কাউন্টডাউন, আপকামিং লিস্ট এবং দৈনিক প্রগ্রেস।" },
          ].map((f) => (
            <div key={f.t} className="p-5 rounded-xl" style={{ background: "#ffffff", border: "1px solid #dae5d3" }}>
              <div className="text-sm mb-2" style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: "#3d5638" }}>
                ✦ {f.t}
              </div>
              <div className="text-sm" style={{ fontFamily: '"Tiro Bangla", serif', color: "#5f7a5b", lineHeight: 1.7 }}>
                {f.d}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-10 p-8 rounded-2xl text-center"
          style={{ background: "linear-gradient(135deg, #3d5638 0%, #1c2a20 100%)", color: "#ffffff" }}
        >
          <div className="text-xl mb-3" style={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>
            ডিজাইন পছন্দ হয়েছে?
          </div>
          <p
            className="text-sm mb-2"
            style={{ fontFamily: '"Tiro Bangla", serif', color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}
          >
            "হ্যাঁ" বললে এই ডিজাইনটি Extension-এর নতুন ট্যাবে যোগ করে দেব।
          </p>
          <p
            className="text-xs"
            style={{ color: "#b7c9b0", fontFamily: '"Fraunces", serif', fontStyle: "italic" }}
          >
            রঙ, লেআউট, টেক্সট — যেকোনো পরিবর্তনের অনুরোধ জানাতে পারেন।
          </p>
        </div>
      </section>
    </div>
  );
}
