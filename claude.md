# ⚡ EnergyVerse

A Bloomberg-terminal-style real-time intelligence dashboard for the global energy transition — covering renewables, nuclear, EVs, hydrogen, and storage.

Built with React + Vite + Express + WebSocket. No API keys required.

---

## Features

### 🗺 Global Energy Map (Leaflet + CartoDB Dark)
- **9 interactive geo layers**: Plants, Storage, Projects, Hydrogen, EV, Nuclear, Transmission Lines, Resource Zones, Policy Pins
- **Topics layer**: Live news items jittered around their source region
- Circle markers sized by capacity (MW), color-coded by sector
- Transmission lines (polylines) and resource zones (polygons)
- Click-to-popup with facility details (owner, status, capacity, type)
- Region + country filter (100+ countries across 6 macro-regions: EMEA, NAM, APAC, LATAM, MEA, Global)
- Sector filter controls both map and content view simultaneously

### 📊 8 Energy Sectors
Each sector has a dedicated 8-panel grid:

| Panel | Content |
|-------|---------|
| Latest News | Google News RSS headlines |
| Tech News | Technology-focused articles |
| Products | New product launches & specs |
| Community | Reddit, GitHub, events |
| Finance | Stock tickers, price moves |
| Startups | Funding rounds, valuations |
| Policy | Region-tagged regulations |
| Media | YouTube videos & live streams |

**Sectors**: Solar · Wind · Hydro · Geothermal · Storage · Nuclear · EV · Hydrogen

### 📈 Market & Signals Panel
- Global KPIs (installed capacity, investment, jobs)
- Market prices per region with trend indicators
- Emissions tracker with progress bars
- Business signals (M&A, partnerships)
- Project status changes
- ETF fund flows & AUM
- LCOE benchmarks by technology
- Investment deals (company, amount, round, country)
- CO₂ by sector with YoY trends

### 🤖 AI Chat (Ollama Integration)
- Streaming chat with local LLM via Ollama
- System prompt includes live sector context + headlines
- Status indicator in topbar (AI:ON / AI:OFF)
- Auto-detects Ollama at `localhost:11434`
- Configurable via `OLLAMA_URL` and `OLLAMA_MODEL` env vars

### 🔍 Search
- Topbar search across all geo facilities
- Debounced type-ahead with dropdown results
- Click result → map flies to location

### 📡 Live Data Feed
- WebSocket push for real-time updates (sectors, news, geo, YouTube)
- Scrolling news ticker at bottom
- Auto-reconnect on connection loss

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (React)                       │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────────────┐  │
│  │ Leaflet  │ │ Sector   │ │ Market │ │  AI Chat    │  │
│  │ Map      │ │ Views    │ │ Panel  │ │  (streaming)│  │
│  └────┬─────┘ └────┬─────┘ └───┬────┘ └──────┬──────┘  │
│       │             │           │              │         │
│       └─────────────┴───────┬───┴──────────────┘         │
│                             │                            │
│                    Vite Dev Server (:2700)                │
│                      proxy /api → :8789                  │
│                      proxy /stream → ws://:8789          │
└─────────────────────────────┬───────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────┐
│                 Express API Server (:8789)                │
│                                                          │
│  ┌────────────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ dataCollector   │  │ scorer   │  │  youtube         │  │
│  │ (RSS/Finance/  │  │ (priority│  │  (channel RSS    │  │
│  │  Reddit/GitHub)│  │  ranking)│  │   aggregation)   │  │
│  └───────┬────────┘  └────┬─────┘  └────────┬─────────┘  │
│          │                │                  │            │
│  ┌───────┴────────────────┴──────────────────┴─────────┐  │
│  │              In-memory cache + cron scheduler       │  │
│  │  Full refresh: */15 min  │  YouTube: */30 min       │  │
│  │  Per-sector staggered: */5 min (30s offset each)   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │ WebSocket    │  │ /api/search   │  │ /api/chat     │  │
│  │ /stream      │  │ facility find │  │ Ollama proxy  │  │
│  └──────────────┘  └───────────────┘  └───────┬───────┘  │
└───────────────────────────────────────────────┬──────────┘
                                                │
                                    ┌───────────┴──────────┐
                                    │  Ollama (:11434)     │
                                    │  llama3 / any model  │
                                    └──────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Leaflet, Vite 7 |
| Styling | Custom CSS terminal theme (CRT scanlines, dark mode) |
| Backend | Express 5, Node.js 22, WebSocket (ws) |
| Scheduling | node-cron (staggered per-sector) |
| AI | Ollama (local LLM, streaming) |
| Maps | Leaflet + CartoDB Dark tiles |
| Data | Google News RSS, Yahoo Finance, Reddit, GitHub, YouTube RSS |
| Deploy | Docker Compose (nginx + API) |

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server status + layer counts |
| GET | `/api/dashboard` | Full dashboard payload |
| POST | `/api/refresh` | Force data refresh |
| GET | `/api/sector/:slug` | Single sector intel |
| GET | `/api/geo/all` | All GeoJSON layers |
| GET | `/api/geo/:layer` | Single GeoJSON layer |
| GET | `/api/events` | Event feed |
| GET | `/api/youtube` | Global YouTube videos |
| GET | `/api/youtube/:sector` | Sector-specific videos |
| GET | `/api/search?q=` | Search geo facilities |
| GET | `/api/ai/status` | Ollama availability check |
| GET | `/api/ai/digest` | AI context summary |
| POST | `/api/chat` | Streaming Ollama chat proxy |
| WS | `/stream` | Real-time push (sectors, news, geo) |

### File Structure

```
energyverse/
├── claude.md              # AI context / project spec
├── README.md              # Quick-start guide
├── docker-compose.yml     # API (:8789) + Web (:8081) services
├── package.json           # Root dev scripts (concurrently)
├── frontend/
│   ├── Dockerfile         # Multi-stage: Vite build → nginx
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.ts     # Dev server + API proxy config
│   ├── index.html         # Entry HTML
│   ├── nginx/
│   │   └── default.conf   # Production reverse proxy config
│   └── src/
│       ├── App.tsx        # Main React app (map, sectors, chat, filters)
│       ├── App.css        # Terminal theme CSS
│       ├── main.tsx       # React entry point
│       └── data/
│           └── energyData.ts  # Static KPIs, markets, policies, sector seeds
└── backend/
    ├── Dockerfile         # API container (Node 22 Alpine)
    ├── package.json       # Backend dependencies
    ├── index.js           # Express + WebSocket + cron + Ollama proxy
    ├── dataCollector.js   # RSS/Finance/Reddit/GitHub aggregation
    ├── scorer.js          # Priority scoring (recency, source rank, engagement)
    ├── layers.js          # 90+ real-world geo facility seeds
    └── youtube.js         # YouTube channel RSS aggregation
```

---

## Run Locally

```bash
npm run install:all
npm run dev
```

- **Frontend**: http://localhost:2700
- **API**: http://localhost:8788

### With Ollama AI Chat

```bash
# Start Ollama (separate terminal)
ollama serve

# Pull a model
ollama pull llama3

# Start Energyverse
npm run dev
```

### Docker

```bash
docker compose up --build
```

- **Web**: http://localhost:2700
- **API**: http://localhost:8789

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8789` | API server port |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama base URL |
| `OLLAMA_MODEL` | `llama3` | LLM model name |
| `OFFLINE_MODE` | — | Skip external fetches, use seed data |
| `FETCH_TIMEOUT_MS` | — | Timeout for RSS/API calls |

---

## Scoring Algorithm

News items are ranked using a weighted composite score:

```
score = recency × 0.45 + sourceRank × 0.30 + engagement × 0.25 + keywordBoost
```

- **Recency**: Exponential decay from publish time
- **Source rank**: Trusted outlets score higher
- **Engagement**: Reddit upvotes, GitHub stars, view counts
- **Keyword boost**: Sector-specific term matching

---

## Coverage

- **8 sectors** with 4-5 Google News queries each
- **6 macro-regions** + 100+ countries
- **50+ real-world facilities** seeded with coordinates
- **40+ stock tickers** tracked (5 per sector)
- **48+ YouTube channels** (8 global + 5 per sector)
- **Automatic refresh** every 5–15 minutes per sector

IMPORTANT!

If I am asking to fix a bug or append a feature, ensure to work only that specific task and never break/build anything else or soemthing that affects other features. 