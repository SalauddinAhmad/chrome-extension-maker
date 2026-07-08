import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/extensions/designer-os")({
  head: () => ({
    meta: [
      { title: "Designer OS — Extension" },
      {
        name: "description",
        content:
          "Designer OS — ডিজাইনারদের জন্য একটি ব্রাউজার এক্সটেনশন। ফিচার শীঘ্রই যোগ হবে।",
      },
      { property: "og:title", content: "Designer OS — Extension" },
      {
        property: "og:description",
        content: "ডিজাইনারদের জন্য একটি ব্রাউজার এক্সটেনশন (WIP)।",
      },
    ],
  }),
  component: DesignerOSPage,
});

function DesignerOSPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary">
            <div className="h-4 w-4 rounded-sm border-[1.5px] border-white/70" />
          </div>
          <div>
            <div className="font-serif text-base font-semibold tracking-tight">
              Designer OS
            </div>
            <div className="text-xs text-muted-foreground">v0.1 · WIP</div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-8 pb-24 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          নতুন এক্সটেনশন · প্রাথমিক ধাপ
        </div>
        <h1 className="font-serif text-5xl leading-[1.05] font-semibold tracking-tight lg:text-6xl">
          Designer <span className="text-primary">OS</span>
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          ডিজাইনারদের প্রতিদিনের কাজ সহজ করার জন্য একটি ব্রাউজার এক্সটেনশন।
          ফিচারগুলো শীঘ্রই যুক্ত হবে — আপনি ডিটেইলস দিলে এখান থেকেই বিল্ড শুরু হবে।
        </p>

        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-left">
          <div className="text-xs tracking-[0.2em] text-primary uppercase mb-3">
            সোর্স ফোল্ডার
          </div>
          <code className="text-sm">extension-designer-os/</code>
          <p className="mt-3 text-sm text-muted-foreground">
            এই এক্সটেনশনের সমস্ত ফাইল আলাদা ফোল্ডারে রাখা হয়েছে যেন Durud
            Reminder (<code>extension/</code>) এর সাথে মিশে না যায়।
          </p>
        </div>
      </section>
    </div>
  );
}
