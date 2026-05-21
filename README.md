# CNCS.SYSTEMS

Interactive public website for **CNCS.SYSTEMS — Cognitive Networked Control Systems**.
Built by **SHAKUR** for AI, Web and Automation services.

## Stack

- **Frontend** — React 19 + TypeScript + Vite
- **AI backend** — Supabase Edge Functions (Deno 2) calling OpenAI Chat Completions
- **i18n** — Native FR / IT / EN with typed translation keys
- **UI** — Dark / light theme, persisted, premium responsive layout

## Architecture

```
cncs-systems/
├─ index.html
├─ src/
│  ├─ App.tsx, main.tsx
│  ├─ components/
│  │  ├─ agents/                   Offer / Audit / Automation cards
│  │  └─ Header / Hero / Systems / Process / Cta / Theme / Language
│  ├─ i18n/                        Typed FR / IT / EN dictionaries
│  └─ lib/agents/                  Typed client + envelope types
└─ supabase/
   ├─ config.toml
   └─ functions/
      ├─ _shared/                  CORS, JSON, rate limit, OpenAI, schemas, prompts, demo
      ├─ agent-offer/
      ├─ agent-audit/
      └─ agent-automation/
```

The frontend never talks to OpenAI directly. It calls our Supabase Edge Functions, which:

1. Validate and rate-limit each request.
2. Build a structured prompt in the requested language.
3. Call OpenAI with `response_format: json_schema` for guaranteed-shape output.
4. Return a typed `AgentEnvelope` to the browser.

If `OPENAI_API_KEY` is not set, the functions return an honest, clearly-labeled **demo mode**
response so the UI keeps working end-to-end during development.

## Run locally

```powershell
npm install
npm run dev
```

Without env vars, the agents will fail with a clear "API not configured" error. To preview
the demo mode (or live mode), set up the Supabase side as described below.

## Configure

Copy `.env.example` to `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Fill in:

| Variable | Where | Required | Description |
|---|---|---|---|
| `VITE_SUPABASE_URL` | `.env.local` | yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` | yes | Supabase publishable (anon) key — browser-safe |
| `VITE_CONTACT_EMAIL` | `.env.local` | no | Email for the primary CTA |
| `VITE_WHATSAPP_URL` | `.env.local` | no | Full `https://wa.me/<number>` URL; button hidden when absent |
| `OPENAI_API_KEY` | Supabase secret | no | Enables live AI; absent → demo mode |
| `OPENAI_MODEL` | Supabase secret | no | Defaults to `gpt-4o-mini` |
| `CNCS_ALLOWED_ORIGINS` | Supabase secret | no | Comma-separated CORS allowlist for production |

## Deploy the edge functions

```powershell
supabase login
supabase link --project-ref <your-project-ref>

# set secrets (server-only, never bundled in the browser)
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set CNCS_ALLOWED_ORIGINS=https://cncs.systems,https://www.cncs.systems

# deploy the three functions
supabase functions deploy agent-offer
supabase functions deploy agent-audit
supabase functions deploy agent-automation
```

## Deploy the frontend

```powershell
npm run typecheck
npm run build
```

The `dist/` folder is a fully static bundle deployable to Vercel, Netlify, Cloudflare Pages
or any static host. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host's
environment variables.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on `http://localhost:5173/` |
| `npm run typecheck` | `tsc -b` — strict TypeScript check |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the built bundle locally |

## Security notes

- The OpenAI key lives only as a Supabase secret. It is never exposed to the browser.
- Each edge function rate-limits per IP (10 requests / minute by default).
- CORS is restricted to the configured allowlist (defaults to localhost in dev).
- Input is validated server-side with hard size caps.
- No user input is logged or stored.
