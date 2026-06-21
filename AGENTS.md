# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Sonar Tracker is a Next.js 14 cryptocurrency whale-tracking SaaS. It is a single Next.js application (not a monorepo) with both frontend and backend (API routes).

### Running the dev server

```bash
npm run dev        # starts Next.js on http://localhost:3000
```

The app requires a `.env.local` with Supabase, Stripe, CoinGecko, and AI provider keys. Without real credentials the server starts fine but API routes that call external services will return errors. See `next.config.js` for the full list of env vars.

### Lint

`next lint` is currently broken due to a pre-existing version mismatch: `eslint-config-next@15` (in devDependencies) pulls ESLint 9, but `next lint` in Next.js 14 uses the ESLint 8 API. To fix, either upgrade Next.js to 15 or pin `eslint-config-next` to a 14.x version.

### Build

```bash
npm run build      # production build (requires env vars)
```

### Key env vars

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client-side) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (client-side) |
| `SUPABASE_URL` | Supabase project URL (server-side) |
| `SUPABASE_SERVICE_ROLE` | Supabase service role key (server-side, never expose) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PRICE_ID` | Stripe price ID for subscription |
| `XAI_API_KEY` | xAI/Grok key (primary AI provider) |
| `OPENAI_API_KEY` | OpenAI key (fallback AI provider) |
| `COINGECKO_API_KEY` | CoinGecko Pro API key |
| `CRON_SECRET` | Auth token for cron job endpoints |

### Node.js version

The project works with Node.js 20 LTS. No `.nvmrc` or `.node-version` file exists in the repo.
