import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  type LinkItem,
  type NewsItem,
  type Region,
  type SectorIntel,
  businessSignals,
  emissions,
  kpis,
  marketRows,
  newsTape as seedNewsTape,
  policies,
  projectChanges,
  sectorIntel as seedSectorIntel,
} from './data/energyData'

const getYouTubeEmbedUrl = (item: LinkItem) => {
  if (item.embedUrl) return item.embedUrl
  if (item.url.includes('/embed/')) return item.url

  try {
    const parsed = new URL(item.url)

    if (parsed.hostname.includes('youtube.com')) {
      const watchId = parsed.searchParams.get('v')
      if (watchId) {
        return `https://www.youtube.com/embed/${watchId}`
      }
    }

    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '')
      if (id) {
        return `https://www.youtube.com/embed/${id}`
      }
    }
  } catch {
    return null
  }

  return null
}

const renderSparkline = (history?: number[]) => {
  if (!history || history.length === 0) return null
  const width = 90
  const height = 38
  const max = Math.max(...history)
  const min = Math.min(...history)
  const span = max - min || 1
  const sparkGradId = `sparkGrad-${Math.random().toString(36).slice(2, 7)}`
  const points = history
    .map((value, idx) => {
      const x = (idx / Math.max(history.length - 1, 1)) * width
      const y = height - ((value - min) / span) * height
      return `${x},${y}`
    })
    .join(' ')

  const trend = history[history.length - 1] - history[0] >= 0 ? 'up' : 'down'

  return (
    <svg className={`sparkline ${trend}`} viewBox={`0 0 ${width} ${height}`} role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id={sparkGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5cffb3" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2bb673" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <polyline points={points} fill={`url(#${sparkGradId})`} stroke="none" />
      <polyline points={points} fill="none" strokeWidth={2} />
    </svg>
  )
}

const macroRegions: Region[] = ['Global', 'EMEA', 'NAM', 'APAC']
const countryRegions: Region[] = ['India', 'UK', 'France', 'China', 'Japan', 'Singapore', 'Netherlands', 'Germany']

const regionGroups: Record<Region, Region[]> = {
  Global: [],
  EMEA: ['UK', 'France', 'Germany', 'Netherlands'],
  NAM: ['US', 'Canada'] as unknown as Region[],
  APAC: ['India', 'China', 'Japan', 'Singapore'] as unknown as Region[],
  India: ['India'],
  UK: ['UK'],
  France: ['France'],
  China: ['China'],
  Japan: ['Japan'],
  Singapore: ['Singapore'],
  Netherlands: ['Netherlands'],
  Germany: ['Germany'],
}

const regionAliases: Record<string, Region> = {
  EU: 'EMEA',
  Europe: 'EMEA',
  Nordics: 'EMEA',
  Norway: 'EMEA',
  Kenya: 'EMEA',
  US: 'NAM',
  USA: 'NAM',
  Canada: 'NAM',
  Mexico: 'NAM',
  Brazil: 'NAM',
  LATAM: 'NAM',
  Australia: 'APAC',
}

const regionCenters: Record<string, [number, number]> = {
  Global: [20, 10],
  EMEA: [49, 12],
  NAM: [39, -98],
  APAC: [22, 108],
  India: [22.5, 78.9],
  UK: [54.5, -2.3],
  France: [46.2, 2.2],
  China: [35.8, 104.2],
  Japan: [36.3, 138.3],
  Singapore: [1.35, 103.8],
  Netherlands: [52.1, 5.3],
  Germany: [51.2, 10.4],
  US: [39.8, -98.6],
  Canada: [56.1, -106.3],
  Mexico: [23.6, -102.6],
  Brazil: [-14.2, -51.9],
  Norway: [60.5, 8.5],
  Kenya: [0.2, 37.9],
  EU: [50.5, 10.0],
  Nordics: [62.0, 15.0],
  Australia: [-24.5, 133.9],
}

const normalizeRegionLabel = (value?: string | Region) => {
  if (!value) return undefined
  if (regionGroups[value as Region]) return value as Region
  return regionAliases[value] || value
}

const jitteredCoords = (regionLabel: string | Region | undefined, index: number) => {
  const normalized = normalizeRegionLabel(regionLabel)
  const base = regionCenters[normalized || 'Global'] || regionCenters.Global
  const angle = (((index + 3) * 137) % 360) * (Math.PI / 180)
  const radius = 0.8 + (index % 5) * 0.55
  const lat = Math.max(-70, Math.min(75, base[0] + Math.sin(angle) * radius))
  const lon = Math.max(-179, Math.min(179, base[1] + Math.cos(angle) * radius * 1.25))
  return [lat, lon] as [number, number]
}

const regionMatch = (itemRegion: Region | string | undefined, selectedRegion: Region, selectedCountry: Region | 'All') => {
  const normalizedItemRegion = normalizeRegionLabel(itemRegion)

  if (!normalizedItemRegion) {
    return selectedRegion === 'Global' && selectedCountry === 'All'
  }

  if (selectedCountry !== 'All') {
    return normalizedItemRegion === selectedCountry
  }

  if (selectedRegion === 'Global') return true
  if (normalizedItemRegion === selectedRegion) return true
  const members = regionGroups[selectedRegion] || []
  return members.includes(normalizedItemRegion as Region)
}

const filterByRegion = <T extends { region?: string | Region; geography?: Region }>(
  items: T[],
  selectedRegion: Region,
  selectedCountry: Region | 'All',
) => {
  if (!items) return []
  const filtered = items.filter((item) =>
    regionMatch((item.region as Region | string | undefined) ?? item.geography, selectedRegion, selectedCountry),
  )
  return filtered
}

const regionHeat: Record<Region | 'Global', Array<{ region: string; score: number; metric: string }>> = {
  Global: [
    { region: 'EMEA', score: 68, metric: 'Grid-scale storage build rate' },
    { region: 'NAM', score: 72, metric: 'V2G pilot density' },
    { region: 'APAC', score: 74, metric: 'Utility solar run-rate' },
  ],
  EMEA: [
    { region: 'Germany', score: 76, metric: 'Battery revenue stacking' },
    { region: 'UK', score: 71, metric: 'Offshore wind queue velocity' },
    { region: 'France', score: 67, metric: 'Nuclear uprate cadence' },
  ],
  NAM: [
    { region: 'US', score: 73, metric: 'ISO capacity awards' },
    { region: 'Canada', score: 65, metric: 'Hydro + storage refurb' },
    { region: 'Mexico', score: 58, metric: 'Grid interconnection adds' },
  ],
  APAC: [
    { region: 'China', score: 78, metric: 'Utility PV run-rate' },
    { region: 'Japan', score: 69, metric: 'V2H/V2G pilots' },
    { region: 'India', score: 72, metric: 'Hybrid solar+storage auctions' },
  ],
  India: [
    { region: 'India', score: 72, metric: 'Hybrid auctions' },
    { region: 'APAC', score: 65, metric: 'Regional coupling' },
    { region: 'Global', score: 60, metric: 'VC interest in EV infra' },
  ],
  UK: [
    { region: 'UK', score: 71, metric: 'Offshore FID velocity' },
    { region: 'EMEA', score: 64, metric: 'Grid-flex tenders' },
    { region: 'Global', score: 59, metric: 'Storage margins' },
  ],
  France: [
    { region: 'France', score: 67, metric: 'Nuclear uprates' },
    { region: 'EMEA', score: 62, metric: 'Hydro refurb push' },
    { region: 'Global', score: 58, metric: 'EV charging density' },
  ],
  China: [
    { region: 'China', score: 78, metric: 'Utility PV run-rate' },
    { region: 'APAC', score: 70, metric: 'Battery manufacturing' },
    { region: 'Global', score: 64, metric: 'EV exports' },
  ],
  Japan: [
    { region: 'Japan', score: 69, metric: 'V2H/V2G pilots' },
    { region: 'APAC', score: 65, metric: 'Offshore floating prep' },
    { region: 'Global', score: 60, metric: 'Hydrogen tie-ins' },
  ],
  Singapore: [
    { region: 'Singapore', score: 66, metric: 'Grid services via BESS' },
    { region: 'APAC', score: 63, metric: 'EV charging density' },
    { region: 'Global', score: 58, metric: 'Data center resiliency' },
  ],
  Netherlands: [
    { region: 'Netherlands', score: 70, metric: 'Grid congestion relief' },
    { region: 'EMEA', score: 64, metric: 'V2G bus depots' },
    { region: 'Global', score: 59, metric: 'Heat pump load shifting' },
  ],
  Germany: [
    { region: 'Germany', score: 76, metric: 'Battery revenue stacking' },
    { region: 'EMEA', score: 65, metric: 'Renewable curtailment mgmt' },
    { region: 'Global', score: 60, metric: 'Electrolyzer pilots' },
  ],
}

const sectorColors: Record<SectorIntel['slug'], string> = {
  Solar: '#f5c04d',
  Wind: '#6ac1ff',
  Hydro: '#53e0c4',
  Geothermal: '#f78c4c',
  Storage: '#8be07f',
  Nuclear: '#b4b4ff',
  EV: '#6fe18f',
}

const globeBaseStyle = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#07130b',
      },
    },
  ],
} as const

type LayerKey =
  | 'plants'
  | 'storage'
  | 'projects'
  | 'hydrogen'
  | 'transmission'
  | 'resource'
  | 'policy'
  | 'topics'

type BasePoint = {
  id: string
  coords: [number, number]
  sector: SectorIntel['slug']
  subtype: string
  capacityMW?: number
  status: string
  owner?: string
  updatedAt: string
  regionTag?: Region | string
}

type LineFeature = {
  id: string
  path: [number, number][]
  capacityMW?: number
  status: string
  updatedAt: string
  name: string
}

type PolygonFeature = {
  id: string
  ring: [number, number][]
  metric: string
  value: number
  updatedAt: string
}

const nowIso = new Date().toISOString().slice(0, 10)

const layerData: {
  plants: BasePoint[]
  storage: BasePoint[]
  projects: BasePoint[]
  hydrogen: BasePoint[]
  policy: BasePoint[]
  transmission: LineFeature[]
  resource: PolygonFeature[]
} = {
  plants: [
    {
      id: 'plant-wind-uk',
      coords: [54.4, 1.2],
      sector: 'Wind',
      subtype: 'Offshore wind',
      capacityMW: 1200,
      status: 'Operational',
      owner: 'NorthSea Wind JV',
      updatedAt: nowIso,
      regionTag: 'UK',
    },
    {
      id: 'plant-solar-india',
      coords: [24.5, 72.6],
      sector: 'Solar',
      subtype: 'Utility PV',
      capacityMW: 800,
      status: 'Commissioning',
      owner: 'Surya Power',
      updatedAt: nowIso,
      regionTag: 'India',
    },
    {
      id: 'plant-hydro-canada',
      coords: [52.8, -122.4],
      sector: 'Hydro',
      subtype: 'Reservoir hydro',
      capacityMW: 1500,
      status: 'Operational',
      owner: 'BC Hydro',
      updatedAt: '2026-02-22',
      regionTag: 'NAM',
    },
    {
      id: 'plant-geo-iceland',
      coords: [64.7, -19.5],
      sector: 'Geothermal',
      subtype: 'Flash steam',
      capacityMW: 300,
      status: 'Operational',
      owner: 'Iceland Geo',
      updatedAt: '2026-02-19',
      regionTag: 'EMEA',
    },
  ],
  storage: [
    {
      id: 'storage-ca',
      coords: [37.3, -121.9],
      sector: 'Storage',
      subtype: 'Li-ion BESS',
      capacityMW: 350,
      status: 'Operational',
      owner: 'Silicon Valley ISO',
      updatedAt: nowIso,
      regionTag: 'NAM',
    },
    {
      id: 'storage-de',
      coords: [51.0, 7.0],
      sector: 'Storage',
      subtype: 'Li-ion BESS',
      capacityMW: 100,
      status: 'Construction',
      owner: 'Rhein Storage',
      updatedAt: '2026-02-26',
      regionTag: 'Germany',
    },
  ],
  projects: [
    {
      id: 'project-solar-mena',
      coords: [23.6, 53.7],
      sector: 'Solar',
      subtype: 'Hybrid solar+storage',
      capacityMW: 2200,
      status: 'Under construction',
      owner: 'Gulf Renewables',
      updatedAt: '2026-02-28',
      regionTag: 'EMEA',
    },
    {
      id: 'project-offshore-jp',
      coords: [38.1, 142.3],
      sector: 'Wind',
      subtype: 'Floating offshore',
      capacityMW: 900,
      status: 'FEED',
      owner: 'Pacific Wind',
      updatedAt: '2026-02-25',
      regionTag: 'Japan',
    },
  ],
  hydrogen: [
    {
      id: 'h2-au',
      coords: [-22.6, 118.0],
      sector: 'Hydro',
      subtype: 'Green H2 hub',
      capacityMW: 500,
      status: 'Pilot',
      owner: 'Pilbara H2',
      updatedAt: nowIso,
      regionTag: 'APAC',
    },
    {
      id: 'h2-eu',
      coords: [52.4, 4.9],
      sector: 'Hydro',
      subtype: 'Electrolyzer cluster',
      capacityMW: 200,
      status: 'Operational',
      owner: 'Delta Hydrogen',
      updatedAt: '2026-02-24',
      regionTag: 'Netherlands',
    },
  ],
  policy: [
    {
      id: 'policy-us-v2g',
      coords: [40.0, -96.0],
      sector: 'EV',
      subtype: 'Policy event',
      status: 'Announced',
      updatedAt: nowIso,
      owner: 'FERC',
      regionTag: 'NAM',
    },
    {
      id: 'policy-eu-grid',
      coords: [50.1, 8.7],
      sector: 'Storage',
      subtype: 'Policy event',
      status: 'Effective',
      updatedAt: '2026-02-23',
      owner: 'EU ENTSO-E',
      regionTag: 'EMEA',
    },
  ],
  transmission: [
    {
      id: 'tx-nam',
      path: [
        [34.0, -118.3],
        [36.1, -115.1],
        [39.7, -104.9],
      ],
      capacityMW: 4000,
      status: 'Operational',
      updatedAt: '2026-02-21',
      name: 'West Connect',
    },
    {
      id: 'tx-emea',
      path: [
        [52.5, 13.4],
        [50.1, 8.7],
        [48.8, 2.3],
      ],
      capacityMW: 6000,
      status: 'Upgrade',
      updatedAt: '2026-02-27',
      name: 'Central Europe Backbone',
    },
  ],
  resource: [
    {
      id: 'solar-mena',
      ring: [
        [18.0, 44.0],
        [26.0, 44.0],
        [26.0, 56.0],
        [18.0, 56.0],
        [18.0, 44.0],
      ],
      metric: 'Solar GHI',
      value: 2200,
      updatedAt: '2026-02-15',
    },
    {
      id: 'wind-nsea',
      ring: [
        [56.0, -4.0],
        [58.0, 2.0],
        [54.0, 4.0],
        [52.0, -2.0],
        [56.0, -4.0],
      ],
      metric: 'Wind CF',
      value: 45,
      updatedAt: '2026-02-12',
    },
  ],
}

const layerLabels: Record<LayerKey, string> = {
  plants: 'Renewable Plants',
  storage: 'Storage',
  projects: 'Projects (UC)',
  hydrogen: 'Green Hydrogen',
  transmission: 'Transmission',
  resource: 'Resource Potential',
  policy: 'Policy & Events',
  topics: 'Intel Topics',
}

const timePresets = [
  { label: '24h', days: 1 },
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: 'All', days: 0 },
]

function App() {
  const lastUpdated = useMemo(() => new Date().toUTCString(), [])
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('offline')
  const [liveNewsTape, setLiveNewsTape] = useState<NewsItem[]>(seedNewsTape)
  const [liveSectorIntel, setLiveSectorIntel] = useState<SectorIntel[]>(seedSectorIntel)
  const [activeSector, setActiveSector] = useState<SectorIntel['slug']>('Storage')
  const [activeRegion, setActiveRegion] = useState<Region>('Global')
  const [activeCountry, setActiveCountry] = useState<Region | 'All'>('All')

  const sectorOrder: SectorIntel['slug'][] = ['Storage', 'EV', 'Nuclear', 'Solar', 'Wind', 'Hydro', 'Geothermal']
  const orderedSectors = [...liveSectorIntel].sort((a, b) => {
    const aIdx = sectorOrder.indexOf(a.slug)
    const bIdx = sectorOrder.indexOf(b.slug)
    if (aIdx === -1 && bIdx === -1) return a.slug.localeCompare(b.slug)
    if (aIdx === -1) return 1
    if (bIdx === -1) return -1
    return aIdx - bIdx
  })
  const trending = orderedSectors.map((s) => s.slug)

  const repoLinks = [
    { label: 'GitHub Repo', href: 'https://github.com/thesairam/energyverse' },
    { label: 'Discussions #1', href: 'https://github.com/thesairam/energyverse/discussions/1' },
  ]
  const [timeWindowDays, setTimeWindowDays] = useState<number>(7)
  const [layerToggles, setLayerToggles] = useState<Record<LayerKey, boolean>>({
    plants: true,
    storage: true,
    projects: true,
    hydrogen: true,
    transmission: true,
    resource: true,
    policy: true,
    topics: true,
  })
  const [sectorToggles, setSectorToggles] = useState<Record<SectorIntel['slug'], boolean>>({
    Solar: true,
    Wind: true,
    Hydro: true,
    Geothermal: true,
    Storage: true,
    Nuclear: true,
    EV: true,
  })
  const [mapCommand, setMapCommand] = useState('')
  const [mapReady, setMapReady] = useState(false)
  const [streamSelections, setStreamSelections] = useState<Record<string, number>>({})
  const [aiSummary, setAiSummary] = useState('Collecting map signals...')
  const [searchStatus, setSearchStatus] = useState('')
  const mapRef = useRef<null | any>(null)

  const filteredGeo = useMemo(() => {
    const cutoff = timeWindowDays > 0 ? Date.now() - timeWindowDays * 24 * 60 * 60 * 1000 : 0
    const inWindow = (dt: string) => (cutoff === 0 ? true : new Date(dt).getTime() >= cutoff)

    const regionFilter = (tag?: Region | string) => regionMatch(tag, activeRegion, activeCountry)
    const sectorFilter = (sector: SectorIntel['slug']) => sectorToggles[sector] !== false

    const pointToFeature = (item: BasePoint) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [item.coords[1], item.coords[0]] },
      properties: {
        id: item.id,
        sector: item.sector,
        subtype: item.subtype,
        capacityMW: item.capacityMW ?? null,
        status: item.status,
        owner: item.owner ?? 'N/A',
        updatedAt: item.updatedAt,
        color: sectorColors[item.sector],
      },
    })

    const plants = layerData.plants
      .filter((p) => inWindow(p.updatedAt) && regionFilter(p.regionTag) && sectorFilter(p.sector))
      .map(pointToFeature)
    const storage = layerData.storage
      .filter((p) => inWindow(p.updatedAt) && regionFilter(p.regionTag) && sectorFilter(p.sector))
      .map(pointToFeature)
    const projects = layerData.projects
      .filter((p) => inWindow(p.updatedAt) && regionFilter(p.regionTag) && sectorFilter(p.sector))
      .map(pointToFeature)
    const hydrogen = layerData.hydrogen
      .filter((p) => inWindow(p.updatedAt) && regionFilter(p.regionTag) && sectorFilter(p.sector))
      .map(pointToFeature)
    const policy = layerData.policy
      .filter((p) => inWindow(p.updatedAt) && regionFilter(p.regionTag) && sectorFilter(p.sector))
      .map(pointToFeature)

    const topicsRaw: BasePoint[] = []
    liveSectorIntel.forEach((sector) => {
      if (!sectorFilter(sector.slug)) return

      const appendTopic = (
        category: string,
        idx: number,
        text: string,
        source: string,
        region?: string | Region,
      ) => {
        const normalized = normalizeRegionLabel(region)
        if (!regionMatch(normalized, activeRegion, activeCountry)) return
        topicsRaw.push({
          id: `topic-${sector.slug}-${category.toLowerCase()}-${idx}`,
          coords: jitteredCoords(normalized || 'Global', idx),
          sector: sector.slug,
          subtype: `${category}: ${text.slice(0, 58)}`,
          status: category,
          owner: source,
          updatedAt: nowIso,
          regionTag: normalized,
        })
      }

      sector.latestNews.forEach((item, idx) => appendTopic('Latest', idx, item.title, item.source, item.region))
      sector.techNews.forEach((item, idx) => appendTopic('Tech', idx + 20, item.title, item.source, item.region))
      sector.products.forEach((item, idx) => appendTopic('Product', idx + 40, item.name, item.company, item.region))
      sector.startups.forEach((item, idx) => appendTopic('Startup', idx + 60, item.name, item.name, item.geography || item.region))
      sector.finance.forEach((item, idx) => appendTopic('Finance', idx + 80, item.metric, sector.slug, item.region))
      sector.youtubeLive.forEach((item, idx) => appendTopic('Live', idx + 100, item.title, item.source, item.region))
      sector.community.forEach((item, idx) => appendTopic(item.platform, idx + 120, item.topic, item.platform, item.region))
    })

    const topics = topicsRaw
      .filter((p) => inWindow(p.updatedAt) && sectorFilter(p.sector))
      .map(pointToFeature)

    const transmission = layerData.transmission
      .filter((t) => inWindow(t.updatedAt))
      .map((t) => ({
        type: 'Feature' as const,
        geometry: { type: 'LineString' as const, coordinates: t.path.map(([lat, lon]) => [lon, lat]) },
        properties: {
          id: t.id,
          name: t.name,
          capacityMW: t.capacityMW,
          status: t.status,
          updatedAt: t.updatedAt,
        },
      }))

    const resource = layerData.resource
      .filter((r) => inWindow(r.updatedAt))
      .map((r) => ({
        type: 'Feature' as const,
        geometry: { type: 'Polygon' as const, coordinates: [[...r.ring.map(([lat, lon]) => [lon, lat])]] },
        properties: {
          id: r.id,
          metric: r.metric,
          value: r.value,
          updatedAt: r.updatedAt,
        },
      }))

    return {
      plants: { type: 'FeatureCollection' as const, features: plants },
      storage: { type: 'FeatureCollection' as const, features: storage },
      projects: { type: 'FeatureCollection' as const, features: projects },
      hydrogen: { type: 'FeatureCollection' as const, features: hydrogen },
      policy: { type: 'FeatureCollection' as const, features: policy },
      topics: { type: 'FeatureCollection' as const, features: topics },
      transmission: { type: 'FeatureCollection' as const, features: transmission },
      resource: { type: 'FeatureCollection' as const, features: resource },
    }
  }, [timeWindowDays, activeRegion, activeCountry, liveSectorIntel, sectorToggles])

  const counts = useMemo(() => {
    return Object.entries(filteredGeo).reduce<Record<string, number>>((acc, [key, collection]) => {
      acc[key] = (collection as any).features.length
      return acc
    }, {})
  }, [filteredGeo])

  const localSummary = useMemo(() => {
    const highlights = [
      `Plants: ${counts.plants || 0}`,
      `Storage: ${counts.storage || 0}`,
      `Projects: ${counts.projects || 0}`,
      `H2 hubs: ${counts.hydrogen || 0}`,
      `Topics: ${counts.topics || 0}`,
      `Grid lines: ${counts.transmission || 0}`,
      `Resource tiles: ${counts.resource || 0}`,
      `Policy events: ${counts.policy || 0}`,
    ]
    return `Last ${timeWindowDays === 0 ? 'all-time' : `${timeWindowDays}d`}: ${highlights.join(' · ')}`
  }, [counts, timeWindowDays])

  const statusHighlights = [
    {
      label: 'Data Bridge',
      value: apiStatus === 'online' ? 'Streaming' : 'Offline',
      hint: apiStatus === 'online' ? 'Live ingest + cache' : 'Falling back to seeded data',
      tone: apiStatus,
    },
    {
      label: 'Sectors Watching',
      value: `${liveSectorIntel.length} feeds`,
      hint: `Active: ${activeSector}`,
      tone: 'info',
    },
    {
      label: 'Last Sync',
      value: liveUpdatedAt ? new Date(liveUpdatedAt).toUTCString() : 'Waiting',
      hint: 'Auto-refresh every 3 min',
      tone: 'info',
    },
  ]

  useEffect(() => {
    const exists = orderedSectors.find((sector) => sector.slug === activeSector)
    if (!exists && orderedSectors.length > 0) {
      setActiveSector(orderedSectors[0].slug)
    }
  }, [activeSector, orderedSectors])

  useEffect(() => {
    let mounted = true

    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/dashboard')
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`)
        }

        const payload = await response.json()
        if (!mounted) return

        if (Array.isArray(payload.sectorIntel) && payload.sectorIntel.length > 0) {
          setLiveSectorIntel((prev) => {
            const prevBySlug = new Map<string, SectorIntel>()
            prev.forEach((row) => prevBySlug.set(row.slug, row))

            const merged = new Map<string, SectorIntel>()

            // prefer API entries, but keep finance fallback and ensure EV exists
            payload.sectorIntel.forEach((sector: SectorIntel) => {
              const backup = prevBySlug.get(sector.slug) || seedSectorIntel.find((s) => s.slug === sector.slug)
              merged.set(sector.slug, {
                ...sector,
                finance: sector.finance && sector.finance.length > 0 ? sector.finance : backup?.finance || [],
              })
            })

            // fill any missing seeded sectors (e.g., EV) if API skipped them
            seedSectorIntel.forEach((seed) => {
              if (!merged.has(seed.slug)) {
                merged.set(seed.slug, seed)
              }
            })

            return Array.from(merged.values())
          })
        }

        if (Array.isArray(payload.newsTape) && payload.newsTape.length > 0) {
          setLiveNewsTape(payload.newsTape)
        }

        setLiveUpdatedAt(typeof payload.updatedAt === 'string' ? payload.updatedAt : null)
        setApiStatus('online')
      } catch {
        if (!mounted) return
        setApiStatus('offline')
      }
    }

    void fetchDashboard()
    const timer = window.setInterval(() => {
      void fetchDashboard()
    }, 180000)

    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let mapInstance: any

    const init = async () => {
      const maplibre = await import('maplibre-gl')

      mapInstance = new maplibre.Map({
        container: 'globe-map',
        style: globeBaseStyle as any,
        center: [10, 25],
        zoom: 1.5,
        pitch: 25,
        bearing: -15,
        // @ts-ignore projection available at runtime
        projection: 'globe',
        minZoom: 1,
        maxZoom: 8,
      } as any)

      mapInstance.addControl(new maplibre.NavigationControl({ visualizePitch: true }), 'top-right')

      mapInstance.on('load', () => {
        if (!isMounted) return
        mapInstance.setFog({
          color: 'rgba(2,10,7,0.9)',
          range: [0.8, 10],
          highColor: '#0f2c1a',
          spaceColor: '#020807',
        })
        mapRef.current = mapInstance
        setMapReady(true)
      })
    }

    void init()

    return () => {
      isMounted = false
      if (mapInstance) {
        mapInstance.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const updateLayers = async () => {
      if (!mapReady || !mapRef.current) return
      const map = mapRef.current
      const maplibre = await import('maplibre-gl')

      const ensureSource = (id: string, data: any) => {
        const src = map.getSource(id)
        if (src) {
          ;(src as any).setData(data)
        } else {
          map.addSource(id, { type: 'geojson', data })
        }
      }

      const setVisibility = (id: string, visible: boolean) => {
        if (!map.getLayer(id)) return
        map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
      }

      ensureSource('plants-src', filteredGeo.plants)
      ensureSource('storage-src', filteredGeo.storage)
      ensureSource('projects-src', filteredGeo.projects)
      ensureSource('hydrogen-src', filteredGeo.hydrogen)
      ensureSource('policy-src', filteredGeo.policy)
      ensureSource('topics-src', filteredGeo.topics)
      ensureSource('tx-src', filteredGeo.transmission)
      ensureSource('resource-src', filteredGeo.resource)

      const pointLayer = (
        id: string,
        src: string,
        colorFallback: string,
      ) => {
        if (!map.getLayer(id)) {
          map.addLayer({
            id,
            type: 'circle',
            source: src,
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 4.5, 4, 8, 7, 13],
              'circle-color': ['coalesce', ['get', 'color'], colorFallback],
              'circle-stroke-color': '#e7ffe7',
              'circle-stroke-width': 1.25,
              'circle-opacity': 0.96,
            },
          })

          map.on('click', id, (e: any) => {
            const f = e.features?.[0]
            if (!f) return
            const p = f.properties || {}
            new maplibre.Popup({ offset: 12 })
              .setLngLat(e.lngLat)
              .setHTML(
                `<strong>${p.subtype || 'Asset'}</strong><br/>${p.status || ''}<br/>Capacity: ${p.capacityMW || '—'} MW<br/>Owner: ${p.owner || 'N/A'}<br/>Updated: ${p.updatedAt || ''}`,
              )
              .addTo(map)
          })
        }
        setVisibility(id, true)
      }

      pointLayer('plants-layer', 'plants-src', '#8be07f')
      pointLayer('storage-layer', 'storage-src', '#8be07f')
      pointLayer('projects-layer', 'projects-src', '#ffd47e')
      pointLayer('hydrogen-layer', 'hydrogen-src', '#76d1ff')
      pointLayer('policy-layer', 'policy-src', '#ff9f7a')
      pointLayer('topics-layer', 'topics-src', '#a0e0ff')

      if (!map.getLayer('tx-layer')) {
        map.addLayer({
          id: 'tx-layer',
          type: 'line',
          source: 'tx-src',
          paint: {
            'line-color': '#6fffb0',
            'line-width': 2,
            'line-dasharray': [2, 1.3],
          },
        })
      }

      if (!map.getLayer('resource-layer')) {
        map.addLayer({
          id: 'resource-layer',
          type: 'fill',
          source: 'resource-src',
          paint: {
            'fill-color': ['interpolate', ['linear'], ['get', 'value'], 500, '#1b4228', 1500, '#46b165', 2500, '#f5c04d'],
            'fill-opacity': 0.35,
            'fill-outline-color': '#2c8a4a',
          },
        })
      }

      setVisibility('plants-layer', layerToggles.plants)
      setVisibility('storage-layer', layerToggles.storage)
      setVisibility('projects-layer', layerToggles.projects)
      setVisibility('hydrogen-layer', layerToggles.hydrogen)
      setVisibility('policy-layer', layerToggles.policy)
      setVisibility('topics-layer', layerToggles.topics)
      setVisibility('tx-layer', layerToggles.transmission)
      setVisibility('resource-layer', layerToggles.resource)
    }

    void updateLayers()
  }, [filteredGeo, layerToggles, mapReady])

  useEffect(() => {
    let cancelled = false

    const fetchAiDigest = async () => {
      setAiSummary('Running local AI digest...')
      try {
        const response = await fetch('/api/ai/digest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ counts, windowDays: timeWindowDays }),
        })

        if (!response.ok) throw new Error(`AI endpoint ${response.status}`)
        const payload = await response.json()
        if (cancelled) return
        setAiSummary(payload.summary || localSummary)
      } catch {
        if (cancelled) return
        setAiSummary(localSummary)
      }
    }

    void fetchAiDigest()
    return () => {
      cancelled = true
    }
  }, [counts, localSummary, timeWindowDays])

  const selectedSector = orderedSectors.find((sector) => sector.slug === activeSector) || orderedSectors[0]

  const filteredSector = selectedSector
    ? {
        ...selectedSector,
        latestNews: filterByRegion(selectedSector.latestNews, activeRegion, activeCountry),
        techNews: filterByRegion(selectedSector.techNews, activeRegion, activeCountry),
        products: filterByRegion(selectedSector.products, activeRegion, activeCountry),
        startups: filterByRegion(selectedSector.startups, activeRegion, activeCountry),
        finance: filterByRegion(selectedSector.finance, activeRegion, activeCountry),
        youtubeLive: filterByRegion(selectedSector.youtubeLive, activeRegion, activeCountry),
        community: filterByRegion(selectedSector.community, activeRegion, activeCountry),
      }
    : undefined

  const featuredVideo = useMemo(() => {
    const fallback = {
      item: {
        title: 'Energy markets live',
        source: 'Reuters Live',
        url: 'https://www.youtube.com/@Reuters/live',
      },
      embed: 'https://www.youtube.com/embed/live_stream?channel=UChqUTb7kYRX8-EiaN3XFrSQ',
      index: -1,
    }

    if (!filteredSector || filteredSector.youtubeLive.length === 0) return fallback
    const idx = streamSelections[filteredSector.slug] ?? 0
    const safeIdx = Math.min(idx, filteredSector.youtubeLive.length - 1)
    const item = filteredSector.youtubeLive[safeIdx]
    const embed = getYouTubeEmbedUrl(item)
    return embed ? { item, embed, index: safeIdx } : fallback
  }, [filteredSector, streamSelections])

  const flyToCoords = (lat: number, lon: number, zoom = 4.2) => {
    if (!mapRef.current) return
    mapRef.current.flyTo({ center: [lon, lat], zoom, speed: 0.8, essential: true })
  }

  const runSearch = async (term: string) => {
    if (!term) return
    setSearchStatus(`Searching “${term}”...`)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`)
      if (!response.ok) throw new Error(`Search ${response.status}`)
      const payload = await response.json()
      const results = payload?.results || []
      if (!results.length) {
        setSearchStatus('No matches found')
        return
      }
      const top = results[0]
      if (Array.isArray(top.coords) && top.coords.length === 2) {
        flyToCoords(top.coords[0], top.coords[1])
      }
      setSearchStatus(`Centered on ${top.title} (${top.layer})`)
    } catch {
      setSearchStatus('Search unavailable; check API')
    }
  }

  const applyCommand = () => {
    const parts = mapCommand.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return

    setSearchStatus('')

    if (parts[0] === 'find' || parts[0] === 'search') {
      const term = mapCommand.replace(/^(find|search)\s*/i, '').trim()
      if (term) void runSearch(term)
      setMapCommand('')
      return
    }

    const nextToggles = { ...layerToggles }
    const nextSectorToggles = { ...sectorToggles }
    for (let i = 0; i < parts.length; i += 1) {
      const token = parts[i]
      if (token === 'time' && parts[i + 1]) {
        const n = Number(parts[i + 1])
        if (!Number.isNaN(n)) setTimeWindowDays(Math.max(0, n))
      }
      if (token === 'all') {
        setTimeWindowDays(0)
      }
      const mapTokenToLayer: Record<string, LayerKey> = {
        plants: 'plants',
        storage: 'storage',
        projects: 'projects',
        hydrogen: 'hydrogen',
        h2: 'hydrogen',
        grid: 'transmission',
        transmission: 'transmission',
        resource: 'resource',
        policy: 'policy',
        topic: 'topics',
        topics: 'topics',
      }
      const mapTokenToSector: Record<string, SectorIntel['slug']> = {
        solar: 'Solar',
        wind: 'Wind',
        hydro: 'Hydro',
        geothermal: 'Geothermal',
        storage: 'Storage',
        nuclear: 'Nuclear',
        ev: 'EV',
      }
      const layerKey = mapTokenToLayer[token]
      if (layerKey) {
        nextToggles[layerKey] = true
      }
      const sectorKey = mapTokenToSector[token]
      if (sectorKey) {
        nextSectorToggles[sectorKey] = true
      }
      if (token === 'hide' && parts[i + 1]) {
        const hideKey = mapTokenToLayer[parts[i + 1]]
        if (hideKey) nextToggles[hideKey] = false
        const hideSectorKey = mapTokenToSector[parts[i + 1]]
        if (hideSectorKey) nextSectorToggles[hideSectorKey] = false
      }
    }
    setLayerToggles(nextToggles)
    setSectorToggles(nextSectorToggles)
  }

  return (
    <div className="dashboard-shell">
      <header className="topbar panel">
        <div>
          <p className="eyebrow">EnergyVerse Monitor</p>
          <h1>Renewables & Nuclear Intelligence Console</h1>
        </div>
        <div className="topbar-right">
          <div className="top-links" aria-label="Primary links">
            {repoLinks.map((link) => (
              <a key={link.href} className="link-chip" href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
          <span className="live-dot">LIVE</span>
          <span className="updated">Updated {lastUpdated}</span>
          <span className={`api-chip ${apiStatus}`}>API {apiStatus}</span>
          {liveUpdatedAt && <span className="updated">Feed {new Date(liveUpdatedAt).toUTCString()}</span>}
        </div>
      </header>

      <section className="topic-strip panel">
        {trending.map((item) => (
          <span key={item} className="topic-pill">
            {item}
          </span>
        ))}
      </section>

      <section className="panel flux-panel">
        <div className="panel-header">
          <h3>Globe Monitor • MapLibre</h3>
          <span>3D globe with energy layers, time filter, command palette</span>
        </div>
        <div className="globe-controls">
          <div className="layer-switches">
            {(
              [
                'plants',
                'storage',
                'projects',
                'hydrogen',
                'topics',
                'transmission',
                'resource',
                'policy',
              ] as LayerKey[]
            ).map((key) => (
              <label key={key} className="layer-toggle">
                <input
                  type="checkbox"
                  checked={layerToggles[key]}
                  onChange={(e) => setLayerToggles((prev) => ({ ...prev, [key]: e.target.checked }))}
                />
                <span>
                  {layerLabels[key]}
                </span>
              </label>
            ))}
          </div>
          <div className="layer-switches">
            {sectorOrder.map((sector) => (
              <label key={sector} className="layer-toggle">
                <input
                  type="checkbox"
                  checked={sectorToggles[sector]}
                  onChange={(e) => setSectorToggles((prev) => ({ ...prev, [sector]: e.target.checked }))}
                />
                <span>{sector}</span>
              </label>
            ))}
          </div>
          <div className="time-filter">
            <div className="time-buttons">
              {timePresets.map((preset) => (
                <button
                  key={preset.label}
                  className={timeWindowDays === preset.days ? 'active' : ''}
                  onClick={() => setTimeWindowDays(preset.days)}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <label className="slider-row">
              <span>Custom days: {timeWindowDays}</span>
              <input
                type="range"
                min={0}
                max={60}
                value={timeWindowDays}
                onChange={(e) => setTimeWindowDays(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="command-bar">
            <input
              value={mapCommand}
              onChange={(e) => setMapCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyCommand()
              }}
              placeholder="Command: 'time 7 topics solar', 'hide wind', 'hide transmission', 'find Surya'"
            />
            <button type="button" onClick={applyCommand}>
              Run
            </button>
            {searchStatus && <span className="command-hint">{searchStatus}</span>}
          </div>
          <div className="ai-panel">
            <p className="ai-label">AI Delta Digest</p>
            <p className="ai-copy">{aiSummary}</p>
          </div>
        </div>
        <div className="flux-map" aria-label="World map with energy layers">
          <div id="globe-map" />
        </div>
        <div className="flux-legend">
          {Object.entries(sectorColors).map(([sector, color]) => (
            <div key={sector} className="legend-item">
              <span className="legend-dot" style={{ background: color }} /> {sector}
            </div>
          ))}
        </div>
      </section>

      <section className="panel region-panel">
        <div className="panel-header">
          <h3>Region Focus</h3>
          <span>Select a macro region and/or country</span>
        </div>
        <div className="region-controls">
          <label className="region-field">
            <span>Region</span>
            <select value={activeRegion} onChange={(e) => setActiveRegion(e.target.value as Region)}>
              {macroRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
          <label className="region-field">
            <span>Country</span>
            <select value={activeCountry} onChange={(e) => setActiveCountry(e.target.value as Region | 'All')}>
              <option value="All">All</option>
              {countryRegions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="region-note">Filters apply live to every container. If none selected, Global shows all.</p>
      </section>

      <section className="status-grid panel">
        {statusHighlights.map((status) => (
          <div key={status.label} className={`status-tile ${status.tone}`}>
            <p className="status-label">{status.label}</p>
            <div className="status-value-row">
              <span className="status-dot" />
              <strong>{status.value}</strong>
            </div>
            <p className="status-hint">{status.hint}</p>
          </div>
        ))}
      </section>

      <section className="kpi-grid">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="panel kpi-card">
            <p className="kpi-label">{kpi.label}</p>
            <h2>{kpi.value}</h2>
            <p className={`kpi-delta ${kpi.trend}`}>{kpi.delta}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel span-6">
          <div className="panel-header">
            <h3>Market Pulse</h3>
            <span>Clean-energy linked instruments</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Region</th>
                <th>Price</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {marketRows.map((row) => (
                <tr key={row.asset}>
                  <td>{row.asset}</td>
                  <td>{row.region}</td>
                  <td>{row.price}</td>
                  <td className={row.trend}>{row.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="panel span-6">
          <div className="panel-header">
            <h3>Policy Tracker</h3>
            <span>Upcoming regulatory shifts</span>
          </div>
          <ul className="policy-list">
            {policies.map((policy) => (
              <li key={policy.title}>
                <div>
                  <p className="policy-title">{policy.title}</p>
                  <p className="policy-meta">{policy.region} • Effective {policy.effectiveDate}</p>
                </div>
                <span className={`impact ${policy.impact}`}>{policy.impact}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel span-4">
          <div className="panel-header">
            <h3>Impact & Emissions</h3>
            <span>Target tracking</span>
          </div>
          <div className="track-list">
            {emissions.map((item) => {
              const ratio = Math.min((item.current / item.target) * 100, 100)
              return (
                <div key={item.segment} className="track-row">
                  <div className="track-head">
                    <p>{item.segment}</p>
                    <p>
                      {item.current} / {item.target} {item.unit}
                    </p>
                  </div>
                  <div className="track-bar">
                    <span style={{ width: `${ratio}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="panel span-4">
          <div className="panel-header">
            <h3>Business Signals</h3>
            <span>Pipeline, capex, margins</span>
          </div>
          <ul className="signal-list">
            {businessSignals.map((signal) => (
              <li key={signal.company}>
                <p>{signal.company}</p>
                <p>{signal.signal}</p>
                <strong>{signal.value}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel span-4">
          <div className="panel-header">
            <h3>Change Feed</h3>
            <span>Project-level updates</span>
          </div>
          <ul className="change-list">
            {projectChanges.map((item) => (
              <li key={item.project}>
                <p>{item.project}</p>
                <p>
                  {item.country} • {item.technology} • {item.status}
                </p>
                <span>{item.change}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel news-panel">
        <div className="panel-header">
          <h3>News Tape</h3>
          <span>Policy, markets, technology, sustainability</span>
        </div>
        <div className="news-ticker">
          <div className="news-track">
            {[...liveNewsTape, ...liveNewsTape].map((item, idx) => (
              <p key={`${item.headline}-${idx}`}>
                <strong>{item.time}</strong> [{item.source}] {item.headline}{' '}
                <span>{item.tag}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="sector-stack panel">
        <div className="sector-tabs" role="tablist" aria-label="Energy technology tabs">
          {orderedSectors.map((sector) => (
            <button
              key={sector.slug}
              className={`sector-tab ${activeSector === sector.slug ? 'active' : ''}`}
              onClick={() => setActiveSector(sector.slug)}
              role="tab"
              aria-selected={activeSector === sector.slug}
              type="button"
            >
              {sector.slug}
            </button>
          ))}
        </div>

        {filteredSector && (
          <article key={filteredSector.slug} className="sector-panel">
            <div className="sector-header">
              <div>
                <p className="sector-label">{filteredSector.slug}</p>
                <h3>{filteredSector.headline}</h3>
              </div>
              <p>{filteredSector.summary}</p>
            </div>

            <div className="sector-grid">
              <section className="sector-card">
                <h4>Latest News</h4>
                {filteredSector.latestNews.length === 0 ? (
                  <p className="empty">No items for this selection.</p>
                ) : (
                  <ul>
                    {filteredSector.latestNews.map((item) => (
                      <li key={item.title}>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.title}
                        </a>
                        <span>
                          {item.source} • {item.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="sector-card">
                <h4>Tech News</h4>
                {filteredSector.techNews.length === 0 ? (
                  <p className="empty">No items for this selection.</p>
                ) : (
                  <ul>
                    {filteredSector.techNews.map((item) => (
                      <li key={item.title}>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.title}
                        </a>
                        <span>
                          {item.source} • {item.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="sector-card">
                <h4>New Products</h4>
                {filteredSector.products.length === 0 ? (
                  <p className="empty">No items for this selection.</p>
                ) : (
                  <ul>
                    {filteredSector.products.map((item) => (
                      <li key={item.name}>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.name} — {item.company}
                        </a>
                        <span>
                          {item.status} • {item.summary}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="sector-card">
                <h4>Startup Radar</h4>
                {filteredSector.startups.length === 0 ? (
                  <p className="empty">No items for this selection.</p>
                ) : (
                  <ul>
                    {filteredSector.startups.map((item) => (
                      <li key={item.name}>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.name} ({item.region})
                        </a>
                        <span>
                          {item.event} • {item.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="sector-card finance-card">
                <h4>Finance & Stocks</h4>
                {filteredSector.finance.length === 0 ? (
                  <p className="empty">No items for this selection.</p>
                ) : (
                  <ul className="finance-list">
                    {filteredSector.finance.map((item) => (
                      <li key={item.metric} className="finance-row">
                        <div className="finance-meta">
                          <p className="finance-label">{item.metric}</p>
                          <div className="finance-price">
                            <strong>{item.value}</strong>
                            <span className={`pill ${item.trend}`}>{item.move}</span>
                          </div>
                        </div>
                        <div className="finance-chart">{renderSparkline(item.history)}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="sector-card sector-card-video">
                <h4>YouTube Live</h4>
                {featuredVideo?.embed ? (
                  <div className="video-wrap">
                    <iframe
                      src={featuredVideo.embed}
                      title={`${filteredSector.slug} live video`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <p className="video-fallback">No embeddable stream in current feed. Use links below.</p>
                )}
                {filteredSector.youtubeLive.length > 1 && (
                  <div className="stream-switch">
                    {filteredSector.youtubeLive.map((item, idx) => (
                      <button
                        key={`${item.title}-${idx}`}
                        className={featuredVideo?.index === idx ? 'active' : ''}
                        onClick={() =>
                          setStreamSelections((prev) => ({
                            ...prev,
                            [filteredSector.slug]: idx,
                          }))
                        }
                        type="button"
                      >
                        {item.source || `Stream ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}
                {filteredSector.youtubeLive.length === 0 ? (
                  <p className="empty">No streams for this selection.</p>
                ) : (
                  <ul>
                    {filteredSector.youtubeLive.map((item) => (
                      <li key={item.title}>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.title}
                        </a>
                        <span>
                          {item.source} • {item.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                </section>

              <section className="sector-card heat-card">
                <h4>Regional Heat</h4>
                <div className="heat-grid">
                  {(regionHeat[activeRegion] || regionHeat.Global).map((row) => (
                    <div key={`${row.region}-${row.metric}`} className="heat-row">
                      <div className="heat-head">
                        <span className="heat-label">{row.region}</span>
                        <span className="heat-score">{row.score}</span>
                      </div>
                      <div className="heat-bar">
                        <span style={{ width: `${Math.min(row.score, 100)}%` }} />
                      </div>
                      <p className="heat-meta">{row.metric}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="sector-card">
                <h4>Reddit & GitHub Topics</h4>
                {filteredSector.community.length === 0 ? (
                  <p className="empty">No items for this selection.</p>
                ) : (
                  <ul>
                    {filteredSector.community.map((item) => (
                      <li key={`${item.platform}-${item.topic}`}>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          [{item.platform}] {item.topic}
                        </a>
                        <span>{item.activity}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </article>
        )}
      </section>
    </div>
  )
}

export default App
