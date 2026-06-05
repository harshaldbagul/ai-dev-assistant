# AI Dev Assistant — GitHub Analyzer

A project exploring AI concepts progressively: chat → streaming → tool calling → RAG → agents.

**Phase 1**: Chat interface where you ask about any GitHub user. Gemini AI uses tool calling to fetch real GitHub data, then streams the response back word by word.

## Prerequisites

- Node.js 24+ (use `nvm use` inside `backend/` or `frontend/` — both have `.nvmrc`)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- (Optional) A [GitHub personal access token](https://github.com/settings/tokens) for higher rate limits (60 → 5000 req/hr)

## Setup

### 1. Clone and install

```bash
# Install backend deps
cd backend && yarn

# Install frontend deps
cd ../frontend && yarn
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in GEMINI_API_KEY (required) and optionally GITHUB_TOKEN

# Frontend
cp frontend/.env.example frontend/.env
# VITE_API_URL is pre-filled for local dev
```

### 3. Run

```bash
# Terminal 1 — backend (http://localhost:3000)
cd backend && yarn dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && yarn dev
```

## Example Prompts

- `Analyze torvalds` — Linus Torvalds' profile and repos
- `Compare gaearon and sindresorhus` — side-by-side comparison
- `Who has more stars — tj or sindresorhus?` — multi-user analysis
- `What languages does addyosmani use?` — language breakdown

## Architecture

```
User message
  → backend POST /api/chat/stream
  → Gemini (tool definitions)
  → Gemini calls tools
  → backend executes GitHub API calls
  → feeds results back to Gemini
  → Gemini streams final response
  → SSE events to frontend
  → renders word by word
```

## SSE Event Contract

```json
{ "type": "tool_call", "tool": "get_github_profile", "args": { "username": "torvalds" } }
{ "type": "text", "content": "Linus Torvalds is..." }
{ "type": "error", "message": "GitHub user not found" }
{ "type": "done" }
```
