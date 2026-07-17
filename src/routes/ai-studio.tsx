import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ai-studio")({
  head: () => ({
    meta: [
      { title: "AI Studio — Multi-Model Playground" },
      {
        name: "description",
        content:
          "একটি ওয়েব টুল যেখানে জনপ্রিয় সব AI মডেল একসাথে — image, text, video, code generation, আপনার নিজের API key দিয়ে।",
      },
    ],
  }),
  component: AIStudioPreview,
});

const providers = [
  { name: "OpenAI", tag: "GPT-5 · DALL·E · Sora", tone: "from-emerald-500/20 to-teal-500/10" },
  { name: "Anthropic", tag: "Claude Sonnet · Opus", tone: "from-orange-500/20 to-amber-500/10" },
  { name: "Google", tag: "Gemini 3 · Veo · Imagen", tone: "from-blue-500/20 to-indigo-500/10" },
  { name: "NVIDIA NIM", tag: "build.nvidia.com models", tone: "from-lime-500/20 to-green-500/10" },
  { name: "Mistral", tag: "Large · Codestral", tone: "from-rose-500/20 to-pink-500/10" },
  { name: "xAI", tag: "Grok 4", tone: "from-slate-500/20 to-zinc-500/10" },
  { name: "DeepSeek", tag: "V3 · Reasoner", tone: "from-violet-500/20 to-purple-500/10" },
  { name: "Groq", tag: "Ultra-fast inference", tone: "from-yellow-500/20 to-orange-500/10" },
];

const capabilities = [
  {
    icon: "✍️",
    title: "Text & Chat",
    body: "যেকোনো LLM select করুন, streaming reply, system prompt, temperature — full control।",
  },
  {
    icon: "🖼️",
    title: "Image Generation",
    body: "DALL·E, Imagen, Flux, SDXL — prompt দিন, aspect ratio বেছে নিন, high-res download।",
  },
  {
    icon: "🎬",
    title: "Video Generation",
    body: "Sora, Veo, Runway, Kling — text-to-video ও image-to-video, 5s/10s clips।",
  },
  {
    icon: "💻",
    title: "Code Generation",
    body: "Codestral, DeepSeek Coder, Claude — syntax highlighting, multi-file output, copy/download।",
  },
  {
    icon: "🎙️",
    title: "Speech & Audio",
    body: "TTS (ElevenLabs, OpenAI), STT (Whisper) — voice clone, multi-language।",
  },
  {
    icon: "🔑",
    title: "Bring Your Own Key",
    body: "সব API key browser-এ locally save হবে — কোনো server storage নেই, সম্পূর্ণ private।",
  },
];

function AIStudioPreview() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 antialiased">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-600/20 via-fuchsia-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-gradient-to-tl from-cyan-500/15 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <header className="mb-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold">
              AI
            </div>
            <span className="text-sm font-medium tracking-tight text-zinc-300">AI Studio</span>
          </div>
          <span className="rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-400">
            Preview · Not functional
          </span>
        </header>

        {/* Hero */}
        <section className="mb-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            আসছে শীঘ্রই
          </div>
          <h1 className="mb-6 bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-6xl font-semibold tracking-tight text-transparent md:text-7xl">
            One playground.<br />Every AI model.
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-400">
            Image, text, video, code — জনপ্রিয় সব AI provider একসাথে। আপনার নিজের API key দিন,
            যেকোনো model select করুন, সব কাজ এক জায়গায়।
          </p>
        </section>

        {/* Providers */}
        <section className="mb-24">
          <h2 className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-zinc-500">
            Supported Providers
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {providers.map((p) => (
              <div
                key={p.name}
                className={`group rounded-xl border border-zinc-800 bg-gradient-to-br ${p.tone} p-4 backdrop-blur transition hover:border-zinc-700`}
              >
                <div className="mb-1 text-base font-semibold text-white">{p.name}</div>
                <div className="text-xs text-zinc-400">{p.tag}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-zinc-500">
            + <a href="https://build.nvidia.com/models" target="_blank" rel="noreferrer" className="underline decoration-zinc-700 hover:text-zinc-300">build.nvidia.com</a> থেকে যেকোনো NIM model directly integrate করা যাবে
          </p>
        </section>

        {/* Capabilities */}
        <section className="mb-24">
          <h2 className="mb-2 text-3xl font-semibold tracking-tight">Capabilities</h2>
          <p className="mb-10 text-zinc-400">যা যা করা যাবে এই একটি tool দিয়ে।</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur transition hover:border-zinc-700 hover:bg-zinc-900/60"
              >
                <div className="mb-3 text-2xl">{c.icon}</div>
                <div className="mb-2 text-base font-semibold">{c.title}</div>
                <p className="text-sm leading-relaxed text-zinc-400">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mock UI preview */}
        <section className="mb-24">
          <h2 className="mb-2 text-3xl font-semibold tracking-tight">Interface Preview</h2>
          <p className="mb-8 text-zinc-400">Studio-এর UI এমন দেখাবে।</p>
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            {/* Window bar */}
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/60 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
              </div>
              <div className="ml-4 rounded-md bg-zinc-800/60 px-3 py-1 text-xs text-zinc-500">
                ai-studio.app / chat
              </div>
            </div>
            <div className="grid grid-cols-[220px_1fr_260px] gap-0">
              {/* Sidebar */}
              <div className="border-r border-zinc-800 bg-zinc-900/30 p-4">
                <div className="mb-4 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  Modes
                </div>
                {["Chat", "Image", "Video", "Code", "Speech"].map((m, i) => (
                  <div
                    key={m}
                    className={`mb-1 rounded-md px-3 py-2 text-sm ${
                      i === 0 ? "bg-violet-500/15 text-violet-300" : "text-zinc-400"
                    }`}
                  >
                    {m}
                  </div>
                ))}
              </div>
              {/* Main */}
              <div className="min-h-[340px] p-6">
                <div className="mb-4 flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-zinc-800" />
                  <div className="flex-1 rounded-lg bg-zinc-900/60 p-3 text-sm text-zinc-300">
                    Write me a Bangla tagline for a coffee brand.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                  <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm leading-relaxed text-zinc-200">
                    "প্রতি চুমুকে জাগরণ" — a simple, evocative line pairing awakening with the ritual of each sip.
                  </div>
                </div>
              </div>
              {/* Right panel */}
              <div className="border-l border-zinc-800 bg-zinc-900/30 p-4">
                <div className="mb-4 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  Model
                </div>
                <div className="mb-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300">
                  claude-sonnet-4.5
                </div>
                <div className="mb-4 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  Temperature
                </div>
                <div className="mb-1 h-1 rounded-full bg-zinc-800">
                  <div className="h-1 w-1/3 rounded-full bg-violet-500" />
                </div>
                <div className="text-xs text-zinc-500">0.7</div>
              </div>
            </div>
          </div>
        </section>

        {/* Note */}
        <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm text-amber-100/80">
          <strong className="text-amber-200">নোট:</strong> এই page শুধুমাত্র <em>preview</em> —
          কোনো functionality এখানে wire করা নেই। AI Studio-এর সম্পূর্ণ source code আলাদা folder
          <code className="mx-1 rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-xs text-amber-200">ai-studio-app/</code>
          -এ standalone project হিসেবে থাকবে।
        </section>

        <footer className="mt-16 text-center text-xs text-zinc-600">
          AI Studio · Bring-your-own-key · All processing client-side
        </footer>
      </div>
    </div>
  );
}
