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
  { url: 'https://www.carbonbrief.org/feed/', source: 'Carbon Brief', region: 'Global' },
  { url: 'https://thedriven.io/feed/', source: 'The Driven', region: 'APAC' },
  { url: 'https://energytransition.org/feed/', source: 'Energy Transition', region: 'Global' },
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
    { url: 'https://solarwakeup.substack.com/feed', source: 'SolarWakeup', region: 'NAM' },
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
    { url: 'https://geothermalresourcescouncil.blogspot.com/feeds/posts/default?alt=rss', source: 'Geothermal Resources Council', region: 'NAM' },
    { url: 'https://www.geothermal-energy.org/feed/', source: 'IGA', region: 'Global' },
  ],
  Storage: [
    { url: 'https://www.energy-storage.news/feed/', source: 'Energy Storage News', region: 'Global' },
    { url: 'https://batteryindustry.tech/feed/', source: 'Battery Industry', region: 'Global' },
    { url: 'https://www.pv-magazine.com/category/energy-storage/feed/', source: 'PV Magazine Storage', region: 'Global' },
    { url: 'https://www.utilitydive.com/topic/energy-storage/feed/', source: 'Utility Dive Storage', region: 'NAM' },
  ],
  Nuclear: [
    { url: 'https://world-nuclear-news.org/rss', source: 'World Nuclear News', region: 'Global' },
    { url: 'https://www.neimagazine.com/feed/', source: 'Nuclear Engineering International', region: 'Global' },
    { url: 'https://www.ans.org/news/rss/', source: 'ANS Nuclear Newswire', region: 'NAM' },
    { url: 'https://www.nucnet.org/rss', source: 'NucNet', region: 'EMEA' },
  ],
  EV: [
    { url: 'https://electrek.co/feed/', source: 'Electrek', region: 'NAM' },
    { url: 'https://insideevs.com/rss/', source: 'InsideEVs', region: 'Global' },
    { url: 'https://chargedevs.com/feed/', source: 'Charged EVs', region: 'NAM' },
    { url: 'https://www.greencarreports.com/rss', source: 'Green Car Reports', region: 'NAM' },
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
  { url: 'https://www.canarymedia.com/rss', source: 'Canary Media', region: 'NAM' },
  { url: 'https://www.energy.gov/rss.xml', source: 'US Dept of Energy', region: 'NAM' },
  { url: 'https://www.eia.gov/rss/', source: 'EIA', region: 'NAM' },
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
  // Netherlands
  { url: 'https://www.dutchnews.nl/feed/', source: 'DutchNews', region: 'EMEA' },
  { url: 'https://www.tno.nl/en/newsroom/rss/', source: 'TNO Energy', region: 'EMEA' },
  // Europe
  { url: 'https://www.euractiv.com/section/energy-environment/feed/', source: 'Euractiv Energy', region: 'EMEA' },
  // India (additional)
  { url: 'https://energy.economictimes.indiatimes.com/rss', source: 'ET Energy World', region: 'APAC' },
  // Japan
  { url: 'https://www.japantimes.co.jp/feed/', source: 'Japan Times', region: 'APAC' },
  // Africa
  { url: 'https://www.esi-africa.com/feed/', source: 'ESI Africa', region: 'MEA' },
  // Latin America
  { url: 'https://www.pv-magazine-latam.com/feed/', source: 'PV Magazine LATAM', region: 'LATAM' },
  { url: 'https://www.bnamericas.com/en/rss/news/electric-power', source: 'BNamericas Power', region: 'LATAM' },
  // Middle East
  { url: 'https://www.zawya.com/en/rss', source: 'Zawya Energy', region: 'MEA' },
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
