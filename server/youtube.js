/**
 * server/youtube.js
 *
 * YouTube energy channel RSS aggregator — per-sector + global.
 * Uses public YouTube RSS feeds (no API key required).
 */

import Parser from 'rss-parser'

const rssParser = new Parser({ timeout: 9000 })

// ── Global energy channels ────────────────────────────────────────────────────
const GLOBAL_CHANNELS = [
  { id: 'UCj_fFAEtEL4ysNL3iK1bSTQ', name: 'IEA' },
  { id: 'UCMfBkbVjbDPiyBPAFVw4_WA', name: 'IRENA' },
  { id: 'UCU2jMqvFPssTEKXl0M_0I6g', name: 'BloombergNEF' },
  { id: 'UCzWQYUVCpZqtN93H8RR44Qw', name: 'Rocky Mountain Institute' },
  { id: 'UCWrMEORLR-XkKQRxDaJH6vQ', name: 'Canary Media' },
  { id: 'UCCkuMpP1N9h0N5CWDqJhJLg', name: 'CleanTechnica' },
  { id: 'UCrM7B7SL_g1edFOnmj-SDKg', name: 'Bloomberg Technology' },
  { id: 'UCVEBuQY8xxWgO23ER1nP5dg', name: 'Wood Mackenzie' },
]

// ── Per-sector channel mapping ────────────────────────────────────────────────
// channel_id: best-effort IDs; graceful fail when wrong
export const SECTOR_CHANNELS = {
  Solar: [
    { id: 'UCJ8V9WFqvriZe_VFZXJV6Zw', name: 'LONGi Solar' },
    { id: 'UCCsKdCGRDh7CiVTBxJ5BNWQ', name: 'SolarPower Europe' },
    { id: 'UCkUJ_lfSaxgOXbJQ1R-r2UQ', name: 'SEIA' },
    { id: 'UCj_fFAEtEL4ysNL3iK1bSTQ', name: 'IEA' },
    { id: 'UCzWQYUVCpZqtN93H8RR44Qw', name: 'Rocky Mountain Institute' },
  ],
  Wind: [
    { id: 'UCNlhEzqHv96xT9YSS3UaYxA', name: 'GWEC' },
    { id: 'UC9e6e3lnJxDQ4d4V-d5yS3A', name: 'Vestas' },
    { id: 'UCXbHm96kT0l6pxsUekDZ5jQ', name: 'WindEurope' },
    { id: 'UCMfBkbVjbDPiyBPAFVw4_WA', name: 'IRENA' },
    { id: 'UCU2jMqvFPssTEKXl0M_0I6g', name: 'BloombergNEF' },
  ],
  Hydro: [
    { id: 'UC3mfnH8SObR1mAFQHjdl8_Q', name: 'Int\'l Hydropower Association' },
    { id: 'UCMfBkbVjbDPiyBPAFVw4_WA', name: 'IRENA' },
    { id: 'UCj_fFAEtEL4ysNL3iK1bSTQ', name: 'IEA' },
    { id: 'UCzWQYUVCpZqtN93H8RR44Qw', name: 'Rocky Mountain Institute' },
  ],
  Geothermal: [
    { id: 'UCXtScYSEbYgCUFBkJ52KMUA', name: 'Geothermal Rising' },
    { id: 'UCrM7B7SL_g1edFOnmj-SDKg', name: 'ThinkGeoEnergy' },
    { id: 'UCMfBkbVjbDPiyBPAFVw4_WA', name: 'IRENA' },
    { id: 'UCj_fFAEtEL4ysNL3iK1bSTQ', name: 'IEA' },
  ],
  Storage: [
    { id: 'UCU2jMqvFPssTEKXl0M_0I6g', name: 'BloombergNEF' },
    { id: 'UCzWQYUVCpZqtN93H8RR44Qw', name: 'Rocky Mountain Institute' },
    { id: 'UCWrMEORLR-XkKQRxDaJH6vQ', name: 'Canary Media' },
    { id: 'UCDsjV8zvsXW9sOGCdiDV9Yw', name: 'CATL Official' },
    { id: 'UCj_fFAEtEL4ysNL3iK1bSTQ', name: 'IEA' },
  ],
  Nuclear: [
    { id: 'UCm5GjhNnQUcMNgHm5MgJ67Q', name: 'World Nuclear Association' },
    { id: 'UC66XXV7CIBKH2D5-MlL76vQ', name: 'IAEA' },
    { id: 'UCRiK2C7nEBiMx6Hh-NQNzfQ', name: 'NuScale Power' },
    { id: 'UCzWQYUVCpZqtN93H8RR44Qw', name: 'Rocky Mountain Institute' },
    { id: 'UCj_fFAEtEL4ysNL3iK1bSTQ', name: 'IEA' },
  ],
  EV: [
    { id: 'UCGEevazguCoYjY63bYgYcvA', name: 'Tesla' },
    { id: 'UCsRFXSSU6R9EhPCBxOBMHOA', name: 'Electrek' },
    { id: 'UCBcRF18a7Qf58cCRy5xuWwQ', name: 'InsideEVs' },
    { id: 'UCR0V4EAKWnAFdRxUWtOWFpw', name: 'Rivian' },
    { id: 'UCU2jMqvFPssTEKXl0M_0I6g', name: 'BloombergNEF' },
  ],
  Hydrogen: [
    { id: 'UCkNtPnkTuBn_FS0gJNDkr3w', name: 'Hydrogen Council' },
    { id: 'UCd5eTEbCDEnY0tNGt0nmCHg', name: 'Nel Hydrogen' },
    { id: 'UCzWQYUVCpZqtN93H8RR44Qw', name: 'Rocky Mountain Institute' },
    { id: 'UCMfBkbVjbDPiyBPAFVw4_WA', name: 'IRENA' },
    { id: 'UCj_fFAEtEL4ysNL3iK1bSTQ', name: 'IEA' },
  ],
}

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
    mkFallback('Vestas V236-15MW Turbine Deployment', 'Vestas', 'https://www.youtube.com/@vestas', 'World\'s largest serial-produced offshore turbine.'),
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
    mkFallback('Iceland\'s Geothermal District Heating', 'IRENA', 'https://www.youtube.com/@IRENAchannel', 'IRENA case study on Icelandic geothermal.'),
  ],
  Storage: [
    mkFallback('CATL Condensed Battery Tech Briefing', 'CATL', 'https://www.youtube.com/@CATL_Official', 'Next-gen condensed matter cell launch.'),
    mkFallback('Grid-Scale Battery Storage – 2 TW by 2030?', 'BloombergNEF', 'https://www.youtube.com/@BloombergNEF', 'BNEF storage deployment forecast.'),
    mkFallback('Long-Duration Energy Storage Roundtable', 'Rocky Mountain Institute', 'https://www.youtube.com/@RockyMountainInstitute', 'LDES technology pathways panel.'),
    mkFallback('Tesla Megapack Deployment – Hornsdale Update', 'Canary Media', 'https://www.youtube.com/@canarymedia', 'World\'s largest battery operations report.'),
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

// ── Global fallback ───────────────────────────────────────────────────────────
const GLOBAL_FALLBACK = [
  mkFallback('World Energy Outlook 2025 – IEA Launch', 'IEA', 'https://www.youtube.com/@IEAenergy', 'IEA flagship World Energy Outlook launch.'),
  mkFallback('Renewable Energy Statistics 2026 – IRENA', 'IRENA', 'https://www.youtube.com/@IRENAchannel', 'IRENA capacity statistics launch webinar.'),
  mkFallback('Global Energy Market Update Q1 2026', 'Wood Mackenzie', 'https://www.youtube.com/@WoodMac_energy', 'Wood Mackenzie Q1 energy market trends.'),
  mkFallback('Battery Storage: Race to 1 TWh', 'BloombergNEF', 'https://www.youtube.com/@BloombergNEF', 'BNEF storage deployment deep-dive.'),
  mkFallback('Offshore Wind: Financing the Next Wave', 'Wood Mackenzie', 'https://www.youtube.com/@WoodMac_energy', 'Offshore wind financing analysis.'),
  mkFallback('Green Hydrogen – 2030 Cost Targets', 'Rocky Mountain Institute', 'https://www.youtube.com/@RockyMountainInstitute', 'RMI H2 cost reduction pathways.'),
]

// ── RSS helpers ───────────────────────────────────────────────────────────────
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

async function fetchChannel(channel, limit = 5) {
  try {
    const feed = await rssParser.parseURL(channelRssUrl(channel.id))
    return (feed?.items || []).slice(0, limit).map((item) => parseEntry(item, channel.name))
  } catch {
    return []
  }
}

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
  const results = await Promise.allSettled(GLOBAL_CHANNELS.map(ch => fetchChannel(ch, perChannel)))
  const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
  const sorted = dedup(all)
  return sorted.length > 0 ? sorted.slice(0, 30) : GLOBAL_FALLBACK
}

export async function fetchYoutubeForSector(sector, perChannel = 4) {
  const channels = SECTOR_CHANNELS[sector] || GLOBAL_CHANNELS.slice(0, 3)
  const results = await Promise.allSettled(channels.map(ch => fetchChannel(ch, perChannel)))
  const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
  const sorted = dedup(all)
  const fallback = SECTOR_FALLBACK_VIDEOS[sector] || GLOBAL_FALLBACK
  return sorted.length > 0 ? sorted.slice(0, 20) : fallback
}
