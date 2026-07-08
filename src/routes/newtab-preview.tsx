import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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
  translit:
    "আল্লাহুম্মা সাল্লি আলা মুহাম্মাদিন ওয়া আলা আলি মুহাম্মাদ, কামা সাল্লাইতা আলা ইব্রাহীম, ইন্নাকা হামীদুম মাজীদ।",
  bangla:
    "হে আল্লাহ! মুহাম্মদ (সাঃ) ও তাঁর পরিবারের উপর রহমত বর্ষণ করুন, যেমন আপনি রহমত বর্ষণ করেছিলেন ইব্রাহিম ও তাঁর পরিবারের উপর। নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত।",
  reference: "সহীহ বুখারী – ৩৩৭০",
};

const quickLinks = [
  { name: "Google", url: "https://google.com", icon: "G" },
  { name: "YouTube", url: "https://youtube.com", icon: "▶" },
  { name: "Gmail", url: "https://mail.google.com", icon: "✉" },
  { name: "GitHub", url: "https://github.com", icon: "◆" },
  { name: "Twitter", url: "https://x.com", icon: "𝕏" },
  { name: "ChatGPT", url: "https://chat.openai.com", icon: "◐" },
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
  const ap = now.getHours() >= 12 ? "PM" : "AM";
  const timeStr = `${toBn(h)}:${toBn(m)} ${ap}`;

  return (
    <div className="min-h-screen" style={{ background: "#f6f2ec" }}>
      {/* Top bar */}
      <div
        className="border-b"
        style={{ background: "#ffffff", borderColor: "#eae3d6" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-sm hover:underline"
            style={{ color: "#0f5f4c" }}
          >
            ← ল্যান্ডিং পেজে ফিরে যান
          </Link>
          <div className="text-xs" style={{ color: "#8a938e" }}>
            নতুন ট্যাব প্রিভিউ · Extension-এ যোগ করার আগে দেখুন
          </div>
        </div>
      </div>

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-6 pt-10 pb-6 text-center">
        <h1
          className="text-3xl md:text-4xl mb-3"
          style={{
            fontFamily: '"Fraunces", serif',
            fontWeight: 600,
            color: "#14201b",
            letterSpacing: "-0.02em",
          }}
        >
          প্রস্তাবিত নতুন ট্যাব ডিজাইন
        </h1>
        <p
          className="text-base"
          style={{
            fontFamily: '"Tiro Bangla", serif',
            color: "#5a655f",
            lineHeight: 1.7,
          }}
        >
          Chrome-এ প্রতিটি নতুন ট্যাব খোলার সময় এই স্ক্রিনটি দেখা যাবে — একটি
          দুরুদ, বর্তমান সময়, তারিখ এবং প্রিয় সাইটের quick links।
        </p>
      </section>

      {/* Browser mockup */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "#ffffff",
            border: "1px solid #eae3d6",
            boxShadow: "0 20px 60px rgba(15, 95, 76, 0.12)",
          }}
        >
          {/* Fake browser chrome */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b"
            style={{ background: "#f3ede3", borderColor: "#eae3d6" }}
          >
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
            </div>
            <div
              className="flex-1 mx-4 px-4 py-1.5 rounded-md text-xs"
              style={{
                background: "#ffffff",
                border: "1px solid #eae3d6",
                color: "#8a938e",
              }}
            >
              🔒 chrome://newtab
            </div>
          </div>

          {/* The actual new tab UI */}
          <div
            className="relative overflow-hidden"
            style={{
              background:
                "radial-gradient(120% 100% at 50% 0%, rgba(184,148,74,0.08) 0%, transparent 50%), linear-gradient(180deg, #faf7f2 0%, #f3ede3 100%)",
              minHeight: 560,
            }}
          >
            {/* Ornamental corner pattern */}
            <div
              className="absolute top-0 left-0 w-64 h-64 opacity-[0.05]"
              style={{
                background:
                  "repeating-linear-gradient(45deg, #0f5f4c 0, #0f5f4c 1px, transparent 1px, transparent 12px)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-64 h-64 opacity-[0.05]"
              style={{
                background:
                  "repeating-linear-gradient(-45deg, #0f5f4c 0, #0f5f4c 1px, transparent 1px, transparent 12px)",
              }}
            />

            <div className="relative px-8 py-12 max-w-3xl mx-auto text-center">
              {/* Brand */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <div
                  className="w-8 h-8 rounded-lg grid place-items-center"
                  style={{
                    background: "linear-gradient(135deg, #0f5f4c 0%, #0a4536 100%)",
                    color: "#b8944a",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M16 4 L26 12 L26 22 L16 28 L6 22 L6 12 Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <circle cx="16" cy="16" r="2" fill="currentColor" />
                  </svg>
                </div>
                <span
                  className="text-sm"
                  style={{
                    fontFamily: '"Fraunces", serif',
                    fontWeight: 600,
                    color: "#0f5f4c",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Durud Reminder
                </span>
              </div>

              {/* Time & Date */}
              <div
                className="text-xs mb-2"
                style={{
                  color: "#b8944a",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontFamily: '"Fraunces", serif',
                }}
              >
                {dateStr}
              </div>
              <div
                className="mb-10"
                style={{
                  fontFamily: '"Fraunces", serif',
                  fontSize: 64,
                  fontWeight: 500,
                  color: "#14201b",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {timeStr}
              </div>

              {/* Durud card */}
              <div
                className="rounded-2xl p-8 mb-8 text-left"
                style={{
                  background: "#ffffff",
                  border: "1px solid #eae3d6",
                  boxShadow: "0 4px 24px rgba(15, 95, 76, 0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid #eae3d6" }}>
                  <div
                    style={{
                      fontFamily: '"Fraunces", serif',
                      fontWeight: 600,
                      color: "#0f5f4c",
                      fontSize: 12,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    ✦ {sampleDurud.name}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="w-7 h-7 rounded-md grid place-items-center"
                      style={{ border: "1px solid #eae3d6", color: "#5a655f" }}
                    >
                      ⟲
                    </button>
                    <button
                      className="w-7 h-7 rounded-md grid place-items-center"
                      style={{ border: "1px solid #eae3d6", color: "#5a655f" }}
                    >
                      ⧉
                    </button>
                  </div>
                </div>
                <div
                  dir="rtl"
                  style={{
                    fontFamily: '"Amiri Quran", serif',
                    fontSize: 26,
                    lineHeight: 2.2,
                    color: "#14201b",
                    marginBottom: 16,
                  }}
                >
                  {sampleDurud.arabic}
                </div>
                <div
                  style={{
                    fontFamily: '"Tiro Bangla", serif',
                    fontStyle: "italic",
                    color: "#5a655f",
                    fontSize: 14,
                    marginBottom: 12,
                    lineHeight: 1.7,
                  }}
                >
                  {sampleDurud.translit}
                </div>
                <div
                  style={{
                    fontFamily: '"Tiro Bangla", serif',
                    fontSize: 15,
                    color: "#14201b",
                    lineHeight: 1.7,
                  }}
                >
                  {sampleDurud.bangla}
                </div>
                <div
                  className="text-right mt-4 pt-3"
                  style={{
                    borderTop: "1px dashed #eae3d6",
                    fontFamily: '"Fraunces", serif',
                    fontStyle: "italic",
                    fontSize: 12,
                    color: "#b8944a",
                  }}
                >
                  — {sampleDurud.reference}
                </div>
              </div>

              {/* Quick links */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {quickLinks.map((l) => (
                  <a
                    key={l.name}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #eae3d6",
                      color: "#14201b",
                      fontFamily: '"Tiro Bangla", serif',
                      boxShadow: "0 1px 3px rgba(15,95,76,0.04)",
                    }}
                  >
                    <span style={{ color: "#0f5f4c", fontWeight: 600 }}>{l.icon}</span>
                    {l.name}
                  </a>
                ))}
              </div>

              {/* Footer hadith */}
              <div
                className="mt-10 text-xs"
                style={{
                  fontFamily: '"Tiro Bangla", serif',
                  color: "#8a938e",
                  fontStyle: "italic",
                }}
              >
                "প্রতিটি ভালো কাজই সাদাকা।" — তিরমিযী ১৯৭০
              </div>
            </div>
          </div>
        </div>

        {/* Description of features */}
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {[
            {
              t: "লাইভ ঘড়ি ও বাংলা তারিখ",
              d: "প্রতি সেকেন্ডে আপডেট হওয়া সময় + বাংলা মাস/বার সহ তারিখ।",
            },
            {
              t: "র‍্যান্ডম দুরুদ",
              d: "প্রতিটি নতুন ট্যাবে লাইব্রেরি থেকে একটি দুরুদ — আরবি, উচ্চারণ, অনুবাদ।",
            },
            {
              t: "Quick Links",
              d: "Google, YouTube, Gmail সহ প্রিয় সাইট এক ক্লিকে।",
            },
          ].map((f) => (
            <div
              key={f.t}
              className="p-5 rounded-xl"
              style={{
                background: "#ffffff",
                border: "1px solid #eae3d6",
              }}
            >
              <div
                className="text-sm mb-2"
                style={{
                  fontFamily: '"Fraunces", serif',
                  fontWeight: 600,
                  color: "#0f5f4c",
                }}
              >
                ✦ {f.t}
              </div>
              <div
                className="text-sm"
                style={{
                  fontFamily: '"Tiro Bangla", serif',
                  color: "#5a655f",
                  lineHeight: 1.7,
                }}
              >
                {f.d}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-10 p-8 rounded-2xl text-center"
          style={{
            background: "linear-gradient(135deg, #0f5f4c 0%, #0a4536 100%)",
            color: "#ffffff",
          }}
        >
          <div
            className="text-xl mb-3"
            style={{ fontFamily: '"Fraunces", serif', fontWeight: 600 }}
          >
            ডিজাইন পছন্দ হয়েছে?
          </div>
          <p
            className="text-sm mb-2"
            style={{
              fontFamily: '"Tiro Bangla", serif',
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.7,
            }}
          >
            "হ্যাঁ" বললে আমি এই ডিজাইনটি Extension-এর নতুন ট্যাবে যোগ করে দেব।
          </p>
          <p
            className="text-xs"
            style={{
              color: "#b8944a",
              fontFamily: '"Fraunces", serif',
              fontStyle: "italic",
            }}
          >
            পরিবর্তনের অনুরোধ থাকলে জানান — রঙ, লেআউট, ফন্ট যেকোনো কিছু।
          </p>
        </div>
      </section>
    </div>
  );
}
