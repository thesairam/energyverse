/**
 * pipeline.js — Renewable Energy News Ingestion Pipeline
 *
 * Implements the strategy from strategy.md:
 *   Query → Normalize → Deduplicate → Filter → Tag & Categorize → Rank → Store & Serve
 *
 * Core idea (strategy.md):
 *   "Pull everything → keep what matters → structure it"
 */

import { createHash } from 'crypto'

// ═══════════════════════════════════════════════════════════════════════════════
// §2  NORMALIZATION LAYER
//
//   Convert all incoming data into a unified schema:
//   { title, description, url, source, published_at, language, content }
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Normalize a raw RSS item into the unified schema from strategy.md §2.
 */
export function normalizeItem(raw, feedSource, feedRegion) {
  const title = stripHtml(raw.title || '')
  const url = cleanUrl(raw.link || raw.guid || raw.url || '')
  const publishedAt = raw.pubDate || raw.isoDate || raw.published || ''
  const content = stripHtml(raw.content || raw.summary || '')
  const description = stripHtml(raw.contentSnippet || raw.description || content || '')

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
    description,
    url,
    source,
    published_at: publishedAt,
    language: detectLanguage(cleanTitle),
    content,
    // Derived fields for pipeline stages
    time: formatTime(publishedAt),
    feedRegion: feedRegion || 'Global',
    _contentHash: contentHash(cleanTitle, url),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3  DEDUPLICATION LAYER
//
//   Remove duplicate stories using:
//   - URL normalization
//   - Title similarity (fuzzy matching)
//   - Content hashing
//
//   Output: one canonical article per story
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Deduplicate items using URL normalization, title similarity, and content hashing.
 */
export function deduplicateItems(items) {
  const seen = new Map()

  return items.filter(item => {
    // 1. URL normalization
    const normUrl = canonicalUrl(item.url)
    if (normUrl && normUrl !== 'news.google.com' && seen.has('url:' + normUrl)) {
      return false
    }

    // 2. Content hashing
    if (item._contentHash && seen.has('hash:' + item._contentHash)) {
      return false
    }

    // 3. Title similarity (fuzzy: first 50 chars, alphanumeric only)
    const titleKey = (item.title || '').slice(0, 50).toLowerCase().replace(/[^a-z0-9]/g, '')
    if (titleKey.length > 10 && seen.has('title:' + titleKey)) {
      return false
    }

    // Mark as seen
    if (normUrl) seen.set('url:' + normUrl, true)
    if (item._contentHash) seen.set('hash:' + item._contentHash, true)
    if (titleKey.length > 10) seen.set('title:' + titleKey, true)

    return true
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4  RELEVANCE FILTERING
//
//   Keep: solar projects, wind farms, EV developments, battery storage systems
//   Remove: unrelated meanings (e.g., "solar flare")
//   Use: keyword scoring
// ═══════════════════════════════════════════════════════════════════════════════

// False-positive patterns to reject (strategy.md: remove "solar flare" etc.)
const FALSE_POSITIVES = [
  'solar flare', 'solar eclipse', 'solar system', 'solar plexus',
  'wind chill', 'wind advisory', 'wind warning', 'wind shear',
  'nuclear family', 'nuclear option', 'nuclear football',
  'battery assault', 'battery charge crime',
  'storage unit rental', 'storage auction',
  'charged with murder', 'charged with assault', 'charged with fraud',
]

// Sector keywords for relevance matching
const SECTOR_KEYWORDS = {
  Solar: ['solar', 'photovoltaic', 'pv ', 'pv-', 'rooftop', 'sunpower', 'longi', 'jinko', 'trina', 'first solar', 'enphase', 'solaredge', 'nrel'],
  Wind: ['wind', 'turbine', 'offshore wind', 'onshore wind', 'vestas', 'siemens gamesa', 'floating wind', 'wind farm', 'gwec'],
  Hydro: ['hydro', 'hydropower', 'hydroelectric', 'dam ', 'pumped storage', 'run of river', 'tidal', 'wave energy'],
  Geothermal: ['geothermal', 'egs', 'enhanced geothermal', 'fervo', 'heat pump', 'geotherm'],
  Storage: ['battery', 'storage', 'bess', 'lithium', 'lfp', 'nmc', 'solid state battery', 'flow battery', 'energy storage', 'catl', 'gigafactory', 'ldes'],
  Nuclear: ['nuclear', 'reactor', 'smr', 'fission', 'fusion', 'uranium', 'tokamak', 'iter', 'nuscale', 'x-energy', 'kairos'],
  EV: ['electric vehicle', ' ev ', 'ev ', 'tesla', 'byd', 'rivian', 'charging', 'v2g', 'vehicle-to-grid', 'dcfc', 'supercharger', 'electrify'],
  Hydrogen: ['hydrogen', 'electrolyzer', 'electrolysis', 'fuel cell', 'h2 ', 'green hydrogen', 'blue hydrogen', 'ammonia'],
}

// General energy keywords
const ENERGY_KEYWORDS = [
  'energy', 'power', 'electric', 'renewable', 'clean', 'green', 'grid', 'utility',
  'carbon', 'emission', 'climate', 'sustainability', 'transition', 'decarboni',
  'megawatt', 'gigawatt', 'kilowatt', 'kwh', 'mwh', 'gwh',
  'solar', 'wind', 'hydro', 'nuclear', 'geothermal', 'hydrogen', 'battery', 'storage',
  'ev ', 'electric vehicle', 'charging', 'turbine', 'panel', 'inverter', 'transformer',
  'offshore', 'onshore', 'distributed', 'microgrid', 'smart grid',
  'pv', 'photovoltaic', 'fuel cell', 'electrolyzer', 'reactor', 'smr',
]

// Known energy sources -- items from these always pass relevance filter
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

/**
 * Filter items for energy relevance (strategy.md §4).
 * Removes false positives and non-energy content.
 */
export function filterRelevance(items, sectorSlug) {
  const sectorKws = SECTOR_KEYWORDS[sectorSlug] || []

  return items.filter(item => {
    const text = (item.title + ' ' + item.description).toLowerCase()

    // Reject false positives first (strategy.md: remove "solar flare" etc.)
    if (FALSE_POSITIVES.some(fp => text.includes(fp))) return false

    // Sector-specific keywords -> always relevant
    if (sectorKws.some(kw => text.includes(kw))) return true

    // General energy keywords -> relevant
    if (ENERGY_KEYWORDS.some(kw => text.includes(kw))) return true

    // From a known energy source -> trust it
    if (item.source && KNOWN_ENERGY_SOURCES.has(item.source.toLowerCase())) return true

    return false
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5  TAGGING & CATEGORIZATION
//
//   Assign structured tags:
//   - Domains: solar, wind, EV, battery
//   - Subtopics: policy, project, technology, market
//   - Geography: country, region
// ═══════════════════════════════════════════════════════════════════════════════

const REGION_KEYWORDS = {
  NAM: ['us ', 'usa', 'united states', 'america', 'canada', 'mexico', 'texas', 'california', 'doe', 'ferc', 'ira ', 'congress'],
  EMEA: ['europe', 'eu ', 'uk ', 'britain', 'germany', 'france', 'spain', 'italy', 'netherlands', 'norway', 'denmark', 'sweden', 'finland', 'ireland', 'scotland', 'portugal'],
  APAC: ['china', 'india', 'japan', 'korea', 'australia', 'indonesia', 'vietnam', 'thailand', 'taiwan', 'singapore', 'asean', 'asia', 'pacific'],
  MEA: ['africa', 'saudi', 'uae', 'emirates', 'middle east', 'egypt', 'morocco', 'kenya', 'south africa', 'nigeria'],
  LATAM: ['brazil', 'chile', 'argentina', 'colombia', 'mexico', 'latin america', 'caribbean', 'peru'],
}

const SUBTOPIC_PATTERNS = {
  policy: ['policy', 'regulation', 'legislation', 'government', 'subsidy', 'tariff', 'incentive', 'mandate', 'standard', 'compliance', 'permit', 'approval', 'ban', 'tax credit'],
  project: ['project', 'plant', 'farm', 'facility', 'commission', 'construction', 'operational', 'capacity', 'mw', 'gw', 'megawatt', 'gigawatt'],
  technology: ['technology', 'innovation', 'research', 'breakthrough', 'patent', 'prototype', 'efficiency', 'performance', 'lab', 'test', 'record'],
  market: ['investment', 'funding', 'ipo', 'acquisition', 'merger', 'deal', 'valuation', 'revenue', 'profit', 'stock', 'share', 'market cap', 'billion', 'million', 'startup', 'seed', 'series a', 'venture'],
}

/**
 * Auto-tag a single item with domains, subtopics, and geography (strategy.md §5).
 */
export function tagItem(item) {
  const text = (item.title + ' ' + (item.description || '')).toLowerCase()

  const domains = []
  const subtopics = []
  const regions = []

  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) domains.push(sector)
  }

  for (const [subtopic, patterns] of Object.entries(SUBTOPIC_PATTERNS)) {
    if (patterns.some(p => text.includes(p))) subtopics.push(subtopic)
  }

  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) regions.push(region)
  }
  if (item.feedRegion && item.feedRegion !== 'Global' && !regions.includes(item.feedRegion)) {
    regions.push(item.feedRegion)
  }

  item.domains = domains
  item.subtopics = subtopics
  item.regions = regions
  // Backward-compatible aliases
  item.sectors = domains
  item.categories = subtopics

  return item
}

export function tagItems(items) {
  return items.map(tagItem)
}

// ═══════════════════════════════════════════════════════════════════════════════
// FULL PIPELINE (§2 -> §5, ranking handled by scorer.js §6)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run the full pipeline: normalize -> dedup -> filter -> tag.
 * Ranking (§6) is handled separately by scorer.js.
 */
export function processPipeline(rawItems, sectorSlug, feedSource, feedRegion) {
  const normalized = rawItems.map(raw => normalizeItem(raw, feedSource, feedRegion))
  const deduped = deduplicateItems(normalized)
  const filtered = filterRelevance(deduped, sectorSlug)
  return tagItems(filtered)
}

/**
 * Merge items from multiple sources, then deduplicate across all of them.
 */
export function mergeAndDeduplicate(...itemArrays) {
  return deduplicateItems(itemArrays.flat())
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function stripHtml(value) {
  return (value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function cleanUrl(url) {
  try {
    const u = new URL(url)
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      u.searchParams.delete(key)
    }
    return u.toString()
  } catch {
    return url
  }
}

function canonicalUrl(url) {
  try {
    const u = new URL(url)
    return (u.hostname + u.pathname).replace(/\/+$/, '').toLowerCase()
  } catch {
    return ''
  }
}

function contentHash(title, url) {
  const input = (title + '|' + canonicalUrl(url)).toLowerCase()
  return createHash('md5').update(input).digest('hex').slice(0, 12)
}

function formatTime(isoDate) {
  if (!isoDate) return 'n/a'
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return 'n/a'
  return parsed.toUTCString().slice(17, 22) + ' UTC'
}

function detectLanguage(text) {
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh'
  if (/[\u3040-\u30ff]/.test(text)) return 'ja'
  if (/[\uac00-\ud7af]/.test(text)) return 'ko'
  if (/[\u0900-\u097f]/.test(text)) return 'hi'
  if (/[\u0600-\u06ff]/.test(text)) return 'ar'
  return 'en'
}
