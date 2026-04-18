/**
 * feeds.js — RSS Feed Registry
 *
 * All curated direct RSS feeds from newssources.md + expanded coverage.
 * Includes Google News multi-region queries and Bing News for diversity.
 */

// ── Global Energy Feeds (apply to all sectors) ───────────────────────────────
export const GLOBAL_FEEDS = [
  { url: 'https://www.renewableenergyworld.com/feed/', source: 'Renewable Energy World', region: 'Global' },
  { url: 'https://cleantechnica.com/feed/', source: 'CleanTechnica', region: 'Global' },
  { url: 'https://www.altenergymag.com/rss/news.xml', source: 'AltEnergyMag', region: 'Global' },
  { url: 'https://www.energylivenews.com/feed/', source: 'Energy Live News', region: 'EMEA' },
  { url: 'https://www.utilitydive.com/feeds/news/', source: 'Utility Dive', region: 'NAM' },
  { url: 'https://www.smart-energy.com/feed/', source: 'Smart Energy International', region: 'Global' },
  { url: 'https://www.powermag.com/feed/', source: 'Power Magazine', region: 'NAM' },
  { url: 'https://energy.mit.edu/news/feed/', source: 'MIT Energy Initiative', region: 'NAM' },
  { url: 'https://renewablesnow.com/feed/', source: 'Renewables Now', region: 'Global' },
  { url: 'https://www.carbonbrief.org/feed/', source: 'Carbon Brief', region: 'Global' },
  { url: 'https://thedriven.io/feed/', source: 'The Driven', region: 'APAC' },
  { url: 'https://energytransition.org/feed/', source: 'Energy Transition', region: 'Global' },
]

// ── Sector-Specific Feeds ─────────────────────────────────────────────────────
export const SECTOR_FEEDS = {
  Solar: [
    { url: 'https://www.pv-magazine.com/feed/', source: 'PV Magazine', region: 'Global' },
    { url: 'https://pv-magazine-usa.com/feed/', source: 'PV Magazine USA', region: 'USA' },
    { url: 'https://www.solarpowerworldonline.com/feed/', source: 'Solar Power World', region: 'USA' },
    { url: 'http://www.solardaily.com/rss/solardaily.xml', source: 'Solar Daily', region: 'Global' },
    { url: 'https://news.energysage.com/feed/', source: 'EnergySage', region: 'USA' },
    { url: 'https://www.solarquotes.com.au/blog/feed/', source: 'SolarQuotes', region: 'Australia' },
    { url: 'https://www.pv-tech.org/feed/', source: 'PV Tech', region: 'Global' },
    { url: 'https://solarquarter.com/feed/', source: 'SolarQuarter', region: 'India' },
    { url: 'https://mercomindia.com/feed/', source: 'Mercom India', region: 'India' },
    { url: 'https://solarwakeup.substack.com/feed', source: 'SolarWakeup', region: 'USA' },
  ],
  Wind: [
    { url: 'https://www.rechargenews.com/rss', source: 'Recharge News', region: 'EMEA' },
    { url: 'https://renews.biz/feed/', source: 'reNEWS', region: 'EMEA' },
    { url: 'https://www.offshorewind.biz/feed/', source: 'Offshore Wind Biz', region: 'Global' },
    { url: 'https://windeurope.org/feed/', source: 'WindEurope', region: 'EMEA' },
    { url: 'https://gwec.net/feed/', source: 'GWEC', region: 'Global' },
  ],
  Hydro: [
    { url: 'https://www.hydroreview.com/feed/', source: 'Hydro Review', region: 'Global' },
    { url: 'https://www.waterpowermagazine.com/feed/', source: 'Water Power Magazine', region: 'Global' },
    { url: 'https://www.hydropower.org/news/rss', source: 'International Hydropower Association', region: 'Global' },
    { url: 'https://www.internationalwaterpower.com/feed/', source: 'International Water Power', region: 'Global' },
  ],
  Geothermal: [
    { url: 'https://www.thinkgeoenergy.com/feed/', source: 'Think GeoEnergy', region: 'Global' },
    { url: 'https://geothermalresourcescouncil.blogspot.com/feeds/posts/default?alt=rss', source: 'Geothermal Resources Council', region: 'USA' },
    { url: 'https://www.geothermal-energy.org/feed/', source: 'IGA', region: 'Global' },
  ],
  Storage: [
    { url: 'https://www.energy-storage.news/feed/', source: 'Energy Storage News', region: 'Global' },
    { url: 'https://batteryindustry.tech/feed/', source: 'Battery Industry', region: 'Global' },
    { url: 'https://www.pv-magazine.com/category/energy-storage/feed/', source: 'PV Magazine Storage', region: 'Global' },
    { url: 'https://www.utilitydive.com/topic/energy-storage/feed/', source: 'Utility Dive Storage', region: 'USA' },
  ],
  Nuclear: [
    { url: 'https://world-nuclear-news.org/rss', source: 'World Nuclear News', region: 'Global' },
    { url: 'https://www.neimagazine.com/feed/', source: 'Nuclear Engineering International', region: 'Global' },
    { url: 'https://www.ans.org/news/rss/', source: 'ANS Nuclear Newswire', region: 'USA' },
    { url: 'https://www.nucnet.org/rss', source: 'NucNet', region: 'EMEA' },
  ],
  EV: [
    { url: 'https://electrek.co/feed/', source: 'Electrek', region: 'USA' },
    { url: 'https://insideevs.com/rss/', source: 'InsideEVs', region: 'Global' },
    { url: 'https://chargedevs.com/feed/', source: 'Charged EVs', region: 'USA' },
    { url: 'https://www.greencarreports.com/rss', source: 'Green Car Reports', region: 'USA' },
    { url: 'https://ev-database.org/rss/blog.xml', source: 'EV Database', region: 'EMEA' },
  ],
  Hydrogen: [
    { url: 'https://www.h2-view.com/feed/', source: 'H2 View', region: 'Global' },
    { url: 'https://fuelcellsworks.com/feed/', source: 'FuelCellsWorks', region: 'Global' },
    { url: 'https://www.hydrogeninsight.com/rss', source: 'Hydrogen Insight', region: 'Global' },
    { url: 'https://hydrogencouncil.com/feed/', source: 'Hydrogen Council', region: 'Global' },
  ],
}

// ── Country / Regional Feeds ──────────────────────────────────────────────────
export const REGIONAL_FEEDS = [
  // USA
  { url: 'https://www.canarymedia.com/rss', source: 'Canary Media', region: 'USA' },
  { url: 'https://www.energy.gov/rss.xml', source: 'US Dept of Energy', region: 'USA' },
  { url: 'https://www.eia.gov/rss/', source: 'EIA', region: 'USA' },
  // UK
  { url: 'https://www.businessgreen.com/rss', source: 'BusinessGreen', region: 'UK' },
  { url: 'https://www.energylivenews.com/feed/', source: 'Energy Live News', region: 'UK' },
  // Germany
  { url: 'https://www.cleanenergywire.org/rss.xml', source: 'Clean Energy Wire', region: 'Germany' },
  { url: 'https://www.pv-magazine.de/feed/', source: 'PV Magazine Germany', region: 'Germany' },
  // India
  { url: 'https://mercomindia.com/feed/', source: 'Mercom India', region: 'India' },
  { url: 'https://solarquarter.com/feed/', source: 'SolarQuarter', region: 'India' },
  { url: 'https://energy.economictimes.indiatimes.com/rss', source: 'ET Energy World', region: 'India' },
  // Australia
  { url: 'https://reneweconomy.com.au/feed/', source: 'RenewEconomy', region: 'Australia' },
  { url: 'https://onestepoffthegrid.com.au/feed/', source: 'One Step Off Grid', region: 'Australia' },
  // China / Asia
  { url: 'https://chinaenergyportal.org/feed/', source: 'China Energy Portal', region: 'China' },
  { url: 'https://www.pv-tech.org/feed/', source: 'PV Tech', region: 'China' },
  // Netherlands
  { url: 'https://www.dutchnews.nl/feed/', source: 'DutchNews', region: 'Netherlands' },
  { url: 'https://www.tno.nl/en/newsroom/rss/', source: 'TNO Energy', region: 'Netherlands' },
  // Europe
  { url: 'https://www.euractiv.com/section/energy-environment/feed/', source: 'Euractiv Energy', region: 'EMEA' },
  // Japan
  { url: 'https://www.japantimes.co.jp/feed/', source: 'Japan Times', region: 'Japan' },
  // Africa
  { url: 'https://www.esi-africa.com/feed/', source: 'ESI Africa', region: 'South Africa' },
  // Latin America
  { url: 'https://www.pv-magazine-latam.com/feed/', source: 'PV Magazine LATAM', region: 'Brazil' },
  { url: 'https://www.bnamericas.com/en/rss/news/electric-power', source: 'BNamericas Power', region: 'LATAM' },
  // Middle East
  { url: 'https://www.zawya.com/en/rss', source: 'Zawya Energy', region: 'UAE' },
]

// ── Government & Institutional ────────────────────────────────────────────────
export const INSTITUTIONAL_FEEDS = [
  { url: 'https://www.iea.org/news/rss', source: 'IEA', region: 'Global' },
  { url: 'https://www.irena.org/rss', source: 'IRENA', region: 'Global' },
  { url: 'https://energy.ec.europa.eu/rss_en', source: 'European Commission Energy', region: 'EMEA' },
  { url: 'https://climate.nasa.gov/feed/', source: 'NASA Climate', region: 'USA' },
]

// ── Google News Multi-Region Queries ──────────────────────────────────────────
// Each entry targets a specific country/language for geographic diversity.
// Format: { query, region, gl, hl, ceid }
const GOOGLE_NEWS_REGIONS = [
  // USA (default)
  { gl: 'US', hl: 'en-US', ceid: 'US:en', region: 'USA' },
  // UK
  { gl: 'GB', hl: 'en-GB', ceid: 'GB:en', region: 'UK' },
  // Germany
  { gl: 'DE', hl: 'en', ceid: 'DE:en', region: 'Germany' },
  // France
  { gl: 'FR', hl: 'en', ceid: 'FR:en', region: 'France' },
  // India
  { gl: 'IN', hl: 'en-IN', ceid: 'IN:en', region: 'India' },
  // Australia
  { gl: 'AU', hl: 'en-AU', ceid: 'AU:en', region: 'Australia' },
  // Japan
  { gl: 'JP', hl: 'en', ceid: 'JP:en', region: 'Japan' },
  // South Korea
  { gl: 'KR', hl: 'en', ceid: 'KR:en', region: 'South Korea' },
  // China (english)
  { gl: 'CN', hl: 'en', ceid: 'CN:en', region: 'China' },
  // Brazil
  { gl: 'BR', hl: 'en', ceid: 'BR:en', region: 'Brazil' },
  // Canada
  { gl: 'CA', hl: 'en-CA', ceid: 'CA:en', region: 'Canada' },
  // South Africa
  { gl: 'ZA', hl: 'en', ceid: 'ZA:en', region: 'South Africa' },
  // UAE
  { gl: 'AE', hl: 'en', ceid: 'AE:en', region: 'UAE' },
  // Saudi Arabia
  { gl: 'SA', hl: 'en', ceid: 'SA:en', region: 'Saudi Arabia' },
  // Spain
  { gl: 'ES', hl: 'en', ceid: 'ES:en', region: 'Spain' },
  // Italy
  { gl: 'IT', hl: 'en', ceid: 'IT:en', region: 'Italy' },
  // Netherlands
  { gl: 'NL', hl: 'en', ceid: 'NL:en', region: 'Netherlands' },
  // Norway
  { gl: 'NO', hl: 'en', ceid: 'NO:en', region: 'Norway' },
  // Denmark
  { gl: 'DK', hl: 'en', ceid: 'DK:en', region: 'Denmark' },
  // Sweden
  { gl: 'SE', hl: 'en', ceid: 'SE:en', region: 'Sweden' },
  // Singapore
  { gl: 'SG', hl: 'en', ceid: 'SG:en', region: 'Singapore' },
  // Indonesia
  { gl: 'ID', hl: 'en', ceid: 'ID:en', region: 'Indonesia' },
  // Mexico
  { gl: 'MX', hl: 'en', ceid: 'MX:en', region: 'Mexico' },
  // Chile
  { gl: 'CL', hl: 'en', ceid: 'CL:en', region: 'Chile' },
  // Egypt
  { gl: 'EG', hl: 'en', ceid: 'EG:en', region: 'Egypt' },
  // Nigeria
  { gl: 'NG', hl: 'en', ceid: 'NG:en', region: 'Nigeria' },
  // Kenya
  { gl: 'KE', hl: 'en', ceid: 'KE:en', region: 'Kenya' },
  // Morocco
  { gl: 'MA', hl: 'en', ceid: 'MA:en', region: 'Morocco' },
  // Turkey
  { gl: 'TR', hl: 'en', ceid: 'TR:en', region: 'Turkey' },
  // Poland
  { gl: 'PL', hl: 'en', ceid: 'PL:en', region: 'Poland' },
  // Vietnam
  { gl: 'VN', hl: 'en', ceid: 'VN:en', region: 'Vietnam' },
  // Taiwan
  { gl: 'TW', hl: 'en', ceid: 'TW:en', region: 'Taiwan' },
  // Thailand
  { gl: 'TH', hl: 'en', ceid: 'TH:en', region: 'Thailand' },
  // Philippines
  { gl: 'PH', hl: 'en', ceid: 'PH:en', region: 'Philippines' },
  // Pakistan
  { gl: 'PK', hl: 'en', ceid: 'PK:en', region: 'Pakistan' },
  // New Zealand
  { gl: 'NZ', hl: 'en', ceid: 'NZ:en', region: 'New Zealand' },
  // Colombia
  { gl: 'CO', hl: 'en', ceid: 'CO:en', region: 'Colombia' },
  // Argentina
  { gl: 'AR', hl: 'en', ceid: 'AR:en', region: 'Argentina' },
  // Israel
  { gl: 'IL', hl: 'en', ceid: 'IL:en', region: 'Israel' },
]

// Sector-specific query terms for multi-region Google News
const SECTOR_GNEWS_QUERIES = {
  Solar: ['solar energy', 'solar power plant', 'photovoltaic', 'solar farm'],
  Wind: ['wind energy', 'wind farm', 'offshore wind', 'wind turbine'],
  Hydro: ['hydropower', 'hydroelectric dam', 'pumped hydro storage'],
  Geothermal: ['geothermal energy', 'geothermal power plant'],
  Storage: ['battery storage', 'energy storage', 'BESS grid battery'],
  Nuclear: ['nuclear power', 'nuclear reactor', 'small modular reactor'],
  EV: ['electric vehicle', 'EV charging', 'electric car'],
  Hydrogen: ['green hydrogen', 'hydrogen energy', 'electrolyzer fuel cell'],
}

/**
 * Build Google News RSS URL for a query in a specific region.
 */
export function googleNewsUrl(query, regionConfig) {
  const { gl, hl, ceid } = regionConfig
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`
}

/**
 * Build Bing News RSS URL for a query.
 */
export function bingNewsUrl(query) {
  return `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss`
}

/**
 * Get multi-region Google News queries for a sector.
 * Returns array of { url, source, region } feed entries.
 * Picks a rotating subset of regions per call to limit total queries.
 */
export function getGoogleNewsFeeds(sectorSlug, maxRegions = 12) {
  const queries = SECTOR_GNEWS_QUERIES[sectorSlug] || ['renewable energy']
  // Rotate through regions based on current hour to spread coverage
  const hour = new Date().getHours()
  const offset = (hour * 3) % GOOGLE_NEWS_REGIONS.length
  const selectedRegions = []
  for (let i = 0; i < maxRegions; i++) {
    selectedRegions.push(GOOGLE_NEWS_REGIONS[(offset + i) % GOOGLE_NEWS_REGIONS.length])
  }
  const feeds = []
  for (const regionCfg of selectedRegions) {
    // Pick one query per region (rotate by region index)
    const qIdx = selectedRegions.indexOf(regionCfg) % queries.length
    feeds.push({
      url: googleNewsUrl(queries[qIdx], regionCfg),
      source: `Google News ${regionCfg.region}`,
      region: regionCfg.region,
    })
  }
  return feeds
}

/**
 * Get Bing News feeds for a sector.
 */
export function getBingNewsFeeds(sectorSlug) {
  const queries = SECTOR_GNEWS_QUERIES[sectorSlug] || ['renewable energy']
  return queries.slice(0, 2).map(q => ({
    url: bingNewsUrl(q),
    source: 'Bing News',
    region: 'Global',
  }))
}

/**
 * Get all direct RSS feed URLs for a given sector.
 */
export function getFeedsForSector(sectorSlug) {
  const sector = SECTOR_FEEDS[sectorSlug] || []
  return [...sector, ...GLOBAL_FEEDS, ...INSTITUTIONAL_FEEDS]
}

/**
 * Get regional feeds — used for regional diversity boost.
 */
export function getRegionalFeeds() {
  return [...REGIONAL_FEEDS]
}

/**
 * Get all unique feed URLs across all categories.
 */
export function getAllFeeds() {
  const all = [
    ...GLOBAL_FEEDS,
    ...INSTITUTIONAL_FEEDS,
    ...REGIONAL_FEEDS,
    ...Object.values(SECTOR_FEEDS).flat(),
  ]
  const seen = new Set()
  return all.filter(f => {
    if (seen.has(f.url)) return false
    seen.add(f.url)
    return true
  })
}
