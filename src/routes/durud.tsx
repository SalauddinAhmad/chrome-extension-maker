import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/durud")({
  component: Index,
});

const features = [
  {
    title: "সমৃদ্ধ দুরুদ লাইব্রেরি",
    body: "দুরুদে তাজ, দুরুদে শাফা'আত ও আরও — আরবি, উচ্চারণ, বাংলা অনুবাদ ও রেফারেন্স সহ।",
  },
  {
    title: "ডিজিটাল তাসবিহ কাউন্টার",
    body: "দৈনিক লক্ষ্য নির্ধারণ করুন, সুন্দর রিং প্রগ্রেসে দেখুন আপনার আজকের অগ্রগতি।",
  },
  {
    title: "স্ট্রিক ও হিটম্যাপ",
    body: "GitHub-স্টাইল হিটম্যাপে গত ৮ সপ্তাহের ধারাবাহিকতা এক নজরে দেখুন।",
  },
  {
    title: "স্মার্ট সাইলেন্স",
    body: "রাতে DND, শুধু সক্রিয় থাকলে রিমাইন্ডার — মনোযোগ নষ্ট না করেই।",
  },
  {
    title: "শুক্রবার বিশেষ মোড",
    body: "জুমার দিন স্বয়ংক্রিয়ভাবে রিমাইন্ডার আরও ঘন ঘন হয়।",
  },
];

const steps = [
  "ডাউনলোড করা ZIP ফাইলটি আনজিপ করুন",
  "Chrome-এ chrome://extensions খুলুন",
  "ডান-উপরে Developer mode চালু করুন",
  "Load unpacked ক্লিক করে ফোল্ডারটি সিলেক্ট করুন",
];

function Index() {
  const [downloading, setDownloading] = useState(false);

  const download = () => {
    setDownloading(true);
    fetch("/durud-reminder-v2.zip")
      .then((res) => {
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "durud-reminder-v2.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => alert(err.message))
      .finally(() => setDownloading(false));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary">
            <div
              className="h-4 w-4 rounded-sm border-[1.5px]"
              style={{ borderColor: "var(--gold)" }}
            />
          </div>
          <div>
            <div className="font-serif text-base font-semibold tracking-tight">
              Durud Reminder
            </div>
            <div className="text-xs text-muted-foreground">v2.0</div>
          </div>
        </div>
        <a
          href="#install"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ইনস্টল
        </a>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 pt-8 pb-20 lg:grid-cols-2 lg:items-center lg:pt-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--gold)" }}
            />
            নতুন সংস্করণ · v2.0
          </div>
          <h1 className="font-serif text-5xl leading-[1.05] font-semibold tracking-tight lg:text-6xl">
            নবীজি (সাঃ)-এর প্রতি
            <br />
            <span className="text-primary">দুরুদ পাঠ</span>, প্রতিদিন।
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
            ব্রাউজিং করার ফাঁকে নিয়মিত দুরুদ পাঠের সুন্দর, শান্ত রিমাইন্ডার।
            মিনিমাল ডিজাইন, সমৃদ্ধ লাইব্রেরি, তাসবিহ কাউন্টার ও দৈনিক স্ট্রিক।
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={download}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60"
            >
              {downloading ? "প্রস্তুত হচ্ছে..." : "ZIP ডাউনলোড করুন"}
              <span aria-hidden>↓</span>
            </button>
            <a
              href="#features"
              className="inline-flex items-center rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary"
            >
              ফিচার দেখুন
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Chrome · Edge · Brave · Opera — সকল Chromium ব্রাউজারে চলে
          </p>
        </div>
        <div className="relative">
          <div
            className="absolute -inset-4 rounded-3xl opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at center, color-mix(in oklab, var(--primary) 15%, transparent), transparent 70%)",
            }}
          />
          <img
            src={heroImg}
            alt="Durud Reminder এর সুন্দর ইসলামিক নকশা"
            width={1536}
            height={1024}
            className="relative rounded-3xl border border-border bg-card object-cover shadow-lg"
          />
        </div>
      </section>

      <section
        id="features"
        className="border-t border-border bg-secondary/40 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 max-w-2xl">
            <div className="mb-3 text-xs tracking-[0.2em] text-primary uppercase">
              যা পাবেন
            </div>
            <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight lg:text-4xl">
              ছোট, মনোযোগী, এবং সুন্দর।
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="bg-card p-7">
                <div className="mb-3 h-1 w-8 rounded-full bg-primary" />
                <h3 className="mb-2 font-serif text-lg font-semibold">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section id="install" className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-3 text-xs tracking-[0.2em] text-primary uppercase">
            ইনস্টল গাইড
          </div>
          <h2 className="mb-10 font-serif text-3xl font-semibold tracking-tight lg:text-4xl">
            মাত্র ৪ ধাপ।
          </h2>
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-primary font-serif text-sm text-primary-foreground">
                  {i + 1}
                </div>
                <p className="pt-1 text-sm text-foreground">{s}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex justify-center">
            <button
              onClick={download}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60"
            >
              {downloading ? "প্রস্তুত হচ্ছে..." : "ZIP ডাউনলোড করুন"}
              <span aria-hidden>↓</span>
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Durud Reminder v2.0 · ভালোবাসা ও ইখলাসের সাথে তৈরি
      </footer>
    </div>
  );
}
