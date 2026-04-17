import Parser from 'rss-parser'
import { rankItems } from './scorer.js'
import { getFeedsForSector, getRegionalFeeds } from './feeds.js'
import { normalizeItem, deduplicateItems, filterRelevance, tagItems, REGION_KEYWORDS } from './pipeline.js'

const DEFAULT_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS || 9000)
const OFFLINE_MODE = process.env.OFFLINE_MODE === '1'

const parser = new Parser({ timeout: DEFAULT_TIMEOUT_MS })

// Detect region from text using pipeline's REGION_KEYWORDS
function detectRegion(text) {
  const lower = (text || '').toLowerCase()
  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return region
  }
  return 'Global'
}

// Date after which we consider news recent (last 45 days rolling)
const newsAfter = (() => {
  const d = new Date()
  d.setDate(d.getDate() - 45)
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
})()

const sectors = [
  {
    slug: 'Solar',
    // Multiple specific queries to get diverse, non-overlapping solar news
    queries: [
      `solar photovoltaic utility scale after:${newsAfter}`,
      `solar panel manufacturing IEC NREL after:${newsAfter}`,
      `solar power plant commissioning MW GW after:${newsAfter}`,
      `solar energy investment funding after:${newsAfter}`,
      `rooftop solar distributed generation prosumer after:${newsAfter}`,
      `solar farm USA IRA clean energy after:${newsAfter}`,
      `solar PV India China Japan capacity gigawatt after:${newsAfter}`,
    ],
    tickers: ['FSLR', 'ENPH', 'TAN', 'SEDG', 'RUN'],
    reddit: 'solar photovoltaic utility scale',
    github: 'solar energy forecasting',
  },
  {
    slug: 'Wind',
    queries: [
      `offshore wind turbine installation after:${newsAfter}`,
      `onshore wind farm capacity GW after:${newsAfter}`,
      `wind energy contract auction CfD after:${newsAfter}`,
      `wind power investment financing after:${newsAfter}`,
      `floating offshore wind FOWT after:${newsAfter}`,
      `US offshore wind Atlantic project after:${newsAfter}`,
      `wind farm China India Japan South Korea APAC after:${newsAfter}`,
    ],
    tickers: ['GEV', 'FAN', 'TPIC', 'NEE', 'VWSYF'],
    reddit: 'wind energy offshore turbine',
    github: 'wind power forecasting',
  },
  {
    slug: 'Hydro',
    queries: [
      `hydropower dam project capacity after:${newsAfter}`,
      `pumped storage hydropower PSH after:${newsAfter}`,
      `run of river hydro plant commissioning after:${newsAfter}`,
      `hydropower investment IRENA IHA after:${newsAfter}`,
      `hydropower USA Canada dam relicensing after:${newsAfter}`,
      `hydropower China India Southeast Asia APAC after:${newsAfter}`,
    ],
    tickers: ['BEP', 'CWEN', 'AY', 'NEE', 'CPKF'],
    reddit: 'hydropower pumped storage hydro',
    github: 'hydropower optimization scheduling',
  },
  {
    slug: 'Geothermal',
    queries: [
      `geothermal energy plant project after:${newsAfter}`,
      `enhanced geothermal system EGS drilling after:${newsAfter}`,
      `geothermal power capacity MW Iceland Chile after:${newsAfter}`,
      `geothermal heat pump district heating after:${newsAfter}`,
      `geothermal USA DOE Fervo after:${newsAfter}`,
      `geothermal Indonesia Philippines Japan APAC after:${newsAfter}`,
    ],
    tickers: ['ORA', 'CLNE', 'NFE', 'GEO', 'ALTV'],
    reddit: 'geothermal energy EGS wells',
    github: 'geothermal reservoir simulation',
  },
  {
    slug: 'Storage',
    queries: [
      `battery energy storage system BESS grid after:${newsAfter}`,
      `lithium iron phosphate LFP battery cell after:${newsAfter}`,
      `long duration energy storage LDES flow battery after:${newsAfter}`,
      `energy storage investment funding after:${newsAfter}`,
      `battery gigafactory manufacturing capacity GWh after:${newsAfter}`,
      `battery storage USA California Texas IRA after:${newsAfter}`,
      `BESS battery storage Australia Japan China APAC after:${newsAfter}`,
    ],
    tickers: ['FLNC', 'TSLA', 'LIT', 'STEM', 'ENS'],
    reddit: 'battery storage BESS grid flexibility',
    github: 'battery management system BMS',
  },
  {
    slug: 'Nuclear',
    queries: [
      `nuclear power plant SMR small modular reactor after:${newsAfter}`,
      `nuclear energy capacity fleet commissioning after:${newsAfter}`,
      `nuclear fusion tokamak ITER demo after:${newsAfter}`,
      `nuclear power investment financing after:${newsAfter}`,
      `nuclear fuel cycle uranium enrichment after:${newsAfter}`,
      `nuclear power USA NRC DOE advanced reactor after:${newsAfter}`,
      `nuclear power China India Japan South Korea APAC after:${newsAfter}`,
    ],
    tickers: ['CCJ', 'URA', 'BWXT', 'LEU', 'SMR'],
    reddit: 'nuclear energy SMR fission fusion',
    github: 'nuclear reactor neutronics simulation',
  },
  {
    slug: 'EV',
    queries: [
      `electric vehicle EV sales delivery automaker after:${newsAfter}`,
      `EV battery charging infrastructure DCFC after:${newsAfter}`,
      `vehicle-to-grid V2G bidirectional charging after:${newsAfter}`,
      `electric vehicle policy incentive IRA rebate after:${newsAfter}`,
      `BYD Tesla Rivian CATL electric vehicle factory after:${newsAfter}`,
      `EV sales USA Canada market share after:${newsAfter}`,
      `electric vehicle China India Japan South Korea APAC after:${newsAfter}`,
    ],
    tickers: ['TSLA', 'BYDDY', 'LI', 'RIVN', 'CHPT'],
    reddit: 'electric vehicles EV battery V2G charging',
    github: 'vehicle to grid V2G EV charging',
  },
  {
    slug: 'Hydrogen',
    queries: [
      `green hydrogen electrolyzer production after:${newsAfter}`,
      `hydrogen fuel cell power generation after:${newsAfter}`,
      `hydrogen pipeline infrastructure export after:${newsAfter}`,
      `green hydrogen investment project funding after:${newsAfter}`,
      `blue grey hydrogen CCS carbon capture after:${newsAfter}`,
      `hydrogen hub USA DOE clean energy after:${newsAfter}`,
      `hydrogen Japan Australia India APAC export after:${newsAfter}`,
    ],
    tickers: ['PLUG', 'BE', 'FCEL', 'BLDP', 'NEL.OL'],
    reddit: 'hydrogen fuel cell electrolyzer green',
    github: 'electrolyzer hydrogen water splitting',
  },
]

const youtubeChannels = {
  Solar: {
    source: 'Solar Power World',
    url: 'https://www.youtube.com/@SolarPowerWorld',
    channelId: null,
  },
  Wind: {
    source: 'WindEurope',
    url: 'https://www.youtube.com/@WindEurope',
    channelId: 'UCdGh2Pg_K_3tW36Z9Yq_RGA',
  },
  Hydro: {
    source: 'IHA',
    url: 'https://www.youtube.com/@theIHAorg',
    channelId: 'UCVMmDqb1XT6uQWqSWBrgPBA',
  },
  Geothermal: {
    source: 'Geothermal Rising',
    url: 'https://www.youtube.com/@GeothermalRising',
    channelId: 'UCy3q58aeGeqCAdz-7Nfx-FQ',
  },
  Storage: {
    source: 'Energy Storage News',
    url: 'https://www.youtube.com/@EnergyStorageNews',
    channelId: 'UC8G_1w1T6xN32IOqDa98GqQ',
  },
  Nuclear: {
    source: 'World Nuclear Association',
    url: 'https://www.youtube.com/@WorldNuclearAssociation',
    channelId: 'UC_oY6mQfQm2Mv0vX6fBsUaA',
  },
  EV: {
    source: 'Fully Charged Show',
    url: 'https://www.youtube.com/@fullychargedshow',
    channelId: 'UCB7wAnGW9fXQEEpS5hG1D8g',
  },
}

const rssUrl = (query) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`

const withTimeout = async (promiseFactory, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await promiseFactory(controller.signal)
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

const defaultItem = (title) => ({
  title,
  source: 'EnergyVerse',
  time: 'n/a',
  url: 'https://news.google.com',
})

const cleanText = (value) => (value || '').replace(/\s+/g, ' ').trim()

const financeCache = new Map()

const toTime = (isoDate) => {
  if (!isoDate) return 'n/a'
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return 'n/a'
  return parsed.toUTCString().slice(17, 22) + ' UTC'
}

const toDomain = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return 'source'
  }
}

// Extract real source from Google News RSS title (format: "Headline - Source Name")
const DOMAIN_NAMES = {
  'news.google.com': 'Google News',
  'smithschool.ox.ac.uk': 'Oxford Smith School',
  'energy.gov': 'US Dept of Energy',
  'iea.org': 'IEA',
  'irena.org': 'IRENA',
  'eia.gov': 'US EIA',
  'ec.europa.eu': 'European Commission',
  'gov.uk': 'UK Government',
}

const extractSource = (title, fallbackUrl) => {
  if (title) {
    const parts = title.split(' - ')
    if (parts.length >= 2) {
      const src = parts[parts.length - 1].trim()
      // Sanity check: source name should be short and not look like a headline
      if (src.length > 0 && src.length < 80 && !src.includes('. ')) {
        // If source looks like a domain, map it to a human-readable name
        if (src.includes('.') && !src.includes(' ')) {
          return DOMAIN_NAMES[src] || DOMAIN_NAMES[src.replace('www.', '')] || src
        }
        return src
      }
    }
  }
  const domain = toDomain(fallbackUrl)
  return DOMAIN_NAMES[domain] || domain
}

const formatValue = (price, currency = 'USD') => {
  if (!Number.isFinite(price)) return 'n/a'
  if (currency === 'USD') return `$${price.toFixed(2)}`
  return `${price.toFixed(2)} ${currency}`
}

const toTrend = (changePercent) => {
  if (!Number.isFinite(changePercent)) return 'flat'
  if (changePercent > 0) return 'up'
  if (changePercent < 0) return 'down'
  return 'flat'
}

const toMove = (changePercent) =>
  Number.isFinite(changePercent)
    ? `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`
    : 'n/a'

const makeHistory = (price, changePercent) => {
  if (!Number.isFinite(price)) return []
  const points = 8
  const drift = Number.isFinite(changePercent) ? changePercent / 100 : 0
  const series = []

  for (let i = 0; i < points; i += 1) {
    const position = (i - (points - 1) / 2) / points
    const wiggle = Math.sin(i * 1.1) * 0.004 * price
    const value = price * (1 + drift * position) + wiggle
    series.push(Number(value.toFixed(2)))
  }

  return series
}

async function fetchRss(query, limit = 8) {
  if (OFFLINE_MODE) return []
  try {
    const feed = await withTimeout(() => parser.parseURL(rssUrl(query)))
    return (feed?.items || []).slice(0, limit).map((item) => {
      const rawTitle = cleanText(item.title)
      const source = extractSource(rawTitle, item.link || item.guid || '')
      // Remove the " - Source Name" suffix from title
      const titleParts = rawTitle.split(' - ')
      const title = titleParts.length >= 2 ? titleParts.slice(0, -1).join(' - ').trim() : rawTitle
      return {
        title,
        source,
        time: toTime(item.pubDate),
        url: item.link || 'https://news.google.com',
        region: detectRegion(title + ' ' + (item.contentSnippet || '')),
      }
    })
  } catch {
    return []
  }
}

// Fetch from multiple queries, deduplicate by title, return top N
async function fetchRssMulti(queries, limitTotal = 10) {
  const results = await Promise.allSettled(queries.map(q => fetchRss(q, 5)))
  const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
  const seen = new Set()
  return all.filter(item => {
    const key = item.title.slice(0, 60).toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, limitTotal)
}

// ── Direct RSS Feed Fetcher ───────────────────────────────────────────────────
// Fetches from curated RSS feeds (PV Magazine, Electrek, etc.) directly.
// These are NOT Google News queries — they're the real source feeds.
async function fetchDirectFeed(feedUrl, limit = 5) {
  if (OFFLINE_MODE) return []
  try {
    const feed = await withTimeout(() => parser.parseURL(feedUrl))
    return (feed?.items || []).slice(0, limit)
  } catch {
    return []
  }
}

// Fetch from all direct feeds for a sector, normalize through pipeline
async function fetchDirectFeeds(sectorSlug, limit = 15) {
  if (OFFLINE_MODE) return []
  const feeds = getFeedsForSector(sectorSlug)
  // Fetch feeds in parallel (limit concurrency by batching)
  const results = await Promise.allSettled(
    feeds.map(feed => fetchDirectFeed(feed.url, 3).then(items =>
      items.map(raw => normalizeItem(raw, feed.source, feed.region))
    ))
  )
  const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
  // Run through pipeline: dedup → filter → tag
  const deduped = deduplicateItems(all)
  const filtered = filterRelevance(deduped, sectorSlug)
  const tagged = tagItems(filtered)
  return tagged.slice(0, limit)
}

// Fetch regional feeds for diversity (runs less frequently)
async function fetchRegionalNews(limit = 10) {
  if (OFFLINE_MODE) return []
  const feeds = getRegionalFeeds()
  const results = await Promise.allSettled(
    feeds.map(feed => fetchDirectFeed(feed.url, 2).then(items =>
      items.map(raw => normalizeItem(raw, feed.source, feed.region))
    ))
  )
  const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
  const deduped = deduplicateItems(all)
  const tagged = tagItems(deduped)
  return tagged.slice(0, limit)
}

async function fetchReddit(query) {
  if (OFFLINE_MODE) return []
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=2`
    const response = await withTimeout((signal) =>
      fetch(url, {
        headers: {
          'User-Agent': 'energyverse-monitor/1.0',
        },
        signal,
      }),
    )
    if (!response?.ok) return []
    const payload = await response.json()
    return (payload?.data?.children || []).slice(0, 2).map((item) => {
      const post = item.data
      return {
        platform: 'Reddit',
        topic: cleanText(post.title),
        activity: `${post.num_comments || 0} comments`,
        url: `https://www.reddit.com${post.permalink || ''}`,
      }
    })
  } catch {
    return []
  }
}

async function fetchGithub(query) {
  if (OFFLINE_MODE) return []
  try {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(`${query} is:issue`)}&sort=updated&order=desc&per_page=2`
    const response = await withTimeout((signal) =>
      fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
        },
        signal,
      }),
    )
    if (!response?.ok) return []
    const payload = await response.json()
    return (payload?.items || []).slice(0, 2).map((issue) => ({
      platform: 'GitHub',
      topic: cleanText(issue.title),
      activity: `${issue.comments || 0} comments`,
      url: issue.html_url,
    }))
  } catch {
    return []
  }
}

async function fetchFinance(tickers) {
  if (OFFLINE_MODE) return tickers.map((symbol) => financeCache.get(symbol)).filter(Boolean)

  const headers = {
    'User-Agent': 'Mozilla/5.0',
    Accept: 'application/json,text/plain,*/*',
  }

  const fromQuoteApi = async () => {
    try {
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(tickers.join(','))}`
      const response = await withTimeout((signal) => fetch(url, { headers, signal }))
      if (!response?.ok) return []
      const payload = await response.json()
      const rows = payload?.quoteResponse?.result || []

      return rows
        .map((row) => {
          const symbol = row.symbol
          const price = Number(row.regularMarketPrice)
          const changePercent = Number(row.regularMarketChangePercent)
          const mapped = {
            metric: `${row.shortName || symbol} (${symbol})`,
            value: formatValue(price, row.currency || 'USD'),
            move: toMove(changePercent),
            trend: toTrend(changePercent),
            history: makeHistory(price, changePercent),
          }
          if (symbol && mapped.value !== 'n/a') {
            financeCache.set(symbol, mapped)
          }
          return mapped
        })
        .filter((row) => row.value !== 'n/a')
    } catch {
      return []
    }
  }

  const fromChartApi = async () => {
    const rows = await Promise.all(
      tickers.map(async (symbol) => {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1mo`
          const response = await withTimeout((signal) => fetch(url, { headers, signal }))
          if (!response?.ok) return null
          const payload = await response.json()
          const result = payload?.chart?.result?.[0]
          if (!result) return null

          const meta = result.meta || {}
          const closesRaw = result?.indicators?.quote?.[0]?.close || []
          const closes = closesRaw.filter((value) => Number.isFinite(value)).map((value) => Number(value))
          const price = Number(meta.regularMarketPrice)
          const previous = Number(meta.previousClose)
          const changePercent = Number.isFinite(price) && Number.isFinite(previous) && previous !== 0
            ? ((price - previous) / previous) * 100
            : Number.NaN

          const history = closes.length >= 2 ? closes.slice(-8).map((value) => Number(value.toFixed(2))) : makeHistory(price, changePercent)

          const mapped = {
            metric: `${meta.shortName || symbol} (${symbol})`,
            value: formatValue(price, meta.currency || 'USD'),
            move: toMove(changePercent),
            trend: toTrend(changePercent),
            history,
          }

          if (mapped.value !== 'n/a') {
            financeCache.set(symbol, mapped)
            return mapped
          }

          return null
        } catch {
          return null
        }
      }),
    )

    return rows.filter(Boolean)
  }

  const quoteRows = await fromQuoteApi()
  if (quoteRows.length > 0) return quoteRows

  const chartRows = await fromChartApi()
  if (chartRows.length > 0) return chartRows

  return tickers.map((symbol) => financeCache.get(symbol)).filter(Boolean)
}

function makeYouTubeLinks(query, slug) {
  const channel = youtubeChannels[slug] || {
    source: 'YouTube Live',
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    channelId: null,
  }

  const embedUrl = channel.channelId
    ? `https://www.youtube.com/embed/live_stream?channel=${channel.channelId}`
    : null

  return [
    {
      title: `${slug} live news stream`,
      source: channel.source,
      time: 'Live',
      url: channel.url,
      embedUrl,
    },
    {
      title: `${slug} market update live`,
      source: 'YouTube',
      time: 'Live search',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${slug} market live`)}`,
      embedUrl,
    },
  ]
}

function toProductFromNews(items) {
  return items.slice(0, 2).map((item, index) => ({
    name: `New Release ${index + 1}`,
    company: item.source,
    summary: item.title,
    status: 'Tracking',
    url: item.url,
    region: item.region || 'Global',
  }))
}

function toStartupFromNews(items) {
  return items.slice(0, 2).map((item, index) => ({
    name: `Startup Signal ${index + 1}`,
    region: item.region || 'Global',
    event: item.title,
    value: item.time,
    url: item.url,
  }))
}

const offlineRow = (sector) => {
  const placeholder = defaultItem(`Offline mode enabled for ${sector.slug}`)
  const ytLinks = makeYouTubeLinks(`${sector.slug} energy news`, sector.slug)
  return {
    slug: sector.slug,
    headline: `${sector.slug} signals paused (offline)`,
    summary: 'Using cached placeholders to avoid external calls.',
    latestNews: [placeholder],
    techNews: [placeholder],
    products: toProductFromNews([placeholder]),
    startups: toStartupFromNews([placeholder]),
    finance: [],
    policy: [placeholder],
    media: ytLinks,
    youtubeLive: ytLinks,
    community: [],
  }
}

async function buildSector(sector) {
  // Build derivative tech/startup queries from the first two base queries (without date suffix)
  const baseNoDate = sector.queries.map(q => q.replace(/ after:[0-9-]+/, ''))
  const techQueries = baseNoDate.slice(0, 2).map(q => `${q} technology innovation research after:${newsAfter}`)
  const startupQueries = baseNoDate.slice(0, 2).map(q => `${q} startup funding investment after:${newsAfter}`)
  const policyQueries = baseNoDate.slice(0, 1).map(q => `${q} policy regulation legislation government after:${newsAfter}`)

  const [latestNews, techNews, startupNews, policyNews, directFeedItems, regionalItems, redditRows, githubRows, financeRows] = await Promise.all([
    fetchRssMulti(sector.queries, 12),
    fetchRssMulti(techQueries, 8),
    fetchRssMulti(startupQueries, 6),
    fetchRssMulti(policyQueries, 4),
    fetchDirectFeeds(sector.slug, 15),
    fetchRegionalNews(8),
    fetchReddit(sector.reddit),
    fetchGithub(sector.github),
    fetchFinance(sector.tickers),
  ])

  // ── Pipeline: Merge Google News + Direct Feeds + Regional → Dedup → Rank ──
  // Ensure every item has a .region for map placement
  const ensureRegion = (items) => items.map(item => {
    if (!item.region) {
      item.region = (item.regions && item.regions[0]) || item.feedRegion || detectRegion(item.title) || 'Global'
    }
    return item
  })

  // Combine Google News results with direct feed items + regional feeds
  const mergedLatest = ensureRegion(deduplicateItems([...latestNews, ...directFeedItems, ...regionalItems]))
  const mergedTech = ensureRegion(deduplicateItems([...techNews, ...directFeedItems.filter(
    item => (item.categories || []).includes('technology')
  )]))
  const mergedPolicy = ensureRegion(deduplicateItems([...policyNews, ...directFeedItems.filter(
    item => (item.categories || []).includes('policy')
  )]))

  const rankedLatest = rankItems([...mergedLatest])
  const rankedTech = rankItems([...mergedTech])
  const headline = rankedLatest[0]?.title || `${sector.slug} market activity update pending`
  const summary = rankedTech[0]?.title || `Collecting ${sector.slug.toLowerCase()} technology and business signals.`

  const products = toProductFromNews(rankedTech)
  const startups = toStartupFromNews(ensureRegion(rankItems([...startupNews])))
  const rankedPolicy = rankItems([...mergedPolicy])

  const ytLinks = makeYouTubeLinks(`${sector.slug} energy news`, sector.slug)
  const sectorRow = {
    slug: sector.slug,
    headline,
    summary,
    latestNews: rankedLatest.length ? rankedLatest : [defaultItem(`No latest ${sector.slug.toLowerCase()} headlines available`)],
    techNews: rankedTech.length ? rankedTech : [defaultItem(`No ${sector.slug.toLowerCase()} tech headlines available`)],
    products: products.length ? products : toProductFromNews([defaultItem(`No ${sector.slug.toLowerCase()} product stories yet`)]),
    startups: startups.length ? startups : toStartupFromNews([defaultItem(`No ${sector.slug.toLowerCase()} startup stories yet`)]),
    finance: financeRows,
    policy: rankedPolicy.length ? rankedPolicy : [defaultItem(`No ${sector.slug.toLowerCase()} policy updates yet`)],
    media: ytLinks,
    youtubeLive: ytLinks,
    community: [...redditRows, ...githubRows],
  }

  const tape = rankedLatest.slice(0, 2).map((item) => ({
    source: item.source,
    headline: item.title,
    tag: sector.slug,
    time: item.time,
  }))

  return { sectorRow, tape }
}

export { sectors, buildSector }

export async function collectSectorIntel() {
  if (OFFLINE_MODE) {
    return {
      updatedAt: new Date().toISOString(),
      sectorIntel: sectors.map(offlineRow),
      newsTape: [],
    }
  }

  const results = await Promise.allSettled(sectors.map((sector) => buildSector(sector)))

  const sectorIntel = []
  const tape = []

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    sectorIntel.push(result.value.sectorRow)
    tape.push(...result.value.tape)
  }

  return {
    updatedAt: new Date().toISOString(),
    sectorIntel,
    newsTape: tape,
  }
}
