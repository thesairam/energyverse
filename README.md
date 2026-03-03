# EnergyVerse Monitor

Bloomberg-style renewables + nuclear intelligence dashboard with live feed ingestion.

## What it includes

- Sector subsections: Solar, Wind, Hydro, Geothermal, Storage, Nuclear, EV, Hydrogen
- Under each section: latest news, tech news, new products, startup signals, finance/stocks, YouTube live links, Reddit/GitHub conversation topics
- Top-level policy, market pulse, emissions/impact, business signals, project changes, and scrolling news tape
- Map layers: plants, storage, projects, hydrogen hubs, EV/V2G sites, nuclear newbuilds, transmission lines, resource tiles, policy pins, intel topics

## Run locally

```bash
npm install
npm run dev
```

This runs both:

- Frontend (Vite): http://localhost:5173 (auto-shifts to 5174 if busy)
- Backend API (Express): http://localhost:8788 (configurable via `PORT`)

## Useful commands

```bash
# frontend + backend together
npm run dev

# backend only (honors PORT)
PORT=8788 npm run start:api

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
- Network calls use short timeouts; set `FETCH_TIMEOUT_MS` to tune
- Set `OFFLINE_MODE=1` to skip external calls and rely on local placeholders
- If a source fails, dashboard falls back to seeded local data for continuity
