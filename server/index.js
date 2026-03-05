/**
 * server/index.js
 * Express 5 + ws API server for Energyverse
 * — Staggered per-sector RSS cron (v2 pattern)
 * — WebSocket live-push for sector, news and geo updates
 * — /api/youtube  — RSS-aggregated energy YouTube videos/streams
 * — /api/geo/all  — all geo layers as GeoJSON FeatureCollections
 * — /api/geo/:layer  — single layer GeoJSON
 * — /api/dashboard, /api/sector/:slug, /api/health, etc.
 */

import express from 'express'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import cron from 'node-cron'
import { collectSectorIntel, sectors, buildSector } from './dataCollector.js'
import { layers, events as seedEvents } from './layers.js'
import { fetchYoutube, fetchYoutubeForSector } from './youtube.js'

// ── GeoJSON helpers ───────────────────────────────────────────────────────────
const LAYER_KEYS = ['plants', 'storage', 'projects', 'hydrogen', 'ev', 'nuclear', 'transmission', 'resource', 'policy']

const toPointFeature   = (item) => ({ type: 'Feature', geometry: { type: 'Point',      coordinates: [item.lon, item.lat] },                                                 properties: { ...item } })
const toLineFeature    = (item) => ({ type: 'Feature', geometry: { type: 'LineString', coordinates: item.path.map(([lat, lon]) => [lon, lat]) },                             properties: { id: item.id, name: item.name, capacityMW: item.capacityMW, status: item.status } })
const toPolygonFeature = (item) => ({ type: 'Feature', geometry: { type: 'Polygon',    coordinates: [[...item.ring.map(([lat, lon]) => [lon, lat])]] },                      properties: { id: item.id, metric: item.metric, value: item.value } })

const featureFnFor = (layer) =>
  layer === 'transmission' ? toLineFeature
  : layer === 'resource'   ? toPolygonFeature
  : toPointFeature

// Build a GeoJSON FeatureCollection for one layer key
function buildFC(layer) {
  const items = layers[layer] || []
  return {
    type: 'FeatureCollection',
    layer,
    updatedAt: new Date().toISOString(),
    features: items.map(featureFnFor(layer)),
  }
}

// Build all layers as a single object: { plants: FC, storage: FC, … }
function buildAllLayers() {
  return Object.fromEntries(LAYER_KEYS.map((k) => [k, buildFC(k)]))
}

// Layer point counts for /api/health
const toCounts = () => Object.fromEntries(LAYER_KEYS.map((k) => [k, (layers[k] || []).length]))

// ── In-memory caches ──────────────────────────────────────────────────────────
const cache = { sectorIntel: [], newsTape: [], updatedAt: null }
const sectorIndex = new Map()   // slug → sectorRow
let liveEvents = [...seedEvents]
let isRefreshing = false

// YouTube cache (TTL = 30 min)
let youtubeCache = []
let youtubeCacheAt = 0
const YT_TTL_MS = 30 * 60 * 1000

// Per-sector YouTube cache
const sectorYtCache = {}
const sectorYtCacheAt = {}

async function refreshYoutube() {
  try {
    youtubeCache = await fetchYoutube(5)
    youtubeCacheAt = Date.now()
    console.log(`[energyverse-api] youtube refreshed — ${youtubeCache.length} videos`)
  } catch (e) {
    console.error('[energyverse-api] youtube refresh failed:', e?.message)
  }
}

// Geo layer cache (rebuild on every full refresh)
let geoCache = buildAllLayers()

// ── Broadcast helper ──────────────────────────────────────────────────────────
let broadcast = (_msg) => {}   // assigned after wss is created

function applySector(row) {
  sectorIndex.set(row.slug, row)
  const idx = cache.sectorIntel.findIndex((s) => s.slug === row.slug)
  if (idx >= 0) cache.sectorIntel[idx] = row; else cache.sectorIntel.push(row)
}

// ── Full refresh ──────────────────────────────────────────────────────────────
async function refreshCache() {
  if (isRefreshing) return
  isRefreshing = true
  try {
    const latest = await collectSectorIntel()
    for (const row of latest.sectorIntel) applySector(row)
    cache.newsTape  = latest.newsTape
    cache.updatedAt = latest.updatedAt
    geoCache = buildAllLayers()
    console.log(`[energyverse-api] full refresh at ${latest.updatedAt} — ${latest.sectorIntel.length} sectors`)
    if (latest.newsTape.length > 0) broadcast({ type: 'news', payload: latest.newsTape.slice(0, 8) })
    broadcast({ type: 'geo', payload: geoCache })
  } catch (e) {
    console.error('[energyverse-api] refresh failed:', e?.message || e)
  } finally { isRefreshing = false }
}

// ── Per-sector staggered refresh ──────────────────────────────────────────────
async function refreshOneSector(sector) {
  try {
    const { sectorRow, tape } = await buildSector(sector)
    applySector(sectorRow)
    cache.updatedAt = new Date().toISOString()
    broadcast({ type: 'sector', payload: sectorRow })
    if (tape.length > 0) broadcast({ type: 'news', payload: tape })
    console.log(`[energyverse-api] sector updated: ${sector.slug}`)
  } catch (e) {
    console.error(`[energyverse-api] sector ${sector.slug} failed:`, e?.message)
  }
}

// ── AI digest helper ──────────────────────────────────────────────────────────
const resolveOllamaUrl = (value) => {
  const base = (value || 'http://localhost:11434').replace(/\/$/, '')
  if (base.match(/\/api\/(generate|chat)$/)) return base
  if (base.endsWith('/api')) return `${base}/generate`
  return `${base}/api/generate`
}

// ── Express setup ─────────────────────────────────────────────────────────────
const app = express()
app.use(express.json())

const PORT = Number(process.env.PORT || 8788)
const server = createServer(app)

// ── WebSocket server ──────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/stream' })

broadcast = (msg) => {
  const text = JSON.stringify(msg)
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(text)
  })
}

wss.on('connection', (ws) => {
  const hello = JSON.stringify({
    type: 'hello',
    sectorIntel: cache.sectorIntel,
    newsTape:    cache.newsTape,
    geo:         geoCache,
    layers:      toCounts(),
    events:      liveEvents.slice(0, 10),
    youtube:     youtubeCache.slice(0, 12),
  })
  ws.send(hello)
  ws.on('error', console.error)
})

// ── HTTP routes ───────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', updatedAt: cache.updatedAt, layers: toCounts(), events: liveEvents.length, sectors: cache.sectorIntel.length })
})

app.get('/api/dashboard', async (_req, res) => {
  if (!cache.updatedAt) await refreshCache()
  res.json({ ...cache, events: liveEvents.slice(0, 20), youtube: youtubeCache.slice(0, 12) })
})

app.post('/api/refresh', async (_req, res) => {
  await Promise.all([refreshCache(), refreshYoutube()])
  res.json({ ok: true, updatedAt: cache.updatedAt })
})

app.get('/api/sector/:slug', async (req, res) => {
  const { slug } = req.params
  const sector = sectors.find((s) => s.slug.toLowerCase() === slug.toLowerCase())
  if (!sector) return res.status(404).json({ error: 'Unknown sector' })
  const cached = sectorIndex.get(sector.slug)
  if (cached) return res.json(cached)
  try {
    const { sectorRow } = await buildSector(sector)
    applySector(sectorRow)
    res.json(sectorRow)
  } catch { res.status(500).json({ error: 'Fetch failed' }) }
})

// All geo layers at once → { plants: FC, storage: FC, … }
app.get('/api/geo/all', (_req, res) => {
  res.json(geoCache)
})

// Single geo layer → GeoJSON FeatureCollection
app.get('/api/geo/:layer', (req, res) => {
  const { layer } = req.params
  if (!LAYER_KEYS.includes(layer)) return res.status(400).json({ error: 'Invalid layer' })
  res.json(buildFC(layer))
})

// Events
app.get('/api/events', (_req, res) => res.json(liveEvents))

// YouTube videos / live streams
app.get('/api/youtube', async (_req, res) => {
  const stale = Date.now() - youtubeCacheAt > YT_TTL_MS
  if (stale || youtubeCache.length === 0) await refreshYoutube()
  res.json(youtubeCache)
})

// YouTube per-sector
app.get('/api/youtube/:sector', async (req, res) => {
  const { sector } = req.params
  const now = Date.now()
  if (!sectorYtCache[sector] || (now - (sectorYtCacheAt[sector] || 0)) > YT_TTL_MS) {
    try {
      sectorYtCache[sector] = await fetchYoutubeForSector(sector, 4)
      sectorYtCacheAt[sector] = now
    } catch (e) {
      console.error('[energyverse-api] sector youtube failed:', e?.message)
    }
  }
  res.json(sectorYtCache[sector] || [])
})

// Search across geo layers
app.get('/api/search', (req, res) => {
  const q = String(req.query.q || '').toLowerCase().trim()
  if (!q) return res.json([])
  const results = []
  for (const layer of LAYER_KEYS) {
    for (const item of layers[layer] || []) {
      const hay = [item.id, item.name, item.sector, item.subtype, item.owner, item.status].filter(Boolean).join(' ').toLowerCase()
      if (hay.includes(q)) results.push({ id: item.id, layer, sector: item.sector, title: item.name || item.id, coords: [item.lat, item.lon], updatedAt: item.updatedAt })
    }
  }
  res.json(results.slice(0, 20))
})

// AI digest (context summary)
app.get('/api/ai/digest', (_req, res) => {
  const sectors = cache.sectorIntel.slice(0, 4).map((s) => ({
    slug: s.slug, score: s.score, headlines: (s.latestNews || []).slice(0, 2).map((n) => n.title),
  }))
  res.json({ sectors, updatedAt: cache.updatedAt, layers: toCounts() })
})

// AI Chat (Ollama streaming proxy)
app.post('/api/chat', async (req, res) => {
  const { messages = [], context = {} } = req.body
  const ollamaUrl = resolveOllamaUrl(process.env.OLLAMA_URL)
  const model = process.env.OLLAMA_MODEL || 'llama3'
  const systemPrompt = `You are an energy sector intelligence assistant embedded in the Energyverse terminal dashboard.
Access to data: ${JSON.stringify({ sectors: (context.sectorIntel || []).slice(0, 3), headlines: (context.newsTape || []).slice(0, 8) })}.
Be concise—terminal UI. Max 4 sentences per response.`

  const payload = { model, prompt: `System: ${systemPrompt}\n\nUser: ${messages.at(-1)?.content || ''}`, stream: true }
  try {
    const upstream = await fetch(ollamaUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!upstream.ok) throw new Error(`Ollama ${upstream.status}`)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Transfer-Encoding', 'chunked')
    const reader = upstream.body.getReader(), dec = new TextDecoder()
    let buf = ''
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buf += dec.decode(value, { stream: true })
      const lines = buf.split('\n'); buf = lines.pop() ?? ''
      for (const line of lines) { if (line.trim()) res.write(line + '\n') }
    }
    res.end()
  } catch (e) {
    res.json({ response: `AI unavailable (${e?.message || 'no Ollama'}). Start Ollama and set OLLAMA_URL.` })
  }
})

// ── Cron jobs ─────────────────────────────────────────────────────────────────
// Full refresh every 15 min
cron.schedule('*/15 * * * *', refreshCache)
// YouTube refresh every 30 min
cron.schedule('*/30 * * * *', refreshYoutube)
// Per-sector staggered refresh every 5 min (each sector fires with 30s offset)
sectors.forEach((sector, idx) => {
  setTimeout(() => {
    cron.schedule('*/5 * * * *', () => refreshOneSector(sector))
  }, idx * 30_000)
})

// ── Boot ──────────────────────────────────────────────────────────────────────
server.listen(PORT, async () => {
  console.log(`[energyverse-api] listening on http://localhost:${PORT}`)
  // Stagger initial loads: sectors first, then youtube (slightly delayed)
  await refreshCache()
  setTimeout(refreshYoutube, 3000)
})
