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
  technology: 'Solar' | 'Wind' | 'Hydro' | 'Geothermal' | 'Nuclear' | 'Storage' | 'EV'
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

export type Region =
  | 'Global'
  | 'EMEA'
  | 'NAM'
  | 'APAC'
  | 'India'
  | 'UK'
  | 'France'
  | 'China'
  | 'Japan'
  | 'Singapore'
  | 'Netherlands'
  | 'Germany'

export type LinkItem = {
  title: string
  source: string
  time: string
  url: string
  embedUrl?: string
  region?: Region
}

export type ProductItem = {
  name: string
  company: string
  summary: string
  status: string
  url: string
  region?: Region
}

export type StartupItem = {
  name: string
  region: string
  event: string
  value: string
  url: string
  geography?: Region
}

export type FinanceItem = {
  metric: string
  value: string
  move: string
  trend: 'up' | 'down' | 'flat'
  history?: number[]
  region?: Region
}

export type CommunityItem = {
  platform: 'Reddit' | 'GitHub'
  topic: string
  activity: string
  url: string
  region?: Region
}

export type SectorIntel = {
  slug: 'Solar' | 'Wind' | 'Hydro' | 'Geothermal' | 'Storage' | 'Nuclear' | 'EV'
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
        region: 'APAC',
      },
      {
        title: 'Grid operators tighten curtailment forecasting for noon peaks',
        source: 'GridWire',
        time: '08:27 UTC',
        url: 'https://example.com/solar-curtailment',
        region: 'EMEA',
      },
    ],
    techNews: [
      {
        title: 'Perovskite tandem pilot hits 28% line efficiency in outdoor trial',
        source: 'PV Lab Watch',
        time: '07:44 UTC',
        url: 'https://example.com/perovskite-pilot',
        region: 'APAC',
      },
      {
        title: 'AI cleaning robotics reduce O&M costs across desert arrays',
        source: 'CleanTech Daily',
        time: '07:20 UTC',
        url: 'https://example.com/solar-robotics',
        region: 'NAM',
      },
    ],
    products: [
      {
        name: 'HelioTrack X2',
        company: 'AxisGrid',
        summary: 'Dual-axis utility tracker with storm-stow optimization.',
        status: 'Commercial launch',
        url: 'https://example.com/heliotrack-x2',
        region: 'EMEA',
      },
      {
        name: 'SunEdge 5000',
        company: 'Nova Inverters',
        summary: '1,500V string inverter with built-in predictive diagnostics.',
        status: 'Pilot deployments',
        url: 'https://example.com/sunedge-5000',
        region: 'APAC',
      },
    ],
    startups: [
      {
        name: 'RayScale',
        region: 'US',
        event: 'Series A closed',
        value: '$42M',
        url: 'https://example.com/rayscale-funding',
        geography: 'NAM',
      },
      {
        name: 'SolMesh',
        region: 'India',
        event: 'Module software platform expansion',
        value: '+4 utility customers',
        url: 'https://example.com/solmesh-expansion',
        geography: 'India',
      },
    ],
    finance: [
      {
        metric: 'Invesco Solar ETF (TAN)',
        value: '$47.12',
        move: '+1.6%',
        trend: 'up',
        history: [46.3, 46.8, 47.0, 46.5, 46.9, 47.1, 47.3, 47.12],
        region: 'Global',
      },
      {
        metric: 'First Solar (FSLR)',
        value: '$186.24',
        move: '-0.4%',
        trend: 'down',
        history: [188.1, 187.7, 187.3, 186.9, 186.4, 186.0, 186.4, 186.24],
        region: 'NAM',
      },
      {
        metric: 'Enphase Energy (ENPH)',
        value: '$107.88',
        move: '+0.9%',
        trend: 'up',
        history: [104.4, 105.1, 105.9, 106.6, 107.1, 107.5, 107.9, 107.88],
        region: 'NAM',
      },
      {
        metric: 'SolarEdge (SEDG)',
        value: '$72.44',
        move: '+1.3%',
        trend: 'up',
        history: [69.9, 70.6, 71.1, 71.8, 72.2, 72.6, 72.7, 72.44],
        region: 'EMEA',
      },
      {
        metric: 'Module ASP Basket',
        value: '$0.142/W',
        move: '-2.1%',
        trend: 'down',
        history: [0.151, 0.149, 0.147, 0.146, 0.144, 0.143, 0.142, 0.142],
        region: 'APAC',
      },
    ],
    youtubeLive: [
      {
        title: 'Solar pro coverage',
        source: 'Solar Power World',
        time: 'Channel',
        url: 'https://www.youtube.com/@SolarPowerWorld',
        region: 'Global',
      },
      {
        title: 'PV industry live',
        source: 'PV Magazine',
        time: 'Live',
        url: 'https://www.youtube.com/@pvmagazineint',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UC6L4aDOb8grUbA-9ZkvJzsg',
        region: 'Global',
      },
    ],
    community: [
      {
        platform: 'Reddit',
        topic: 'Tracker vs fixed-tilt economics in high-irradiance regions',
        activity: '430 comments',
        url: 'https://www.reddit.com/r/solar/',
        region: 'Global',
      },
      {
        platform: 'GitHub',
        topic: 'Open-source PV yield model calibration issue thread',
        activity: '84 comments',
        url: 'https://github.com/topics/solar-energy',
        region: 'Global',
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
        region: 'UK',
      },
      {
        title: 'Transmission queue reforms shorten interconnection pathways',
        source: 'GridWire',
        time: '08:09 UTC',
        url: 'https://example.com/wind-grid-queue',
        region: 'NAM',
      },
    ],
    techNews: [
      {
        title: 'Blade lifecycle analytics improve failure prediction windows',
        source: 'Rotor Tech',
        time: '07:37 UTC',
        url: 'https://example.com/blade-analytics',
        region: 'EMEA',
      },
      {
        title: 'Direct-drive nacelle redesign trims maintenance intervals',
        source: 'Turbine Weekly',
        time: '06:58 UTC',
        url: 'https://example.com/direct-drive-redesign',
        region: 'APAC',
      },
    ],
    products: [
      {
        name: 'OceanSpin 16MW',
        company: 'AeroFlux',
        summary: 'Next-gen offshore turbine with advanced pitch control.',
        status: 'Type certification phase',
        url: 'https://example.com/oceanspin-16mw',
        region: 'EMEA',
      },
      {
        name: 'WindTwin AI',
        company: 'RotorIQ',
        summary: 'Digital twin platform for fleet-level performance optimization.',
        status: 'Commercial release',
        url: 'https://example.com/windtwin-ai',
        region: 'NAM',
      },
    ],
    startups: [
      {
        name: 'DriftAnchor',
        region: 'Norway',
        event: 'Strategic partnership for floating mooring systems',
        value: '3 pilot sites',
        url: 'https://example.com/driftanchor-partnership',
        geography: 'EMEA',
      },
      {
        name: 'WindOps ML',
        region: 'UK',
        event: 'Seed extension',
        value: '$11M',
        url: 'https://example.com/windops-seed',
        geography: 'UK',
      },
    ],
    finance: [
      {
        metric: 'Global Wind Developers Index',
        value: '1,248',
        move: '+0.9%',
        trend: 'up',
        history: [1231, 1236, 1240, 1244, 1246, 1249, 1251, 1248],
        region: 'Global',
      },
      {
        metric: 'Vestas (VWS.CO)',
        value: 'DKK 194.2',
        move: '+1.1%',
        trend: 'up',
        history: [191.0, 192.1, 193.0, 193.8, 194.6, 194.6, 194.4, 194.2],
        region: 'EMEA',
      },
      {
        metric: 'Siemens Energy (ENR.DE)',
        value: '€26.48',
        move: '-0.2%',
        trend: 'down',
        history: [27.1, 26.9, 26.7, 26.5, 26.6, 26.4, 26.5, 26.48],
        region: 'Germany',
      },
      {
        metric: 'Ørsted (ORSTED.CO)',
        value: 'DKK 487.6',
        move: '+1.4%',
        trend: 'up',
        history: [472.1, 475.4, 478.9, 481.6, 485.2, 488.1, 489.0, 487.6],
        region: 'EMEA',
      },
      {
        metric: 'TPI Composites (TPIC)',
        value: '$3.44',
        move: '+2.8%',
        trend: 'up',
        history: [3.02, 3.08, 3.11, 3.19, 3.26, 3.31, 3.36, 3.44],
        region: 'NAM',
      },
    ],
    youtubeLive: [
      {
        title: 'Wind industry sessions',
        source: 'WindEurope',
        time: 'Live',
        url: 'https://www.youtube.com/@WindEurope',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCdGh2Pg_K_3tW36Z9Yq_RGA',
        region: 'Global',
      },
      {
        title: 'Clean power briefings',
        source: 'American Clean Power',
        time: 'Channel',
        url: 'https://www.youtube.com/@AmericanCleanPower',
        region: 'Global',
      },
    ],
    community: [
      {
        platform: 'Reddit',
        topic: 'Offshore cabling bottlenecks and cost pass-through debate',
        activity: '289 comments',
        url: 'https://www.reddit.com/r/windenergy/',
        region: 'Global',
      },
      {
        platform: 'GitHub',
        topic: 'Wake modeling package update for complex terrain',
        activity: '52 issues',
        url: 'https://github.com/topics/wind-energy',
        region: 'Global',
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
        region: 'India',
      },
      {
        title: 'Reservoir dispatch protocol revised for climate volatility',
        source: 'PolicyGrid',
        time: '07:54 UTC',
        url: 'https://example.com/reservoir-dispatch',
        region: 'Global',
      },
    ],
    techNews: [
      {
        title: 'Digital governor upgrade lowers ramping losses at cascade dams',
        source: 'Hydro Tech',
        time: '07:03 UTC',
        url: 'https://example.com/digital-governor',
        region: 'NAM',
      },
      {
        title: 'Fish-safe turbine blades enter expanded field testing',
        source: 'RiverLab',
        time: '06:46 UTC',
        url: 'https://example.com/fish-safe-turbines',
        region: 'EMEA',
      },
    ],
    products: [
      {
        name: 'HydroPilot OS',
        company: 'AquaControl',
        summary: 'Plant control stack for reservoir, flow and market co-optimization.',
        status: 'Regional rollout',
        url: 'https://example.com/hydropilot-os',
        region: 'APAC',
      },
      {
        name: 'EcoBlade H4',
        company: 'RiverMotion',
        summary: 'Retrofit blade kit focused on low-head efficiency gains.',
        status: 'Commercial availability',
        url: 'https://example.com/ecoblade-h4',
        region: 'EMEA',
      },
    ],
    startups: [
      {
        name: 'PeakReservoir',
        region: 'Brazil',
        event: 'Series B extension',
        value: '$27M',
        url: 'https://example.com/peakreservoir-seriesb',
        geography: 'Global',
      },
      {
        name: 'FlowBridge',
        region: 'Canada',
        event: 'Pumped storage software contract award',
        value: '6-plant portfolio',
        url: 'https://example.com/flowbridge-contract',
        geography: 'NAM',
      },
    ],
    finance: [
      {
        metric: 'Global Hydro Utility Basket',
        value: '782',
        move: '+0.3%',
        trend: 'up',
        history: [774, 776, 778, 779, 781, 782, 783, 782],
        region: 'Global',
      },
      {
        metric: 'Brookfield Renewable (BEP)',
        value: '$24.61',
        move: '+0.7%',
        trend: 'up',
        history: [24.1, 24.2, 24.4, 24.5, 24.6, 24.7, 24.65, 24.61],
        region: 'NAM',
      },
      {
        metric: 'Innergex (INE.TO)',
        value: '$13.72',
        move: '+0.5%',
        trend: 'up',
        history: [13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.72],
        region: 'NAM',
      },
      {
        metric: 'Pumped Storage CAPEX Index',
        value: '119.4',
        move: '+1.8%',
        trend: 'up',
        history: [117.5, 117.9, 118.6, 118.9, 119.2, 119.5, 119.7, 119.4],
        region: 'Global',
      },
      {
        metric: 'Run-of-River Ops Basket',
        value: '211',
        move: '+0.6%',
        trend: 'up',
        history: [204, 206, 207, 208, 209, 210, 211, 211],
        region: 'EMEA',
      },
    ],
    youtubeLive: [
      {
        title: 'Hydropower briefings',
        source: 'IHA',
        time: 'Live',
        url: 'https://www.youtube.com/@theIHAorg',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCVMmDqb1XT6uQWqSWBrgPBA',
        region: 'Global',
      },
      {
        title: 'Hydro projects & O&M',
        source: 'Hydro Review',
        time: 'Channel',
        url: 'https://www.youtube.com/@HydroReview',
        region: 'Global',
      },
    ],
    community: [
      {
        platform: 'Reddit',
        topic: 'Pumped hydro vs battery economics in long-duration storage',
        activity: '198 comments',
        url: 'https://www.reddit.com/r/renewableenergy/',
        region: 'Global',
      },
      {
        platform: 'GitHub',
        topic: 'Open reservoir optimization model with market constraints',
        activity: '39 PRs',
        url: 'https://github.com/topics/hydropower',
        region: 'Global',
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
        region: 'APAC',
      },
      {
        title: 'Regional heat policy incentives expanded for industrial clusters',
        source: 'PolicyGrid',
        time: '07:31 UTC',
        url: 'https://example.com/geothermal-policy',
        region: 'EMEA',
      },
    ],
    techNews: [
      {
        title: 'Directional drilling workflow cuts well completion time',
        source: 'DeepHeat Tech',
        time: '07:01 UTC',
        url: 'https://example.com/geothermal-drilling',
        region: 'NAM',
      },
      {
        title: 'Binary cycle control software boosts output stability',
        source: 'Thermal Systems',
        time: '06:40 UTC',
        url: 'https://example.com/binary-cycle-controls',
        region: 'EMEA',
      },
    ],
    products: [
      {
        name: 'GeoLoop 3D',
        company: 'DeepCircuit',
        summary: 'Reservoir digital twin for enhanced geothermal planning.',
        status: 'Beta enterprise program',
        url: 'https://example.com/geoloop-3d',
        region: 'EMEA',
      },
      {
        name: 'ThermaCore Unit',
        company: 'HeatForge',
        summary: 'Modular surface unit for distributed geothermal heat systems.',
        status: 'Field validation',
        url: 'https://example.com/thermacore-unit',
        region: 'APAC',
      },
    ],
    startups: [
      {
        name: 'MagmaGrid',
        region: 'US',
        event: 'Series A',
        value: '$38M',
        url: 'https://example.com/magmagrid-seriesa',
        geography: 'NAM',
      },
      {
        name: 'CoreHeat Labs',
        region: 'Kenya',
        event: 'Government-backed pilot grant',
        value: '$9M equivalent',
        url: 'https://example.com/coreheat-grant',
        geography: 'EMEA',
      },
    ],
    finance: [
      {
        metric: 'Geothermal Development Basket',
        value: '324',
        move: '+2.1%',
        trend: 'up',
        history: [316, 318, 320, 321, 323, 324, 325, 324],
        region: 'Global',
      },
      {
        metric: 'Ormat Technologies (ORA)',
        value: '$73.88',
        move: '+0.6%',
        trend: 'up',
        history: [72.4, 72.9, 73.1, 73.3, 73.5, 73.7, 74.0, 73.88],
        region: 'NAM',
      },
      {
        metric: 'Calpine (Private benchmark)',
        value: '$7.9B est.',
        move: '+0.4%',
        trend: 'up',
        history: [7.62, 7.66, 7.7, 7.74, 7.8, 7.84, 7.88, 7.9],
        region: 'NAM',
      },
      {
        metric: 'EGS Private Valuation Index',
        value: '141',
        move: '+3.5%',
        trend: 'up',
        history: [136, 137, 138, 139, 140, 141, 141.5, 141],
        region: 'Global',
      },
      {
        metric: 'CLNE (Renewable gas)',
        value: '$3.58',
        move: '+1.1%',
        trend: 'up',
        history: [3.32, 3.36, 3.41, 3.45, 3.49, 3.53, 3.55, 3.58],
        region: 'NAM',
      },
    ],
    youtubeLive: [
      {
        title: 'Geothermal industry talks',
        source: 'Geothermal Rising',
        time: 'Live',
        url: 'https://www.youtube.com/@GeothermalRising',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCy3q58aeGeqCAdz-7Nfx-FQ',
        region: 'Global',
      },
      {
        title: 'Geothermal interviews',
        source: 'ThinkGeoEnergy',
        time: 'Channel',
        url: 'https://www.youtube.com/@thinkgeoenergy',
        region: 'Global',
      },
    ],
    community: [
      {
        platform: 'Reddit',
        topic: 'District heating potential from geothermal in cold climates',
        activity: '147 comments',
        url: 'https://www.reddit.com/r/geothermal/',
        region: 'Global',
      },
      {
        platform: 'GitHub',
        topic: 'Open-source geothermal reservoir simulator benchmark thread',
        activity: '31 issues',
        url: 'https://github.com/topics/geothermal',
        region: 'Global',
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
        region: 'UK',
      },
      {
        title: 'Hybrid solar-plus-storage pipeline reaches record queue level',
        source: 'Storage Bulletin',
        time: '08:33 UTC',
        url: 'https://example.com/hybrid-pipeline',
        region: 'NAM',
      },
    ],
    techNews: [
      {
        title: 'Sodium-ion pack trial confirms improved cold-weather performance',
        source: 'Battery Lab Daily',
        time: '07:42 UTC',
        url: 'https://example.com/sodium-ion-trial',
        region: 'China',
      },
      {
        title: 'Flow battery stack redesign doubles membrane lifespan',
        source: 'Long Duration News',
        time: '07:11 UTC',
        url: 'https://example.com/flow-battery-redesign',
        region: 'EMEA',
      },
    ],
    products: [
      {
        name: 'VoltStack L8',
        company: 'BlueCurrent',
        summary: '8-hour utility battery platform with thermal balancing.',
        status: 'Commercial launch',
        url: 'https://example.com/voltstack-l8',
        region: 'NAM',
      },
      {
        name: 'GridShift Optimizer',
        company: 'PeakLogic',
        summary: 'Revenue stacking engine for ancillary, arbitrage and capacity markets.',
        status: 'General availability',
        url: 'https://example.com/gridshift-optimizer',
        region: 'EMEA',
      },
    ],
    startups: [
      {
        name: 'AnodePath',
        region: 'Germany',
        event: 'Series B',
        value: '$63M',
        url: 'https://example.com/anodepath-seriesb',
        geography: 'Germany',
      },
      {
        name: 'Thermavault',
        region: 'US',
        event: 'Utility LDES pilot selected',
        value: '200 MWh project',
        url: 'https://example.com/thermavault-pilot',
        geography: 'NAM',
      },
    ],
    finance: [
      {
        metric: 'Global Lithium Carbonate',
        value: '$13,540/t',
        move: '-1.3%',
        trend: 'down',
        history: [13980, 13860, 13710, 13640, 13590, 13560, 13540, 13540],
        region: 'Global',
      },
      {
        metric: 'Fluence Energy (FLNC)',
        value: '$20.44',
        move: '+2.6%',
        trend: 'up',
        history: [19.7, 19.9, 20.1, 20.3, 20.5, 20.7, 20.6, 20.44],
        region: 'NAM',
      },
      {
        metric: 'Stem Inc (STEM)',
        value: '$3.12',
        move: '+3.4%',
        trend: 'up',
        history: [2.71, 2.78, 2.83, 2.89, 2.95, 3.01, 3.07, 3.12],
        region: 'NAM',
      },
      {
        metric: 'Battery Storage Revenue Index',
        value: '158',
        move: '+1.9%',
        trend: 'up',
        history: [152, 154, 155, 156, 157, 158, 158.5, 158],
        region: 'Global',
      },
      {
        metric: 'Global X Lithium ETF (LIT)',
        value: '$47.05',
        move: '+0.7%',
        trend: 'up',
        history: [45.7, 46.0, 46.2, 46.5, 46.8, 47.0, 47.1, 47.05],
        region: 'Global',
      },
    ],
    youtubeLive: [
      {
        title: 'Storage & grid briefings',
        source: 'Energy Storage News',
        time: 'Live',
        url: 'https://www.youtube.com/@EnergyStorageNews',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UC8G_1w1T6xN32IOqDa98GqQ',
        region: 'Global',
      },
      {
        title: 'Clean energy explainers',
        source: 'CleanTechnica',
        time: 'Channel',
        url: 'https://www.youtube.com/@cleantechnica',
        region: 'Global',
      },
    ],
    community: [
      {
        platform: 'Reddit',
        topic: 'Sodium-ion bankability versus LFP in utility procurements',
        activity: '501 comments',
        url: 'https://www.reddit.com/r/batteries/',
        region: 'Global',
      },
      {
        platform: 'GitHub',
        topic: 'Open EMS scheduler discussion for day-ahead battery dispatch',
        activity: '74 discussions',
        url: 'https://github.com/topics/energy-storage',
        region: 'Global',
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
        region: 'NAM',
      },
      {
        title: 'Utility consortium confirms timeline for uprate program',
        source: 'Nuclear Desk',
        time: '08:41 UTC',
        url: 'https://example.com/uprate-program',
        region: 'EMEA',
      },
    ],
    techNews: [
      {
        title: 'Passive safety subsystem test data released for Gen IV design',
        source: 'Reactor Tech Wire',
        time: '07:36 UTC',
        url: 'https://example.com/passive-safety-data',
        region: 'France',
      },
      {
        title: 'Fuel cycle digital QA stack lowers outage planning overhead',
        source: 'CoreCompute',
        time: '07:00 UTC',
        url: 'https://example.com/fuel-cycle-qa',
        region: 'NAM',
      },
    ],
    products: [
      {
        name: 'CoreSMR-300',
        company: 'NuCore Systems',
        summary: 'Factory-fabricated reactor package with modular civil footprint.',
        status: 'Pre-licensing stage',
        url: 'https://example.com/coresmr-300',
        region: 'NAM',
      },
      {
        name: 'OutageLens',
        company: 'AtomIQ',
        summary: 'Refueling outage optimization software for legacy fleets.',
        status: 'Commercial release',
        url: 'https://example.com/outagelens',
        region: 'EMEA',
      },
    ],
    startups: [
      {
        name: 'Neutron Forge',
        region: 'Canada',
        event: 'Strategic financing round',
        value: '$75M',
        url: 'https://example.com/neutron-forge-round',
        geography: 'NAM',
      },
      {
        name: 'Helix Isotopes',
        region: 'France',
        event: 'Supply chain partnership announcement',
        value: '3-year fuel agreement',
        url: 'https://example.com/helix-isotopes-partnership',
        geography: 'France',
      },
    ],
    finance: [
      {
        metric: 'Cameco (CCJ)',
        value: '$49.33',
        move: '+1.0%',
        trend: 'up',
        history: [48.1, 48.4, 48.7, 49.0, 49.2, 49.4, 49.5, 49.33],
        region: 'NAM',
      },
      {
        metric: 'Uranium Miners ETF (URA)',
        value: '$31.81',
        move: '+0.8%',
        trend: 'up',
        history: [31.1, 31.2, 31.4, 31.6, 31.7, 31.9, 31.85, 31.81],
        region: 'Global',
      },
      {
        metric: 'BWX Technologies (BWXT)',
        value: '$95.14',
        move: '+0.6%',
        trend: 'up',
        history: [92.8, 93.4, 94.0, 94.5, 94.9, 95.2, 95.4, 95.14],
        region: 'NAM',
      },
      {
        metric: 'Centrus Energy (LEU)',
        value: '$52.26',
        move: '+1.9%',
        trend: 'up',
        history: [48.9, 49.6, 50.2, 50.9, 51.4, 51.9, 52.3, 52.26],
        region: 'NAM',
      },
      {
        metric: 'U3O8 Spot',
        value: '$88.00/lb',
        move: '+0.9%',
        trend: 'up',
        history: [86.2, 86.8, 87.3, 87.9, 88.4, 88.1, 88.0, 88.0],
        region: 'Global',
      },
    ],
    youtubeLive: [
      {
        title: 'Nuclear industry briefs',
        source: 'World Nuclear Association',
        time: 'Live',
        url: 'https://www.youtube.com/@WorldNuclearAssociation',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UC_oY6mQfQm2Mv0vX6fBsUaA',
        region: 'Global',
      },
      {
        title: 'Nuclear & grid explainers',
        source: 'Engineering with Rosie',
        time: 'Channel',
        url: 'https://www.youtube.com/@EngineeringwithRosie',
        region: 'Global',
      },
    ],
    community: [
      {
        platform: 'Reddit',
        topic: 'SMR commercialization timelines and procurement risk',
        activity: '612 comments',
        url: 'https://www.reddit.com/r/nuclear/',
        region: 'Global',
      },
      {
        platform: 'GitHub',
        topic: 'Open-source reactor simulation and neutronics tooling updates',
        activity: '118 discussions',
        url: 'https://github.com/topics/nuclear',
        region: 'Global',
      },
    ],
  },
  {
    slug: 'EV',
    headline: 'EV and V2G momentum grows as fleets electrify and grids tap parked batteries',
    summary: 'OEM launches, charging buildout, and vehicle-to-grid pilots are converging on grid services revenue.',
    latestNews: [
      {
        title: 'Major utility opens V2G tariff for school bus fleets in three states',
        source: 'GridWire',
        time: '09:14 UTC',
        url: 'https://example.com/v2g-school-bus',
        region: 'NAM',
      },
      {
        title: 'OEMs commit to NACS interoperability timeline across EU and APAC',
        source: 'EVTech',
        time: '08:32 UTC',
        url: 'https://example.com/nacs-interoperability',
        region: 'EMEA',
      },
    ],
    techNews: [
      {
        title: 'Bi-directional inverter platform scales from residential to depot fleets',
        source: 'ChargeLab',
        time: '07:58 UTC',
        url: 'https://example.com/bidirectional-platform',
        region: 'NAM',
      },
      {
        title: 'Solid-state cell supplier secures OEM validation for 2027 SUV line',
        source: 'Battery Scope',
        time: '07:21 UTC',
        url: 'https://example.com/solid-state-validation',
        region: 'Japan',
      },
    ],
    products: [
      {
        name: 'GridShare V2G Hub',
        company: 'AmpLink',
        summary: 'Aggregator stack for ISO market bids using EV fleets.',
        status: 'Market pilot',
        url: 'https://example.com/gridshare-v2g',
        region: 'NAM',
      },
      {
        name: 'DriveLoop 350',
        company: 'ChargeNorth',
        summary: 'High-power charger with native ISO 15118-20 support.',
        status: 'Commercial launch',
        url: 'https://example.com/driveloop-350',
        region: 'EMEA',
      },
    ],
    startups: [
      {
        name: 'FleetPulse',
        region: 'US',
        event: 'Series B',
        value: '$52M',
        url: 'https://example.com/fleetpulse-seriesb',
        geography: 'NAM',
      },
      {
        name: 'VoltPort',
        region: 'Germany',
        event: 'V2G utility partnership',
        value: '5-city rollout',
        url: 'https://example.com/voltport-utility',
        geography: 'Germany',
      },
    ],
    finance: [
      {
        metric: 'Tesla (TSLA)',
        value: '$199.12',
        move: '+1.8%',
        trend: 'up',
        history: [191.2, 193.4, 194.8, 196.1, 197.9, 198.6, 199.4, 199.12],
        region: 'NAM',
      },
      {
        metric: 'BYD Co (BYDDY)',
        value: '$53.44',
        move: '+0.9%',
        trend: 'up',
        history: [51.2, 51.9, 52.4, 52.8, 53.1, 53.3, 53.6, 53.44],
        region: 'China',
      },
      {
        metric: 'Li Auto (LI)',
        value: '$34.21',
        move: '+1.1%',
        trend: 'up',
        history: [32.8, 33.1, 33.4, 33.8, 34.0, 34.2, 34.3, 34.21],
        region: 'China',
      },
      {
        metric: 'Rivian (RIVN)',
        value: '$13.77',
        move: '+2.4%',
        trend: 'up',
        history: [12.4, 12.7, 12.9, 13.1, 13.3, 13.5, 13.7, 13.77],
        region: 'NAM',
      },
      {
        metric: 'ChargePoint (CHPT)',
        value: '$2.58',
        move: '+3.1%',
        trend: 'up',
        history: [2.12, 2.18, 2.24, 2.31, 2.36, 2.42, 2.51, 2.58],
        region: 'NAM',
      },
    ],
    youtubeLive: [
      {
        title: 'EV ecosystem & V2G',
        source: 'Fully Charged Show',
        time: 'Channel',
        url: 'https://www.youtube.com/@fullychargedshow',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCB7wAnGW9fXQEEpS5hG1D8g',
        region: 'Global',
      },
      {
        title: 'Charging infra deep dives',
        source: 'Out of Spec Reviews',
        time: 'Channel',
        url: 'https://www.youtube.com/@OutofSpecReviews',
        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCc6JKtmHUrqJq2jKklh1mQA',
        region: 'Global',
      },
    ],
    community: [
      {
        platform: 'Reddit',
        topic: 'Vehicle-to-grid pilots using school buses and depots',
        activity: '742 comments',
        url: 'https://www.reddit.com/r/electricvehicles/',
        region: 'Global',
      },
      {
        platform: 'GitHub',
        topic: 'Open V2G protocol adapter for ISO 15118-20 and OCPP',
        activity: '63 issues',
        url: 'https://github.com/topics/vehicle-to-grid',
        region: 'Global',
      },
    ],
  },
]
