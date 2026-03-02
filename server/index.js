import express from 'express'
import cron from 'node-cron'
import { WebSocketServer } from 'ws'
import { collectSectorIntel } from './dataCollector.js'
import { layers, events as seedEvents } from './layers.js'

const app = express()
const port = Number(process.env.PORT || 8787)

app.use(express.json())

const layerKeys = ['plants', 'storage', 'projects', 'hydrogen', 'transmission', 'resource', 'policy']

const toPointFeature = (item) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [item.lon, item.lat] },
  properties: {
    id: item.id,
    name: item.name,
    sector: item.sector,
    subtype: item.subtype,
    capacityMW: item.capacityMW ?? null,
    status: item.status,
    owner: item.owner ?? 'N/A',
    updatedAt: item.updatedAt,
    regionTag: item.regionTag,
  },
})

const toLineFeature = (item) => ({
  type: 'Feature',
  geometry: { type: 'LineString', coordinates: item.path.map(([lat, lon]) => [lon, lat]) },
  properties: {
    id: item.id,
    name: item.name,
    capacityMW: item.capacityMW ?? null,
    status: item.status,
    updatedAt: item.updatedAt,
  },
})

const toPolygonFeature = (item) => ({
  type: 'Feature',
  geometry: { type: 'Polygon', coordinates: [[...item.ring.map(([lat, lon]) => [lon, lat])]] },
  properties: {
    id: item.id,
    metric: item.metric,
    value: item.value,
    updatedAt: item.updatedAt,
  },
})

let cache = {
  updatedAt: null,
  sectorIntel: [],
  newsTape: [],
}

let liveEvents = [...seedEvents]

let isRefreshing = false

async function refreshCache() {
  if (isRefreshing) return
  isRefreshing = true
  try {
    const latest = await collectSectorIntel()
    cache = latest
    // eslint-disable-next-line no-console
    console.log(`[energyverse-api] refreshed at ${latest.updatedAt}`)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[energyverse-api] refresh failed:', error?.message || error)
  } finally {
    isRefreshing = false
  }
}

const toCounts = () => {
  const counts = {}
  for (const key of layerKeys) {
    const collection = layers[key] || []
    counts[key] = collection.length
  }
  return counts
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', updatedAt: cache.updatedAt, layers: toCounts(), events: liveEvents.length })
})

app.get('/api/dashboard', async (_req, res) => {
  if (!cache.updatedAt) {
    await refreshCache()
  }
  res.json(cache)
})

app.post('/api/refresh', async (_req, res) => {
  await refreshCache()
  res.json({ ok: true, updatedAt: cache.updatedAt })
})

app.get('/api/geo/:layer', (req, res) => {
  const { layer } = req.params
  if (!layerKeys.includes(layer)) {
    return res.status(400).json({ error: 'Invalid layer' })
  }

  const items = layers[layer] || []
  const cutoffMs = req.query.since ? new Date(req.query.since).getTime() : null

  const filtered = items.filter((item) => {
    if (!cutoffMs) return true
    const ts = new Date(item.updatedAt).getTime()
    return Number.isFinite(ts) && ts >= cutoffMs
  })

  const featureBuilder =
    layer === 'transmission' ? toLineFeature : layer === 'resource' ? toPolygonFeature : toPointFeature

  const fc = {
    type: 'FeatureCollection',
    features: filtered.map(featureBuilder),
  }

  return res.json(fc)
})

app.get('/api/events', (req, res) => {
  const since = req.query.since ? new Date(req.query.since).getTime() : null
  const filtered = liveEvents.filter((evt) => {
    if (!since) return true
    const ts = new Date(evt.updatedAt).getTime()
    return Number.isFinite(ts) && ts >= since
  })
  res.json({ events: filtered })
})

app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toString().trim().toLowerCase()
  if (!q) return res.json({ results: [] })

  const results = []
  for (const layer of layerKeys) {
    const items = layers[layer] || []
    for (const item of items) {
      const haystack = `${item.name || ''} ${item.subtype || ''} ${item.owner || ''}`.toLowerCase()
      if (haystack.includes(q)) {
        results.push({
          id: item.id,
          layer,
          sector: item.sector,
          title: item.name || item.id,
          coords: [item.lat, item.lon],
          updatedAt: item.updatedAt,
        })
      }
    }
  }

  res.json({ results })
})

app.post('/api/ai/digest', async (req, res) => {
  const { counts = {}, windowDays = 7, diffs = [] } = req.body || {}

  const prompt = `You are an energy markets analyst. Summarize key changes in bullet form.
Window: ${windowDays} days.
Counts: ${JSON.stringify(counts)}
Diffs: ${JSON.stringify(diffs).slice(0, 800)}
Highlight material signals and keep it to 4 bullets.`

  const model = process.env.OLLAMA_MODEL || 'llama3'
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate'

  try {
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
    })

    if (!response.ok) {
      throw new Error(`Ollama responded ${response.status}`)
    }

    const payload = await response.json()
    const text = payload?.response || payload?.message || ''
    if (!text) throw new Error('No response text')
    return res.json({ summary: text })
  } catch (error) {
    const fallback = `Local LLM unavailable; heuristic summary — Window ${windowDays}d: plants ${counts.plants || 0}, storage ${counts.storage || 0}, projects ${counts.projects || 0}, H2 ${counts.hydrogen || 0}, grid ${counts.transmission || 0}, resource ${counts.resource || 0}, policy ${counts.policy || 0}.`
    return res.json({ summary: fallback, error: error?.message || 'ollama_unavailable' })
  }
})

cron.schedule('*/15 * * * *', () => {
  void refreshCache()
})

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[energyverse-api] listening on http://localhost:${port}`)
  void refreshCache()
})

const wss = new WebSocketServer({ server, path: '/stream' })

const broadcast = (msg) => {
  const data = JSON.stringify(msg)
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data)
    }
  })
}

wss.on('connection', (socket) => {
  socket.send(
    JSON.stringify({
      type: 'hello',
      layers: toCounts(),
      events: liveEvents.slice(-5),
    }),
  )
})

setInterval(() => {
  // simulate live ticker by rotating events
  const next = {
    ...liveEvents[Math.floor(Math.random() * liveEvents.length)],
    updatedAt: new Date().toISOString(),
  }
  liveEvents = [...liveEvents.slice(-20), next]
  broadcast({ type: 'event', payload: next })
}, 20000)
