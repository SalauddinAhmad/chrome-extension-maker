import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/ai-nexus-hub")({
  head: () => ({
    meta: [
      { title: "AI Nexus Hub — Unified Multi-AI Workspace" },
      {
        name: "description",
        content:
          "Enterprise-grade SaaS to connect OpenAI, Gemini, Claude, Grok, NVIDIA NIM & more — chat, image, video, code, workflows in one dashboard.",
      },
      { property: "og:title", content: "AI Nexus Hub" },
      { property: "og:description", content: "Unified multi-AI workspace for teams." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NexusPreview,
});

const providers = [
  { name: "OpenAI", tag: "GPT-5 · DALL·E · Sora", tone: "from-emerald-500/25 to-teal-500/10" },
  { name: "Anthropic", tag: "Claude 4 Opus · Sonnet", tone: "from-orange-500/25 to-amber-500/10" },
  { name: "Google", tag: "Gemini 3 · Veo · Imagen", tone: "from-blue-500/25 to-indigo-500/10" },
  { name: "xAI", tag: "Grok 4 · Vision", tone: "from-slate-500/25 to-zinc-500/10" },
  { name: "DeepSeek", tag: "V3 · Reasoner · Coder", tone: "from-violet-500/25 to-purple-500/10" },
  { name: "Mistral", tag: "Large · Codestral", tone: "from-rose-500/25 to-pink-500/10" },
  { name: "Cohere", tag: "Command R+ · Embed", tone: "from-cyan-500/25 to-sky-500/10" },
  { name: "Meta", tag: "Llama 3.3 · 405B", tone: "from-blue-600/25 to-indigo-600/10" },
  { name: "NVIDIA NIM", tag: "build.nvidia.com", tone: "from-lime-500/25 to-green-500/10" },
  { name: "Stability", tag: "SD 3.5 · SVD", tone: "from-fuchsia-500/25 to-pink-500/10" },
  { name: "Replicate", tag: "10k+ models", tone: "from-neutral-500/25 to-stone-500/10" },
  { name: "Runway", tag: "Gen-4 Video", tone: "from-red-500/25 to-orange-500/10" },
  { name: "Pika", tag: "2.2 · Scenes", tone: "from-pink-500/25 to-rose-500/10" },
  { name: "Leonardo", tag: "Phoenix · Motion", tone: "from-amber-500/25 to-yellow-500/10" },
  { name: "Together AI", tag: "OSS inference", tone: "from-teal-500/25 to-cyan-500/10" },
  { name: "OpenRouter", tag: "300+ routed models", tone: "from-indigo-500/25 to-violet-500/10" },
];

const modules = [
  { icon: "💬", title: "AI Chat", body: "Multi-model chat, streaming, file upload, markdown, code highlighting, chat history." },
  { icon: "🖼️", title: "Image Studio", body: "Text-to-image, img2img, inpaint, outpaint, upscale, background removal, masonry gallery." },
  { icon: "🎬", title: "Video Generator", body: "Text-to-video & image-to-video via Runway, Pika, Kling, Luma, NVIDIA models." },
  { icon: "💻", title: "Code Studio", body: "VS Code-inspired editor, AI assistant, refactor, bug-fix, live preview, multi-tab." },
  { icon: "🔗", title: "Workflow Builder", body: "Drag-and-drop nodes: input, AI, image, video, webhook, DB, logic. Export as JSON." },
  { icon: "📚", title: "Prompt Library", body: "Save, categorize, favorite, share prompts across marketing, design, code, business." },
  { icon: "🎙️", title: "Speech & Audio", body: "TTS (ElevenLabs, OpenAI), Whisper STT, voice cloning, multi-language." },
  { icon: "📄", title: "Document Analyzer", body: "PDF/DOCX ingest, embeddings, RAG search, summarization, extraction." },
  { icon: "🧬", title: "Embeddings", body: "Generate, store, and query vectors from any embedding provider." },
  { icon: "🛒", title: "Model Marketplace", body: "Browse all connected provider models with capability & pricing detection." },
  { icon: "🔑", title: "API Management", body: "Encrypted key vault, test connection, auto model discovery, usage tracking per key." },
  { icon: "📊", title: "Usage Analytics", body: "Requests, tokens, cost, media generated — daily/weekly/monthly/yearly charts." },
];

const roles = [
  {
    title: "Admin",
    perks: ["Manage users & workspaces", "Monitor API usage & cost", "Enable/disable providers", "View audit logs & activity", "Manage subscriptions"],
  },
  {
    title: "User",
    perks: ["Add own API keys", "Create projects & workspaces", "Use all connected models", "Save history & export", "Share prompts & workflows"],
  },
];

const plans = [
  { name: "Free", price: "$0", tag: "Get started", perks: ["3 providers", "100 msgs/mo", "Community support"] },
  { name: "Pro", price: "$19", tag: "For creators", perks: ["Unlimited providers", "10k msgs/mo", "Image + video gen", "Priority queue"] },
  { name: "Business", price: "$79", tag: "For teams", perks: ["Team workspaces", "SSO + roles", "Usage analytics", "Workflow builder"] },
  { name: "Enterprise", price: "Custom", tag: "SLA + audit", perks: ["Self-host option", "Dedicated support", "SOC 2 · SSO · SAML", "Custom integrations"] },
];

function NexusPreview() {
  return (
    <div className="min-h-screen bg-[#07070c] text-zinc-100 antialiased selection:bg-fuchsia-500/30">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-600/25 via-fuchsia-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[640px] rounded-full bg-gradient-to-tl from-cyan-500/15 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[380px] w-[520px] rounded-full bg-gradient-to-br from-indigo-500/15 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-14">
        {/* Header */}
        <header className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 text-sm font-bold shadow-lg shadow-fuchsia-500/20">
              N
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">AI Nexus Hub</span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Unified AI Workspace</span>
            </div>
          </div>
          <span className="rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-400">
            Preview · Not functional
          </span>
        </header>

        {/* Hero */}
        <section className="mb-24 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            16 providers · 300+ models · one dashboard
          </div>
          <h1 className="mb-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Every AI model.
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              One workspace.
            </span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Connect OpenAI, Gemini, Claude, Grok, NVIDIA NIM and 12 more providers with your own keys.
            Chat, generate images & video, write code, build workflows — all from a single enterprise-grade console.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200">
              Start free
            </button>
            <button className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900">
              Book demo
            </button>
            <Link
              to="/ai-studio"
              className="text-sm text-zinc-500 underline-offset-4 transition hover:text-zinc-300 hover:underline"
            >
              ← See AI Studio
            </Link>
          </div>
        </section>

        {/* Providers */}
        <section className="mb-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Providers</h2>
              <p className="mt-1 text-sm text-zinc-500">Bring your own API keys — encrypted at rest, never exposed to the frontend.</p>
            </div>
            <span className="text-xs text-zinc-600">16 supported</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {providers.map((p) => (
              <div
                key={p.name}
                className={`group relative overflow-hidden rounded-xl border border-zinc-800/70 bg-gradient-to-br ${p.tone} p-4 transition hover:border-zinc-700`}
              >
                <div className="text-sm font-medium text-zinc-100">{p.name}</div>
                <div className="mt-1 text-[11px] text-zinc-400">{p.tag}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Modules */}
        <section className="mb-24">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">12 built-in modules</h2>
            <p className="mt-1 text-sm text-zinc-500">Everything a team needs — no context switching between tabs.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <div
                key={m.title}
                className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-5 backdrop-blur-sm transition hover:border-zinc-700 hover:bg-zinc-900/50"
              >
                <div className="mb-3 text-xl">{m.icon}</div>
                <div className="mb-1.5 text-sm font-semibold text-zinc-100">{m.title}</div>
                <p className="text-xs leading-relaxed text-zinc-400">{m.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard mock */}
        <section className="mb-24">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Dashboard preview</h2>
            <p className="mt-1 text-sm text-zinc-500">Linear-grade sidebar, glass panels, dark & light mode.</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 shadow-2xl shadow-fuchsia-500/5">
            <div className="flex items-center gap-2 border-b border-zinc-900 px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              <div className="ml-4 text-[11px] text-zinc-500">nexus.ai / workspace / acme</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] min-h-[380px]">
              <aside className="border-r border-zinc-900 bg-zinc-950/80 p-3">
                {["Dashboard", "AI Chat", "Image Studio", "Video Gen", "Code Studio", "Workflows", "Prompt Library", "Marketplace", "API Keys", "Analytics", "Billing", "Settings"].map((item, i) => (
                  <div
                    key={item}
                    className={`mb-1 rounded-md px-2.5 py-1.5 text-xs ${
                      i === 1 ? "bg-zinc-800/80 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </aside>
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-zinc-500">Chat · Claude 4 Opus</div>
                    <div className="text-sm font-medium">Draft launch email</div>
                  </div>
                  <div className="flex gap-1.5">
                    {["GPT-5", "Gemini 3", "Claude 4", "Grok 4"].map((m) => (
                      <span key={m} className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-[10px] text-zinc-400">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="max-w-[80%] rounded-lg bg-zinc-900/60 p-3 text-xs text-zinc-300">
                    Write a launch email for our new AI dashboard, tone: confident but warm.
                  </div>
                  <div className="ml-auto max-w-[80%] rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 p-3 text-xs text-zinc-200">
                    Here's a draft that opens with a clear promise and builds trust with concrete numbers…
                  </div>
                  <div className="max-w-[60%] rounded-lg bg-zinc-900/60 p-3 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-400" />
                      streaming…
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="mb-24 grid gap-4 md:grid-cols-2">
          {roles.map((r) => (
            <div key={r.title} className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-md bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-fuchsia-200">
                  Role
                </span>
                <h3 className="text-lg font-semibold">{r.title}</h3>
              </div>
              <ul className="space-y-2">
                {r.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="mt-1 h-1 w-1 rounded-full bg-fuchsia-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Plans */}
        <section className="mb-24">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
            <p className="mt-1 text-sm text-zinc-500">Bring your own keys — pay only for the platform.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {plans.map((p, i) => (
              <div
                key={p.name}
                className={`rounded-xl border p-5 ${
                  i === 1
                    ? "border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-500/10 to-violet-500/5"
                    : "border-zinc-800/70 bg-zinc-900/30"
                }`}
              >
                <div className="mb-1 text-xs uppercase tracking-widest text-zinc-500">{p.tag}</div>
                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold">{p.price}</span>
                  {p.price !== "Custom" && <span className="text-xs text-zinc-500">/mo</span>}
                </div>
                <div className="mb-4 text-sm font-medium text-zinc-200">{p.name}</div>
                <ul className="space-y-1.5">
                  {p.perks.map((x) => (
                    <li key={x} className="text-[11px] text-zinc-400">• {x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Stack */}
        <section className="mb-16 rounded-2xl border border-zinc-800/70 bg-zinc-900/30 p-8">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Tech stack</h2>
          <div className="grid gap-6 text-sm md:grid-cols-4">
            <div>
              <div className="mb-2 text-xs uppercase tracking-widest text-zinc-500">Frontend</div>
              <div className="text-zinc-300">Next.js 15 · React 19 · TypeScript · Tailwind · shadcn/ui · Framer Motion</div>
            </div>
            <div>
              <div className="mb-2 text-xs uppercase tracking-widest text-zinc-500">Backend</div>
              <div className="text-zinc-300">Laravel 12 · MySQL 8 · Redis · Queue Workers · Sanctum</div>
            </div>
            <div>
              <div className="mb-2 text-xs uppercase tracking-widest text-zinc-500">Storage</div>
              <div className="text-zinc-300">AWS S3 · Cloudflare R2 · Encrypted vault for API keys</div>
            </div>
            <div>
              <div className="mb-2 text-xs uppercase tracking-widest text-zinc-500">Deploy</div>
              <div className="text-zinc-300">Docker · Kubernetes-ready · VPS · Multi-tenant</div>
            </div>
          </div>
        </section>

        <footer className="border-t border-zinc-900 pt-8 text-xs text-zinc-600">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>AI Nexus Hub · Preview mockup · Code lives in <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-400">ai-nexus-hub-app/</code></span>
            <span>© 2026</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
