/**
 * Priority scoring for intelligence feed items.
 * score = (recency × 0.45) + (sourceRank × 0.30) + (engagement × 0.25)
 * Returns 0–100.
 */

const SOURCE_RANK = {
  'iea.org': 20, 'irena.org': 20, 'bnef.com': 20, 'spglobal.com': 18,
  'reuters.com': 18, 'bloomberg.com': 18, 'ft.com': 17, 'wsj.com': 16,
  'pv-magazine.com': 15, 'rechargenews.com': 15, 'windpower-monthly.com': 14,
  'energymonitor.ai': 14, 'electrek.co': 13, 'cleantechnica.com': 12,
  'greentechmedia.com': 12, 'hydropower.org': 12,
  'techcrunch.com': 8, 'cnbc.com': 9, 'bbc.co.uk': 9, 'theguardian.com': 9,
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
