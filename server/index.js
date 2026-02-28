import express from 'express'
import cron from 'node-cron'
import { collectSectorIntel } from './dataCollector.js'

const app = express()
const port = Number(process.env.PORT || 8787)

app.use(express.json())

let cache = {
  updatedAt: null,
  sectorIntel: [],
  newsTape: [],
}

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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', updatedAt: cache.updatedAt })
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

cron.schedule('*/15 * * * *', () => {
  void refreshCache()
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[energyverse-api] listening on http://localhost:${port}`)
  void refreshCache()
})
