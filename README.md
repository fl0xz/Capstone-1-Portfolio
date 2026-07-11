# Foundry Labs — Commerce Hub

A unified dashboard mockup for managing TikTok Shop, Amazon, and eBay accounts across multiple client groups. Built with a clean, Apple-inspired aesthetic.

## Features

- **Client Groups** — Organise accounts by business client (Enterprise, Mid-Market, Small Business)
- **Multi-Platform** — TikTok Shop, Amazon Seller Central, and eBay in one view
- **24-Hour Analytics** — Live metrics with hourly charts for revenue, orders, and views
- **Morning Reports** — Automated daily snapshots with highlights, alerts, and rankings
- **Account Connection Flow** — Step-by-step modal to add platform credentials
- **Live Data Simulation** — Metrics refresh every 30 seconds to simulate real-time sync

## Quick Start

```bash
cd foundry-dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

- React 19 + TypeScript
- Vite
- Recharts (analytics charts)
- Lucide React (icons)

## Mockup Notes

This is a **frontend mockup** with simulated data. Live platform integrations would require:

| Platform | API | Auth |
|----------|-----|------|
| TikTok Shop | TikTok Shop Open API | OAuth 2.0 |
| Amazon | Selling Partner API (SP-API) | LWA + IAM |
| eBay | eBay Trading/Finding API | OAuth 2.0 |

## Project Structure

```
src/
├── components/     # UI components (Sidebar, Cards, Charts, Modals)
├── views/          # Page views (Overview, Groups, Reports, Settings)
├── data/           # Mock data and generators
├── hooks/          # Live data simulation hook
├── utils/          # Formatting helpers
└── types.ts        # TypeScript interfaces
```

## Built for Foundry Labs

Commerce account management for agencies managing social media and shop accounts for businesses of all sizes.
