/**
 * server/youtube.js
 *
 * YouTube Data API v3 aggregator — per-sector + global.
 * Uses YouTube API key for channel uploads + trending search.
 * Falls back to public RSS feeds when no API key is configured.
 *
 * Quota budget (10,000 units/day):
 *   playlistItems: 1 unit/call  (~50 calls/refresh × 48 = 2,400/day)
 *   search:       100 units/call (cached 2h, ~12 calls/day × 100 = 1,200/day)
 *   Total: ~3,600 units/day — well within limits
 */

import Parser from 'rss-parser'

const API_BASE = 'https://www.googleapis.com/youtube/v3'
const rssParser = new Parser({ timeout: 9000 })

function getApiKey() {
  return process.env.youtubeapikey || process.env.YOUTUBE_API_KEY || ''
}

function decodeHtml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

// ── Global energy channels ────────────────────────────────────────────────────
const GLOBAL_CHANNELS = [
  { id: 'UC-EZ6mRgHRi7V2mQnU3xxdg', name: 'IEA' },
  { id: 'UCsRswimGttupKwVWa1LNt-Q', name: 'IRENA' },
  { id: 'UChNAU6hC-QOgdQu38MawCnQ', name: 'BloombergNEF' },
  { id: 'UCJosEMbY3NmU-Jz52cTO2Kg', name: 'Rocky Mountain Institute' },
  { id: 'UCAkVWXKsmZ3EuAaj-3yxFYA', name: 'Canary Media' },
  { id: 'UCSUThAoiQIrb5lqUAwbaxfg', name: 'CleanTechnica' },
  { id: 'UCdK2BueKxC9VxXh7e1Ne4oQ', name: 'Bloomberg Television' },
  { id: 'UCcOIZzJgLCyMPILY7-1Vsdg', name: 'Electrek' },
]

// ── Per-sector channel mapping ────────────────────────────────────────────────
export const SECTOR_CHANNELS = {
  Solar: [
    { id: 'UCwyMZZT9OStWV93hdSzNPfw', name: 'LONGi Solar' },
    { id: 'UCS8A0H0xlnzUmnIC1LX82AA', name: 'SolarPower Europe' },
    { id: 'UClh1-SF0TlJgSo3vUjR7WYQ', name: 'SEIA' },
    { id: 'UC-EZ6mRgHRi7V2mQnU3xxdg', name: 'IEA' },
    { id: 'UCJosEMbY3NmU-Jz52cTO2Kg', name: 'Rocky Mountain Institute' },
  ],
  Wind: [
    { id: 'UCjFuSrQZhWBAZsXf8lGbaSQ', name: 'GWEC' },
    { id: 'UCt7COviBbnPVmuQC37XoHhw', name: 'Vestas' },
    { id: 'UCS5dJ99ZB7Gy0GD_md1P67A', name: 'WindEurope' },
    { id: 'UCsRswimGttupKwVWa1LNt-Q', name: 'IRENA' },
    { id: 'UChNAU6hC-QOgdQu38MawCnQ', name: 'BloombergNEF' },
  ],
  Hydro: [
    { id: 'UCsRswimGttupKwVWa1LNt-Q', name: 'IRENA' },
    { id: 'UC-EZ6mRgHRi7V2mQnU3xxdg', name: 'IEA' },
    { id: 'UCJosEMbY3NmU-Jz52cTO2Kg', name: 'Rocky Mountain Institute' },
    { id: 'UCAkVWXKsmZ3EuAaj-3yxFYA', name: 'Canary Media' },
  ],
  Geothermal: [
    { id: 'UCSqOWncVIrqAPH2pkPqCxTg', name: 'Geothermal Rising' },
    { id: 'UCvRx_SSV897Nm4e7NQbt5vQ', name: 'ThinkGeoEnergy' },
    { id: 'UCsRswimGttupKwVWa1LNt-Q', name: 'IRENA' },
    { id: 'UC-EZ6mRgHRi7V2mQnU3xxdg', name: 'IEA' },
  ],
  Storage: [
    { id: 'UChNAU6hC-QOgdQu38MawCnQ', name: 'BloombergNEF' },
    { id: 'UCJosEMbY3NmU-Jz52cTO2Kg', name: 'Rocky Mountain Institute' },
    { id: 'UCAkVWXKsmZ3EuAaj-3yxFYA', name: 'Canary Media' },
    { id: 'UCl9ddWwc4ktM-JVBFglayTQ', name: 'CATL Official' },
    { id: 'UC-EZ6mRgHRi7V2mQnU3xxdg', name: 'IEA' },
  ],
  Nuclear: [
    { id: 'UCgD5A0pDdQemlXUbIUDDkpQ', name: 'World Nuclear Association' },
    { id: 'UCOID9Mio--rP1PxqS_z8Wiw', name: 'IAEA' },
    { id: 'UC_Jn5u2shgFMMTEUnfF_WvQ', name: 'NuScale Power' },
    { id: 'UCJosEMbY3NmU-Jz52cTO2Kg', name: 'Rocky Mountain Institute' },
    { id: 'UC-EZ6mRgHRi7V2mQnU3xxdg', name: 'IEA' },
  ],
  EV: [
    { id: 'UC5WjFrtBdufl6CZojX3D8dQ', name: 'Tesla' },
    { id: 'UCcOIZzJgLCyMPILY7-1Vsdg', name: 'Electrek' },
    { id: 'UCBTwNMozDdRPaFtbC2n2FeA', name: 'InsideEVs' },
    { id: 'UCPMdVVKDEUrbp3nH46sTZmg', name: 'Rivian' },
    { id: 'UChNAU6hC-QOgdQu38MawCnQ', name: 'BloombergNEF' },
  ],
  Hydrogen: [
    { id: 'UCEeRePYoX3YIdovXHtofi8Q', name: 'Hydrogen Council' },
    { id: 'UCJosEMbY3NmU-Jz52cTO2Kg', name: 'Rocky Mountain Institute' },
    { id: 'UCsRswimGttupKwVWa1LNt-Q', name: 'IRENA' },
    { id: 'UC-EZ6mRgHRi7V2mQnU3xxdg', name: 'IEA' },
    { id: 'UCSUThAoiQIrb5lqUAwbaxfg', name: 'CleanTechnica' },
  ],
}

// ── Sector search queries (for trending discovery) ────────────────────────────
const SECTOR_SEARCH_QUERIES = {
  Solar:      'solar energy panel photovoltaic industry news',
  Wind:       'wind energy turbine offshore wind farm news',
  Hydro:      'hydropower hydroelectric dam energy news',
  Geothermal: 'geothermal energy power plant news',
  Storage:    'battery energy storage grid BESS news',
  Nuclear:    'nuclear power reactor SMR energy news',
  EV:         'electric vehicle EV charging industry news',
  Hydrogen:   'green hydrogen electrolyzer fuel cell news',
}
const GLOBAL_SEARCH_QUERY = 'energy transition renewable clean power news'

// ── Per-sector static fallbacks ───────────────────────────────────────────────
const mkFallback = (title, channel, url, desc) => ({
  title, channel, url, videoId: '', thumbnail: '', pubDate: new Date().toISOString(), isLive: false, description: desc,
})

export const SECTOR_FALLBACK_VIDEOS = {
  Solar: [
    mkFallback('Global Solar Power Capacity Hits 3 TW', 'IEA', 'https://www.youtube.com/@IEAenergy', 'IEA report on milestone solar capacity.'),
    mkFallback('LONGi Hi-MO X10 Module Launch', 'LONGi Solar', 'https://www.youtube.com/@longi_solar', 'Next-gen bifacial module announcement.'),
    mkFallback('US Solar Market Outlook 2026', 'SEIA', 'https://www.youtube.com/@seia', 'SEIA mid-year market update.'),
    mkFallback('Solar PV Cost Curves to 2030', 'BloombergNEF', 'https://www.youtube.com/@BloombergNEF', 'BNEF solar LCOE forecast analysis.'),
  ],
  Wind: [
    mkFallback('Global Wind Report 2026 – GWEC Launch', 'GWEC', 'https://www.youtube.com/@gwecglobal', 'Annual global wind market statistics.'),
    mkFallback('Offshore Wind Finance Summit Recap', 'BloombergNEF', 'https://www.youtube.com/@BloombergNEF', 'BNEF offshore wind financing panel.'),
    mkFallback('Vestas V236-15MW Turbine Deployment', 'Vestas', 'https://www.youtube.com/@vestas', "World's largest serial-produced offshore turbine."),
    mkFallback('WindEurope Annual Statistics 2026', 'WindEurope', 'https://www.youtube.com/@windeurope', 'European wind market capacity figures.'),
  ],
  Hydro: [
    mkFallback('Hydropower Status Report 2026 – IHA', 'IHA', 'https://www.youtube.com/c/InternationalHydropowerAssociation', 'Annual global hydropower capacity update.'),
    mkFallback('Pumped Storage Hydro – The Grid Battery', 'IRENA', 'https://www.youtube.com/@IRENAchannel', 'IRENA pumped hydro flexibility report.'),
    mkFallback('Three Gorges Dam – 2026 Operations', 'IEA', 'https://www.youtube.com/@IEAenergy', 'IEA analysis of large hydro operations.'),
  ],
  Geothermal: [
    mkFallback('Geothermal Rising Forum 2026 Highlights', 'Geothermal Rising', 'https://www.youtube.com/@geothermalrising', 'Key sessions from GRF 2026.'),
    mkFallback('Enhanced Geothermal Systems – Next Frontier', 'ThinkGeoEnergy', 'https://www.youtube.com/@thinkgeoenergy', 'EGS technology deep-dive.'),
    mkFallback('Iceland Geothermal District Heating', 'IRENA', 'https://www.youtube.com/@IRENAchannel', 'IRENA case study on Icelandic geothermal.'),
  ],
  Storage: [
    mkFallback('CATL Condensed Battery Tech Briefing', 'CATL', 'https://www.youtube.com/@CATL_Official', 'Next-gen condensed matter cell launch.'),
    mkFallback('Grid-Scale Battery Storage – 2 TW by 2030?', 'BloombergNEF', 'https://www.youtube.com/@BloombergNEF', 'BNEF storage deployment forecast.'),
    mkFallback('Long-Duration Energy Storage Roundtable', 'Rocky Mountain Institute', 'https://www.youtube.com/@RockyMountainInstitute', 'LDES technology pathways panel.'),
    mkFallback('Tesla Megapack Deployment – Hornsdale Update', 'Canary Media', 'https://www.youtube.com/@canarymedia', "World's largest battery operations report."),
  ],
  Nuclear: [
    mkFallback('IAEA World Nuclear Performance Report 2026', 'IAEA', 'https://www.youtube.com/@iaeaorg', 'Annual nuclear fleet performance statistics.'),
    mkFallback('Small Modular Reactors – Global Pipeline', 'World Nuclear Association', 'https://www.youtube.com/@worldnuclearassoc', 'WNA SMR deployment tracker update.'),
    mkFallback('NuScale VOYGR Commercial Operations', 'NuScale Power', 'https://www.youtube.com/@NuScalePower', 'First SMR commercial launch briefing.'),
    mkFallback('Nuclear – The Clean Energy Debate', 'IEA', 'https://www.youtube.com/@IEAenergy', 'IEA nuclear role in net-zero scenarios.'),
  ],
  EV: [
    mkFallback('Tesla Q1 2026 Delivery Report', 'Tesla', 'https://www.youtube.com/@Tesla', 'Tesla Q1 global delivery numbers.'),
    mkFallback('Global EV Outlook 2026 – IEA Launch', 'IEA', 'https://www.youtube.com/@IEAenergy', 'IEA annual EV market analysis.'),
    mkFallback('Rivian R2 Production Ramp Update', 'Rivian', 'https://www.youtube.com/@Rivian', 'Rivian Normal, IL factory status.'),
    mkFallback('BYD Surpasses 2M EVs – Monthly Record', 'BloombergNEF', 'https://www.youtube.com/@BloombergNEF', 'BNEF China EV market analysis.'),
  ],
  Hydrogen: [
    mkFallback('Hydrogen Council CEO Roundtable 2026', 'Hydrogen Council', 'https://www.youtube.com/@HydrogenCouncil', 'Annual hydrogen industry outlook.'),
    mkFallback('Green Hydrogen Below $2/kg – When?', 'Rocky Mountain Institute', 'https://www.youtube.com/@RockyMountainInstitute', 'RMI H2 cost-reduction pathway.'),
    mkFallback('IRENA Green Hydrogen Trade Report', 'IRENA', 'https://www.youtube.com/@IRENAchannel', 'H2 international trade potential.'),
    mkFallback('Nel Elektrolyser Factory – Norway Tour', 'Nel Hydrogen', 'https://www.youtube.com/@nel_hydrogen', 'Largest electrolyser factory capacity walk-through.'),
  ],
}

const GLOBAL_FALLBACK = [
  mkFallback('World Energy Outlook 2025 – IEA Launch', 'IEA', 'https://www.youtube.com/@IEAenergy', 'IEA flagship World Energy Outlook launch.'),
  mkFallback('Renewable Energy Statistics 2026 – IRENA', 'IRENA', 'https://www.youtube.com/@IRENAchannel', 'IRENA capacity statistics launch webinar.'),
  mkFallback('Global Energy Market Update Q1 2026', 'Wood Mackenzie', 'https://www.youtube.com/@WoodMac_energy', 'Wood Mackenzie Q1 energy market trends.'),
  mkFallback('Battery Storage: Race to 1 TWh', 'BloombergNEF', 'https://www.youtube.com/@BloombergNEF', 'BNEF storage deployment deep-dive.'),
  mkFallback('Offshore Wind: Financing the Next Wave', 'Wood Mackenzie', 'https://www.youtube.com/@WoodMac_energy', 'Offshore wind financing analysis.'),
  mkFallback('Green Hydrogen – 2030 Cost Targets', 'Rocky Mountain Institute', 'https://www.youtube.com/@RockyMountainInstitute', 'RMI H2 cost reduction pathways.'),
]

// ── YouTube Data API v3 helpers ───────────────────────────────────────────────

/** Convert channel ID (UC…) → uploads playlist ID (UU…) */
function uploadsPlaylistId(channelId) {
  return channelId.startsWith('UC') ? 'UU' + channelId.slice(2) : channelId
}

/** Fetch latest uploads from a channel via playlistItems (1 quota unit) */
async function apiFetchChannel(channel, limit = 5) {
  const key = getApiKey()
  const playlistId = uploadsPlaylistId(channel.id)
  const params = new URLSearchParams({
    part: 'snippet',
    playlistId,
    maxResults: String(limit),
    key,
  })
  const res = await fetch(`${API_BASE}/playlistItems?${params}`, {
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()

  return (data.items || []).map(item => {
    const s = item.snippet || {}
    const videoId = s.resourceId?.videoId || ''
    const title = decodeHtml((s.title || '').trim())
    return {
      title,
      channel: channel.name,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      videoId,
      thumbnail: s.thumbnails?.medium?.url || s.thumbnails?.default?.url ||
                 (videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : ''),
      pubDate: s.publishedAt || new Date().toISOString(),
      isLive: /\b(live|streaming|premiere)\b/i.test(title),
      description: decodeHtml((s.description || '').slice(0, 160)),
    }
  })
}

/** Search YouTube for videos (100 quota units — results cached 2h) */
const searchCache = new Map()
const SEARCH_TTL = 2 * 60 * 60 * 1000

async function apiSearch(query, maxResults = 8) {
  const key = getApiKey()
  const cached = searchCache.get(query)
  if (cached && Date.now() - cached.ts < SEARCH_TTL) return cached.data

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    order: 'date',
    maxResults: String(maxResults),
    relevanceLanguage: 'en',
    publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    key,
  })
  const res = await fetch(`${API_BASE}/search?${params}`, {
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) return cached?.data || []
  const data = await res.json()

  const videos = (data.items || []).map(item => ({
    title: decodeHtml(item.snippet?.title || ''),
    channel: decodeHtml(item.snippet?.channelTitle || ''),
    url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
    videoId: item.id?.videoId || '',
    thumbnail: item.snippet?.thumbnails?.medium?.url || '',
    pubDate: item.snippet?.publishedAt || new Date().toISOString(),
    isLive: item.snippet?.liveBroadcastContent === 'live',
    description: decodeHtml((item.snippet?.description || '').slice(0, 160)),
  }))

  searchCache.set(query, { ts: Date.now(), data: videos })
  return videos
}

// ── RSS fallback ──────────────────────────────────────────────────────────────
const channelRssUrl = (channelId) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`

function parseEntry(item, channelName) {
  const raw = item.link || item.url || ''
  const match = raw.match(/[?&]v=([A-Za-z0-9_-]{11})/) || raw.match(/youtu\.be\/([A-Za-z0-9_-]{11})/)
  const videoId = match?.[1] || ''
  const title = (item.title || '').replace(/\s+/g, ' ').trim()
  const isLive = /\b(live|streaming|stream|webinar|conference|summit)\b/i.test(title)
  return {
    title,
    channel: channelName,
    url: raw || `https://www.youtube.com/watch?v=${videoId}`,
    videoId,
    thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : '',
    pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
    isLive,
    description: (item.contentSnippet || item.content || '').slice(0, 160),
  }
}

async function rssFetchChannel(channel, limit = 5) {
  try {
    const feed = await rssParser.parseURL(channelRssUrl(channel.id))
    return (feed?.items || []).slice(0, limit).map((item) => parseEntry(item, channel.name))
  } catch {
    return []
  }
}

// ── Unified channel fetch — API preferred, RSS fallback ───────────────────────

async function fetchChannel(channel, limit = 5) {
  if (getApiKey()) {
    try {
      return await apiFetchChannel(channel, limit)
    } catch (err) {
      console.warn(`[youtube] API failed for ${channel.name}: ${err.message}, falling back to RSS`)
    }
  }
  return rssFetchChannel(channel, limit)
}

// ── Dedup + sort ──────────────────────────────────────────────────────────────
function dedup(videos) {
  const seen = new Set()
  return videos.filter(v => {
    const key = v.videoId || v.url
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
}

// ── Public exports ────────────────────────────────────────────────────────────

export async function fetchYoutube(perChannel = 4) {
  const useApi = !!getApiKey()
  if (useApi) console.log('[youtube] Using YouTube Data API v3')
  else console.log('[youtube] No API key — using RSS feeds')

  // Channel uploads
  const channelResults = await Promise.allSettled(
    GLOBAL_CHANNELS.map(ch => fetchChannel(ch, perChannel))
  )
  const channelVideos = channelResults.flatMap(r => r.status === 'fulfilled' ? r.value : [])

  // Trending search (API only, cached 2h)
  let searchVideos = []
  if (useApi) {
    try {
      searchVideos = await apiSearch(GLOBAL_SEARCH_QUERY, 10)
    } catch { /* non-critical */ }
  }

  const all = dedup([...channelVideos, ...searchVideos])
  return all.length > 0 ? all.slice(0, 30) : GLOBAL_FALLBACK
}

export async function fetchYoutubeForSector(sector, perChannel = 4) {
  const useApi = !!getApiKey()
  const channels = SECTOR_CHANNELS[sector] || GLOBAL_CHANNELS.slice(0, 3)

  // Channel uploads
  const channelResults = await Promise.allSettled(
    channels.map(ch => fetchChannel(ch, perChannel))
  )
  const channelVideos = channelResults.flatMap(r => r.status === 'fulfilled' ? r.value : [])

  // Sector search (API only, cached 2h)
  let searchVideos = []
  if (useApi && SECTOR_SEARCH_QUERIES[sector]) {
    try {
      searchVideos = await apiSearch(SECTOR_SEARCH_QUERIES[sector], 8)
    } catch { /* non-critical */ }
  }

  const all = dedup([...channelVideos, ...searchVideos])
  const fallback = SECTOR_FALLBACK_VIDEOS[sector] || GLOBAL_FALLBACK
  return all.length > 0 ? all.slice(0, 20) : fallback
}
