# Foundry Labs — Commerce Hub

Unified dashboard for managing TikTok Shop, Amazon UK, eBay, and Etsy accounts across brand groups.

## Phase 1 — Amazon UK OAuth

- **Link-based connect** — brands authorise via Seller Central (no per-client API setup)
- **Vercel API routes** — `/api/amazon/authorize` and `/api/amazon/callback`
- **Optional Supabase** — auth, brands, encrypted token storage
- **Demo mode** — works without config using mock data

## Phase 1b — Amazon UK Data Sync (Live)

- **Sales API metrics** — last-24h revenue + orders with hourly breakdown
- **Token refresh** — LWA access tokens refreshed automatically
- **Manual sync** — Settings → Sync all, or brand detail → Sync Amazon
- **Hourly cron** — `/api/cron/sync-amazon` via Vercel Cron
- **Live overlay** — synced metrics replace mock Amazon data in the UI

## Quick Start

```bash
npm install
npm run dev
```

Copy `.env.example` to Vercel environment variables. See **Settings → Integrations** in the app.

## Amazon UK Setup (one-time)

1. [Seller Central UK](https://sellercentral.amazon.co.uk) → **Develop Apps**
2. Create SP-API app → note Application ID, LWA Client ID & Secret
3. Enable **Sales and Traffic** (order metrics) role on the app
4. Set redirect URI: `https://your-app.vercel.app/api/amazon/callback`
5. Add env vars to Vercel (see `.env.example`)
6. Run `supabase/schema.sql` in Supabase SQL editor
7. In app: open a brand → **Connect Account** → **Amazon UK** → **Connect Amazon UK**
8. After connect, sync runs automatically — or use **Sync Amazon** / Settings

## Tech Stack

- React 19 + TypeScript + Vite
- Vercel Serverless Functions (Amazon OAuth + sync)
- Supabase (auth + Postgres for tokens/metrics)
- Recharts + Lucide React

## Project Structure

```
api/                # Vercel serverless (OAuth + sync + cron)
supabase/           # Database schema
src/
├── components/     # UI components
├── views/          # Pages (Overview, Brands, Reports, Settings, Login)
├── contexts/       # Auth context
├── lib/            # Supabase + API client
└── hooks/          # Live mock data + Amazon overlay
```

## Built for Foundry Labs

Brand-first commerce management — retainer + margin model for mid-market and enterprise clients.
