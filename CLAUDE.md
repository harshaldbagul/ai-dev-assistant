# CLAUDE.md — AI Dev Assistant

Learning project exploring AI concepts progressively: chat → streaming → tool calling → RAG → agents.
Currently on **Phase 1**: chat + streaming + tool calling via GitHub Analyzer.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 8, TypeScript 6, Tailwind CSS 3, shadcn/ui (Zinc dark) |
| Backend | Node 24, Express 4, TypeScript 5, pino logging |
| AI | Google Gemini (`@google/generative-ai`), model configurable via `GEMINI_MODEL` env |
| Streaming | SSE over HTTP (NOT WebSocket, NOT EventSource) |

## Dev Commands

```bash
# Backend (runs on :3000)
cd backend && yarn dev             # tsx watch — hot reload
cd backend && yarn tsc --noEmit   # type check only

# Frontend (runs on :5173)
cd frontend && yarn dev
cd frontend && yarn tsc -p tsconfig.app.json --noEmit
cd frontend && yarn build         # verify production bundle
```

Before running, copy `.env.example` → `.env` in `backend/` and fill in `GEMINI_API_KEY`.

## Testing the Backend (before touching frontend)

```bash
curl -N -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"Who is torvalds?","history":[]}'

# Expected SSE stream:
# data: {"type":"tool_call","tool":"get_github_profile","args":{"username":"torvalds"}}
# data: {"type":"text","content":"..."}
# data: {"type":"done"}
```

## Architecture — Non-Obvious Decisions

### SSE uses `fetch` + `ReadableStream`, not `EventSource`
`EventSource` is read-only and cannot send a POST body. `api.ts` uses `fetch()` with a `ReadableStream` reader to parse `data: {...}\n\n` lines manually.

### Gemini tool-calling loop
`GeminiService.streamChat()` runs a `while(true)` loop calling `generateContent()` (non-streaming) until Gemini stops requesting tools, then switches to `generateContentStream()` for the final response. This enables multi-tool chains (e.g. "compare two users") in a single turn.

### Two separate history states in `useChat`
- `displayMessages: Message[]` — UI state (id, role, content, isStreaming, isError)
- `geminiHistory: GeminiMessage[]` — API state sent to backend (`role: 'user'|'model'`, parts)

They have different shapes and are never merged. `geminiHistory` is updated only in `onDone`, using the functional state updater to avoid stale closure issues.

### `streamingContentRef` is a ref, not state
Streaming text is accumulated in a `useRef` during the stream and only written to state via `setDisplayMessages`. This avoids closure staleness — the `onText` callback always writes to `streamingContentRef.current` and reads from it in `onDone`.

### ScrollArea viewport ref
Radix `ScrollArea` forwards a `viewportRef` prop (custom extension in `scroll-area.tsx`) to `ScrollAreaPrimitive.Viewport`. Auto-scroll checks `scrollTop` on this element — NOT the content div.

## SSE Event Contract

Every backend event follows this exact shape. Frontend `types/index.ts` mirrors this.

```
data: {"type":"tool_call","tool":"get_github_profile","args":{"username":"torvalds"}}
data: {"type":"text","content":"Linus Torvalds is..."}
data: {"type":"error","message":"GitHub user not found"}
data: {"type":"done"}
```

## Extending the Project

### Add a new tool
1. Add the function declaration to `backend/src/tools/definitions.ts`
2. Add the `case` to `backend/src/tools/executor.ts`
3. If it needs a new service, add it under `backend/src/services/`
4. No other files need to change — GeminiService picks it up automatically

### Add a new AI provider (OpenAI, Anthropic)
1. Create `backend/src/services/ai/OpenAIService.ts` implementing `AIService` interface
2. Swap the singleton in `chat.controller.ts` — or make it config-driven via `AI_PROVIDER` env var
3. `AIService` interface is in `backend/src/services/ai/AIService.ts`

### Add conversation persistence / memory
All history lives in `useChat`'s `geminiHistory` state. To persist: serialize to `localStorage` on `onDone`, rehydrate on mount.

### Add authentication
A middleware slot exists in `app.ts` — add before the route mounts:
```typescript
app.use('/api', authMiddleware);
app.use('/api/chat', chatRouter);
```

## Code Conventions

- **Controllers**: req/res handling only — no business logic, no direct service calls beyond the AI service
- **No `any`**: enforced by ESLint (`@typescript-eslint/no-explicit-any: error`)
- **Error handling**: all async errors caught in service layer, emitted as `{type:'error'}` SSE events — never thrown past the SSE boundary
- **Singletons**: services are module-level singletons (`export const githubService = new GithubService()`)
- **Type imports**: use `import type` for type-only imports (TypeScript `verbatimModuleSyntax` is on in frontend)
- **No prose classes**: `@tailwindcss/typography` is NOT installed — markdown styled via ReactMarkdown `components` prop in `MessageBubble.tsx`

## Environment Variables

| Var | Required | Default | Notes |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | From aistudio.google.com |
| `GEMINI_MODEL` | No | `gemini-2.0-flash` | Swap model without code change |
| `PORT` | No | `3000` | |
| `NODE_ENV` | No | `development` | Affects pino pretty-printing |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173` | Comma-separated for prod |
| `GITHUB_TOKEN` | No | — | 60 → 5000 req/hr when set |

## Key Files

```
backend/src/
  app.ts                      — Express setup, process guards, SIGTERM shutdown
  config/env.ts               — Zod env validation (crashes on startup if invalid)
  services/ai/GeminiService.ts — Tool-calling loop + streaming logic
  services/ai/AIService.ts    — Interface (swap providers here)
  tools/definitions.ts        — Gemini tool schemas
  tools/executor.ts           — Tool name → service call mapping
  controllers/chat.controller.ts — SSE setup, heartbeat, abort handling

frontend/src/
  hooks/useChat.ts            — ALL state and SSE logic lives here
  services/api.ts             — fetch + ReadableStream SSE client
  components/chat/MessageBubble.tsx — ReactMarkdown with remark-gfm + custom components
  components/ui/scroll-area.tsx     — Extended with viewportRef prop
```
