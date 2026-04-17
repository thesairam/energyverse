/**
 * pipeline.js — News Ingestion Pipeline
 *
 * Implements the strategy from strategy.md:
 *   Query → Normalize → Deduplicate → Filter → Tag → Rank → Serve
 *
 * This module processes raw RSS items from diverse sources into
 * clean, deduplicated, tagged, and ranked intelligence items.
 */

// ── Sector keyword maps for auto-tagging ──────────────────────────────────────
const SECTOR_KEYWORDS = {
  Solar: ['solar', 'photovoltaic', 'pv ', 'pv-', 'rooftop', 'sunpower', 'longi', 'jinko', 'trina', 'first solar', 'enphase', 'solaredge', 'nrel'],
  Wind: ['wind', 'turbine', 'offshore wind', 'onshore wind', 'vestas', 'siemens gamesa', 'ørsted', 'orsted', 'floating wind', 'wind farm', 'gwec'],
  Hydro: ['hydro', 'hydropower', 'hydroelectric', 'dam ', 'pumped storage', 'run of river', 'tidal', 'wave energy'],
  Geothermal: ['geothermal', 'egs', 'enhanced geothermal', 'fervo', 'heat pump', 'geotherm'],
  Storage: ['battery', 'storage', 'bess', 'lithium', 'lfp', 'nmc', 'solid state battery', 'flow battery', 'energy storage', 'catl', 'gigafactory', 'ldes'],
  Nuclear: ['nuclear', 'reactor', 'smr', 'fission', 'fusion', 'uranium', 'tokamak', 'iter', 'nuscale', 'x-energy', 'kairos'],
  EV: ['electric vehicle', ' ev ', 'ev ', 'tesla', 'byd', 'rivian', 'charging', 'v2g', 'vehicle-to-grid', 'dcfc', 'supercharger', 'electrify'],
  Hydrogen: ['hydrogen', 'electrolyzer', 'electrolysis', 'fuel cell', 'h2 ', 'green hydrogen', 'blue hydrogen', 'ammonia'],
}

// ── Region keyword maps for auto-tagging ──────────────────────────────────────
const REGION_KEYWORDS = {
  NAM: ['us ', 'usa', 'united states', 'america', 'canada', 'mexico', 'texas', 'california', 'doe', 'ferc', 'ira ', 'congress'],
  EMEA: ['europe', 'eu ', 'uk ', 'britain', 'germany', 'france', 'spain', 'italy', 'netherlands', 'norway', 'denmark', 'sweden', 'finland', 'ireland', 'scotland', 'portugal'],
  APAC: ['china', 'india', 'japan', 'korea', 'australia', 'indonesia', 'vietnam', 'thailand', 'taiwan', 'singapore', 'asean', 'asia', 'pacific'],
  MEA: ['africa', 'saudi', 'uae', 'emirates', 'middle east', 'egypt', 'morocco', 'kenya', 'south africa', 'nigeria'],
  LATAM: ['brazil', 'chile', 'argentina', 'colombia', 'mexico', 'latin america', 'caribbean', 'peru'],
}

// ── Category patterns for content categorization ──────────────────────────────
const CATEGORY_PATTERNS = {
  policy: ['policy', 'regulation', 'legislation', 'government', 'subsidy', 'tariff', 'incentive', 'mandate', 'standard', 'compliance', 'permit', 'approval', 'ban', 'tax credit'],
  finance: ['investment', 'funding', 'ipo', 'acquisition', 'merger', 'deal', 'valuation', 'revenue', 'profit', 'stock', 'share', 'market cap', 'billion', 'million'],
  technology: ['technology', 'innovation', 'research', 'breakthrough', 'patent', 'prototype', 'efficiency', 'performance', 'lab', 'test', 'record'],
  startup: ['startup', 'seed', 'series a', 'series b', 'series c', 'venture', 'accelerator', 'incubator', 'founded'],
  project: ['project', 'plant', 'farm', 'facility', 'commission', 'construction', 'operational', 'capacity', 'mw', 'gw', 'megawatt', 'gigawatt'],
}

// ── Energy relevance keywords ─────────────────────────────────────────────────
const ENERGY_KEYWORDS = [
  'energy', 'power', 'electric', 'renewable', 'clean', 'green', 'grid', 'utility',
  'carbon', 'emission', 'climate', 'sustainability', 'transition', 'decarboni',
  'megawatt', 'gigawatt', 'kilowatt', 'kwh', 'mwh', 'gwh',
  'solar', 'wind', 'hydro', 'nuclear', 'geothermal', 'hydrogen', 'battery', 'storage',
  'ev ', 'electric vehicle', 'charging', 'turbine', 'panel', 'inverter', 'transformer',
  'offshore', 'onshore', 'distributed', 'microgrid', 'smart grid',
  'pv', 'photovoltaic', 'fuel cell', 'electrolyzer', 'reactor', 'smr',
]

// ── 1. Normalize ──────────────────────────────────────────────────────────────
/**
 * Normalize a raw RSS item into a standard format.
 * Handles items from Google News RSS, direct RSS feeds, etc.
 */
export function normalizeItem(raw, feedSource, feedRegion) {
  const title = cleanText(raw.title || '')
  const url = normalizeUrl(raw.link || raw.guid || raw.url || '')
  const pubDate = raw.pubDate || raw.isoDate || raw.published || ''
  const description = cleanText(raw.contentSnippet || raw.content || raw.summary || raw.description || '')

  // Extract source from Google News-style titles ("Headline - SourceName")
  let source = feedSource || ''
  let cleanTitle = title
  if (!feedSource || feedSource === 'Google News') {
    const parts = title.split(' - ')
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1].trim()
      if (lastPart.length > 0 && lastPart.length < 80 && !lastPart.includes('. ')) {
        source = lastPart
        cleanTitle = parts.slice(0, -1).join(' - ').trim()
      }
    }
  }

  return {
    title: cleanTitle,
    source,
    url,
    time: formatTime(pubDate),
    pubDate,
    description,
    feedRegion: feedRegion || 'Global',
    // These will be filled by tagging
    sectors: [],
    regions: [],
    categories: [],
  }
}

// ── 2. Deduplicate ────────────────────────────────────────────────────────────
/**
 * Deduplicate items by normalized URL and title similarity.
 * When duplicates are found, keep the one from the higher-ranked source.
 */
export function deduplicateItems(items) {
  const urlMap = new Map()
  const titleMap = new Map()

  for (const item of items) {
    // Check URL-based dedup
    const normUrl = item.url.replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase()
    if (normUrl && normUrl !== 'https://news.google.com') {
      if (urlMap.has(normUrl)) continue
      urlMap.set(normUrl, true)
    }

    // Check title-based dedup (first 50 chars, lowercased)
    const titleKey = item.title.slice(0, 50).toLowerCase().replace(/[^a-z0-9]/g, '')
    if (titleKey.length > 10) {
      if (titleMap.has(titleKey)) continue
      titleMap.set(titleKey, true)
    }

    urlMap.set(normUrl, item)
  }

  // Collect unique items preserving order
  const seen = new Set()
  const result = []
  for (const item of items) {
    const normUrl = item.url.replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase()
    const titleKey = item.title.slice(0, 50).toLowerCase().replace(/[^a-z0-9]/g, '')
    const key = `${normUrl}||${titleKey}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }
  return result
}

// ── 3. Relevance Filter ──────────────────────────────────────────────────────
/**
 * Filter items for energy relevance.
 * Items from known energy sources pass automatically.
 * Others need keyword matches in title or description.
 */
export function filterRelevance(items, sectorSlug) {
  const sectorKws = SECTOR_KEYWORDS[sectorSlug] || []

  return items.filter(item => {
    const text = `${item.title} ${item.description}`.toLowerCase()

    // Sector-specific keywords → always relevant
    if (sectorKws.some(kw => text.includes(kw))) return true

    // General energy keywords → relevant
    if (ENERGY_KEYWORDS.some(kw => text.includes(kw))) return true

    // From a known energy source → trust it
    if (item.source && isKnownEnergySource(item.source)) return true

    return false
  })
}

const KNOWN_ENERGY_SOURCES = new Set([
  'pv magazine', 'pv tech', 'cleantechnica', 'electrek', 'renewable energy world',
  'energy storage news', 'recharge news', 'renewables now', 'solar power world',
  'utility dive', 'canary media', 'power magazine', 'smart energy international',
  'insideevs', 'offshore wind biz', 'windeurope', 'gwec', 'battery industry',
  'renew economy', 'reneweconomy', 'mercom india', 'solarquarter', 'solar daily',
  'energysage', 'solarquotes', 'green car reports', 'charged evs',
  'clean energy wire', 'businessgreen', 'esi africa', 'euractiv',
  'iea', 'irena', 'mit energy initiative', 'us dept of energy', 'nasa climate',
  'bloomberg', 'reuters', 'financial times',
])

function isKnownEnergySource(source) {
  return KNOWN_ENERGY_SOURCES.has(source.toLowerCase())
}

// ── 4. Tag & Categorize ──────────────────────────────────────────────────────
/**
 * Auto-tag items with sectors, regions, and content categories.
 */
export function tagItem(item) {
  const text = `${item.title} ${item.description}`.toLowerCase()

  // Tag sectors
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      item.sectors.push(sector)
    }
  }

  // Tag regions from content + feed metadata
  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      item.regions.push(region)
    }
  }
  if (item.feedRegion && item.feedRegion !== 'Global' && !item.regions.includes(item.feedRegion)) {
    item.regions.push(item.feedRegion)
  }

  // Tag categories
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (patterns.some(p => text.includes(p))) {
      item.categories.push(category)
    }
  }

  return item
}

export function tagItems(items) {
  return items.map(tagItem)
}

// ── 5. Full Pipeline ─────────────────────────────────────────────────────────
/**
 * Run the full pipeline: normalize → dedup → filter → tag
 * Ranking is handled by scorer.js separately.
 */
export function processPipeline(rawItems, sectorSlug, feedSource, feedRegion) {
  const normalized = rawItems.map(raw => normalizeItem(raw, feedSource, feedRegion))
  const deduped = deduplicateItems(normalized)
  const filtered = filterRelevance(deduped, sectorSlug)
  const tagged = tagItems(filtered)
  return tagged
}

/**
 * Merge items from multiple sources, deduplicate across all of them.
 */
export function mergeAndDeduplicate(...itemArrays) {
  const all = itemArrays.flat()
  return deduplicateItems(all)
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function cleanText(value) {
  return (value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function normalizeUrl(url) {
  try {
    const u = new URL(url)
    // Remove tracking params
    u.searchParams.delete('utm_source')
    u.searchParams.delete('utm_medium')
    u.searchParams.delete('utm_campaign')
    u.searchParams.delete('utm_content')
    u.searchParams.delete('utm_term')
    return u.toString()
  } catch {
    return url
  }
}

function formatTime(isoDate) {
  if (!isoDate) return 'n/a'
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return 'n/a'
  return parsed.toUTCString().slice(17, 22) + ' UTC'
}
