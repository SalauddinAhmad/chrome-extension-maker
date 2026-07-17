# AI Studio

একটি standalone web tool যেখানে জনপ্রিয় সব AI provider (OpenAI, Anthropic, Google Gemini, NVIDIA NIM, Mistral, xAI, DeepSeek, Groq ইত্যাদি) একসাথে integrate করা থাকবে। User নিজের API key দিয়ে যেকোনো model select করে **text, image, video, code, speech** — সব ধরনের generation করতে পারবে।

> 🔒 সব API key শুধু browser-এর `localStorage`-এ save হবে — কোনো server storage নেই।

---

## Scope

| Mode   | Providers (planned)                                     |
| ------ | ------------------------------------------------------- |
| Chat   | OpenAI, Anthropic, Gemini, Mistral, DeepSeek, Groq, xAI |
| Image  | DALL·E 3, Imagen 3, Flux, SDXL, Ideogram                |
| Video  | Sora, Veo, Runway Gen-3, Kling, Pika                    |
| Code   | Codestral, DeepSeek Coder, Claude, GPT                  |
| Speech | ElevenLabs TTS, OpenAI TTS/Whisper                      |
| NIM    | build.nvidia.com — যেকোনো hosted NIM endpoint           |

---

## Planned Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** + shadcn/ui
- **Zustand** — settings & chat state
- **AI SDK** (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`) — unified streaming interface
- **IndexedDB (Dexie)** — conversation history
- **Client-side only** — কোনো backend নেই

---

## Folder Layout (planned)

```
ai-studio-app/
├── src/
│   ├── providers/         # provider adapters (openai.ts, anthropic.ts, nvidia.ts …)
│   ├── modes/             # chat, image, video, code, speech UIs
│   ├── components/        # shared UI (ModelPicker, KeyManager, PromptBox)
│   ├── stores/            # zustand stores
│   ├── lib/               # utils, storage, streaming helpers
│   └── App.tsx
├── package.json
└── vite.config.ts
```

---

## Status

🚧 **Scaffolding stage** — শুধু README + structure। Implementation পরের step-এ শুরু হবে।

Preview page: [`/ai-studio`](../src/routes/ai-studio.tsx) — main app-এর inside এ mounted preview।
