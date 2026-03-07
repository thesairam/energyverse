import './App.css'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  type LinkItem, type NewsItem, type Region, type SectorIntel, type PolicyItem,
  type EmissionTrack, type ProjectChange, type BusinessSignal, type FinanceItem,
  type ProductItem, type StartupItem, type CommunityItem, type Kpi, type MarketRow,
  type FundFlowRow, type LcoeRow, type InvestDeal, type Co2SectorRow,
  kpis, marketRows, newsTape, policies, emissions, projectChanges, businessSignals, sectorIntel,
  fundFlows, lcoeData, investDeals, co2BySector,
} from './data/energyData'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type LayerKey = 'plants' | 'storage' | 'projects' | 'hydrogen' | 'ev' | 'nuclear' | 'transmission' | 'resource' | 'policy' | 'topics'
type BasePoint = { id: string; coords: [number, number]; sector: SectorIntel['slug']; subtype?: string; status?: string; owner?: string; updatedAt: string; regionTag?: string; capacityMW?: number }
type LineFeature = { id: string; path: [number, number][]; name: string; capacityMW?: number; status?: string; updatedAt: string }
type PolygonFeature = { id: string; ring: [number, number][]; metric: string; value: string; updatedAt: string }
type ChatMessage = { role: 'user' | 'assistant'; content: string }
type YoutubeVideo = { title: string; channel: string; url: string; videoId: string; thumbnail: string; pubDate: string; isLive: boolean; description: string }
type ApiGeoFC = { type: 'FeatureCollection'; features: any[]; layer?: string }
type ApiGeoLayers = Partial<Record<string, ApiGeoFC>>
type ActiveTab = SectorIntel['slug'] | 'CHAT'

// ─────────────────────────────────────────────────────────────────────────────
// Country + Region data — full global coverage
// ─────────────────────────────────────────────────────────────────────────────
type CountryEntry = { name: string; region: string; lat: number; lon: number }

const COUNTRY_LIST: CountryEntry[] = [
  // Europe / EMEA
  { name: 'UK', region: 'EMEA', lat: 53, lon: -2 },
  { name: 'Germany', region: 'EMEA', lat: 51, lon: 10 },
  { name: 'France', region: 'EMEA', lat: 46, lon: 2 },
  { name: 'Netherlands', region: 'EMEA', lat: 52, lon: 5 },
  { name: 'Spain', region: 'EMEA', lat: 40, lon: -3 },
  { name: 'Italy', region: 'EMEA', lat: 42, lon: 12 },
  { name: 'Sweden', region: 'EMEA', lat: 60, lon: 18 },
  { name: 'Norway', region: 'EMEA', lat: 60, lon: 8 },
  { name: 'Denmark', region: 'EMEA', lat: 56, lon: 10 },
  { name: 'Poland', region: 'EMEA', lat: 52, lon: 20 },
  { name: 'Belgium', region: 'EMEA', lat: 50, lon: 4 },
  { name: 'Portugal', region: 'EMEA', lat: 39, lon: -8 },
  { name: 'Austria', region: 'EMEA', lat: 47, lon: 14 },
  { name: 'Switzerland', region: 'EMEA', lat: 47, lon: 8 },
  { name: 'Finland', region: 'EMEA', lat: 61, lon: 26 },
  { name: 'Czech Republic', region: 'EMEA', lat: 50, lon: 15 },
  { name: 'Romania', region: 'EMEA', lat: 46, lon: 25 },
  { name: 'Greece', region: 'EMEA', lat: 39, lon: 22 },
  { name: 'Hungary', region: 'EMEA', lat: 47, lon: 19 },
  { name: 'Turkey', region: 'EMEA', lat: 39, lon: 35 },
  { name: 'Ukraine', region: 'EMEA', lat: 49, lon: 32 },
  { name: 'Ireland', region: 'EMEA', lat: 53, lon: -8 },
  { name: 'Croatia', region: 'EMEA', lat: 45, lon: 16 },
  { name: 'Serbia', region: 'EMEA', lat: 44, lon: 21 },
  { name: 'Bulgaria', region: 'EMEA', lat: 43, lon: 25 },
  { name: 'Slovakia', region: 'EMEA', lat: 49, lon: 19 },
  { name: 'Lithuania', region: 'EMEA', lat: 56, lon: 24 },
  { name: 'Latvia', region: 'EMEA', lat: 57, lon: 25 },
  { name: 'Estonia', region: 'EMEA', lat: 59, lon: 25 },
  // Middle East & Africa — MEA
  { name: 'UAE', region: 'MEA', lat: 24, lon: 54 },
  { name: 'Saudi Arabia', region: 'MEA', lat: 24, lon: 45 },
  { name: 'Qatar', region: 'MEA', lat: 25, lon: 51 },
  { name: 'Kuwait', region: 'MEA', lat: 29, lon: 48 },
  { name: 'Oman', region: 'MEA', lat: 22, lon: 58 },
  { name: 'Bahrain', region: 'MEA', lat: 26, lon: 50 },
  { name: 'Israel', region: 'MEA', lat: 31, lon: 35 },
  { name: 'Jordan', region: 'MEA', lat: 31, lon: 36 },
  { name: 'Iraq', region: 'MEA', lat: 33, lon: 44 },
  { name: 'Iran', region: 'MEA', lat: 32, lon: 53 },
  { name: 'Egypt', region: 'MEA', lat: 27, lon: 30 },
  { name: 'South Africa', region: 'MEA', lat: -29, lon: 25 },
  { name: 'Nigeria', region: 'MEA', lat: 10, lon: 8 },
  { name: 'Morocco', region: 'MEA', lat: 32, lon: -6 },
  { name: 'Kenya', region: 'MEA', lat: 1, lon: 38 },
  { name: 'Ethiopia', region: 'MEA', lat: 9, lon: 40 },
  { name: 'Ghana', region: 'MEA', lat: 8, lon: -1 },
  { name: 'Tanzania', region: 'MEA', lat: -6, lon: 35 },
  { name: 'Algeria', region: 'MEA', lat: 28, lon: 2 },
  { name: 'Tunisia', region: 'MEA', lat: 34, lon: 9 },
  { name: 'Libya', region: 'MEA', lat: 25, lon: 17 },
  { name: 'Mozambique', region: 'MEA', lat: -18, lon: 35 },
  { name: 'Zambia', region: 'MEA', lat: -14, lon: 28 },
  { name: 'DR Congo', region: 'MEA', lat: -4, lon: 22 },
  { name: 'Senegal', region: 'MEA', lat: 14, lon: -14 },
  // North America — NAM
  { name: 'USA', region: 'NAM', lat: 38, lon: -97 },
  { name: 'Canada', region: 'NAM', lat: 56, lon: -96 },
  // Latin America — LATAM
  { name: 'Mexico', region: 'LATAM', lat: 23, lon: -102 },
  { name: 'Brazil', region: 'LATAM', lat: -10, lon: -53 },
  { name: 'Chile', region: 'LATAM', lat: -30, lon: -71 },
  { name: 'Colombia', region: 'LATAM', lat: 5, lon: -74 },
  { name: 'Argentina', region: 'LATAM', lat: -34, lon: -64 },
  { name: 'Peru', region: 'LATAM', lat: -9, lon: -77 },
  { name: 'Ecuador', region: 'LATAM', lat: -2, lon: -78 },
  { name: 'Bolivia', region: 'LATAM', lat: -17, lon: -65 },
  { name: 'Uruguay', region: 'LATAM', lat: -33, lon: -56 },
  { name: 'Paraguay', region: 'LATAM', lat: -23, lon: -58 },
  { name: 'Venezuela', region: 'LATAM', lat: 8, lon: -66 },
  { name: 'Cuba', region: 'LATAM', lat: 22, lon: -80 },
  { name: 'Costa Rica', region: 'LATAM', lat: 10, lon: -84 },
  // Asia-Pacific — APAC
  { name: 'China', region: 'APAC', lat: 35, lon: 103 },
  { name: 'India', region: 'APAC', lat: 20, lon: 78 },
  { name: 'Japan', region: 'APAC', lat: 36, lon: 138 },
  { name: 'South Korea', region: 'APAC', lat: 37, lon: 128 },
  { name: 'Australia', region: 'APAC', lat: -25, lon: 133 },
  { name: 'Singapore', region: 'APAC', lat: 1, lon: 104 },
  { name: 'Vietnam', region: 'APAC', lat: 16, lon: 108 },
  { name: 'Indonesia', region: 'APAC', lat: -5, lon: 120 },
  { name: 'Taiwan', region: 'APAC', lat: 24, lon: 121 },
  { name: 'Thailand', region: 'APAC', lat: 13, lon: 101 },
  { name: 'Philippines', region: 'APAC', lat: 13, lon: 122 },
  { name: 'Malaysia', region: 'APAC', lat: 3, lon: 112 },
  { name: 'Bangladesh', region: 'APAC', lat: 24, lon: 90 },
  { name: 'Pakistan', region: 'APAC', lat: 30, lon: 70 },
  { name: 'New Zealand', region: 'APAC', lat: -43, lon: 172 },
  { name: 'Kazakhstan', region: 'APAC', lat: 48, lon: 68 },
  { name: 'Mongolia', region: 'APAC', lat: 47, lon: 106 },
  { name: 'Myanmar', region: 'APAC', lat: 17, lon: 96 },
  { name: 'Sri Lanka', region: 'APAC', lat: 8, lon: 81 },
  { name: 'Nepal', region: 'APAC', lat: 28, lon: 84 },
  { name: 'Uzbekistan', region: 'APAC', lat: 41, lon: 64 },
]

const macroRegions = ['Global', 'EMEA', 'NAM', 'APAC', 'LATAM', 'MEA'] as const
// Build regionCenters from COUNTRY_LIST + macro defaults
const regionCenters: Record<string, [number, number]> = {
  Global: [20, 10], EMEA: [48, 15], NAM: [45, -100],
  APAC: [25, 105], LATAM: [-15, -60], MEA: [15, 30],
}
COUNTRY_LIST.forEach(c => { regionCenters[c.name] = [c.lat, c.lon] })

const regionGroups: Record<string, string[]> = {
  Global: [...macroRegions.slice(1), ...COUNTRY_LIST.map(c => c.name)],
  EMEA: COUNTRY_LIST.filter(c => c.region === 'EMEA').map(c => c.name),
  NAM: ['USA', 'Canada'],
  LATAM: COUNTRY_LIST.filter(c => c.region === 'LATAM').map(c => c.name),
  MEA: COUNTRY_LIST.filter(c => c.region === 'MEA').map(c => c.name),
  APAC: COUNTRY_LIST.filter(c => c.region === 'APAC').map(c => c.name),
}
COUNTRY_LIST.forEach(c => { regionGroups[c.name] = [] })

const normalizeRegionLabel = (value?: string | Region): string => {
  if (!value) return 'Global'
  const aliases: Record<string, string> = {
    us: 'USA', usa: 'USA', 'united states': 'USA', america: 'NAM',
    eu: 'EMEA', europe: 'EMEA', 'united kingdom': 'UK', gb: 'UK',
    deutschland: 'Germany', prc: 'China', 'south korea': 'South Korea', rok: 'South Korea',
    'republic of korea': 'South Korea',
  }
  return aliases[value.toLowerCase()] ?? value
}

const jitteredCoords = (regionLabel: string | undefined, index: number): [number, number] => {
  const normalized = normalizeRegionLabel(regionLabel)
  const base = regionCenters[normalized] || regionCenters.Global
  const angle = (((index + 3) * 137) % 360) * (Math.PI / 180)
  const radius = 0.8 + (index % 5) * 0.55
  const lat = Math.max(-70, Math.min(75, base[0] + Math.sin(angle) * radius))
  const lon = Math.max(-179, Math.min(179, base[1] + Math.cos(angle) * radius * 1.25))
  return [lat, lon]
}

const regionMatch = (itemRegion: string | undefined, selected: string, country: string): boolean => {
  const norm = normalizeRegionLabel(itemRegion)
  if (selected === 'Global') return true
  if (norm === selected) return true
  if (country !== 'All' && norm === country) return true
  const members = regionGroups[selected] || []
  return members.includes(norm)
}

// ─────────────────────────────────────────────────────────────────────────────
// Visual constants
// ─────────────────────────────────────────────────────────────────────────────
const sectorColors: Record<SectorIntel['slug'], string> = {
  Solar: '#f5a623', Wind: '#4ad9ff', Hydro: '#5b9cf6', Geothermal: '#e07b54',
  Storage: '#a8ff78', Nuclear: '#d0ff4f', EV: '#bd93f9', Hydrogen: '#ff79c6',
}

const layerLabels: Record<LayerKey, string> = {
  plants: '⚡ Plants', storage: '🔋 Storage', projects: '🏗 Projects',
  hydrogen: '💧 H₂', ev: '🚗 EV', nuclear: '☢ Nuclear',
  transmission: '⟶ TX Lines', resource: '▦ Resource', policy: '📋 Policy', topics: '◈ Topics',
}

const nowIso = new Date().toISOString().slice(0, 10)
const MAX_TOPICS = 80

const layerData: {
  plants: BasePoint[]; storage: BasePoint[]; projects: BasePoint[]; hydrogen: BasePoint[]
  ev: BasePoint[]; nuclear: BasePoint[]; policy: BasePoint[]
  transmission: LineFeature[]; resource: PolygonFeature[]
} = {
  plants: [
    { id: 'wind-uk-hornsea', coords: [53.5, -1.5], sector: 'Wind', subtype: 'Offshore WF', capacityMW: 1200, status: 'Operating', owner: 'Ørsted', updatedAt: nowIso, regionTag: 'UK' },
    { id: 'solar-bhadla', coords: [27.5, 71.9], sector: 'Solar', subtype: 'Utility PV', capacityMW: 2245, status: 'Operating', owner: 'Adani', updatedAt: nowIso, regionTag: 'India' },
    { id: 'hydro-three-gorges', coords: [30.8, 111.0], sector: 'Hydro', subtype: 'Run-of-river', capacityMW: 22500, status: 'Operating', owner: 'CTGC', updatedAt: nowIso, regionTag: 'China' },
    { id: 'geo-nesjavellir', coords: [64.1, -21.2], sector: 'Geothermal', subtype: 'Flash steam', capacityMW: 575, status: 'Operating', owner: 'Reykjavik Energy', updatedAt: nowIso, regionTag: 'EMEA' },
    { id: 'nuclear-hinkley-c', coords: [51.2, -3.1], sector: 'Nuclear', subtype: 'EPR', capacityMW: 3200, status: 'Under construction', owner: 'EDF', updatedAt: nowIso, regionTag: 'UK' },
    { id: 'wind-texas-roscoe', coords: [32.4, -100.5], sector: 'Wind', subtype: 'Onshore WF', capacityMW: 3000, status: 'Operating', owner: 'RWE', updatedAt: nowIso, regionTag: 'USA' },
    { id: 'solar-xinjiang', coords: [41.0, 85.0], sector: 'Solar', subtype: 'Utility PV', capacityMW: 5000, status: 'Operating', owner: 'CGN', updatedAt: nowIso, regionTag: 'China' },
    { id: 'solar-noor-morocco', coords: [31.0, -7.1], sector: 'Solar', subtype: 'CSP+PV', capacityMW: 580, status: 'Operating', owner: 'MASEN', updatedAt: nowIso, regionTag: 'Morocco' },
    { id: 'wind-gemini-nl', coords: [55.0, 3.3], sector: 'Wind', subtype: 'Offshore WF', capacityMW: 600, status: 'Operating', owner: 'Northland Power', updatedAt: nowIso, regionTag: 'Netherlands' },
    { id: 'solar-aswan-egypt', coords: [23.9, 32.9], sector: 'Solar', subtype: 'Utility PV', capacityMW: 1650, status: 'Operating', owner: 'Masdar', updatedAt: nowIso, regionTag: 'Egypt' },
    { id: 'hydro-itaipu', coords: [-25.4, -54.6], sector: 'Hydro', subtype: 'Dam', capacityMW: 14000, status: 'Operating', owner: 'Itaipu Binacional', updatedAt: nowIso, regionTag: 'Brazil' },
    { id: 'geo-cerro-prieto', coords: [32.4, -115.3], sector: 'Geothermal', subtype: 'Flash steam', capacityMW: 720, status: 'Operating', owner: 'CFE', updatedAt: nowIso, regionTag: 'Mexico' },
    { id: 'wind-horns-rev', coords: [55.5, 7.9], sector: 'Wind', subtype: 'Offshore WF', capacityMW: 430, status: 'Operating', owner: 'Vattenfall', updatedAt: nowIso, regionTag: 'Denmark' },
    { id: 'solar-sudair', coords: [25.6, 45.2], sector: 'Solar', subtype: 'Utility PV', capacityMW: 1500, status: 'Operating', owner: 'ARAMCO/ACWA', updatedAt: nowIso, regionTag: 'Saudi Arabia' },
    { id: 'wind-sheringham', coords: [53.1, 1.2], sector: 'Wind', subtype: 'Offshore WF', capacityMW: 317, status: 'Operating', owner: 'Equinor', updatedAt: nowIso, regionTag: 'UK' },
    { id: 'nuclear-vogtle', coords: [33.1, -81.8], sector: 'Nuclear', subtype: 'AP1000', capacityMW: 2234, status: 'Operating', owner: 'Georgia Power', updatedAt: nowIso, regionTag: 'USA' },
    { id: 'hydro-grand-inga', coords: [-5.5, 13.7], sector: 'Hydro', subtype: 'Run-of-river', capacityMW: 44000, status: 'Development', owner: 'Inga JV', updatedAt: nowIso, regionTag: 'DR Congo' },
    { id: 'solar-tengger', coords: [37.4, 105.2], sector: 'Solar', subtype: 'Utility PV', capacityMW: 1547, status: 'Operating', owner: 'Zhongwei Power', updatedAt: nowIso, regionTag: 'China' },
    { id: 'wind-dogger-bank', coords: [54.5, 1.9], sector: 'Wind', subtype: 'Offshore WF', capacityMW: 3600, status: 'Under construction', owner: 'SSE/Equinor', updatedAt: nowIso, regionTag: 'UK' },
  ],
  storage: [
    { id: 'bess-hornsdale', coords: [-33.7, 137.6], sector: 'Storage', subtype: 'Li-ion BESS', capacityMW: 300, status: 'Operating', owner: 'Neoen', updatedAt: nowIso, regionTag: 'Australia' },
    { id: 'bess-uk-minety', coords: [51.6, -1.9], sector: 'Storage', subtype: 'Li-ion BESS', capacityMW: 200, status: 'Operating', owner: 'RWE', updatedAt: nowIso, regionTag: 'UK' },
    { id: 'fes-germany', coords: [51.5, 9.0], sector: 'Storage', subtype: 'Flywheel', capacityMW: 50, status: 'Operating', owner: 'Statkraft', updatedAt: nowIso, regionTag: 'Germany' },
    { id: 'bess-vistra-moss', coords: [33.8, -117.9], sector: 'Storage', subtype: 'Li-ion BESS', capacityMW: 400, status: 'Operating', owner: 'Vistra', updatedAt: nowIso, regionTag: 'USA' },
    { id: 'bess-chile-coya', coords: [-26.3, -70.1], sector: 'Storage', subtype: 'Li-ion BESS', capacityMW: 112, status: 'Operating', owner: 'CAP/Engie', updatedAt: nowIso, regionTag: 'Chile' },
    { id: 'pumped-hydro-dinorwig', coords: [53.1, -4.0], sector: 'Storage', subtype: 'Pumped Hydro', capacityMW: 1860, status: 'Operating', owner: 'First Hydro', updatedAt: nowIso, regionTag: 'UK' },
    { id: 'bess-japan-buzen', coords: [33.7, 131.2], sector: 'Storage', subtype: 'Li-ion BESS', capacityMW: 300, status: 'Operating', owner: 'Kyushu EPCo', updatedAt: nowIso, regionTag: 'Japan' },
  ],
  projects: [
    { id: 'h2-rotterdam-hub', coords: [51.9, 4.5], sector: 'Hydrogen', subtype: 'Green H2 hub', capacityMW: 1000, status: 'Approved', owner: 'Shell/BP', updatedAt: nowIso, regionTag: 'Netherlands' },
    { id: 'ev-gigafactory-berlin', coords: [52.3, 13.8], sector: 'EV', subtype: 'Gigafactory', capacityMW: 0, status: 'Operating', owner: 'Tesla', updatedAt: nowIso, regionTag: 'Germany' },
    { id: 'solar-gujarat-hybrid', coords: [23.2, 72.6], sector: 'Solar', subtype: 'Utility PV', capacityMW: 30000, status: 'Under construction', owner: 'NTPC', updatedAt: nowIso, regionTag: 'India' },
    { id: 'wind-australia-aim', coords: [-28.0, 130.0], sector: 'Wind', subtype: 'Onshore WF', capacityMW: 1743, status: 'Approved', owner: 'AGL', updatedAt: nowIso, regionTag: 'Australia' },
    { id: 'h2-neom-helios', coords: [28.0, 35.0], sector: 'Hydrogen', subtype: 'Green H2', capacityMW: 4000, status: 'Under construction', owner: 'ACWA/Air Products', updatedAt: nowIso, regionTag: 'Saudi Arabia' },
    { id: 'nuclear-kairos-us', coords: [36.0, -84.0], sector: 'Nuclear', subtype: 'FHR Demo', capacityMW: 35, status: 'Development', owner: 'Kairos Power', updatedAt: nowIso, regionTag: 'USA' },
    { id: 'solar-atacama', coords: [-22.0, -69.5], sector: 'Solar', subtype: 'CSP', capacityMW: 390, status: 'Development', owner: 'SolarReserve', updatedAt: nowIso, regionTag: 'Chile' },
  ],
  hydrogen: [
    { id: 'h2-chile-htwo', coords: [-53.5, -70.1], sector: 'Hydrogen', subtype: 'Green H2', capacityMW: 800, status: 'Development', owner: 'HIF Global', updatedAt: nowIso, regionTag: 'Chile' },
    { id: 'h2-jera-japan', coords: [35.5, 137.0], sector: 'Hydrogen', subtype: 'Ammonia terminal', capacityMW: 600, status: 'Approved', owner: 'JERA', updatedAt: nowIso, regionTag: 'Japan' },
    { id: 'h2-namibia-hyphen', coords: [-25.0, 16.0], sector: 'Hydrogen', subtype: 'Green H2 export', capacityMW: 2000, status: 'Development', owner: 'Hyphen H2', updatedAt: nowIso, regionTag: 'MEA' },
    { id: 'h2-australia-h2ng', coords: [-32.0, 116.0], sector: 'Hydrogen', subtype: 'Green H2 export', capacityMW: 1500, status: 'Approved', owner: 'H2 Perth JV', updatedAt: nowIso, regionTag: 'Australia' },
    { id: 'h2-spain-h2med', coords: [39.5, -0.4], sector: 'Hydrogen', subtype: 'H2 pipeline', capacityMW: 0, status: 'Development', owner: 'H2Med Consortium', updatedAt: nowIso, regionTag: 'Spain' },
    { id: 'h2-india-nhm', coords: [28.6, 77.2], sector: 'Hydrogen', subtype: 'Green H2', capacityMW: 1200, status: 'Development', owner: 'NTPC/ACME', updatedAt: nowIso, regionTag: 'India' },
    { id: 'h2-uk-hozelock', coords: [51.5, -0.1], sector: 'Hydrogen', subtype: 'H2 grid-injection', capacityMW: 0, status: 'Pilot', owner: 'Cadent Gas', updatedAt: nowIso, regionTag: 'UK' },
  ],
  ev: [
    { id: 'ev-gigafactory-nevada', coords: [39.5, -116.0], sector: 'EV', subtype: 'Gigafactory', capacityMW: 0, status: 'Operating', owner: 'Tesla/Panasonic', updatedAt: nowIso, regionTag: 'USA' },
    { id: 'ev-catl-erfurt', coords: [51.0, 11.0], sector: 'EV', subtype: 'Battery factory', capacityMW: 0, status: 'Operating', owner: 'CATL', updatedAt: nowIso, regionTag: 'Germany' },
    { id: 'ev-northvolt-ett', coords: [65.9, 22.4], sector: 'EV', subtype: 'Battery factory', capacityMW: 0, status: 'Operating', owner: 'Northvolt', updatedAt: nowIso, regionTag: 'Sweden' },
    { id: 'ev-sg-comfortdelgro', coords: [1.3, 103.8], sector: 'EV', subtype: 'Fleet depot', capacityMW: 0, status: 'Operating', owner: 'ComfortDelGro', updatedAt: nowIso, regionTag: 'Singapore' },
    { id: 'ev-byd-chongqing', coords: [29.6, 106.5], sector: 'EV', subtype: 'Gigafactory', capacityMW: 0, status: 'Operating', owner: 'BYD', updatedAt: nowIso, regionTag: 'China' },
    { id: 'ev-rivian-normal', coords: [40.5, -88.9], sector: 'EV', subtype: 'Assembly plant', capacityMW: 0, status: 'Operating', owner: 'Rivian', updatedAt: nowIso, regionTag: 'USA' },
    { id: 'ev-lg-poland', coords: [51.1, 17.0], sector: 'EV', subtype: 'Battery factory', capacityMW: 0, status: 'Operating', owner: 'LG Energy Solution', updatedAt: nowIso, regionTag: 'Poland' },
  ],
  nuclear: [
    { id: 'nuc-france-fleet', coords: [47.5, 2.5], sector: 'Nuclear', subtype: 'PWR fleet', capacityMW: 41000, status: 'Operating', owner: 'EDF', updatedAt: nowIso, regionTag: 'France' },
    { id: 'nuc-daya-bay', coords: [22.5, 114.5], sector: 'Nuclear', subtype: 'PWR', capacityMW: 9000, status: 'Operating', owner: 'CGN', updatedAt: nowIso, regionTag: 'China' },
    { id: 'nuc-kudankulam', coords: [8.2, 77.7], sector: 'Nuclear', subtype: 'VVER', capacityMW: 4000, status: 'Operating', owner: 'NPCIL', updatedAt: nowIso, regionTag: 'India' },
    { id: 'nuc-sizewell-c', coords: [52.2, 1.6], sector: 'Nuclear', subtype: 'EPR', capacityMW: 3200, status: 'Development', owner: 'EDF UK', updatedAt: nowIso, regionTag: 'UK' },
    { id: 'nuc-akkuyu', coords: [36.1, 33.5], sector: 'Nuclear', subtype: 'VVER-1200', capacityMW: 4800, status: 'Under construction', owner: 'Rosatom', updatedAt: nowIso, regionTag: 'Turkey' },
    { id: 'nuc-barakah-uae', coords: [23.9, 52.2], sector: 'Nuclear', subtype: 'APR-1400', capacityMW: 5600, status: 'Operating', owner: 'ENEC', updatedAt: nowIso, regionTag: 'UAE' },
    { id: 'nuc-nuscale-us', coords: [43.5, -112.0], sector: 'Nuclear', subtype: 'SMR', capacityMW: 462, status: 'Development', owner: 'NuScale/UAMPS', updatedAt: nowIso, regionTag: 'USA' },
  ],
  policy: [
    { id: 'pol-eu-v2g', coords: [50.8, 4.4], sector: 'EV', subtype: 'V2G Regulation', status: 'Active', owner: 'EU Commission', updatedAt: nowIso, regionTag: 'EMEA' },
    { id: 'pol-us-ira-storage', coords: [38.9, -77.0], sector: 'Storage', subtype: 'IRA Tax Credits', status: 'Active', owner: 'US DOE/Treasury', updatedAt: nowIso, regionTag: 'USA' },
    { id: 'pol-india-solar-pli', coords: [28.6, 77.2], sector: 'Solar', subtype: 'Manufacturing PLI', status: 'Active', owner: 'MNRE', updatedAt: nowIso, regionTag: 'India' },
    { id: 'pol-uk-cfd', coords: [51.5, -0.1], sector: 'Wind', subtype: 'CfD Auction Round 6', status: 'Active', owner: 'DESNZ', updatedAt: nowIso, regionTag: 'UK' },
    { id: 'pol-cn-carbon', coords: [31.2, 121.5], sector: 'Solar', subtype: 'National Carbon Market', status: 'Active', owner: 'MEE China', updatedAt: nowIso, regionTag: 'China' },
    { id: 'pol-au-safeguard', coords: [-25.0, 133.0], sector: 'Storage', subtype: 'Safeguard Mechanism', status: 'Active', owner: 'DCCEEW', updatedAt: nowIso, regionTag: 'Australia' },
  ],
  transmission: [
    { id: 'tx-north-sea-link', path: [[59.0, -2.5], [58.0, 5.5]], name: 'North Sea Link (NO-UK)', capacityMW: 1400, status: 'Operating', updatedAt: nowIso },
    { id: 'tx-basslink', path: [[-38.5, 143.5], [-41.0, 147.0]], name: 'Basslink (AUS)', capacityMW: 500, status: 'Operating', updatedAt: nowIso },
    { id: 'tx-sapei', path: [[38.0, 16.0], [39.7, 9.5]], name: 'SA.PE.I. Interconnect (IT)', capacityMW: 1000, status: 'Operating', updatedAt: nowIso },
    { id: 'tx-hvdc-china', path: [[24.0, 102.0], [22.5, 114.0]], name: 'Yunnan-Guangdong HVDC', capacityMW: 5000, status: 'Operating', updatedAt: nowIso },
  ],
  resource: [
    { id: 'res-north-sea-wind', ring: [[60.0, -4.0], [55.0, -4.0], [55.0, 10.0], [60.0, 10.0], [60.0, -4.0]], metric: 'Wind resource', value: '>8 m/s avg', updatedAt: nowIso },
    { id: 'res-sahara-solar', ring: [[25.0, -5.0], [15.0, -5.0], [15.0, 25.0], [25.0, 25.0], [25.0, -5.0]], metric: 'Solar irradiance', value: '>2200 kWh/m²', updatedAt: nowIso },
    { id: 'res-atacama-solar', ring: [[-16.0, -72.0], [-26.0, -72.0], [-26.0, -66.0], [-16.0, -66.0], [-16.0, -72.0]], metric: 'Solar irradiance', value: '>2800 kWh/m²', updatedAt: nowIso },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Components — base tile window
// ─────────────────────────────────────────────────────────────────────────────
function Win({ title, children, className, scrollable = true }: { title: string; children: React.ReactNode; className?: string; scrollable?: boolean }) {
  return (
    <div className={`tw ${className || ''}`}>
      <div className="tw-bar"><span className="tw-title">{title}</span></div>
      <div className={`tw-body ${scrollable ? 'tw-scroll' : ''}`}>{children}</div>
    </div>
  )
}

function NewsWin({ items, title }: { items: LinkItem[]; title: string }) {
  return (
    <Win title={title}>
      {items.map((n, i) => (
        <div key={i} className="tw-row">
          <span className="tw-tag">[{n.source}]</span>
          <a href={n.url} target="_blank" rel="noreferrer" className="tw-col-main tw-link">{n.title}</a>
          <span className="tw-col-time tw-dim">{n.time}</span>
        </div>
      ))}
    </Win>
  )
}

function ProductsWin({ items }: { items: ProductItem[] }) {
  return (
    <Win title="PRODUCTS / LAUNCHES">
      {items.map((p, i) => (
        <div key={i} className="tw-row">
          <span className="tw-prompt tw-green">+</span>
          <span className="tw-col-main">{p.name}</span>
          <span className="tw-tag">[{p.company}]</span>
          <span className="tw-amber tw-spec">{p.summary}</span>
        </div>
      ))}
    </Win>
  )
}

function CommunityWin({ items }: { items: CommunityItem[] }) {
  return (
    <Win title="COMMUNITY / EVENTS">
      {items.map((c, i) => (
        <div key={i} className="tw-row">
          <span className="tw-prompt tw-cyan">@</span>
          <span className="tw-col-main">{c.topic}</span>
          <span className="tw-dim">{c.platform}</span>
          <span className="tw-col-time tw-dim">{c.activity}</span>
        </div>
      ))}
    </Win>
  )
}

function FinanceWin({ items }: { items: FinanceItem[] }) {
  return (
    <Win title="FINANCE / DEALS">
      {items.map((f, i) => (
        <div key={i} className="tw-row">
          <span className="tw-prompt tw-amber">$</span>
          <span className="tw-col-main">{f.metric}</span>
          <span className={`tw-amber ${f.trend === 'up' ? 'tw-green' : f.trend === 'down' ? 'tw-red' : ''}`}>{f.value}</span>
          <span className="tw-dim">{f.move}</span>
        </div>
      ))}
    </Win>
  )
}

function StartupsWin({ items }: { items: StartupItem[] }) {
  return (
    <Win title="STARTUPS">
      {items.map((s, i) => (
        <div key={i} className="tw-row">
          <span className="tw-col-main tw-green">{s.name}</span>
          <span className="tw-dim">→</span>
          <span className="tw-col-sub">{s.event}</span>
          <span className="tw-amber">{s.value}</span>
        </div>
      ))}
    </Win>
  )
}

function PolicyWin({ items, sectorSlug }: { items: PolicyItem[]; sectorSlug?: string }) {
  const filtered = sectorSlug ? items.filter(p => p.title.toLowerCase().includes(sectorSlug.toLowerCase())) : items
  const toShow = filtered.length > 0 ? filtered : items.slice(0, 4)
  return (
    <Win title="POLICY">
      {toShow.map((p, i) => (
        <div key={i} className="tw-row tw-policy-row">
          <span className="tw-tag tw-tag-region">[{p.region}]</span>
          <span className={`tw-impact tw-impact-${p.impact}`}>{p.impact.toUpperCase()}</span>
          <span className="tw-col-main">{p.title}</span>
          <span className="tw-col-time tw-dim">{p.effectiveDate}</span>
        </div>
      ))}
    </Win>
  )
}

function YoutubeWin({ items, videos }: { items?: LinkItem[]; videos?: YoutubeVideo[] }) {
  const allVideos: YoutubeVideo[] = videos && videos.length > 0 ? videos :
    (items || []).map(l => ({ title: l.title, channel: l.source || 'Energy', url: l.url, videoId: '', thumbnail: '', pubDate: l.time || '', isLive: false, description: '' }))
  if (allVideos.length === 0) return (
    <Win title="▶ MEDIA / STREAMS"><p className="tw-empty">// loading streams…</p></Win>
  )
  return (
    <Win title="▶ MEDIA / STREAMS">
      {allVideos.map((v, i) => (
        <div key={i} className={`tw-row tw-yt-row ${v.isLive ? 'yt-live' : ''}`}>
          {v.thumbnail ? (
            <a href={v.url} target="_blank" rel="noreferrer" className="yt-thumb-wrap">
              <img src={v.thumbnail} alt="" className="yt-thumb" />
              {v.isLive && <span className="yt-live-badge">LIVE</span>}
            </a>
          ) : null}
          <div className="tw-yt-info">
            <a href={v.url} target="_blank" rel="noreferrer" className="tw-yt-link">
              <span className={`tw-prompt ${v.isLive ? 'tw-red yt-pulse' : 'tw-green'}`}>{v.isLive ? '● LIVE' : '▶'}</span>
              <span className="tw-col-main">{v.title}</span>
            </a>
            <div className="yt-meta">
              <span className="tw-col-src tw-cyan">{v.channel}</span>
              <span className="tw-dim"> · {v.pubDate ? new Date(v.pubDate).toLocaleDateString() : ''}</span>
              {v.description && <span className="tw-dim yt-desc"> — {v.description.slice(0, 80)}</span>}
            </div>
          </div>
        </div>
      ))}
    </Win>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sector View — now includes Policy + Media inside
// ─────────────────────────────────────────────────────────────────────────────
function SectorView({ sector, allPolicies, sectorVideos }: { sector: SectorIntel; allPolicies: PolicyItem[]; sectorVideos: YoutubeVideo[] }) {
  const mediaToShow: YoutubeVideo[] = sectorVideos.length > 0 ? sectorVideos : (sector.youtubeLive || []).map((l: LinkItem) => ({ title: l.title, channel: l.source || sector.slug, url: l.url, videoId: '', thumbnail: '', pubDate: l.time || '', isLive: false, description: '' }))
  return (
    <div className="sector-view">
      <div className="sector-banner">
        <span className="sector-slug" style={{ color: sectorColors[sector.slug] }}>[{sector.slug.toUpperCase()}]</span>
        <span className="sector-headline">{sector.headline}</span>
        <span className="sector-summary tw-dim">{sector.summary}</span>
      </div>
      <div className="sector-grid">
        <NewsWin items={sector.latestNews} title="LATEST NEWS" />
        <NewsWin items={sector.techNews} title="TECH NEWS" />
        <ProductsWin items={sector.products} />
        <CommunityWin items={sector.community} />
        <FinanceWin items={sector.finance} />
        <StartupsWin items={sector.startups} />
        <PolicyWin items={allPolicies} sectorSlug={sector.slug} />
        <YoutubeWin videos={mediaToShow.length > 0 ? mediaToShow : undefined} items={sector.youtubeLive} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Market View — rendered as right panel
// ─────────────────────────────────────────────────────────────────────────────
function MarketPanel({ liveKpis, liveMarket, emissionTracks, bSignals, pChanges, flows, lcoe, deals, co2 }: {
  liveKpis: Kpi[]; liveMarket: MarketRow[]; emissionTracks: EmissionTrack[]
  bSignals: BusinessSignal[]; pChanges: ProjectChange[]
  flows: FundFlowRow[]; lcoe: LcoeRow[]; deals: InvestDeal[]; co2: Co2SectorRow[]
}) {
  return (
    <div className="market-panel-inner">
      <Win title="GLOBAL KPIs">
        {liveKpis.map((k, i) => (
          <div key={i} className="tw-row">
            <span className="tw-col-metric tw-dim">{k.label}</span>
            <span className={`tw-col-val ${k.trend === 'up' ? 'tw-green' : k.trend === 'down' ? 'tw-red' : ''}`}>{k.value}</span>
            <span className={`tw-move ${k.trend === 'up' ? 'tw-green' : k.trend === 'down' ? 'tw-red' : 'tw-dim'}`}>
              {k.trend === 'up' ? '▲' : k.trend === 'down' ? '▼' : '─'} {k.delta}
            </span>
          </div>
        ))}
      </Win>
      <Win title="MARKET PRICES">
        {liveMarket.map((m, i) => (
          <div key={i} className="tw-row">
            <span className="tw-col-main">{m.asset}</span>
            <span className="tw-tag">[{m.region}]</span>
            <span className={`tw-col-val ${m.trend === 'up' ? 'tw-green' : 'tw-red'}`}>{m.price}</span>
            <span className={`tw-move ${m.trend === 'up' ? 'tw-green' : 'tw-red'}`}>{m.trend === 'up' ? '▲' : '▼'} {m.change}</span>
          </div>
        ))}
      </Win>
      <Win title="EMISSIONS TRACKER">
        {emissionTracks.map((e, i) => {
          const pct = Math.min(100, Math.round((e.current / e.target) * 100))
          const bars = Math.round(pct / 5)
          return (
            <div key={i} className="tw-row tw-emission-row">
              <span className="tw-col-metric tw-dim">{e.segment}</span>
              <span className="tw-bar-track">{'█'.repeat(bars)}<span className="tw-dim">{'░'.repeat(20 - bars)}</span></span>
              <span className="tw-dim">{e.current}/{e.target} {e.unit}</span>
            </div>
          )
        })}
      </Win>
      <Win title="BUSINESS SIGNALS">
        {bSignals.map((s, i) => (
          <div key={i} className="tw-row">
            <span className="tw-prompt tw-amber">§</span>
            <span className="tw-col-main">{s.company}</span>
            <span className="tw-dim">·</span>
            <span className="tw-col-sub">{s.signal}</span>
            <span className="tw-amber">{s.value}</span>
          </div>
        ))}
      </Win>
      <Win title="PROJECT CHANGES">
        {pChanges.map((p, i) => (
          <div key={i} className="tw-row">
            <span className="tw-prompt tw-cyan">Δ</span>
            <span className="tw-col-main">{p.project}</span>
            <span className="tw-tag">[{p.country}]</span>
            <span className="tw-dim">{p.status}</span>
            <span className="tw-amber tw-change">{p.change}</span>
          </div>
        ))}
      </Win>
      <Win title="ETF FUND FLOWS">
        {flows.map((f, i) => (
          <div key={i} className="tw-row">
            <span className={`tw-prompt ${f.trend === 'in' ? 'tw-green' : f.trend === 'out' ? 'tw-red' : 'tw-dim'}`}>{f.trend === 'in' ? '↑' : f.trend === 'out' ? '↓' : '─'}</span>
            <span className="tw-col-main">{f.asset}</span>
            <span className={`tw-amber`}>{f.flow}</span>
            <span className="tw-tag">[{f.period}]</span>
            <span className="tw-dim">AUM {f.aum}</span>
          </div>
        ))}
      </Win>
      <Win title="LCOE BENCHMARK">
        {lcoe.map((r, i) => (
          <div key={i} className="tw-row">
            <span className="tw-col-metric tw-dim">{r.tech}</span>
            <span className={`tw-col-val ${r.trend === 'down' ? 'tw-green' : r.trend === 'up' ? 'tw-red' : 'tw-dim'}`}>{r.lcoe}</span>
            <span className={`tw-move ${r.trend === 'down' ? 'tw-green' : r.trend === 'up' ? 'tw-red' : 'tw-dim'}`}>{r.delta}</span>
            <span className="tw-tag">[{r.source}]</span>
          </div>
        ))}
      </Win>
      <Win title="INVESTMENT DEALS">
        {deals.map((d, i) => (
          <div key={i} className="tw-row">
            <span className="tw-prompt tw-cyan">$</span>
            <span className="tw-col-main">{d.company}</span>
            <span className="tw-amber">{d.amount}</span>
            <span className="tw-tag">[{d.sector}]</span>
            <span className="tw-dim">{d.round} · {d.country} {d.date}</span>
          </div>
        ))}
      </Win>
      <Win title="CO₂ BY SECTOR">
        {co2.map((c, i) => {
          return (
            <div key={i} className="tw-row">
              <span className="tw-col-metric tw-dim">{c.sector}</span>
              <span className="tw-tag">[{c.region}]</span>
              <span className={`tw-col-val ${c.trend === 'down' ? 'tw-green' : 'tw-red'}`}>{c.mtco2} Mt</span>
              <span className={`tw-move ${c.trend === 'down' ? 'tw-green' : 'tw-red'}`}>{c.yoy}</span>
              <span className="tw-dim">→{c.target}Mt</span>
            </div>
          )
        })}
      </Win>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat View
// ─────────────────────────────────────────────────────────────────────────────
function ChatView({ messages, input, streaming, onInput, onSend }: {
  messages: ChatMessage[]; input: string; streaming: boolean
  onInput: (v: string) => void; onSend: () => void
}) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  return (
    <div className="chat-view">
      <Win title="ENERGYVERSE AI · ollama" scrollable={false}>
        <div className="chat-log tw-scroll">
          {messages.map((m, i) => (
            <div key={i} className={`chat-line ${m.role}`}>
              <span className="chat-prompt">{m.role === 'user' ? '$ ' : '> '}</span>
              <span className="chat-content">{m.content}{streaming && i === messages.length - 1 && m.role === 'assistant' && <span className="cursor-blink">█</span>}</span>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="chat-input-row">
          <span className="tw-prompt tw-green">$&gt;</span>
          <input className="chat-input" value={input} onChange={e => onInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !streaming && onSend()}
            placeholder="ask about a sector, region, or technology…" disabled={streaming} autoFocus />
          <button className="chat-send" onClick={onSend} disabled={streaming}>{streaming ? '...' : 'SEND'}</button>
        </div>
      </Win>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('offline')
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<string | null>(null)
  const [liveNewsTape, setLiveNewsTape] = useState<NewsItem[]>(newsTape)
  const [liveSectorIntel, setLiveSectorIntel] = useState<SectorIntel[]>(sectorIntel)
  const [activeTab, setActiveTab] = useState<ActiveTab>('Solar')
  const [activeRegion, setActiveRegion] = useState<string>('Global')
  const [activeCountry, setActiveCountry] = useState<string>('All')
  const [mapSectorFilter, setMapSectorFilter] = useState<SectorIntel['slug'] | null>(null)
  const [layerToggles, setLayerToggles] = useState<Record<LayerKey, boolean>>({
    plants: true, storage: true, projects: true, hydrogen: true,
    ev: true, nuclear: true, transmission: false, resource: false, policy: true, topics: false,
  })
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [aiSummary, setAiSummary] = useState('Collecting map signals...')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Ready. Ask me about any sector, region, technology, or market signal.' },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatStreaming, setChatStreaming] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const layerGroupsRef = useRef<Partial<Record<LayerKey, L.LayerGroup>>>({})
  const [apiGeoLayers, setApiGeoLayers] = useState<ApiGeoLayers>({})
  const [youtubeVideos, setYoutubeVideos] = useState<YoutubeVideo[]>([])
  const [sectorYoutube, setSectorYoutube] = useState<Record<string, YoutubeVideo[]>>({})

  const sectorOrder: SectorIntel['slug'][] = ['Solar', 'Wind', 'Hydro', 'Geothermal', 'Storage', 'Nuclear', 'EV', 'Hydrogen']
  const orderedSectors = [...liveSectorIntel].sort((a, b) => sectorOrder.indexOf(a.slug) - sectorOrder.indexOf(b.slug))
  const activeSectorData = orderedSectors.find(s => s.slug === activeTab)
  const newsTapeToRender = [...liveNewsTape, ...liveNewsTape]

  // Countries grouped by macro region for the dropdown
  const countriesForRegion = activeRegion === 'Global'
    ? COUNTRY_LIST
    : COUNTRY_LIST.filter(c => c.region === activeRegion)

  const filteredGeo = useMemo(() => {
    const cutoff = Date.now() - 7 * 864e5
    const inW = (dt: string) => new Date(dt).getTime() >= cutoff
    const rf = (tag?: string) => regionMatch(tag, activeRegion, activeCountry)
    const sf = (sector?: string) => !mapSectorFilter || sector === mapSectorFilter
    const pt = (item: BasePoint) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [item.coords[1], item.coords[0]] },
      properties: { ...item, color: sectorColors[item.sector] },
    })
    const topicsRaw: BasePoint[] = []
    liveSectorIntel.forEach(sec => {
      const add = (cat: string, idx: number, text: string, src: string, reg?: string) => {
        if (topicsRaw.length >= MAX_TOPICS) return
        if (mapSectorFilter && sec.slug !== mapSectorFilter) return
        const n = normalizeRegionLabel(reg)
        if (!regionMatch(n, activeRegion, activeCountry)) return
        topicsRaw.push({ id: `topic-${sec.slug}-${cat}-${idx}`, coords: jitteredCoords(n, idx), sector: sec.slug, subtype: `${cat}: ${text.slice(0, 58)}`, status: cat, owner: src, updatedAt: nowIso, regionTag: n })
      }
      sec.latestNews.forEach((i: any, idx: number) => add('Latest', idx, i.title, i.source, i.region))
      sec.techNews.forEach((i: any, idx: number) => add('Tech', idx + 20, i.title, i.source, i.region))
      sec.products.forEach((i: any, idx: number) => add('Product', idx + 40, (i as any).name, (i as any).company, (i as any).region))
    })

    const useApi = Object.keys(apiGeoLayers).length > 0
    const apiPt = (key: string, fallback: BasePoint[]) => {
      if (useApi && apiGeoLayers[key]) {
        return {
          type: 'FeatureCollection' as const,
          features: (apiGeoLayers[key]!.features || []).filter((f: any) =>
            rf(f.properties?.regionTag) && inW(f.properties?.updatedAt || nowIso) && sf(f.properties?.sector)
          ).map((f: any) => ({ ...f, properties: { ...f.properties, color: sectorColors[f.properties?.sector as keyof typeof sectorColors] || '#39ff14' } }))
        }
      }
      return { type: 'FeatureCollection' as const, features: fallback.filter(p => inW(p.updatedAt) && rf(p.regionTag) && sf(p.sector)).map(pt) }
    }

    const tx = useApi && apiGeoLayers['transmission']
      ? { type: 'FeatureCollection' as const, features: ((apiGeoLayers['transmission']!.features || []) as any[]).filter((f: any) => inW(f.properties?.updatedAt || nowIso)) }
      : { type: 'FeatureCollection' as const, features: layerData.transmission.filter(t => inW(t.updatedAt)).map(t => ({
          type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates: t.path.map(([lat, lon]) => [lon, lat]) },
          properties: { id: t.id, name: t.name, capacityMW: t.capacityMW, status: t.status },
        })) }

    const res = useApi && apiGeoLayers['resource']
      ? { type: 'FeatureCollection' as const, features: ((apiGeoLayers['resource']!.features || []) as any[]).filter((f: any) => inW(f.properties?.updatedAt || nowIso)) }
      : { type: 'FeatureCollection' as const, features: layerData.resource.filter(r => inW(r.updatedAt)).map(r => ({
          type: 'Feature' as const, geometry: { type: 'Polygon' as const, coordinates: [[...r.ring.map(([lat, lon]) => [lon, lat])]] },
          properties: { id: r.id, metric: r.metric, value: r.value },
        })) }

    return {
      plants: apiPt('plants', layerData.plants),
      storage: apiPt('storage', layerData.storage),
      projects: apiPt('projects', layerData.projects),
      hydrogen: apiPt('hydrogen', layerData.hydrogen),
      ev: apiPt('ev', layerData.ev),
      nuclear: apiPt('nuclear', layerData.nuclear),
      policy: apiPt('policy', layerData.policy),
      topics: { type: 'FeatureCollection' as const, features: topicsRaw.filter(p => inW(p.updatedAt)).map(pt) },
      transmission: tx,
      resource: res,
    }
  }, [activeRegion, activeCountry, liveSectorIntel, apiGeoLayers, mapSectorFilter])

  // API polling + geo fetch
  useEffect(() => {
    let mounted = true
    const fetch_ = async () => {
      try {
        const r = await fetch('/api/dashboard')
        if (!r.ok) throw new Error()
        const d = await r.json()
        if (!mounted) return
        if (Array.isArray(d.sectorIntel) && d.sectorIntel.length > 0) setLiveSectorIntel(d.sectorIntel)
        if (Array.isArray(d.newsTape) && d.newsTape.length > 0) setLiveNewsTape(d.newsTape)
        if (d.updatedAt) setLiveUpdatedAt(d.updatedAt)
        if (Array.isArray(d.youtube) && d.youtube.length > 0) setYoutubeVideos(d.youtube)
        setApiStatus('online')
        try {
          const gr = await fetch('/api/geo/all')
          if (gr.ok) { const gd = await gr.json(); if (mounted) setApiGeoLayers(gd) }
        } catch {/**/}
      } catch { if (mounted) setApiStatus('offline') }
    }
    void fetch_()
    const t = window.setInterval(fetch_, 180000)
    return () => { mounted = false; clearInterval(t) }
  }, [])

  // Fetch sector-specific YouTube on tab change
  useEffect(() => {
    if (activeTab === 'CHAT') return
    const slug = activeTab
    if (sectorYoutube[slug]) return // already cached
    fetch(`/api/youtube/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && Array.isArray(data)) setSectorYoutube(prev => ({ ...prev, [slug]: data })) })
      .catch(() => {/**/})
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // WebSocket
  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout>
    let dead = false
    const connect = () => {
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
      ws = new WebSocket(`${proto}://${window.location.host}/stream`)
      ws.onopen = () => setApiStatus('online')
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.type === 'hello') {
            if (Array.isArray(msg.sectorIntel) && msg.sectorIntel.length > 0) setLiveSectorIntel(msg.sectorIntel)
            if (Array.isArray(msg.newsTape) && msg.newsTape.length > 0) setLiveNewsTape(msg.newsTape)
            if (msg.geo && typeof msg.geo === 'object') setApiGeoLayers(msg.geo)
            if (Array.isArray(msg.youtube) && msg.youtube.length > 0) setYoutubeVideos(msg.youtube)
          } else if (msg.type === 'geo' && typeof msg.payload === 'object') {
            setApiGeoLayers(prev => ({ ...prev, ...msg.payload }))
          } else if (msg.type === 'youtube' && Array.isArray(msg.payload)) {
            setYoutubeVideos(msg.payload)
          } else if (msg.type === 'sector' && msg.payload?.slug) {
            setLiveSectorIntel(prev =>
              prev.some(s => s.slug === msg.payload.slug)
                ? prev.map(s => s.slug === msg.payload.slug ? msg.payload : s)
                : [...prev, msg.payload]
            )
          } else if (msg.type === 'news' && Array.isArray(msg.payload)) {
            setLiveNewsTape(prev => [...msg.payload, ...prev].slice(0, 60))
          }
        } catch {/**/}
      }
      ws.onclose = () => { if (!dead) reconnectTimer = setTimeout(connect, 5000) }
      ws.onerror = () => { setApiStatus('offline'); ws?.close() }
    }
    connect()
    return () => { dead = true; clearTimeout(reconnectTimer); ws?.close() }
  }, [])

  // Map initialization — Leaflet with CartoDB Dark tiles
  useEffect(() => {
    let isMounted = true
    const container = document.getElementById('globe-map')
    if (!container || mapRef.current) return
    try {
      const map = L.map(container, { center: [20, 10], zoom: 2, zoomControl: false, minZoom: 1, maxZoom: 8, preferCanvas: true })
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 19, className: 'carto-tiles',
      }).addTo(map)
      L.control.zoom({ position: 'topright' }).addTo(map)
      mapRef.current = map
      if (isMounted) setMapReady(true)
    } catch { if (isMounted) setMapError('Map failed to initialize.') }
    return () => {
      isMounted = false
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      layerGroupsRef.current = {}
    }
  }, [])

  // Map layer sync — Leaflet LayerGroup per layer key
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const map = mapRef.current
    const layerColors: Record<string, string> = {
      plants: '#39ff14', storage: '#a8ff78', projects: '#ffb000',
      hydrogen: '#ff79c6', ev: '#bd93f9', nuclear: '#d0ff4f',
      policy: '#ff5555', topics: '#8be9fd', transmission: '#ffb000', resource: '#39ff14',
    }
    const popupHtml = (p: Record<string, any>) => `
      <div class="mv-popup">
        <strong>${p.name || p.id || 'Project'}</strong>
        <span class="badge">${p.sector || ''}</span>
        <table>
          ${p.subtype ? `<tr><td>Type</td><td>${p.subtype}</td></tr>` : ''}
          ${p.status ? `<tr><td>Status</td><td>${p.status}</td></tr>` : ''}
          ${p.capacityMW ? `<tr><td>Capacity</td><td>${p.capacityMW} MW</td></tr>` : ''}
          ${p.owner ? `<tr><td>Owner</td><td>${p.owner}</td></tr>` : ''}
          ${p.updatedAt ? `<tr><td>Updated</td><td>${p.updatedAt}</td></tr>` : ''}
        </table>
      </div>`

    const renderLayer = (key: LayerKey, fc: { features: any[] }, color: string) => {
      let group = layerGroupsRef.current[key]
      if (!group) { group = L.layerGroup().addTo(map); layerGroupsRef.current[key] = group }
      group.clearLayers()
      if (!layerToggles[key]) return
      fc.features.forEach((f: any) => {
        if (f.geometry?.type !== 'Point') return
        const [lon, lat] = f.geometry.coordinates
        const p = f.properties || {}
        const c = p.color || color
        const r = Math.min(4 + Math.sqrt((p.capacityMW || 50) / 200), 12)
        L.circleMarker([lat, lon], { radius: r, color: c, fillColor: c, fillOpacity: 0.82, weight: 1, opacity: 1 })
          .bindPopup(popupHtml(p), { maxWidth: 280, className: 'leaflet-dark-popup' })
          .addTo(group!)
      })
    }

    renderLayer('plants', filteredGeo.plants as any, layerColors.plants)
    renderLayer('storage', filteredGeo.storage as any, layerColors.storage)
    renderLayer('projects', filteredGeo.projects as any, layerColors.projects)
    renderLayer('hydrogen', filteredGeo.hydrogen as any, layerColors.hydrogen)
    renderLayer('ev', filteredGeo.ev as any, layerColors.ev)
    renderLayer('nuclear', filteredGeo.nuclear as any, layerColors.nuclear)
    renderLayer('policy', filteredGeo.policy as any, layerColors.policy)
    renderLayer('topics', filteredGeo.topics as any, layerColors.topics)

    // Transmission lines
    let txGroup = layerGroupsRef.current['transmission']
    if (!txGroup) { txGroup = L.layerGroup().addTo(map); layerGroupsRef.current['transmission'] = txGroup }
    txGroup.clearLayers()
    if (layerToggles.transmission) {
      ;(filteredGeo.transmission as any).features?.forEach((f: any) => {
        if (f.geometry?.type !== 'LineString') return
        const latlngs = f.geometry.coordinates.map(([lon, lat]: number[]) => [lat, lon] as L.LatLngTuple)
        L.polyline(latlngs, { color: '#ffb000', weight: 1.5, opacity: 0.7 }).addTo(txGroup!)
      })
    }

    const counts = Object.entries(filteredGeo).reduce<Record<string, number>>((a, [k, v]) => { a[k] = (v as any).features?.length ?? 0; return a }, {})
    const summary = Object.entries(counts).filter(([, n]) => n > 0).map(([k, n]) => `${k}:${n}`).join(' · ')
    setAiSummary(summary || 'No features in current filter')
  }, [mapReady, filteredGeo, layerToggles])

  // AI Chat
  const sendChat = async () => {
    if (chatStreaming) return
    const question = chatInput.trim()
    if (!question) return
    const userMsg: ChatMessage = { role: 'user', content: question }
    setChatInput('')
    setChatMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }])
    setChatStreaming(true)
    try {
      const r = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...chatMessages, userMsg].slice(-4), context: { sectorIntel: liveSectorIntel.slice(0, 3), newsTape: liveNewsTape.slice(0, 10) } }),
      })
      if (!r.ok || !r.body) throw new Error()
      const reader = r.body.getReader(), dec = new TextDecoder()
      let buf = '', acc = ''
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          try { const p = JSON.parse(line); if (p?.response) acc += p.response } catch { acc += line }
          setChatMessages(prev => { const c = [...prev]; c[c.length - 1] = { role: 'assistant', content: acc }; return c })
        }
      }
      if (!acc) setChatMessages(prev => { const c = [...prev]; c[c.length - 1] = { role: 'assistant', content: 'No response from Ollama.' }; return c })
    } catch (e: any) {
      setChatMessages(prev => { const c = [...prev]; c[c.length - 1] = { role: 'assistant', content: `Error: ${e?.message || 'unknown'}` }; return c })
    } finally { setChatStreaming(false) }
  }

  const sectorTabs = orderedSectors.map(s => s.slug)
  const currentSectorVideos = activeSectorData ? (sectorYoutube[activeSectorData.slug] || youtubeVideos) : []
  const mapSectorBtnStyle = (slug: SectorIntel['slug']) =>
    mapSectorFilter === slug ? { color: sectorColors[slug], borderColor: sectorColors[slug], background: 'rgba(255,255,255,0.05)' } : {}

  return (
    <div className="terminal-shell">

      {/* ── Top status bar ── */}
      <div className="t-topbar">
        <span className="t-logo">⚡ ENERGYVERSE</span>
        <span className="t-topbar-sep">│</span>
        <span className={`t-status ${apiStatus}`}><span className="t-dot" />{apiStatus === 'online' ? 'LIVE' : 'OFFLINE'}</span>
        {liveUpdatedAt && <span className="t-dim">SYNC {new Date(liveUpdatedAt).toUTCString().slice(0, 25)}</span>}
        <span className="t-topbar-sep">│</span>
        <span className="t-dim">REGION</span>
        <select className="t-select" value={activeRegion} onChange={e => { setActiveRegion(e.target.value); setActiveCountry('All') }}>
          {macroRegions.map(r => <option key={r}>{r}</option>)}
        </select>
        <select className="t-select" value={activeCountry} onChange={e => setActiveCountry(e.target.value)}>
          <option value="All">— All Countries —</option>
          {countriesForRegion.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <span className="t-topbar-right t-dim">SECTORS:{orderedSectors.length} │ COUNTRIES:{COUNTRY_LIST.length}</span>
      </div>

      {/* ── KPI strip ── */}
      <div className="t-kpi-strip">
        {kpis.map((k, i) => (
          <div key={i} className="t-kpi">
            <span className="t-kpi-label tw-dim">{k.label}</span>
            <span className={`t-kpi-val ${k.trend === 'up' ? 'tw-green' : k.trend === 'down' ? 'tw-red' : ''}`}>{k.value}</span>
            <span className={`t-kpi-delta ${k.trend === 'up' ? 'tw-green' : k.trend === 'down' ? 'tw-red' : 'tw-dim'}`}>
              {k.trend === 'up' ? '▲' : k.trend === 'down' ? '▼' : '─'} {k.delta}
            </span>
          </div>
        ))}
      </div>

      {/* ── Dashboard top: MAP + MARKET always visible ── */}
      <div className="t-dashboard-top">

        {/* Map panel */}
        <div className="t-map-panel">
          <div className="map-panel-header">
            <span className="tw-green map-panel-title">◈ GLOBAL ENERGY MAP</span>
            <div className="map-ai-inline">
              <span className="tw-prompt tw-cyan">AI›</span>
              <span className="tw-dim">{aiSummary}</span>
            </div>
          </div>
          <div className="map-controls-row">
            <div className="map-layer-toggles">
              {(Object.keys(layerToggles) as LayerKey[]).map(k => (
                <label key={k} className={`map-toggle ${layerToggles[k] ? 'on' : 'off'}`}>
                  <input type="checkbox" checked={layerToggles[k]} onChange={e => setLayerToggles(prev => ({ ...prev, [k]: e.target.checked }))} />
                  {layerLabels[k]}
                </label>
              ))}
            </div>
          </div>
          <div className="map-sector-filter-row">
            <span className="tw-dim map-filter-label">SECTOR FILTER</span>
            <button className={`t-tab t-tab-sm ${!mapSectorFilter ? 'active' : ''}`} onClick={() => setMapSectorFilter(null)}>ALL</button>
            {orderedSectors.map(s => (
              <button key={s.slug} className={`t-tab t-tab-sm ${mapSectorFilter === s.slug ? 'active' : ''}`}
                style={mapSectorBtnStyle(s.slug)} onClick={() => setMapSectorFilter(mapSectorFilter === s.slug ? null : s.slug)}>
                {s.slug}
              </button>
            ))}
          </div>
          {mapError && <div className="t-map-error">{mapError}</div>}
          <div className="t-map-container" id="globe-map" />
          <div className="map-legend">
            {orderedSectors.map(s => (
              <span key={s.slug} className="legend-item" style={{ opacity: !mapSectorFilter || mapSectorFilter === s.slug ? 1 : 0.3 }}>
                <span className="legend-dot" style={{ background: sectorColors[s.slug] }} />{s.slug}
              </span>
            ))}
            <span className="legend-item tw-dim"><span className="legend-line" />TX</span>
          </div>
        </div>

        {/* Market panel */}
        <div className="t-market-panel">
          <div className="market-panel-header"><span className="tw-green">◈ MARKET &amp; SIGNALS</span></div>
          <MarketPanel liveKpis={kpis} liveMarket={marketRows} emissionTracks={emissions} bSignals={businessSignals} pChanges={projectChanges} flows={fundFlows} lcoe={lcoeData} deals={investDeals} co2={co2BySector} />
        </div>
      </div>

      {/* ── Sector tabs ── */}
      <div className="t-tabs">
        <div className="t-tabs-sectors">
          {sectorTabs.map(slug => (
            <button key={slug} className={`t-tab ${activeTab === slug ? 'active' : ''}`}
              style={activeTab === slug ? { color: sectorColors[slug as SectorIntel['slug']], borderColor: sectorColors[slug as SectorIntel['slug']] } : {}}
              onClick={() => setActiveTab(slug as ActiveTab)}>
              {slug}
            </button>
          ))}
        </div>
        <div className="t-tabs-divider">│</div>
        <div className="t-tabs-global">
          <button className={`t-tab t-tab-global ${activeTab === 'CHAT' ? 'active' : ''}`} onClick={() => setActiveTab('CHAT')}>
            AI CHAT
          </button>
        </div>
      </div>

      {/* ── Sector + Chat content ── */}
      <main className="t-main">
        {activeSectorData && activeTab !== 'CHAT' && (
          <SectorView sector={activeSectorData} allPolicies={policies} sectorVideos={currentSectorVideos} />
        )}
        {activeTab === 'CHAT' && (
          <ChatView messages={chatMessages} input={chatInput} streaming={chatStreaming} onInput={setChatInput} onSend={sendChat} />
        )}
      </main>

      {/* ── News ticker ── */}
      <div className="t-ticker">
        <span className="t-ticker-label">TAPE►</span>
        <div className="t-ticker-track">
          <div className="t-ticker-inner">
            {newsTapeToRender.map((item, i) => (
              <span key={i} className="t-ticker-item">
                <span className="tw-dim">[{item.source}]</span>
                <span className="tw-amber">[{item.tag}]</span>
                {item.headline}
                <span className="tw-dim t-ticker-sep">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default App
