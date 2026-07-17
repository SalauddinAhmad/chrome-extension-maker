# AI Nexus Hub

Enterprise-grade unified multi-AI SaaS workspace. This folder holds the full production app codebase — kept **separate** from the Lovable preview site. The `/ai-nexus-hub` route in the parent project is only a design/marketing preview.

---

## Vision

One dashboard where teams connect **any AI provider** with their own API keys and use every capability — chat, image, video, code, embeddings, workflows — with role-based access, analytics, and billing.

---

## Supported Providers

| Provider | Capabilities |
| --- | --- |
| OpenAI | Chat, Image (DALL·E), Video (Sora), Audio (TTS/Whisper), Embeddings |
| Google Gemini | Chat, Vision, Image (Imagen), Video (Veo), Embeddings |
| Anthropic Claude | Chat, Vision, Code |
| xAI Grok | Chat, Vision |
| DeepSeek | Chat, Reasoning, Code |
| Mistral | Chat, Code (Codestral), Embeddings |
| Cohere | Chat, Embeddings, Rerank |
| Meta Llama (via hosts) | Chat, Code |
| Stability AI | Image, Video (SVD) |
| Replicate | 10k+ community models |
| Runway | Video (Gen-4) |
| Pika Labs | Video |
| Leonardo AI | Image, Motion |
| Together AI | OSS inference |
| OpenRouter | Routed access to 300+ models |
| **NVIDIA NIM** | Full catalogue from https://build.nvidia.com/models — auto capability detection |

---

## Modules

1. **AI Chat** — multi-model, streaming, markdown, code highlight, file upload, history, regenerate, export
2. **Image Studio** — text→image, img→img, inpaint, outpaint, upscale, background removal, masonry gallery
3. **Video Generator** — text→video, image→video, upscale, extension
4. **Code Studio** — VS Code-inspired editor, AI assistant, refactor, bug-fix, live preview
5. **Workflow Builder** — drag-drop nodes (input, AI, image, video, webhook, DB, logic), export JSON
6. **Prompt Library** — save, categorize, favorite, share
7. **Speech & Audio** — TTS, STT, voice clone, multi-language
8. **Document Analyzer** — PDF/DOCX → embeddings → RAG
9. **Model Marketplace** — browse, filter by capability & price
10. **API Management** — encrypted vault, test connection, auto-discovery
11. **Usage Analytics** — requests, tokens, cost, media — daily/weekly/monthly/yearly
12. **Billing** — Stripe + Paddle, plans, credits, usage limits

---

## Roles

- **Admin** — users, analytics, providers, subscriptions, audit logs
- **User** — API keys, projects, model usage, history, export

---

## Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 19
- TypeScript strict
- Tailwind CSS + shadcn/ui
- Framer Motion
- Vercel AI SDK (multi-provider streaming)

**Backend**
- Laravel 12 API
- MySQL 8
- Redis (queues + rate limit)
- Laravel Horizon workers
- Sanctum auth
- Spatie Permission (RBAC)

**Storage**
- AWS S3 / Cloudflare R2
- Encrypted API key vault (AES-256-GCM, per-tenant KEK)

**Auth**
- Sanctum JWT
- OAuth: Google, GitHub
- TOTP 2FA
- SSO / SAML (Enterprise)

**Deploy**
- Docker Compose (dev)
- Kubernetes manifests (prod)
- Multi-tenant with workspace scoping

---

## Suggested Folder Layout

```
ai-nexus-hub-app/
├── apps/
│   ├── web/                  # Next.js 15 frontend
│   │   ├── app/
│   │   │   ├── (marketing)/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── chat/
│   │   │   │   ├── image/
│   │   │   │   ├── video/
│   │   │   │   ├── code/
│   │   │   │   ├── workflows/
│   │   │   │   ├── prompts/
│   │   │   │   ├── marketplace/
│   │   │   │   ├── keys/
│   │   │   │   ├── analytics/
│   │   │   │   ├── billing/
│   │   │   │   └── settings/
│   │   │   └── api/
│   │   └── components/
│   └── api/                  # Laravel 12
│       ├── app/
│       │   ├── Providers/AI/    # OpenAI, Gemini, Claude, NVIDIA…
│       │   ├── Http/Controllers/
│       │   ├── Jobs/
│       │   └── Services/Vault/  # Encrypted key storage
│       └── database/migrations/
├── packages/
│   ├── ai-sdk-adapter/       # Unified provider interface
│   ├── ui/                   # Shared React components
│   └── types/                # Shared TS types
└── infra/
    ├── docker/
    ├── k8s/
    └── terraform/
```

---

## Security Non-Negotiables

- API keys never leave the backend — the frontend calls Laravel, Laravel calls providers
- Keys stored AES-256-GCM with per-workspace KEK
- Rate limiting per user + per workspace
- Audit log for every key use, model call, admin action
- CSP + HSTS + SameSite cookies
- 2FA enforced for Admin role

---

## Status

📄 **Specification only** — no code committed yet. The `/ai-nexus-hub` route in the parent Lovable site is the visual preview of the target design.
