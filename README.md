# PETAW Web

Frontend web app for **PETAW** — a chat-assistant UI (Assistant, History, Documents, Memory, Workspace, Settings). This codebase is the interface layer only; the actual multi-model orchestration is handled by a separate service, **ShakurOS API**, that lives outside this repo.

Internally, the engineering philosophy powering the studio is named **CNCS** — Cognitive Networked Control Systems. CNCS stays in the engine room (system prompts, infrastructure naming); SHAKUR STUDIO is the public face.

## Stack

- **Frontend** — React 19 + TypeScript (strict) + Vite
- **Chat backend** — external `ShakurOS API` (not in this repo), reached via `VITE_SHAKUROS_API_URL`
- **Utility agents** — three standalone Supabase Edge Functions (Offer / Audit / Automation), OpenAI-only, unrelated to the chat feature
- **i18n** — FR / EN with typed translation keys (`src/i18n`)
- **UI** — Premium Minimal Metal design system, dark / light, persisted

## Architecture

```
cncs-systems/
├─ index.html
├─ src/
│  ├─ App.tsx, main.tsx
│  ├─ components/
│  │  ├─ Layout.tsx                 Sidebar + mobile header/drawer
│  │  ├─ chat/                      MessageList, ModelSelector, QuickActions
│  │  └─ pages/                     ChatPage, HistoryPage, DocumentsPage, MemoryPage, WorkspacePage, SettingsPage
│  ├─ i18n/                         Typed FR / EN dictionaries
│  ├─ lib/
│  │  ├─ router.ts                  Hash-based page routing (RoutePath)
│  │  ├─ shakurOS.ts, shakurosClient.ts   Client for the external ShakurOS API
│  │  ├─ modelRouter.ts             Static provider/model catalog used by Settings (display only)
│  │  └─ providers/                 Per-provider model metadata (id, name, models) — no client-side generation
│  └─ styles/globals.css            Premium Minimal Metal tokens
└─ supabase/
   ├─ config.toml
   └─ functions/
      ├─ _shared/                   CORS, rate limit, OpenAI client, schemas, prompts, demo mode, run logging
      ├─ agent-offer/
      ├─ agent-audit/
      └─ agent-automation/
```

There are two independent backends here — don't conflate them:

1. **Chat** (`ChatPage` → `src/lib/shakurOS.ts` → `src/lib/shakurosClient.ts`) talks to the external ShakurOS API at `VITE_SHAKUROS_API_URL`. Session identity is a `crypto.randomUUID()` generated and stored client-side — this is a device identifier, not a real credential; the ShakurOS service is expected to enforce its own auth server-side.
2. **Utility agents** (`agent-offer`, `agent-audit`, `agent-automation`) are self-contained Supabase Edge Functions, unrelated to the chat feature. Each:
   - Validates and rate-limits the request (per-IP plus a global cap; see Security notes).
   - Builds a structured prompt in the requested language.
   - Calls OpenAI with `response_format: json_schema` for guaranteed-shape output.
   - Returns a typed `AgentEnvelope`, and fire-and-forget logs the run to `public.agent_runs` via `_shared/db.ts` (using Supabase's own auto-injected `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — not something you configure).
   - Falls back to an explicitly-labeled **demo mode** response if `OPENAI_API_KEY` isn't set.

`src/lib/modelRouter.ts` and `src/lib/providers/*` only hold static display metadata (provider names, model lists, descriptions) for the Settings page — they do not generate responses. The `ModelSelector` shown in the chat UI has its own separate, hand-written list of provider/model IDs that it sends to the external ShakurOS API; nothing in this repo guarantees those IDs are kept in sync with what ShakurOS actually supports.

## Run locally

```powershell
npm install
npm run dev
```

## Configure

Copy `.env.example` to `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

| Variable | Where | Required | Description |
|---|---|---|---|
| `VITE_SHAKUROS_API_URL` | `.env.local` | yes, for chat | Base URL of the external ShakurOS API (defaults to `http://localhost:8787`) |
| `VITE_SUPABASE_URL` | `.env.local` | no — currently unused | Declared for a future Supabase client integration; nothing in `src/` reads it yet, and `@supabase/supabase-js` isn't a dependency |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` | no — currently unused | Same as above |
| `VITE_CONTACT_EMAIL` | `.env.local` | no — currently unused | Typed in `vite-env.d.ts` but not read anywhere; the CTA section that used it no longer exists in this UI |
| `VITE_WHATSAPP_URL` | `.env.local` | no — currently unused | Same as above |
| `OPENAI_API_KEY` | Supabase secret | no | Enables the utility agents (Offer/Audit/Automation); demo mode otherwise |
| `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` | Supabase secret | no | Reserved — not currently read by any deployed function |
| `OPENAI_MODEL` | Supabase secret | no | Defaults to `gpt-4o-mini` |
| `CNCS_ALLOWED_ORIGINS` | Supabase secret | no | Comma-separated CORS allowlist (defaults to localhost in dev) |

`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by the Supabase platform for run-logging — do not set these yourself.

## Deploy the edge functions

```powershell
supabase login
supabase link --project-ref <your-project-ref>

# set secrets (server-only, never bundled in the browser)
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set CNCS_ALLOWED_ORIGINS=https://shakurstudio.com,https://www.shakurstudio.com

# deploy the functions
supabase functions deploy agent-offer
supabase functions deploy agent-audit
supabase functions deploy agent-automation
```

## Deploy the frontend

```powershell
npm run typecheck
npm run build
```

The `dist/` folder is a fully static bundle deployable to Vercel, Netlify, Cloudflare Pages or any static host. Set `VITE_SHAKUROS_API_URL` in the host's environment variables.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on `http://localhost:5173/` |
| `npm run typecheck` | `tsc -b` — strict TypeScript check |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the built bundle locally |

## Design system — Premium Minimal Metal

- Warm champagne accent (`#d8c8b8` dark / `#a66b56` light) over obsidian/graphite (dark) or platinum (light) surfaces
- No purple, no cobalt, no decorative noise, no fake AI particles

## Security notes

- Utility-agent OpenAI key lives only as a Supabase secret; never exposed to the browser.
- Each utility-agent function rate-limits per resolved client IP (10 req/min) plus a global cap across all callers (200 req/min) so a spoofed `X-Forwarded-For` can't translate into unbounded billed spend.
- CORS is restricted to the configured allowlist (defaults to localhost in dev).
- Input is validated server-side with hard size caps.
- No user input is logged or stored long-term; only run metadata (agent, language, mode, status, latency) is logged.
- Chat auth against the external ShakurOS API is currently a client-generated device ID, not a verified credential — treat this as a known gap until ShakurOS enforces real auth server-side.
