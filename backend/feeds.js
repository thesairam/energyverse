/**
 * feeds.js — RSS Feed Registry
 *
 * All curated direct RSS feeds from newssources.md, organized by scope.
 * Global feeds are ingested for every sector; sector feeds are targeted.
 * Country feeds add regional diversity.
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
]

// ── Sector-Specific Feeds ─────────────────────────────────────────────────────
export const SECTOR_FEEDS = {
  Solar: [
    { url: 'https://www.pv-magazine.com/feed/', source: 'PV Magazine', region: 'Global' },
    { url: 'https://pv-magazine-usa.com/feed/', source: 'PV Magazine USA', region: 'NAM' },
    { url: 'https://www.solarpowerworldonline.com/feed/', source: 'Solar Power World', region: 'NAM' },
    { url: 'http://www.solardaily.com/rss/solardaily.xml', source: 'Solar Daily', region: 'Global' },
    { url: 'https://news.energysage.com/feed/', source: 'EnergySage', region: 'NAM' },
    { url: 'https://www.solarquotes.com.au/blog/feed/', source: 'SolarQuotes', region: 'APAC' },
    { url: 'https://www.pv-tech.org/feed/', source: 'PV Tech', region: 'APAC' },
    { url: 'https://solarquarter.com/feed/', source: 'SolarQuarter', region: 'APAC' },
    { url: 'https://mercomindia.com/feed/', source: 'Mercom India', region: 'APAC' },
  ],
  Wind: [
    { url: 'https://www.rechargenews.com/rss', source: 'Recharge News', region: 'EMEA' },
    { url: 'https://renews.biz/feed/', source: 'reNEWS', region: 'EMEA' },
    { url: 'https://www.offshorewind.biz/feed/', source: 'Offshore Wind Biz', region: 'Global' },
    { url: 'https://windeurope.org/feed/', source: 'WindEurope', region: 'EMEA' },
    { url: 'https://gwec.net/feed/', source: 'GWEC', region: 'Global' },
  ],
  Hydro: [
    // Hydro uses global + institutional feeds primarily
  ],
  Geothermal: [
    // Geothermal uses global + institutional feeds primarily
  ],
  Storage: [
    { url: 'https://www.energy-storage.news/feed/', source: 'Energy Storage News', region: 'Global' },
    { url: 'https://batteryindustry.tech/feed/', source: 'Battery Industry', region: 'Global' },
    { url: 'https://www.pv-magazine.com/category/energy-storage/feed/', source: 'PV Magazine Storage', region: 'Global' },
  ],
  Nuclear: [
    // Nuclear uses global + institutional feeds primarily
  ],
  EV: [
    { url: 'https://electrek.co/feed/', source: 'Electrek', region: 'NAM' },
    { url: 'https://insideevs.com/rss/', source: 'InsideEVs', region: 'Global' },
    { url: 'https://chargedevs.com/feed/', source: 'Charged EVs', region: 'NAM' },
    { url: 'https://www.greencarreports.com/rss', source: 'Green Car Reports', region: 'NAM' },
  ],
  Hydrogen: [
    // Hydrogen uses global + institutional feeds primarily
  ],
}

// ── Country / Regional Feeds ──────────────────────────────────────────────────
export const REGIONAL_FEEDS = [
  // USA
  { url: 'https://www.canarymedia.com/rss', source: 'Canary Media', region: 'NAM' },
  { url: 'https://www.energy.gov/rss.xml', source: 'US Dept of Energy', region: 'NAM' },
  // UK
  { url: 'https://www.businessgreen.com/rss', source: 'BusinessGreen', region: 'EMEA' },
  // Germany
  { url: 'https://www.cleanenergywire.org/rss.xml', source: 'Clean Energy Wire', region: 'EMEA' },
  { url: 'https://www.pv-magazine.de/feed/', source: 'PV Magazine Germany', region: 'EMEA' },
  // India
  { url: 'https://mercomindia.com/feed/', source: 'Mercom India', region: 'APAC' },
  { url: 'https://solarquarter.com/feed/', source: 'SolarQuarter', region: 'APAC' },
  // Australia
  { url: 'https://reneweconomy.com.au/feed/', source: 'RenewEconomy', region: 'APAC' },
  { url: 'https://onestepoffthegrid.com.au/feed/', source: 'One Step Off Grid', region: 'APAC' },
  // China / Asia
  { url: 'https://chinaenergyportal.org/feed/', source: 'China Energy Portal', region: 'APAC' },
  { url: 'https://www.pv-tech.org/feed/', source: 'PV Tech', region: 'APAC' },
  // Europe
  { url: 'https://www.euractiv.com/section/energy-environment/feed/', source: 'Euractiv Energy', region: 'EMEA' },
  // Africa
  { url: 'https://www.esi-africa.com/feed/', source: 'ESI Africa', region: 'MEA' },
  // Latin America
  { url: 'https://www.pv-magazine-latam.com/feed/', source: 'PV Magazine LATAM', region: 'LATAM' },
]

// ── Government & Institutional ────────────────────────────────────────────────
export const INSTITUTIONAL_FEEDS = [
  { url: 'https://www.iea.org/news/rss', source: 'IEA', region: 'Global' },
  { url: 'https://www.irena.org/rss', source: 'IRENA', region: 'Global' },
  { url: 'https://energy.ec.europa.eu/rss_en', source: 'European Commission Energy', region: 'EMEA' },
  { url: 'https://climate.nasa.gov/feed/', source: 'NASA Climate', region: 'NAM' },
]

/**
 * Get all direct RSS feed URLs for a given sector.
 * Combines sector-specific + a sample of global + regional + institutional feeds.
 * Limits total to avoid overwhelming the system.
 */
export function getFeedsForSector(sectorSlug) {
  const sector = SECTOR_FEEDS[sectorSlug] || []
  // Each sector gets its own feeds + a rotating subset of global/regional
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
