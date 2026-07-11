# Foundry Labs — Commerce Hub

Unified dashboard for managing TikTok Shop, Amazon UK, eBay, and Etsy accounts across brand groups.

## Phase 1 — Amazon UK OAuth (Live)

- **Link-based connect** — brands authorise via Seller Central (no per-client API setup)
- **Vercel API routes** — `/api/amazon/authorize` and `/api/amazon/callback`
- **Optional Supabase** — auth, brands, encrypted token storage
- **Demo mode** — works without config using mock data

## Quick Start

```bash
npm install
npm run dev
```

Copy `.env.example` to Vercel environment variables. See **Settings → Integrations** in the app.

## Amazon UK Setup (one-time)

1. [Seller Central UK](https://sellercentral.amazon.co.uk) → **Develop Apps**
2. Create SP-API app → note Application ID, LWA Client ID & Secret
3. Set redirect URI: `https://your-app.vercel.app/api/amazon/callback`
4. Add env vars to Vercel (see `.env.example`)
5. In app: open a brand → **Connect Account** → **Amazon UK** → **Connect Amazon UK**

Each brand connects via link — clients can authorise their own seller accounts.

## Tech Stack

- React 19 + TypeScript + Vite
- Vercel Serverless Functions (Amazon OAuth)
- Supabase (optional — auth + Postgres)
- Recharts + Lucide React

## Project Structure

```
api/                # Vercel serverless (Amazon OAuth)
supabase/           # Database schema
src/
├── components/     # UI components
├── views/          # Pages (Overview, Brands, Reports, Settings, Login)
├── contexts/       # Auth context
├── lib/            # Supabase + API client
└── hooks/          # Live data
```

## Built for Foundry Labs

Brand-first commerce management — retainer + margin model for mid-market and enterprise clients.
