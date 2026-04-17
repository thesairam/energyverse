# EnergyVerse

Bloomberg-terminal-style real-time intelligence dashboard for the global energy transition — renewables, nuclear, EVs, hydrogen, and storage.

Built with React + Vite + Express + WebSocket. No API keys required.

## Project Structure

```
energyverse/
├── claude.md              # AI context / project spec
├── README.md              # This file
├── docker-compose.yml     # Orchestrates frontend + backend
├── package.json           # Root dev scripts (concurrently)
├── frontend/              # React + Vite + TypeScript
│   ├── Dockerfile         # Multi-stage: Vite build → nginx
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── nginx/default.conf
│   └── src/
│       ├── App.tsx        # Main React component
│       ├── App.css        # Terminal theme CSS
│       └── data/energyData.ts
└── backend/               # Express 5 + WebSocket API
    ├── Dockerfile         # Node 22 Alpine
    ├── package.json
    ├── index.js           # Express server + cron + Ollama proxy
    ├── dataCollector.js   # RSS/Finance/Reddit/GitHub aggregation
    ├── scorer.js          # Priority scoring algorithm
    ├── layers.js          # 90+ geo facility seeds
    └── youtube.js         # YouTube channel RSS
```

## Run Locally

```bash
# Install all dependencies
npm run install:all

# Start frontend + backend together
npm run dev
```

- **Frontend**: http://localhost:2700
- **API**: http://localhost:8789

### With Ollama AI Chat

```bash
ollama serve        # separate terminal
ollama pull llama3
npm run dev
```

### Docker

```bash
docker compose up --build
```

- **Web**: http://localhost:2700
- **API**: http://localhost:8789

## Live Data Sources (no API keys)

- Google News RSS (sector and topic queries)
- Yahoo Finance quote endpoint (ticker snapshots)
- Reddit search JSON (recent discussion topics)
- GitHub issue search API (active technical conversations)
- YouTube channel RSS (48+ channels)

## Refresh Behavior

- API cache refreshes on startup and every 15 minutes
- Frontend polls `/api/dashboard` every 3 minutes
- Network calls use short timeouts; set `FETCH_TIMEOUT_MS` to tune
- Set `OFFLINE_MODE=1` to skip external calls and rely on local placeholders
- If a source fails, dashboard falls back to seeded local data for continuity
