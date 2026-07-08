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

const upcomingDuruds = [
  { t: "দুরুদে ইব্রাহিম", v: "12:17", active: true },
  { t: "দুরুদে শাফা'আত", v: "12:32" },
  { t: "দুরুদে জিব্রীল", v: "12:47" },
  { t: "দুরুদে হাজার", v: "01:02" },
];

function NewTabPreview() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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
            {/* Sky decor: clouds + sparkles + birds */}
            <svg
              className="absolute top-0 left-0 w-full pointer-events-none"
              viewBox="0 0 1200 260"
              fill="none"
              aria-hidden
            >
              <g fill="#ffffff" opacity="0.9">
                <ellipse cx="120" cy="60" rx="90" ry="22" />
                <ellipse cx="200" cy="40" rx="60" ry="16" />
                <ellipse cx="1050" cy="80" rx="110" ry="26" />
                <ellipse cx="960" cy="50" rx="70" ry="18" />
                <ellipse cx="1130" cy="180" rx="80" ry="20" />
              </g>
              <g fill="#7a9576" opacity="0.55">
                {[
                  [280, 90], [420, 40], [640, 130], [780, 70],
                  [880, 160], [520, 200], [340, 210], [720, 200],
                ].map(([x, y], i) => (
                  <path
                    key={i}
                    d={`M${x} ${y - 6} L${x + 1.2} ${y - 1.2} L${x + 6} ${y} L${x + 1.2} ${y + 1.2} L${x} ${y + 6} L${x - 1.2} ${y + 1.2} L${x - 6} ${y} L${x - 1.2} ${y - 1.2} Z`}
                  />
                ))}
              </g>
              <g stroke="#4a6b48" strokeWidth="1.6" fill="none" strokeLinecap="round">
                <path d="M950 150 q6 -8 12 0 q6 -8 12 0" />
                <path d="M990 170 q5 -7 10 0 q5 -7 10 0" opacity="0.7" />
                <path d="M1030 145 q6 -8 12 0 q6 -8 12 0" opacity="0.85" />
              </g>
            </svg>

            {/* Mountain silhouettes at bottom */}
            <svg
              className="absolute bottom-0 left-0 w-full pointer-events-none"
              viewBox="0 0 1200 220"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden
              style={{ height: 180 }}
            >
              <path
                d="M0 180 L120 120 L220 160 L340 90 L470 150 L600 100 L740 155 L860 110 L980 150 L1100 105 L1200 140 L1200 220 L0 220 Z"
                fill="#b7c9b0"
                opacity="0.6"
              />
              <path
                d="M0 200 L100 160 L200 185 L320 140 L450 180 L580 150 L700 185 L820 155 L940 185 L1060 155 L1200 180 L1200 220 L0 220 Z"
                fill="#8ea888"
                opacity="0.6"
              />
              <g stroke="#5f7a5b" strokeWidth="0.6" opacity="0.4">
                {Array.from({ length: 60 }).map((_, i) => {
                  const x = 20 + i * 20;
                  return <line key={i} x1={x} y1="215" x2={x} y2="207" />;
                })}
              </g>
            </svg>

            {/* Settings gear top-right */}
            <div className="absolute top-4 right-6" style={{ color: "#5f7a5b" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>

            <div className="relative px-8 pt-14 pb-28 max-w-4xl mx-auto">
              {/* Big time */}
              <div className="text-center mb-10">
                <div
                  style={{
                    fontFamily: '"Fraunces", serif',
                    fontSize: 96,
                    fontWeight: 500,
                    color: "#1c2a20",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {toBn(h)}
                  <span style={{ color: "#3d5638" }}>.</span>
                  {toBn(m)}
                  <span
                    style={{
                      fontSize: 22,
                      marginLeft: 6,
                      color: "#5f7a5b",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {ap}
                  </span>
                </div>
                <div
                  className="mt-3 text-xs"
                  style={{
                    fontFamily: '"Fraunces", serif',
                    color: "#5f7a5b",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  {dateStr}
                </div>
              </div>

              {/* 2-column grid — top row */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Location + Hijri card */}
                <div
                  className="relative rounded-2xl p-5 overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.55)",
                    border: "1px solid rgba(122,149,118,0.25)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  {/* mosque silhouette */}
                  <svg
                    className="absolute bottom-0 right-0 opacity-40"
                    width="170"
                    height="75"
                    viewBox="0 0 170 75"
                    fill="#7a9576"
                    aria-hidden
                  >
                    <path d="M0 75 L0 58 L22 58 L22 42 Q22 32 32 32 Q42 32 42 42 L42 58 L58 58 L58 38 Q58 22 75 16 Q80 6 85 16 Q102 22 102 38 L102 58 L118 58 L118 42 Q118 32 128 32 Q138 32 138 42 L138 58 L170 58 L170 75 Z" />
                    <circle cx="80" cy="9" r="2.2" fill="#7a9576" />
                  </svg>
                  <div className="flex items-center gap-3 mb-3 relative">
                    <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(122,149,118,0.18)", color: "#3d5638" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 21s-7-6-7-12a7 7 0 1 1 14 0c0 6-7 12-7 12z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#6b7a68", fontFamily: '"Tiro Bangla", serif' }}>অবস্থান</div>
                      <div style={{ fontSize: 14, color: "#1c2a20", fontFamily: '"Fraunces", serif', fontWeight: 600 }}>ঢাকা, বাংলাদেশ</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 relative">
                    <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(122,149,118,0.18)", color: "#3d5638" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M3 10h18M8 2v4M16 2v4" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#6b7a68", fontFamily: '"Tiro Bangla", serif' }}>
                        {toBn(now.getDate())} {bnMonths[now.getMonth()]} {toBn(now.getFullYear())}
                      </div>
                      <div style={{ fontSize: 14, color: "#1c2a20", fontFamily: '"Fraunces", serif', fontWeight: 600 }}>শা'বান ২১, ১৪৪৬ হি.</div>
                    </div>
                  </div>
                </div>

                {/* Next durud reminder ring + upcoming list */}
                <div
                  className="rounded-2xl p-5 flex items-center gap-5"
                  style={{
                    background: "rgba(255,255,255,0.55)",
                    border: "1px solid rgba(122,149,118,0.25)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" stroke="rgba(122,149,118,0.25)" strokeWidth="7" fill="none" />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        stroke="#3d5638"
                        strokeWidth="7"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        strokeDashoffset={2 * Math.PI * 52 * 0.35}
                        transform="rotate(-90 60 60)"
                      />
                      <circle cx="60" cy="8" r="5" fill="#ffffff" stroke="#3d5638" strokeWidth="2" />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div style={{ fontSize: 11, color: "#6b7a68", fontFamily: '"Tiro Bangla", serif' }}>পরবর্তী দুরুদ</div>
                        <div style={{ fontSize: 12, color: "#1c2a20", fontFamily: '"Fraunces", serif', fontWeight: 600 }}>দুরুদে ইব্রাহিম</div>
                        <div style={{ fontSize: 13, color: "#3d5638", fontFamily: '"Fraunces", serif', fontWeight: 700, marginTop: 2 }}>
                          {toBn("03:06:57")}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 rounded-xl overflow-hidden" style={{ background: "rgba(122,149,118,0.12)" }}>
                    {upcomingDuruds.map((r) => (
                      <div
                        key={r.t}
                        className="flex items-center justify-between px-3 py-2 text-xs"
                        style={{
                          background: r.active ? "#3d5638" : "transparent",
                          color: r.active ? "#ffffff" : "#1c2a20",
                          fontFamily: '"Tiro Bangla", serif',
                        }}
                      >
                        <span>{r.t}</span>
                        <span style={{ opacity: r.active ? 1 : 0.7 }}>{toBn(r.v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Quick actions */}
                <div
                  className="rounded-2xl p-5 flex items-center justify-around"
                  style={{
                    background: "rgba(255,255,255,0.55)",
                    border: "1px solid rgba(122,149,118,0.25)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  {[
                    { icon: "▶", label: "প্লে" },
                    { icon: "⧉", label: "কপি" },
                    { icon: "⟲", label: "নতুন" },
                    { icon: "↗", label: "শেয়ার" },
                  ].map((a) => (
                    <div key={a.label} className="text-center">
                      <div
                        className="w-11 h-11 rounded-full grid place-items-center mx-auto mb-1"
                        style={{
                          background: "rgba(122,149,118,0.18)",
                          color: "#3d5638",
                          fontSize: 16,
                        }}
                      >
                        {a.icon}
                      </div>
                      <div style={{ fontSize: 11, color: "#3d5638", fontFamily: '"Tiro Bangla", serif' }}>{a.label}</div>
                    </div>
                  ))}
                </div>

                {/* Today's durud progress */}
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: "rgba(255,255,255,0.55)",
                    border: "1px solid rgba(122,149,118,0.25)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span style={{ color: "#6b7a68", fontFamily: '"Tiro Bangla", serif' }}>আজকের দুরুদ পাঠ</span>
                    <span style={{ color: "#3d5638", fontFamily: '"Fraunces", serif', fontWeight: 700 }}>
                      {toBn(23)} / {toBn(40)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "rgba(122,149,118,0.2)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: "57%", background: "linear-gradient(90deg, #7a9576 0%, #3d5638 100%)" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full grid place-items-center" style={{ background: "rgba(122,149,118,0.18)", color: "#3d5638" }}>✦</div>
                      <div>
                        <div style={{ color: "#6b7a68", fontFamily: '"Tiro Bangla", serif' }}>শুরু</div>
                        <div style={{ color: "#1c2a20", fontFamily: '"Fraunces", serif', fontWeight: 600 }}>ফজর ০৫:১২</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full grid place-items-center" style={{ background: "rgba(122,149,118,0.18)", color: "#3d5638" }}>◐</div>
                      <div>
                        <div style={{ color: "#6b7a68", fontFamily: '"Tiro Bangla", serif' }}>স্ট্রিক</div>
                        <div style={{ color: "#1c2a20", fontFamily: '"Fraunces", serif', fontWeight: 600 }}>{toBn(7)} দিন</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured durud strip */}
              <div
                className="mt-4 rounded-2xl p-5 text-center"
                style={{
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(122,149,118,0.3)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#3d5638",
                    fontFamily: '"Fraunces", serif',
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  ✦ এই মুহূর্তের দুরুদ · {sampleDurud.name}
                </div>
                <div
                  dir="rtl"
                  style={{
                    fontFamily: '"Amiri Quran", serif',
                    fontSize: 22,
                    lineHeight: 2,
                    color: "#1c2a20",
                  }}
                >
                  {sampleDurud.arabic}
                </div>
                <div
                  className="mt-2"
                  style={{
                    fontFamily: '"Tiro Bangla", serif',
                    fontSize: 12,
                    color: "#5f7a5b",
                    fontStyle: "italic",
                  }}
                >
                  — {sampleDurud.reference}
                </div>
              </div>
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
