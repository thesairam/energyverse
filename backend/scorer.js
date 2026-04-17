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
  'solarwakeup': 11, 'solarwakeup.substack.com': 11,
  'utility dive storage': 13, 'ev database': 10,
  'eia': 14, 'eia.gov': 14,
  'dutchnews': 8, 'dutchnews.nl': 8,
  'tno energy': 13, 'tno.nl': 13,
  'et energy world': 10, 'energy.economictimes.indiatimes.com': 10,
  // Hydro sources
  'hydro review': 13, 'hydroreview.com': 13,
  'water power magazine': 12, 'waterpowermagazine.com': 12,
  'international water power': 12, 'internationalwaterpower.com': 12,
  // Geothermal sources
  'think geoenergy': 14, 'thinkgeoenergy.com': 14,
  'geothermal resources council': 12, 'geothermalresourcescouncil.blogspot.com': 12,
  'iga': 12, 'geothermal-energy.org': 12,
  // Nuclear sources
  'world nuclear news': 15, 'world-nuclear-news.org': 15,
  'nuclear engineering international': 14, 'neimagazine.com': 14,
  'ans nuclear newswire': 13, 'ans.org': 13,
  'nucnet': 13, 'nucnet.org': 13,
  // Hydrogen sources
  'h2 view': 14, 'h2-view.com': 14,
  'fuelcellsworks': 12, 'fuelcellsworks.com': 12,
  'hydrogen insight': 14, 'hydrogeninsight.com': 14,
  'hydrogen council': 13, 'hydrogencouncil.com': 13,
  // Additional global/regional
  'carbon brief': 15, 'carbonbrief.org': 15,
  'the driven': 12, 'thedriven.io': 12,
  'energy transition': 13, 'energytransition.org': 13,
  'japan times': 10, 'japantimes.co.jp': 10,
  'bnamericas': 11, 'bnamericas.com': 11,
  'zawya': 10, 'zawya.com': 10,
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
