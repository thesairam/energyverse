# EnergyVerse Monitor

Bloomberg-style renewables + nuclear intelligence dashboard with live feed ingestion.

## What it includes

- Sector subsections: Solar, Wind, Hydro, Geothermal, Storage, Nuclear
- Under each section: latest news, tech news, new products, startup signals, finance/stocks, YouTube live links, Reddit/GitHub conversation topics
- Top-level policy, market pulse, emissions/impact, business signals, project changes, and scrolling news tape

## Run locally

```bash
npm install
npm run dev
```

This runs both:

- Frontend (Vite): http://localhost:5173
- Backend API (Express): http://localhost:8787

## Useful commands

```bash
# frontend + backend together
npm run dev

# backend only
npm run start:api

# production build (frontend)
npm run build

# preview production build
npm run preview
```

## Live data sources (no API keys required)

- Google News RSS (sector and topic queries)
- Yahoo Finance quote endpoint (ticker snapshots)
- Reddit search JSON (recent discussion topics)
- GitHub issue search API (active technical conversations)
- YouTube live search links (sector-specific)

## Refresh behavior

- API cache refreshes on startup and every 15 minutes
- Frontend polls `/api/dashboard` every 3 minutes
- If a source fails, dashboard falls back to seeded local data for continuity
