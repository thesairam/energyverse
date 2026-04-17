/**
 * Priority scoring for intelligence feed items.
 * score = (recency × 0.45) + (sourceRank × 0.30) + (engagement × 0.25)
 * Returns 0–100.
 */

const SOURCE_RANK = {
  'iea.org': 20, 'irena.org': 20, 'bnef.com': 20, 'spglobal.com': 18,
  'reuters.com': 18, 'reuters': 18, 'bloomberg.com': 18, 'bloomberg': 18,
  'ft.com': 17, 'financial times': 17, 'wsj.com': 16, 'wall street journal': 16,
  'pv-magazine.com': 15, 'pv magazine': 15, 'pv tech': 15,
  'rechargenews.com': 15, 'recharge': 15, 'recharge news': 15,
  'windpower-monthly.com': 14, 'windpower monthly': 14,
  'energymonitor.ai': 14, 'energy monitor': 14,
  'electrek.co': 13, 'electrek': 13,
  'cleantechnica.com': 12, 'cleantechnica': 12,
  'greentechmedia.com': 12, 'greentech media': 12,
  'hydropower.org': 12, 'international hydropower association': 12,
  'energy.gov': 14, 'department of energy': 14, 'us dept of energy': 14,
  'offshorewind.biz': 14, 'offshore wind biz': 14,
  'canary media': 13, 'canarymedia.com': 13,
  'utility dive': 13, 'utilitydive.com': 13,
  'solar power world': 12, 'solarpowerworldonline.com': 12,
  'energy storage news': 12, 'energy-storage.news': 12,
  'world nuclear news': 13,
  'international water power': 12,
  // New sources from newssources.md
  'renewable energy world': 14, 'renewableenergyworld.com': 14,
  'altenergymag': 11, 'altenergymag.com': 11,
  'energy live news': 12, 'energylivenews.com': 12,
  'smart energy international': 12, 'smart-energy.com': 12,
  'power magazine': 13, 'powermag.com': 13,
  'mit energy initiative': 15, 'energy.mit.edu': 15,
  'renewables now': 13, 'renewablesnow.com': 13,
  'solar daily': 10, 'solardaily.com': 10,
  'energysage': 11, 'news.energysage.com': 11,
  'solarquotes': 11, 'solarquotes.com.au': 11,
  'renews': 13, 'renews.biz': 13,
  'windeurope': 14, 'windeurope.org': 14,
  'gwec': 14, 'gwec.net': 14,
  'battery industry': 11, 'batteryindustry.tech': 11,
  'insideevs': 12, 'insideevs.com': 12,
  'charged evs': 11, 'chargedevs.com': 11,
  'green car reports': 12, 'greencarreports.com': 12,
  'businessgreen': 12, 'businessgreen.com': 12,
  'clean energy wire': 14, 'cleanenergywire.org': 14,
  'mercom india': 12, 'mercomindia.com': 12,
  'solarquarter': 11, 'solarquarter.com': 11,
  'reneweconomy': 13, 'reneweconomy.com.au': 13,
  'one step off grid': 10, 'onestepoffthegrid.com.au': 10,
  'china energy portal': 12, 'chinaenergyportal.org': 12,
  'euractiv': 13, 'euractiv.com': 13,
  'esi africa': 11, 'esi-africa.com': 11,
  'pv magazine latam': 12, 'pv-magazine-latam.com': 12,
  'pv magazine germany': 13, 'pv-magazine.de': 13,
  'european commission energy': 16, 'energy.ec.europa.eu': 16,
  'nasa climate': 15, 'climate.nasa.gov': 15,
  // General media
  'techcrunch.com': 8, 'techcrunch': 8,
  'cnbc.com': 9, 'cnbc': 9,
  'bbc.co.uk': 9, 'bbc': 9,
  'theguardian.com': 9, 'the guardian': 9,
  'nikkei asia': 12, 'nikkei': 12,
  'livemint': 10, 'economic times': 10, 'hindu business line': 10,
  'saur energy': 11,
  'reddit.com': 5, 'github.com': 4,
}

const HIGH_PRIORITY_KEYWORDS = [
  'gigawatt', 'gw ', 'record', 'first', 'breakthrough', 'approved', 'awarded',
  'completed', 'online', 'commercial', 'milestone', 'smr', 'electrolyzer',
  'v2g', 'auction', 'offtake', 'fid', 'ipo', 'acquisition',
]

function recencyScore(pubDate) {
  if (!pubDate) return 5
  const ageMs = Date.now() - new Date(pubDate).getTime()
  if (Number.isNaN(ageMs)) return 5
  const ageH = ageMs / 3_600_000
  if (ageH < 1)  return 40
  if (ageH < 6)  return 35
  if (ageH < 24) return 28
  if (ageH < 72) return 18
  if (ageH < 168) return 10
  return 5
}

function engagementScore(activity) {
  if (!activity) return 0
  const match = String(activity).match(/(\d+)/)
  if (!match) return 0
  const count = Number(match[1])
  if (count >= 500) return 30
  if (count >= 100) return 22
  if (count >= 20) return 14
  if (count >= 5) return 8
  return 2
}

function sourceRankScore(source) {
  if (!source) return 0
  const lower = source.toLowerCase()
  for (const [domain, rank] of Object.entries(SOURCE_RANK)) {
    if (lower.includes(domain)) return rank
  }
  return 3
}

function keywordBoost(title) {
  if (!title) return 0
  const lower = title.toLowerCase()
  const hits = HIGH_PRIORITY_KEYWORDS.filter((kw) => lower.includes(kw))
  return Math.min(hits.length * 4, 10)
}

export function scoreItem(item) {
  return (
    recencyScore(item.pubDate || item.time) +
    engagementScore(item.activity) +
    sourceRankScore(item.source) +
    keywordBoost(item.title || item.headline || '')
  )
}

export function rankItems(items) {
  for (const item of items) item.score = scoreItem(item)
  return items.sort((a, b) => b.score - a.score)
}
