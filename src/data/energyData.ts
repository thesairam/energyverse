export type Kpi = {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down' | 'flat'
}

export type MarketRow = {
  asset: string
  region: string
  price: string
  change: string
  trend: 'up' | 'down'
}

export type PolicyItem = {
  region: string
  title: string
  effectiveDate: string
  impact: 'high' | 'medium' | 'low'
}

export type EmissionTrack = {
  segment: string
  current: number
  target: number
  unit: string
}

export type ProjectChange = {
  project: string
  country: string
  technology: 'Solar' | 'Wind' | 'Hydro' | 'Geothermal' | 'Nuclear' | 'Storage'
  status: string
  change: string
}

export type BusinessSignal = {
  company: string
  signal: string
  value: string
}

export type NewsItem = {
  source: string
  headline: string
  tag: string
  time: string
}

export type LinkItem = {
  title: string
  source: string
  time: string
  url: string
  embedUrl?: string
}

export type ProductItem = {
  name: string
  company: string
  summary: string
  status: string
  url: string
}

export type StartupItem = {
  name: string
  region: string
  event: string
  value: string
  url: string
}

export type FinanceItem = {
  metric: string
  value: string
  move: string
  trend: 'up' | 'down' | 'flat'
  history?: number[]
}

export type CommunityItem = {
  platform: 'Reddit' | 'GitHub'
  topic: string
  activity: string
  url: string
}

export type SectorIntel = {
  slug: 'Solar' | 'Wind' | 'Hydro' | 'Geothermal' | 'Storage' | 'Nuclear'
  headline: string
  summary: string
  latestNews: LinkItem[]
  techNews: LinkItem[]
  products: ProductItem[]
  startups: StartupItem[]
  finance: FinanceItem[]
  youtubeLive: LinkItem[]
  community: CommunityItem[]
}

export const kpis: Kpi[] = [
  {
    label: 'Global Clean Generation Share',
    value: '46.2%',
    delta: '+1.4% WoW',
    trend: 'up',
  },
  {
    label: 'Nuclear Output Utilization',
    value: '83.7%',
    delta: '+0.8% DoD',
    trend: 'up',
  },
  {
    label: 'Grid Carbon Intensity',
    value: '338 gCO₂e/kWh',
    delta: '-2.2% WoW',
    trend: 'down',
  },
  {
    label: 'Clean Energy Capital Flow',
    value: '$18.9B',
    delta: '+6.1% MoM',
    trend: 'up',
  },
]

export const marketRows: MarketRow[] = [
  {
    asset: 'EUA Carbon Futures',
    region: 'EU',
    price: '€76.10',
    change: '-1.1%',
    trend: 'down',
  },
  {
    asset: 'US Renewable Energy Credits',
    region: 'US',
    price: '$21.48',
    change: '+3.4%',
    trend: 'up',
  },
  {
    asset: 'Uranium Spot (U3O8)',
    region: 'Global',
    price: '$88.00',
    change: '+0.9%',
    trend: 'up',
  },
  {
    asset: 'Nordic Baseload (Low-Carbon Mix)',
    region: 'Nordics',
    price: '€49.24',
    change: '-0.4%',
    trend: 'down',
  },
]

export const policies: PolicyItem[] = [
  {
    region: 'EU',
    title: 'Grid Flexibility Act enters dispatch phase for storage and demand response',
    effectiveDate: 'Mar 04',
    impact: 'high',
  },
  {
    region: 'US',
    title: 'Advanced Nuclear Credit guidance update for lifetime extensions',
    effectiveDate: 'Mar 06',
    impact: 'high',
  },
  {
    region: 'India',
    title: 'Solar manufacturing-linked procurement thresholds revised upward',
    effectiveDate: 'Mar 10',
    impact: 'medium',
  },
  {
    region: 'Japan',
    title: 'Offshore wind leasing round adds transmission sharing requirements',
    effectiveDate: 'Mar 11',
    impact: 'medium',
  },
]

export const emissions: EmissionTrack[] = [
  {
    segment: 'Power Sector Intensity',
    current: 338,
    target: 280,
    unit: 'gCO₂e/kWh',
  },
  {
    segment: 'Industrial Electrification Coverage',
    current: 41,
    target: 55,
    unit: '%',
  },
  {
    segment: 'Grid-Scale Storage Utilization',
    current: 64,
    target: 75,
    unit: '%',
  },
]

export const projectChanges: ProjectChange[] = [
  {
    project: 'Helios East',
    country: 'Spain',
    technology: 'Solar',
    status: 'Construction',
    change: 'Permits cleared; commissioning moved earlier by 6 weeks',
  },
  {
    project: 'North Sea Arc',
    country: 'UK',
    technology: 'Wind',
    status: 'Financing',
    change: 'Debt package closed at improved spread; EPC tender reopened',
  },
  {
    project: 'Cedar Node BESS',
    country: 'US',
    technology: 'Storage',
    status: 'Operational',
    change: 'Cycle performance improved after firmware update',
  },
  {
    project: 'Kanto Unit-3',
    country: 'Japan',
    technology: 'Nuclear',
    status: 'Maintenance',
    change: 'Refueling outage completed; return-to-service window confirmed',
  },
]

export const businessSignals: BusinessSignal[] = [
  {
    company: 'Orion Renewables',
    signal: 'Q1 Pipeline Conversion',
    value: '31% -> FID',
  },
  {
    company: 'NuCore Systems',
    signal: 'SMR Partnership Count',
    value: '+2 new MOUs',
  },
  {
    company: 'TerraGrid Infra',
    signal: 'Transmission Capex Guidance',
    value: '+11% YoY',
  },
  {
    company: 'BlueCurrent Storage',
    signal: 'Battery Margin Trend',
    value: '+180 bps QoQ',
  },
]

export const newsTape: NewsItem[] = [
  {
    source: 'GridWire',
    headline: 'EU balancing markets widen access for aggregated battery fleets',
    tag: 'Policy',
    time: '09:11 UTC',
  },
  {
    source: 'AtomWatch',
    headline: 'Two utilities submit joint framework for advanced reactor siting',
    tag: 'Nuclear',
    time: '08:53 UTC',
  },
  {
    source: 'Sunline',
    headline: 'Module prices stabilize as demand from utility-scale developers rises',
    tag: 'Solar',
    time: '08:22 UTC',
  },
  {
    source: 'WindScope',
    headline: 'Floating wind tender in Asia oversubscribed in first round',
    tag: 'Wind',
    time: '07:58 UTC',
  },
]

export const sectorIntel: SectorIntel[] = [
  {
    slug: 'Solar',
    headline: 'Utility-scale deployment accelerates on lower module costs and tracker upgrades',
    summary: 'Solar manufacturing margins are mixed while downstream EPC demand improves.',
    latestNews: [
      {
        title: 'Latin American auction books 7.2 GW of new solar capacity',
        source: 'Sunline',
        time: '09:03 UTC',
        url: 'https://example.com/solar-auction',
      },
      {
        title: 'Grid operators tighten curtailment forecasting for noon peaks',
        source: 'GridWire',
        time: '08:27 UTC',
        url: 'https://example.com/solar-curtailment',
      },
    ],
    techNews: [
      {
        title: 'Perovskite tandem pilot hits 28% line efficiency in outdoor trial',
        source: 'PV Lab Watch',
        time: '07:44 UTC',
        url: 'https://example.com/perovskite-pilot',
      },
      {
        title: 'AI cleaning robotics reduce O&M costs across desert arrays',
        source: 'CleanTech Daily',
        time: '07:20 UTC',
        url: 'https://example.com/solar-robotics',
      },
    ],
    products: [
      {
        name: 'HelioTrack X2',
        company: 'AxisGrid',
        summary: 'Dual-axis utility tracker with storm-stow optimization.',
        status: 'Commercial launch',
        url: 'https://example.com/heliotrack-x2',
      },
      {
        name: 'SunEdge 5000',
        company: 'Nova Inverters',
        summary: '1,500V string inverter with built-in predictive diagnostics.',
        status: 'Pilot deployments',
        url: 'https://example.com/sunedge-5000',
      },
    ],
    startups: [
      {
        name: 'RayScale',
        region: 'US',
        event: 'Series A closed',
        value: '$42M',
        url: 'https://example.com/rayscale-funding',
      },
      {
        name: 'SolMesh',
        region: 'India',
        event: 'Module software platform expansion',
        value: '+4 utility customers',
        url: 'https://example.com/solmesh-expansion',
      },
    ],
    finance: [
      {
        metric: 'Invesco Solar ETF (TAN)',
        value: '$47.12',
        move: '+1.6%',
        trend: 'up',
        history: [46.3, 46.8, 47.0, 46.5, 46.9, 47.1, 47.3, 47.12],
      },
      {
        metric: 'First Solar (FSLR)',
        value: '$186.24',
        move: '-0.4%',
        trend: 'down',
        history: [188.1, 187.7, 187.3, 186.9, 186.4, 186.0, 186.4, 186.24],
      },
      {
        metric: 'Module ASP Basket',
        value: '$0.142/W',
        move: '-2.1%',
        trend: 'down',
        history: [0.151, 0.149, 0.147, 0.146, 0.144, 0.143, 0.142, 0.142],
      },
    ],
    youtubeLive: [
      {
        title: 'Live solar market wrap and procurement outlook',
        source: 'Bloomberg Live',
        time: 'Live',
        url: 'https://www.youtube.com/@BloombergTV/live',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCIALMKvObZNtJ6AmdCLP7Lg',
      },
    ],
    community: [
      {
        platform: 'Reddit',
        topic: 'Tracker vs fixed-tilt economics in high-irradiance regions',
        activity: '430 comments',
        url: 'https://www.reddit.com/r/solar/',
      },
      {
        platform: 'GitHub',
        topic: 'Open-source PV yield model calibration issue thread',
        activity: '84 comments',
        url: 'https://github.com/topics/solar-energy',
      },
    ],
  },
  {
    slug: 'Wind',
    headline: 'Offshore procurement remains strong while OEM profitability recovers gradually',
    summary: 'Floating wind and repowering themes dominate near-term project updates.',
    latestNews: [
      {
        title: 'North Sea round secures additional floating wind acreage',
        source: 'WindScope',
        time: '08:51 UTC',
        url: 'https://example.com/floating-wind-round',
      },
      {
        title: 'Transmission queue reforms shorten interconnection pathways',
        source: 'GridWire',
        time: '08:09 UTC',
        url: 'https://example.com/wind-grid-queue',
      },
    ],
    techNews: [
      {
        title: 'Blade lifecycle analytics improve failure prediction windows',
        source: 'Rotor Tech',
        time: '07:37 UTC',
        url: 'https://example.com/blade-analytics',
      },
      {
        title: 'Direct-drive nacelle redesign trims maintenance intervals',
        source: 'Turbine Weekly',
        time: '06:58 UTC',
        url: 'https://example.com/direct-drive-redesign',
      },
    ],
    products: [
      {
        name: 'OceanSpin 16MW',
        company: 'AeroFlux',
        summary: 'Next-gen offshore turbine with advanced pitch control.',
        status: 'Type certification phase',
        url: 'https://example.com/oceanspin-16mw',
      },
      {
        name: 'WindTwin AI',
        company: 'RotorIQ',
        summary: 'Digital twin platform for fleet-level performance optimization.',
        status: 'Commercial release',
        url: 'https://example.com/windtwin-ai',
      },
    ],
    startups: [
      {
        name: 'DriftAnchor',
        region: 'Norway',
        event: 'Strategic partnership for floating mooring systems',
        value: '3 pilot sites',
        url: 'https://example.com/driftanchor-partnership',
      },
      {
        name: 'WindOps ML',
        region: 'UK',
        event: 'Seed extension',
        value: '$11M',
        url: 'https://example.com/windops-seed',
      },
    ],
    finance: [
      {
        metric: 'Global Wind Developers Index',
        value: '1,248',
        move: '+0.9%',
        trend: 'up',
        history: [1231, 1236, 1240, 1244, 1246, 1249, 1251, 1248],
      },
      {
        metric: 'Vestas (VWS.CO)',
        value: 'DKK 194.2',
        move: '+1.1%',
        trend: 'up',
        history: [191.0, 192.1, 193.0, 193.8, 194.6, 194.6, 194.4, 194.2],
      },
      {
        metric: 'Siemens Energy (ENR.DE)',
        value: '€26.48',
        move: '-0.2%',
        trend: 'down',
        history: [27.1, 26.9, 26.7, 26.5, 26.6, 26.4, 26.5, 26.48],
      },
    ],
    youtubeLive: [
      {
        title: 'Offshore wind live policy and project desk',
        source: 'Reuters Live',
        time: 'Live',
        url: 'https://www.youtube.com/@Reuters/live',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UChqUTb7kYRX8-EiaN3XFrSQ',
      },
    ],
    community: [
      {
        platform: 'Reddit',
        topic: 'Offshore cabling bottlenecks and cost pass-through debate',
        activity: '289 comments',
        url: 'https://www.reddit.com/r/windenergy/',
      },
      {
        platform: 'GitHub',
        topic: 'Wake modeling package update for complex terrain',
        activity: '52 issues',
        url: 'https://github.com/topics/wind-energy',
      },
    ],
  },
  {
    slug: 'Hydro',
    headline: 'Hydro modernization gains pace with digital control upgrades and pumped storage planning',
    summary: 'Hydrology variability is driving new balancing and reservoir optimization strategies.',
    latestNews: [
      {
        title: 'Pumped storage approvals rise in South Asia',
        source: 'HydroView',
        time: '08:38 UTC',
        url: 'https://example.com/pumped-storage-approvals',
      },
      {
        title: 'Reservoir dispatch protocol revised for climate volatility',
        source: 'PolicyGrid',
        time: '07:54 UTC',
        url: 'https://example.com/reservoir-dispatch',
      },
    ],
    techNews: [
      {
        title: 'Digital governor upgrade lowers ramping losses at cascade dams',
        source: 'Hydro Tech',
        time: '07:03 UTC',
        url: 'https://example.com/digital-governor',
      },
      {
        title: 'Fish-safe turbine blades enter expanded field testing',
        source: 'RiverLab',
        time: '06:46 UTC',
        url: 'https://example.com/fish-safe-turbines',
      },
    ],
    products: [
      {
        name: 'HydroPilot OS',
        company: 'AquaControl',
        summary: 'Plant control stack for reservoir, flow and market co-optimization.',
        status: 'Regional rollout',
        url: 'https://example.com/hydropilot-os',
      },
      {
        name: 'EcoBlade H4',
        company: 'RiverMotion',
        summary: 'Retrofit blade kit focused on low-head efficiency gains.',
        status: 'Commercial availability',
        url: 'https://example.com/ecoblade-h4',
      },
    ],
    startups: [
      {
        name: 'PeakReservoir',
        region: 'Brazil',
        event: 'Series B extension',
        value: '$27M',
        url: 'https://example.com/peakreservoir-seriesb',
      },
      {
        name: 'FlowBridge',
        region: 'Canada',
        event: 'Pumped storage software contract award',
        value: '6-plant portfolio',
        url: 'https://example.com/flowbridge-contract',
      },
    ],
    finance: [
      {
        metric: 'Global Hydro Utility Basket',
        value: '782',
        move: '+0.3%',
        trend: 'up',
        history: [774, 776, 778, 779, 781, 782, 783, 782],
      },
      {
        metric: 'Brookfield Renewable (BEP)',
        value: '$24.61',
        move: '+0.7%',
        trend: 'up',
        history: [24.1, 24.2, 24.4, 24.5, 24.6, 24.7, 24.65, 24.61],
      },
      {
        metric: 'Pumped Storage CAPEX Index',
        value: '119.4',
        move: '+1.8%',
        trend: 'up',
        history: [117.5, 117.9, 118.6, 118.9, 119.2, 119.5, 119.7, 119.4],
      },
    ],
    youtubeLive: [
      {
        title: 'Hydro and pumped storage operations live bulletin',
        source: 'Al Jazeera English Live',
        time: 'Live',
        url: 'https://www.youtube.com/@aljazeeraenglish/live',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCNye-wNBqNL5ZzHSJj3l8Bg',
      },
    ],
    community: [
      {
        platform: 'Reddit',
        topic: 'Pumped hydro vs battery economics in long-duration storage',
        activity: '198 comments',
        url: 'https://www.reddit.com/r/renewableenergy/',
      },
      {
        platform: 'GitHub',
        topic: 'Open reservoir optimization model with market constraints',
        activity: '39 PRs',
        url: 'https://github.com/topics/hydropower',
      },
    ],
  },
  {
    slug: 'Geothermal',
    headline: 'Enhanced geothermal projects attract capital as drilling technology matures',
    summary: 'EGS pilot data and heat-to-power software are key industry watchpoints.',
    latestNews: [
      {
        title: 'New EGS site reaches commercial flow threshold',
        source: 'GeoPulse',
        time: '08:15 UTC',
        url: 'https://example.com/egs-commercial-flow',
      },
      {
        title: 'Regional heat policy incentives expanded for industrial clusters',
        source: 'PolicyGrid',
        time: '07:31 UTC',
        url: 'https://example.com/geothermal-policy',
      },
    ],
    techNews: [
      {
        title: 'Directional drilling workflow cuts well completion time',
        source: 'DeepHeat Tech',
        time: '07:01 UTC',
        url: 'https://example.com/geothermal-drilling',
      },
      {
        title: 'Binary cycle control software boosts output stability',
        source: 'Thermal Systems',
        time: '06:40 UTC',
        url: 'https://example.com/binary-cycle-controls',
      },
    ],
    products: [
      {
        name: 'GeoLoop 3D',
        company: 'DeepCircuit',
        summary: 'Reservoir digital twin for enhanced geothermal planning.',
        status: 'Beta enterprise program',
        url: 'https://example.com/geoloop-3d',
      },
      {
        name: 'ThermaCore Unit',
        company: 'HeatForge',
        summary: 'Modular surface unit for distributed geothermal heat systems.',
        status: 'Field validation',
        url: 'https://example.com/thermacore-unit',
      },
    ],
    startups: [
      {
        name: 'MagmaGrid',
        region: 'US',
        event: 'Series A',
        value: '$38M',
        url: 'https://example.com/magmagrid-seriesa',
      },
      {
        name: 'CoreHeat Labs',
        region: 'Kenya',
        event: 'Government-backed pilot grant',
        value: '$9M equivalent',
        url: 'https://example.com/coreheat-grant',
      },
    ],
    finance: [
      {
        metric: 'Geothermal Development Basket',
        value: '324',
        move: '+2.1%',
        trend: 'up',
        history: [316, 318, 320, 321, 323, 324, 325, 324],
      },
      {
        metric: 'Ormat Technologies (ORA)',
        value: '$73.88',
        move: '+0.6%',
        trend: 'up',
        history: [72.4, 72.9, 73.1, 73.3, 73.5, 73.7, 74.0, 73.88],
      },
      {
        metric: 'EGS Private Valuation Index',
        value: '141',
        move: '+3.5%',
        trend: 'up',
        history: [136, 137, 138, 139, 140, 141, 141.5, 141],
      },
    ],
    youtubeLive: [
      {
        title: 'Geothermal dispatch and drilling live updates',
        source: 'DW News Live',
        time: 'Live',
        url: 'https://www.youtube.com/@dwnews/live',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCknLrEdhRCp1aegoMqRaCZg',
      },
    ],
    community: [
      {
        platform: 'Reddit',
        topic: 'District heating potential from geothermal in cold climates',
        activity: '147 comments',
        url: 'https://www.reddit.com/r/geothermal/',
      },
      {
        platform: 'GitHub',
        topic: 'Open-source geothermal reservoir simulator benchmark thread',
        activity: '31 issues',
        url: 'https://github.com/topics/geothermal',
      },
    ],
  },
  {
    slug: 'Storage',
    headline: 'Battery and long-duration storage become central to grid reliability planning',
    summary: 'Duration economics and market participation rules remain key investor focus areas.',
    latestNews: [
      {
        title: 'Capacity market introduces fast-response premium for BESS assets',
        source: 'GridWire',
        time: '09:18 UTC',
        url: 'https://example.com/bess-capacity-market',
      },
      {
        title: 'Hybrid solar-plus-storage pipeline reaches record queue level',
        source: 'Storage Bulletin',
        time: '08:33 UTC',
        url: 'https://example.com/hybrid-pipeline',
      },
    ],
    techNews: [
      {
        title: 'Sodium-ion pack trial confirms improved cold-weather performance',
        source: 'Battery Lab Daily',
        time: '07:42 UTC',
        url: 'https://example.com/sodium-ion-trial',
      },
      {
        title: 'Flow battery stack redesign doubles membrane lifespan',
        source: 'Long Duration News',
        time: '07:11 UTC',
        url: 'https://example.com/flow-battery-redesign',
      },
    ],
    products: [
      {
        name: 'VoltStack L8',
        company: 'BlueCurrent',
        summary: '8-hour utility battery platform with thermal balancing.',
        status: 'Commercial launch',
        url: 'https://example.com/voltstack-l8',
      },
      {
        name: 'GridShift Optimizer',
        company: 'PeakLogic',
        summary: 'Revenue stacking engine for ancillary, arbitrage and capacity markets.',
        status: 'General availability',
        url: 'https://example.com/gridshift-optimizer',
      },
    ],
    startups: [
      {
        name: 'AnodePath',
        region: 'Germany',
        event: 'Series B',
        value: '$63M',
        url: 'https://example.com/anodepath-seriesb',
      },
      {
        name: 'Thermavault',
        region: 'US',
        event: 'Utility LDES pilot selected',
        value: '200 MWh project',
        url: 'https://example.com/thermavault-pilot',
      },
    ],
    finance: [
      {
        metric: 'Global Lithium Carbonate',
        value: '$13,540/t',
        move: '-1.3%',
        trend: 'down',
        history: [13980, 13860, 13710, 13640, 13590, 13560, 13540, 13540],
      },
      {
        metric: 'Fluence Energy (FLNC)',
        value: '$20.44',
        move: '+2.6%',
        trend: 'up',
        history: [19.7, 19.9, 20.1, 20.3, 20.5, 20.7, 20.6, 20.44],
      },
      {
        metric: 'Battery Storage Revenue Index',
        value: '158',
        move: '+1.9%',
        trend: 'up',
        history: [152, 154, 155, 156, 157, 158, 158.5, 158],
      },
    ],
    youtubeLive: [
      {
        title: 'Battery markets and ancillary services live stream',
        source: 'CNBC Live',
        time: 'Live',
        url: 'https://www.youtube.com/@CNBCtelevision/live',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCrp_UI8XtuYfpiqluWLD7Lw',
      },
    ],
    community: [
      {
        platform: 'Reddit',
        topic: 'Sodium-ion bankability versus LFP in utility procurements',
        activity: '501 comments',
        url: 'https://www.reddit.com/r/batteries/',
      },
      {
        platform: 'GitHub',
        topic: 'Open EMS scheduler discussion for day-ahead battery dispatch',
        activity: '74 discussions',
        url: 'https://github.com/topics/energy-storage',
      },
    ],
  },
  {
    slug: 'Nuclear',
    headline: 'Nuclear uprates and SMR programs advance under reliability-focused policy frameworks',
    summary: 'Lifetime extensions and advanced reactor licensing milestones are market moving.',
    latestNews: [
      {
        title: 'Regulator finalizes phased review model for first-of-a-kind SMRs',
        source: 'AtomWatch',
        time: '09:06 UTC',
        url: 'https://example.com/smr-review-model',
      },
      {
        title: 'Utility consortium confirms timeline for uprate program',
        source: 'Nuclear Desk',
        time: '08:41 UTC',
        url: 'https://example.com/uprate-program',
      },
    ],
    techNews: [
      {
        title: 'Passive safety subsystem test data released for Gen IV design',
        source: 'Reactor Tech Wire',
        time: '07:36 UTC',
        url: 'https://example.com/passive-safety-data',
      },
      {
        title: 'Fuel cycle digital QA stack lowers outage planning overhead',
        source: 'CoreCompute',
        time: '07:00 UTC',
        url: 'https://example.com/fuel-cycle-qa',
      },
    ],
    products: [
      {
        name: 'CoreSMR-300',
        company: 'NuCore Systems',
        summary: 'Factory-fabricated reactor package with modular civil footprint.',
        status: 'Pre-licensing stage',
        url: 'https://example.com/coresmr-300',
      },
      {
        name: 'OutageLens',
        company: 'AtomIQ',
        summary: 'Refueling outage optimization software for legacy fleets.',
        status: 'Commercial release',
        url: 'https://example.com/outagelens',
      },
    ],
    startups: [
      {
        name: 'Neutron Forge',
        region: 'Canada',
        event: 'Strategic financing round',
        value: '$75M',
        url: 'https://example.com/neutron-forge-round',
      },
      {
        name: 'Helix Isotopes',
        region: 'France',
        event: 'Supply chain partnership announcement',
        value: '3-year fuel agreement',
        url: 'https://example.com/helix-isotopes-partnership',
      },
    ],
    finance: [
      {
        metric: 'Cameco (CCJ)',
        value: '$49.33',
        move: '+1.0%',
        trend: 'up',
        history: [48.1, 48.4, 48.7, 49.0, 49.2, 49.4, 49.5, 49.33],
      },
      {
        metric: 'Uranium Miners ETF (URA)',
        value: '$31.81',
        move: '+0.8%',
        trend: 'up',
        history: [31.1, 31.2, 31.4, 31.6, 31.7, 31.9, 31.85, 31.81],
      },
      {
        metric: 'U3O8 Spot',
        value: '$88.00/lb',
        move: '+0.9%',
        trend: 'up',
        history: [86.2, 86.8, 87.3, 87.9, 88.4, 88.1, 88.0, 88.0],
      },
    ],
    youtubeLive: [
      {
        title: 'Nuclear policy and SMR market live monitor',
        source: 'France 24 Live',
        time: 'Live',
        url: 'https://www.youtube.com/@FRANCE24/live',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCQfwfsi5VrQ8yKZ-UWmAEFg',
      },
    ],
    community: [
      {
        platform: 'Reddit',
        topic: 'SMR commercialization timelines and procurement risk',
        activity: '612 comments',
        url: 'https://www.reddit.com/r/nuclear/',
      },
      {
        platform: 'GitHub',
        topic: 'Open-source reactor simulation and neutronics tooling updates',
        activity: '118 discussions',
        url: 'https://github.com/topics/nuclear',
      },
    ],
  },
]
