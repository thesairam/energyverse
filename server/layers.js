/**
 * server/layers.js
 * Static geo seed data – real named facilities, plants, projects
 * All coordinates are [lat, lon] following the app convention
 * toPointFeature converts to GeoJSON [lon, lat]
 */

export const layers = {
  plants: [
    // ── Wind ──────────────────────────────────────────────────────────────
    { id: 'plant-wind-uk-hornsea', name: 'Hornsea One', lat: 53.9, lon: 1.9, sector: 'Wind', subtype: 'Offshore WF', capacityMW: 1218, status: 'Operating', owner: 'Ørsted', updatedAt: '2026-03-01', regionTag: 'UK' },
    { id: 'plant-wind-uk-dogger', name: 'Dogger Bank A', lat: 54.7, lon: 2.3, sector: 'Wind', subtype: 'Offshore WF', capacityMW: 1200, status: 'Commissioning', owner: 'SSE/Equinor', updatedAt: '2026-03-01', regionTag: 'UK' },
    { id: 'plant-wind-texas-permian', name: 'Permian Basin Wind', lat: 31.5, lon: -102.5, sector: 'Wind', subtype: 'Onshore WF', capacityMW: 3000, status: 'Operating', owner: 'NextEra', updatedAt: '2026-02-28', regionTag: 'NAM' },
    { id: 'plant-wind-germany-north', name: 'NordSee Ost', lat: 54.4, lon: 7.7, sector: 'Wind', subtype: 'Offshore WF', capacityMW: 295, status: 'Operating', owner: 'RWE', updatedAt: '2026-02-20', regionTag: 'Germany' },
    { id: 'plant-wind-china-offshore', name: 'Rudong Offshore', lat: 32.6, lon: 121.3, sector: 'Wind', subtype: 'Offshore WF', capacityMW: 800, status: 'Operating', owner: 'CGNPC', updatedAt: '2026-02-15', regionTag: 'China' },
    // ── Solar ──────────────────────────────────────────────────────────────
    { id: 'plant-solar-india-bhadla', name: 'Bhadla Solar Park', lat: 27.5, lon: 71.9, sector: 'Solar', subtype: 'Utility PV', capacityMW: 2245, status: 'Operating', owner: 'NTPC/Adani', updatedAt: '2026-03-01', regionTag: 'India' },
    { id: 'plant-solar-xinjiang-hami', name: 'Hami Solar Base', lat: 42.8, lon: 93.5, sector: 'Solar', subtype: 'Utility PV', capacityMW: 5000, status: 'Operating', owner: 'CGN', updatedAt: '2026-02-28', regionTag: 'China' },
    { id: 'plant-solar-us-copper-mtn', name: 'Copper Mountain Solar', lat: 35.7, lon: -114.9, sector: 'Solar', subtype: 'Utility PV', capacityMW: 816, status: 'Operating', owner: 'Sempra', updatedAt: '2026-02-25', regionTag: 'NAM' },
    { id: 'plant-solar-es-nunez', name: 'Núñez de Balboa', lat: 38.4, lon: -6.5, sector: 'Solar', subtype: 'Utility PV', capacityMW: 500, status: 'Operating', owner: 'Iberdrola', updatedAt: '2026-02-20', regionTag: 'EMEA' },
    // ── Hydro ──────────────────────────────────────────────────────────────
    { id: 'plant-hydro-three-gorges', name: 'Three Gorges Dam', lat: 30.8, lon: 111.0, sector: 'Hydro', subtype: 'Run-of-river', capacityMW: 22500, status: 'Operating', owner: 'CTGC', updatedAt: '2026-01-15', regionTag: 'China' },
    { id: 'plant-hydro-itaipu', name: 'Itaipu Binacional', lat: -25.4, lon: -54.6, sector: 'Hydro', subtype: 'Reservoir', capacityMW: 14000, status: 'Operating', owner: 'Brazil/Paraguay', updatedAt: '2026-01-10', regionTag: 'NAM' },
    { id: 'plant-hydro-bc', name: 'Peace River Hydro', lat: 56.0, lon: -122.7, sector: 'Hydro', subtype: 'Reservoir hydro', capacityMW: 2730, status: 'Operating', owner: 'BC Hydro', updatedAt: '2026-02-10', regionTag: 'NAM' },
    // ── Geothermal ─────────────────────────────────────────────────────────
    { id: 'plant-geo-iceland-hs', name: 'Hellisheiði Power', lat: 64.0, lon: -21.4, sector: 'Geothermal', subtype: 'Flash steam', capacityMW: 303, status: 'Operating', owner: 'ON Power', updatedAt: '2026-01-20', regionTag: 'EMEA' },
    { id: 'plant-geo-us-geysers', name: 'The Geysers', lat: 38.8, lon: -122.8, sector: 'Geothermal', subtype: 'Dry steam', capacityMW: 725, status: 'Operating', owner: 'Calpine Corp', updatedAt: '2026-01-25', regionTag: 'NAM' },
    { id: 'plant-geo-nz-wairakei', name: 'Wairakei Power Station', lat: -38.6, lon: 176.1, sector: 'Geothermal', subtype: 'Flash steam', capacityMW: 116, status: 'Operating', owner: 'Contact Energy', updatedAt: '2026-01-18', regionTag: 'APAC' },
    // ── Nuclear ────────────────────────────────────────────────────────────
    { id: 'plant-nuc-hinkley', name: 'Hinkley Point C', lat: 51.2, lon: -3.1, sector: 'Nuclear', subtype: 'EPR', capacityMW: 3200, status: 'Under construction', owner: 'EDF', updatedAt: '2026-03-02', regionTag: 'UK' },
    { id: 'plant-nuc-france-flamanville', name: 'Flamanville-3 EPR', lat: 49.5, lon: -1.9, sector: 'Nuclear', subtype: 'EPR', capacityMW: 1630, status: 'Commissioning', owner: 'EDF', updatedAt: '2026-02-28', regionTag: 'France' },
    { id: 'plant-nuc-us-vogtle', name: 'Vogtle Unit 4', lat: 33.1, lon: -81.8, sector: 'Nuclear', subtype: 'AP1000', capacityMW: 1117, status: 'Commissioning', owner: 'Georgia Power', updatedAt: '2026-03-01', regionTag: 'NAM' },
    { id: 'plant-nuc-china-haiyang', name: 'Haiyang AP1000', lat: 36.7, lon: 121.5, sector: 'Nuclear', subtype: 'AP1000', capacityMW: 2500, status: 'Operating', owner: 'SNPTC', updatedAt: '2026-02-20', regionTag: 'China' },
  ],

  storage: [
    { id: 'bess-aus-hornsdale', name: 'Hornsdale Power Reserve', lat: -33.1, lon: 138.0, sector: 'Storage', subtype: 'Li-ion BESS', capacityMW: 150, status: 'Operating', owner: 'Neoen/Tesla', updatedAt: '2026-02-28', regionTag: 'APAC' },
    { id: 'bess-uk-minety', name: 'Minety BESS', lat: 51.7, lon: -2.0, sector: 'Storage', subtype: 'Li-ion BESS', capacityMW: 350, status: 'Operating', owner: 'Harmony Energy', updatedAt: '2026-03-01', regionTag: 'UK' },
    { id: 'bess-ca-elkhorn', name: 'Elkhorn Battery', lat: 36.6, lon: -121.6, sector: 'Storage', subtype: 'Li-ion BESS', capacityMW: 182, status: 'Operating', owner: 'Vistra', updatedAt: '2026-02-27', regionTag: 'NAM' },
    { id: 'bess-texas-moss-landing', name: 'Moss Landing Phase 2', lat: 36.8, lon: -121.8, sector: 'Storage', subtype: 'Li-ion BESS', capacityMW: 300, status: 'Operating', owner: 'Monterey Bay', updatedAt: '2026-02-22', regionTag: 'NAM' },
    { id: 'bess-de-schwerin', name: 'Schwerin Flywheel', lat: 53.6, lon: 11.4, sector: 'Storage', subtype: 'Flywheel', capacityMW: 50, status: 'Operating', owner: 'Statkraft DE', updatedAt: '2026-02-15', regionTag: 'Germany' },
    { id: 'bess-cn-hubei-psps', name: 'Hubei Pumped Hydro', lat: 30.9, lon: 113.0, sector: 'Storage', subtype: 'Pumped hydro', capacityMW: 2400, status: 'Construction', owner: 'Three Gorges Corp', updatedAt: '2026-02-25', regionTag: 'China' },
    { id: 'bess-uk-humber', name: 'Humber Flow Battery', lat: 53.7, lon: -0.4, sector: 'Storage', subtype: 'Flow battery', capacityMW: 100, status: 'Construction', owner: 'Humber Storage Co', updatedAt: '2026-02-27', regionTag: 'UK' },
  ],

  projects: [
    { id: 'proj-wind-us-vineyard', name: 'Vineyard Wind 1', lat: 41.4, lon: -70.8, sector: 'Wind', subtype: 'Offshore WF', capacityMW: 806, status: 'Under construction', owner: 'Avangrid/CIP', updatedAt: '2026-03-02', regionTag: 'NAM' },
    { id: 'proj-solar-india-gujarat', name: 'Khavda RE Park', lat: 23.8, lon: 68.5, sector: 'Solar', subtype: 'Utility PV', capacityMW: 30000, status: 'Under construction', owner: 'Adani Green', updatedAt: '2026-03-01', regionTag: 'India' },
    { id: 'proj-wind-de-he-dreieck', name: 'He Dreieck Wind', lat: 52.2, lon: 8.6, sector: 'Wind', subtype: 'Onshore WF', capacityMW: 120, status: 'Permitted', owner: 'EnBW', updatedAt: '2026-02-26', regionTag: 'Germany' },
    { id: 'proj-solar-es-helios-east', name: 'Helios East', lat: 39.3, lon: -1.9, sector: 'Solar', subtype: 'Utility PV', capacityMW: 500, status: 'Permitted', owner: 'Iberdrola', updatedAt: '2026-02-26', regionTag: 'EMEA' },
    { id: 'proj-wind-nz-clutha', name: 'Clutha Wind Farm', lat: -46.0, lon: 169.4, sector: 'Wind', subtype: 'Onshore WF', capacityMW: 240, status: 'Under construction', owner: 'Mercury NZ', updatedAt: '2026-02-20', regionTag: 'APAC' },
    { id: 'proj-nuc-us-smr-idaho', name: 'Nuscale CFPP', lat: 43.5, lon: -112.0, sector: 'Nuclear', subtype: 'SMR', capacityMW: 462, status: 'FEED', owner: 'NuScale/UAMPS', updatedAt: '2026-03-01', regionTag: 'NAM' },
    { id: 'proj-solar-sa-neom', name: 'NEOM Solar Array', lat: 28.0, lon: 35.2, sector: 'Solar', subtype: 'Utility PV', capacityMW: 4800, status: 'Development', owner: 'NEOM/ACWA', updatedAt: '2026-02-28', regionTag: 'EMEA' },
  ],

  hydrogen: [
    { id: 'h2-rotterdam-port', name: 'Rotterdam H2Hub', lat: 51.9, lon: 4.1, sector: 'Hydrogen', subtype: 'Green H2 hub', capacityMW: 1000, status: 'Development', owner: 'Shell/Port Rotterdam', updatedAt: '2026-03-01', regionTag: 'Netherlands' },
    { id: 'h2-germany-rhine', name: 'RhineGreen Hub', lat: 50.9, lon: 6.9, sector: 'Hydrogen', subtype: 'Green H2 hub', capacityMW: 200, status: 'Construction', owner: 'RhineGreen', updatedAt: '2026-02-29', regionTag: 'Germany' },
    { id: 'h2-chile-atacama', name: 'AustriaHydr Atacama', lat: -24.0, lon: -70.1, sector: 'Hydrogen', subtype: 'Green H2 export', capacityMW: 800, status: 'Development', owner: 'Enertrag/HIF', updatedAt: '2026-02-25', regionTag: 'NAM' },
    { id: 'h2-japan-jera', name: 'JERA Ammonia Co-firing', lat: 34.8, lon: 136.9, sector: 'Hydrogen', subtype: 'Ammonia terminal', capacityMW: 600, status: 'Approved', owner: 'JERA', updatedAt: '2026-02-22', regionTag: 'Japan' },
    { id: 'h2-us-gulf', name: 'Gulf Coast Electrolyzer', lat: 29.7, lon: -95.2, sector: 'Hydrogen', subtype: 'Electrolyzer', capacityMW: 120, status: 'Development', owner: 'GC Hydrogen LLC', updatedAt: '2026-02-25', regionTag: 'NAM' },
    { id: 'h2-india-green', name: 'NTPC Green H2 Pilot', lat: 23.0, lon: 72.5, sector: 'Hydrogen', subtype: 'Green H2 pilot', capacityMW: 50, status: 'Construction', owner: 'NTPC', updatedAt: '2026-02-20', regionTag: 'India' },
    { id: 'h2-aus-pilbara', name: 'Pilbara H2 Export', lat: -23.8, lon: 118.0, sector: 'Hydrogen', subtype: 'Green H2 export', capacityMW: 5000, status: 'Development', owner: 'ATCO/Woodside', updatedAt: '2026-02-18', regionTag: 'APAC' },
  ],

  ev: [
    { id: 'ev-tesla-gigafactory-nevada', name: 'Tesla Gigafactory Nevada', lat: 39.5, lon: -119.4, sector: 'EV', subtype: 'Gigafactory', capacityMW: 0, status: 'Operating', owner: 'Tesla', updatedAt: '2026-03-01', regionTag: 'NAM' },
    { id: 'ev-catl-thuringia', name: 'CATL Erfurt Gigafactory', lat: 50.9, lon: 11.0, sector: 'EV', subtype: 'Cell manufacturing', capacityMW: 0, status: 'Operating', owner: 'CATL', updatedAt: '2026-02-28', regionTag: 'Germany' },
    { id: 'ev-northvolt-skelleftea', name: 'Northvolt Ett', lat: 64.7, lon: 20.9, sector: 'EV', subtype: 'Cell manufacturing', capacityMW: 0, status: 'Operating', owner: 'Northvolt', updatedAt: '2026-02-25', regionTag: 'EMEA' },
    { id: 'ev-v2g-uk', name: 'Northern Buses V2G', lat: 53.5, lon: -1.5, sector: 'EV', subtype: 'Depot V2G pilot', capacityMW: 12, status: 'Pilot', owner: 'Northern Buses', updatedAt: '2026-03-03', regionTag: 'UK' },
    { id: 'ev-byd-shenzhen', name: 'BYD Shenzhen Factory', lat: 22.6, lon: 114.1, sector: 'EV', subtype: 'Gigafactory', capacityMW: 0, status: 'Operating', owner: 'BYD', updatedAt: '2026-02-20', regionTag: 'China' },
    { id: 'ev-sg-comfortdelgro', name: 'ComfortDelGro Fleet Depot', lat: 1.33, lon: 103.85, sector: 'EV', subtype: 'Fleet depot V2G', capacityMW: 8, status: 'Pilot', owner: 'ComfortDelGro', updatedAt: '2026-02-22', regionTag: 'Singapore' },
  ],

  nuclear: [
    { id: 'nuc-smr-us-idaho-demo', name: 'Idaho SMR Demo', lat: 43.6, lon: -112.0, sector: 'Nuclear', subtype: 'SMR demo', capacityMW: 300, status: 'FEED', owner: 'Idaho SMR', updatedAt: '2026-03-03', regionTag: 'NAM' },
    { id: 'nuc-gen4-france', name: 'HexaNuke Gen IV', lat: 46.5, lon: 2.6, sector: 'Nuclear', subtype: 'Gen IV pilot', capacityMW: 150, status: 'Concept', owner: 'HexaNuke', updatedAt: '2026-02-20', regionTag: 'France' },
    { id: 'nuc-china-sanmen', name: 'Sanmen Nuclear AP1000', lat: 29.1, lon: 121.7, sector: 'Nuclear', subtype: 'AP1000', capacityMW: 2500, status: 'Operating', owner: 'SNPTC', updatedAt: '2026-02-12', regionTag: 'China' },
    { id: 'nuc-canada-ontario-refurb', name: 'Darlington Refurbishment', lat: 43.9, lon: -78.7, sector: 'Nuclear', subtype: 'CANDU refurb', capacityMW: 3512, status: 'Under construction', owner: 'OPG', updatedAt: '2026-02-28', regionTag: 'NAM' },
    { id: 'nuc-uk-sizewell-c', name: 'Sizewell C EPR', lat: 52.2, lon: 1.6, sector: 'Nuclear', subtype: 'EPR', capacityMW: 3200, status: 'Approved', owner: 'EDF/HMG', updatedAt: '2026-03-01', regionTag: 'UK' },
  ],

  policy: [
    { id: 'policy-eu-flex', name: 'EU Flexibility Act', lat: 50.8, lon: 4.4, sector: 'Policy', subtype: 'Grid flexibility', status: 'Effective', owner: 'EU Commission', updatedAt: '2026-03-02', regionTag: 'EMEA' },
    { id: 'policy-us-ancillary', name: 'FERC Ancillary Reform', lat: 38.9, lon: -77.0, sector: 'Policy', subtype: 'Grid policy', status: 'Filed', owner: 'FERC', updatedAt: '2026-02-28', regionTag: 'NAM' },
    { id: 'policy-india-solar-pli', name: 'India Solar PLI Round 2', lat: 28.6, lon: 77.2, sector: 'Policy', subtype: 'Manufacturing subsidy', status: 'Active', owner: 'MNRE', updatedAt: '2026-03-01', regionTag: 'India' },
    { id: 'policy-uk-cfd-ar6', name: 'UK CfD Allocation Round 6', lat: 51.5, lon: -0.12, sector: 'Policy', subtype: 'Auction', status: 'Active', owner: 'DESNZ', updatedAt: '2026-03-03', regionTag: 'UK' },
    { id: 'policy-cn-ets', name: 'China ETS Phase 3', lat: 39.9, lon: 116.4, sector: 'Policy', subtype: 'Carbon market', status: 'Effective', owner: 'MEE', updatedAt: '2026-02-25', regionTag: 'China' },
    { id: 'policy-us-ira-storage', name: 'IRA Storage ITC Rules', lat: 37.0, lon: -95.0, sector: 'Policy', subtype: 'Tax credit', status: 'Active', owner: 'IRS/DOE', updatedAt: '2026-02-20', regionTag: 'NAM' },
  ],

  transmission: [
    { id: 'tx-nsea-grid', name: 'North Sea Grid Link', path: [[55, 5], [56, 3], [57, 0], [56, -2], [55, -3]], capacityMW: 2000, status: 'Approved', updatedAt: '2026-03-01' },
    { id: 'tx-us-east-hvdc', name: 'US East Coast HVDC', path: [[40, -74], [39, -77], [38, -80], [36, -82]], capacityMW: 3000, status: 'Development', updatedAt: '2026-02-28' },
    { id: 'tx-uk-nl-intertie', name: 'BritNed Interconnector', path: [[51.9, 1.3], [52.1, 2.5], [52.4, 3.5], [51.9, 4.2]], capacityMW: 1800, status: 'Operational', updatedAt: '2026-02-21' },
    { id: 'tx-hu-balkan', name: 'Balkans HVDC', path: [[47.5, 19.0], [46.1, 17.3], [45.2, 15.9], [43.8, 20.4]], capacityMW: 1000, status: 'Approved', updatedAt: '2026-02-18' },
  ],

  resource: [
    { id: 'res-sahara-solar', ring: [[30, -5], [30, 30], [15, 30], [15, -5], [30, -5]], metric: 'Solar DNI', value: '>6 kWh/m²/d', updatedAt: '2026-03-01' },
    { id: 'res-north-sea-wind', ring: [[51, -4], [51, 8], [57, 8], [57, -4], [51, -4]], metric: 'Wind Speed', value: '>9 m/s mean', updatedAt: '2026-03-01' },
    { id: 'res-patagonia-wind', ring: [[-40, -70], [-40, -60], [-55, -60], [-55, -70], [-40, -70]], metric: 'Wind Speed', value: '>10 m/s mean', updatedAt: '2026-02-28' },
  ],
}

export const events = [
  { id: 'evt-1', layer: 'plants', sector: 'Solar', title: 'Khavda RE Park milestone: first 5 GW energised', updatedAt: '2026-03-01T08:00:00Z', lat: 23.8, lon: 68.5 },
  { id: 'evt-2', layer: 'storage', sector: 'Storage', title: 'Minety BESS completes primary frequency response contract', updatedAt: '2026-03-01T06:30:00Z', lat: 51.7, lon: -2.0 },
  { id: 'evt-3', layer: 'hydrogen', sector: 'Hydrogen', title: 'Rotterdam H2Hub announces €2 bn Phase 1 FID', updatedAt: '2026-03-02T18:15:00Z', lat: 51.9, lon: 4.1 },
  { id: 'evt-4', layer: 'ev', sector: 'EV', title: 'Northern Buses V2G fleet expands to 200 vehicles', updatedAt: '2026-03-03T09:10:00Z', lat: 53.5, lon: -1.5 },
  { id: 'evt-5', layer: 'nuclear', sector: 'Nuclear', title: 'Vogtle Unit 4 reaches commercial operation', updatedAt: '2026-03-02T14:30:00Z', lat: 33.1, lon: -81.8 },
  { id: 'evt-6', layer: 'projects', sector: 'Wind', title: 'Vineyard Wind 1 installs first monopile foundation', updatedAt: '2026-03-03T11:00:00Z', lat: 41.4, lon: -70.8 },
  { id: 'evt-7', layer: 'policy', sector: 'Policy', title: 'UK CfD AR6 results: 6.7 GW solar/wind cleared', updatedAt: '2026-03-03T14:00:00Z', lat: 51.5, lon: -0.12 },
]
