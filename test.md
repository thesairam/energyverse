# EnergyVerse — Testing Plan

Comprehensive testing plan covering every component, source, and functionality for authenticity, accuracy, and diversity.

---

## Table of Contents

1. [Backend API Endpoints](#1-backend-api-endpoints)
2. [Data Source Authenticity](#2-data-source-authenticity)
3. [News Source Quality & Diversity](#3-news-source-quality--diversity)
4. [Financial Data Accuracy](#4-financial-data-accuracy)
5. [Geo Layer Accuracy & Coverage](#5-geo-layer-accuracy--coverage)
6. [YouTube Channel Authenticity](#6-youtube-channel-authenticity)
7. [Scoring Algorithm](#7-scoring-algorithm)
8. [Frontend Components](#8-frontend-components)
9. [Map Functionality](#9-map-functionality)
10. [Search Functionality](#10-search-functionality)
11. [AI Chat (Ollama)](#11-ai-chat-ollama)
12. [WebSocket Real-Time Feed](#12-websocket-real-time-feed)
13. [Region & Country Filtering](#13-region--country-filtering)
14. [Docker & Deployment](#14-docker--deployment)
15. [Cross-Cutting Concerns](#15-cross-cutting-concerns)

---

## 1. Backend API Endpoints

### 1.1 Health Check
```bash
# Should return status:"ok", valid counts, and ISO timestamp
curl -s http://localhost:8788/api/health | python3 -m json.tool
```
| Check | Expected |
|-------|----------|
| `.status` | `"ok"` |
| `.updatedAt` | Valid ISO 8601 timestamp within last 20 min |
| `.layers.plants` | ≥ 40 |
| `.layers.storage` | ≥ 11 |
| `.layers.projects` | ≥ 12 |
| `.layers.hydrogen` | ≥ 11 |
| `.layers.ev` | ≥ 12 |
| `.layers.nuclear` | ≥ 9 |
| `.layers.transmission` | ≥ 8 |
| `.layers.resource` | ≥ 7 |
| `.layers.policy` | ≥ 10 |
| `.events` | ≥ 13 |
| `.sectors` | `8` |

### 1.2 Dashboard Payload
```bash
curl -s http://localhost:8788/api/dashboard | python3 -c "
import json, sys
d = json.load(sys.stdin)
assert len(d['sectorIntel']) == 8, 'Expected 8 sectors'
for s in d['sectorIntel']:
    slug = s['slug']
    assert len(s['latestNews']) >= 5, f'{slug}: latestNews < 5'
    assert len(s['techNews']) >= 3, f'{slug}: techNews < 3'
    assert len(s['products']) >= 1, f'{slug}: products empty'
    assert len(s['startups']) >= 1, f'{slug}: startups empty'
    assert len(s['finance']) >= 3, f'{slug}: finance < 3'
    assert len(s['community']) >= 2, f'{slug}: community < 2'
assert len(d['newsTape']) >= 8, 'newsTape too short'
assert len(d['youtube']) >= 5, 'youtube too few'
print('PASS: dashboard payload complete')
"
```

### 1.3 Single Sector
```bash
# Test each sector slug
for slug in solar wind hydro geothermal storage nuclear ev hydrogen; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8788/api/sector/$slug")
  echo "$slug: $status"
done
# All should return 200
```

### 1.4 Geo Layers
```bash
# All layers at once
curl -s http://localhost:8788/api/geo/all | python3 -c "
import json, sys
d = json.load(sys.stdin)
expected = ['plants','storage','projects','hydrogen','ev','nuclear','policy','transmission','resource']
for layer in expected:
    fc = d[layer]
    assert fc['type'] == 'FeatureCollection', f'{layer}: not FeatureCollection'
    assert len(fc['features']) > 0, f'{layer}: empty features'
    print(f'  {layer}: {len(fc[\"features\"])} features OK')
print('PASS: all geo layers valid')
"

# Single layer
for layer in plants storage projects hydrogen ev nuclear policy transmission resource; do
  count=$(curl -s "http://localhost:8788/api/geo/$layer" | python3 -c "import json,sys; print(len(json.load(sys.stdin)['features']))")
  echo "$layer: $count features"
done
```

### 1.5 Events
```bash
curl -s http://localhost:8788/api/events | python3 -c "
import json, sys
events = json.load(sys.stdin)
assert len(events) >= 13, f'Only {len(events)} events'
sectors_covered = set(e['sector'] for e in events)
expected = {'Solar','Wind','Storage','Hydrogen','Nuclear','EV','Policy'}
assert expected.issubset(sectors_covered), f'Missing sectors: {expected - sectors_covered}'
print(f'PASS: {len(events)} events covering {sectors_covered}')
"
```

### 1.6 YouTube
```bash
# Global
curl -s http://localhost:8788/api/youtube | python3 -c "
import json, sys
vids = json.load(sys.stdin)
assert len(vids) >= 5, f'Only {len(vids)} videos'
print(f'PASS: {len(vids)} global YouTube videos')
"

# Per-sector
for sector in Solar Wind Hydro Geothermal Storage Nuclear EV Hydrogen; do
  count=$(curl -s "http://localhost:8788/api/youtube/$sector" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))")
  echo "$sector: $count videos"
done
```

### 1.7 Force Refresh
```bash
curl -s -X POST http://localhost:8788/api/refresh | python3 -m json.tool
# Should return { "ok": true }
```

### 1.8 Invalid Routes
```bash
# Invalid geo layer
curl -s -o /dev/null -w "%{http_code}" "http://localhost:8788/api/geo/invalid"
# Expected: 400

# Invalid sector
curl -s -o /dev/null -w "%{http_code}" "http://localhost:8788/api/sector/nonexistent"
# Expected: 200 (builds on demand) or 404
```

---

## 2. Data Source Authenticity

### 2.1 Google News RSS Feeds
Each sector has 6–7 queries. Verify each returns valid RSS XML with real articles.

```bash
# Test all 8 sectors × first query
AFTER=$(date -d '-45 days' +%Y-%m-%d)
QUERIES=(
  "solar+photovoltaic+utility+scale+after:$AFTER"
  "offshore+wind+turbine+installation+after:$AFTER"
  "hydropower+dam+project+capacity+after:$AFTER"
  "geothermal+energy+plant+project+after:$AFTER"
  "battery+energy+storage+system+BESS+grid+after:$AFTER"
  "nuclear+power+plant+SMR+small+modular+reactor+after:$AFTER"
  "electric+vehicle+EV+sales+delivery+automaker+after:$AFTER"
  "green+hydrogen+electrolyzer+production+after:$AFTER"
)
SECTORS=(Solar Wind Hydro Geothermal Storage Nuclear EV Hydrogen)

for i in "${!QUERIES[@]}"; do
  count=$(curl -s "https://news.google.com/rss/search?q=${QUERIES[$i]}&hl=en-US&gl=US&ceid=US:en" | grep -c '<item>')
  echo "${SECTORS[$i]}: $count articles"
done
```

**Pass criteria**: Each query returns ≥ 3 articles. Articles are from recognizable energy/news publishers.

### 2.2 NAM-Specific Queries
```bash
AFTER=$(date -d '-45 days' +%Y-%m-%d)
NAM_QUERIES=(
  "solar+farm+USA+IRA+clean+energy+after:$AFTER"
  "US+offshore+wind+Atlantic+project+after:$AFTER"
  "hydropower+USA+Canada+dam+relicensing+after:$AFTER"
  "geothermal+USA+DOE+Fervo+after:$AFTER"
  "battery+storage+USA+California+Texas+IRA+after:$AFTER"
  "nuclear+power+USA+NRC+DOE+advanced+reactor+after:$AFTER"
  "EV+sales+USA+Canada+market+share+after:$AFTER"
  "hydrogen+hub+USA+DOE+clean+energy+after:$AFTER"
)
for i in "${!NAM_QUERIES[@]}"; do
  count=$(curl -s "https://news.google.com/rss/search?q=${NAM_QUERIES[$i]}&hl=en-US&gl=US&ceid=US:en" | grep -c '<item>')
  echo "NAM ${SECTORS[$i]}: $count articles"
done
```

### 2.3 APAC-Specific Queries
```bash
AFTER=$(date -d '-45 days' +%Y-%m-%d)
APAC_QUERIES=(
  "solar+PV+India+China+Japan+capacity+gigawatt+after:$AFTER"
  "wind+farm+China+India+Japan+South+Korea+APAC+after:$AFTER"
  "hydropower+China+India+Southeast+Asia+APAC+after:$AFTER"
  "geothermal+Indonesia+Philippines+Japan+APAC+after:$AFTER"
  "BESS+battery+storage+Australia+Japan+China+APAC+after:$AFTER"
  "nuclear+power+China+India+Japan+South+Korea+APAC+after:$AFTER"
  "electric+vehicle+China+India+Japan+South+Korea+APAC+after:$AFTER"
  "hydrogen+Japan+Australia+India+APAC+export+after:$AFTER"
)
for i in "${!APAC_QUERIES[@]}"; do
  count=$(curl -s "https://news.google.com/rss/search?q=${APAC_QUERIES[$i]}&hl=en-US&gl=US&ceid=US:en" | grep -c '<item>')
  echo "APAC ${SECTORS[$i]}: $count articles"
done
```

### 2.4 Reddit API
```bash
QUERIES=("solar photovoltaic" "wind energy offshore" "hydropower pumped" "geothermal energy" "battery storage BESS" "nuclear energy SMR" "electric vehicles EV" "hydrogen fuel cell")
for q in "${QUERIES[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://www.reddit.com/search.json?q=$q&sort=new&limit=2" -A "EnergyVerseBot/1.0")
  echo "Reddit '$q': HTTP $status"
done
# All should return 200
```

### 2.5 GitHub Issues API
```bash
QUERIES=("solar energy forecasting" "wind power forecasting" "hydropower optimization" "geothermal reservoir" "battery management system" "nuclear reactor simulation" "vehicle to grid V2G" "electrolyzer hydrogen")
for q in "${QUERIES[@]}"; do
  count=$(curl -s "https://api.github.com/search/issues?q=$q&sort=updated&per_page=2" | python3 -c "import json,sys; print(json.load(sys.stdin).get('total_count',0))")
  echo "GitHub '$q': $count total results"
done
# All should return > 0 results
```

### 2.6 Yahoo Finance Tickers
```bash
# All 40 tickers across 8 sectors
TICKERS="FSLR,ENPH,TAN,SEDG,RUN,GEV,FAN,TPIC,NEE,VWSYF,BEP,CWEN,AY,CPKF,ORA,CLNE,NFE,GEO,ALTV,FLNC,TSLA,LIT,STEM,ENS,CCJ,URA,BWXT,LEU,SMR,BYDDY,LI,RIVN,CHPT,PLUG,BE,FCEL,BLDP"

curl -s "https://query1.finance.yahoo.com/v7/finance/quote?symbols=$TICKERS" | python3 -c "
import json, sys
d = json.load(sys.stdin)
results = d.get('quoteResponse', {}).get('result', [])
valid = [r['symbol'] for r in results if 'regularMarketPrice' in r]
invalid = [r['symbol'] for r in results if 'regularMarketPrice' not in r]
print(f'Valid tickers: {len(valid)}/{len(results)}')
if invalid:
    print(f'Missing price data: {invalid}')
"
```

**Pass criteria**: ≥ 35/40 tickers return valid price data. Any failures should be documented and tickers replaced.

---

## 3. News Source Quality & Diversity

### 3.1 Source Extraction Accuracy
```bash
curl -s http://localhost:8788/api/dashboard | python3 -c "
import json, sys
from collections import Counter
d = json.load(sys.stdin)
sources = Counter()
bad_sources = []
for s in d['sectorIntel']:
    for cat in ['latestNews', 'techNews']:
        for n in s.get(cat, []):
            src = n.get('source', '')
            sources[src] += 1
            # Flag if source still shows as domain instead of publisher name
            if src.count('.') >= 2 or src.startswith('http'):
                bad_sources.append((s['slug'], src, n['title'][:50]))

print('=== Top 20 Sources ===')
for src, cnt in sources.most_common(20):
    print(f'  {cnt:3d}  {src}')
print(f'\nTotal unique sources: {len(sources)}')
if bad_sources:
    print(f'\n!!! {len(bad_sources)} items with raw domain sources:')
    for sector, src, title in bad_sources[:5]:
        print(f'  [{sector}] {src} — {title}')
else:
    print('\nPASS: All sources extracted as publisher names')
"
```

**Pass criteria**:
- ≥ 15 unique sources across all sectors
- No sources showing as `news.google.com`
- Sources are recognizable energy/news publishers (PV Tech, Reuters, CleanTechnica, etc.)

### 3.2 Source Diversity per Sector
```bash
curl -s http://localhost:8788/api/dashboard | python3 -c "
import json, sys
d = json.load(sys.stdin)
for s in d['sectorIntel']:
    sources = set()
    for cat in ['latestNews', 'techNews']:
        for n in s.get(cat, []):
            sources.add(n.get('source', ''))
    status = 'PASS' if len(sources) >= 3 else 'WARN'
    print(f'{status} {s[\"slug\"]:12s}: {len(sources)} unique sources')
"
```

**Pass criteria**: Every sector has ≥ 3 unique sources to avoid single-source dependency.

### 3.3 Title Cleanliness
```bash
curl -s http://localhost:8788/api/dashboard | python3 -c "
import json, sys
d = json.load(sys.stdin)
issues = []
for s in d['sectorIntel']:
    for cat in ['latestNews', 'techNews']:
        for n in s.get(cat, []):
            title = n.get('title', '')
            # Title should NOT end with ' - Source Name' (already stripped)
            if ' - ' in title and len(title.split(' - ')[-1]) < 40:
                issues.append((s['slug'], title[:80]))
if issues:
    print(f'WARN: {len(issues)} titles may still have source suffix:')
    for slug, t in issues[:5]:
        print(f'  [{slug}] {t}')
else:
    print('PASS: All titles cleaned (no trailing source names)')
"
```

### 3.4 No Spam / Irrelevant Content
```bash
curl -s http://localhost:8788/api/dashboard | python3 -c "
import json, sys
d = json.load(sys.stdin)
SPAM_WORDS = ['casino', 'crypto', 'bitcoin', 'forex', 'dating', 'weight loss', 'viagra', 'click here']
spam = []
for s in d['sectorIntel']:
    for cat in ['latestNews', 'techNews', 'products', 'startups']:
        for n in s.get(cat, []):
            title = n.get('title', '').lower()
            for word in SPAM_WORDS:
                if word in title:
                    spam.append((s['slug'], word, n['title'][:60]))
if spam:
    print(f'FAIL: {len(spam)} spam items detected:')
    for slug, word, title in spam:
        print(f'  [{slug}] \"{word}\" in: {title}')
else:
    print('PASS: No spam content detected')
"
```

### 3.5 Regional Diversity in News
```bash
curl -s http://localhost:8788/api/dashboard | python3 -c "
import json, sys
d = json.load(sys.stdin)
NAM_TERMS = ['US', 'USA', 'United States', 'American', 'Canada', 'Texas', 'California', 'DOE', 'FERC', 'IRA']
APAC_TERMS = ['China', 'India', 'Japan', 'Korea', 'Australia', 'APAC', 'Asia', 'Southeast Asia', 'ASEAN']
for s in d['sectorIntel']:
    titles = ' '.join(n.get('title','') for cat in ['latestNews','techNews'] for n in s.get(cat,[]))
    nam = sum(1 for t in NAM_TERMS if t in titles)
    apac = sum(1 for t in APAC_TERMS if t in titles)
    status = 'PASS' if nam > 0 and apac > 0 else 'WARN' if nam > 0 or apac > 0 else 'FAIL'
    print(f'{status} {s[\"slug\"]:12s}: NAM mentions={nam}, APAC mentions={apac}')
"
```

**Pass criteria**: Each sector has at least 1 NAM and 1 APAC mention in headlines.

---

## 4. Financial Data Accuracy

### 4.1 Ticker Validity
```bash
curl -s http://localhost:8788/api/dashboard | python3 -c "
import json, sys
d = json.load(sys.stdin)
for s in d['sectorIntel']:
    fin = s.get('finance', [])
    valid = [f for f in fin if f.get('value') and f['value'] != 'n/a']
    print(f'{s[\"slug\"]:12s}: {len(valid)}/{len(fin)} tickers with price data')
    for f in fin:
        trend = f.get('trend', '?')
        assert trend in ('up', 'down', 'flat', '?'), f'Invalid trend: {trend}'
"
```

**Pass criteria**: ≥ 3/5 tickers per sector return valid price data.

### 4.2 Price Sanity
```bash
curl -s http://localhost:8788/api/dashboard | python3 -c "
import json, sys
d = json.load(sys.stdin)
for s in d['sectorIntel']:
    for f in s.get('finance', []):
        price_str = f.get('value', 'n/a')
        if price_str == 'n/a': continue
        price = float(str(price_str).replace('$','').replace(',',''))
        if price <= 0 or price > 100000:
            print(f'WARN {s[\"slug\"]}/{f.get(\"metric\",\"?\")}: suspicious price {price_str}')
print('PASS: price sanity check complete')
"
```

### 4.3 Sparkline History
```bash
curl -s http://localhost:8788/api/dashboard | python3 -c "
import json, sys
d = json.load(sys.stdin)
for s in d['sectorIntel']:
    for f in s.get('finance', []):
        hist = f.get('history', [])
        if len(hist) != 8:
            print(f'WARN {s[\"slug\"]}/{f.get(\"metric\",\"?\")}: history length {len(hist)}, expected 8')
print('PASS: sparkline history check complete')
"
```

---

## 5. Geo Layer Accuracy & Coverage

### 5.1 Coordinate Validity
```bash
curl -s http://localhost:8788/api/geo/all | python3 -c "
import json, sys
d = json.load(sys.stdin)
errors = []
for layer, fc in d.items():
    for f in fc.get('features', []):
        geom = f['geometry']
        if geom['type'] == 'Point':
            lon, lat = geom['coordinates']
            if not (-180 <= lon <= 180 and -90 <= lat <= 90):
                errors.append(f'{layer}/{f[\"properties\"].get(\"title\",\"?\")}: invalid coords [{lat},{lon}]')
        elif geom['type'] == 'LineString':
            for coord in geom['coordinates']:
                if not (-180 <= coord[0] <= 180 and -90 <= coord[1] <= 90):
                    errors.append(f'{layer}: invalid line coord {coord}')
if errors:
    print(f'FAIL: {len(errors)} invalid coordinates:')
    for e in errors[:10]: print(f'  {e}')
else:
    print('PASS: All coordinates valid')
"
```

### 5.2 Regional Distribution
```bash
curl -s http://localhost:8788/api/geo/all | python3 -c "
import json, sys
d = json.load(sys.stdin)
regions = {}
for layer, fc in d.items():
    for f in fc.get('features', []):
        tag = f.get('properties', {}).get('regionTag', 'none')
        regions[tag] = regions.get(tag, 0) + 1

nam = sum(v for k,v in regions.items() if k in ('NAM','USA','Canada'))
apac = sum(v for k,v in regions.items() if k in ('APAC','China','Japan','India','Singapore','Australia'))
emea = sum(v for k,v in regions.items() if k in ('EMEA','UK','Germany','France','Netherlands','Spain','Iceland'))

print(f'NAM:  {nam} facilities')
print(f'APAC: {apac} facilities')
print(f'EMEA: {emea} facilities')
print(f'Other: {sum(regions.values()) - nam - apac - emea}')
print()
for tag, cnt in sorted(regions.items(), key=lambda x: -x[1]):
    print(f'  {tag:15s}: {cnt}')
"
```

**Pass criteria**: NAM ≥ 25, APAC ≥ 30, EMEA ≥ 15.

### 5.3 Sector Diversity in Facilities
```bash
curl -s http://localhost:8788/api/geo/all | python3 -c "
import json, sys
from collections import Counter
d = json.load(sys.stdin)
sectors = Counter()
for layer, fc in d.items():
    for f in fc.get('features', []):
        sector = f.get('properties', {}).get('sector', layer)
        sectors[sector] += 1
for sector, cnt in sectors.most_common():
    print(f'  {sector:15s}: {cnt}')
expected = ['Solar','Wind','Hydro','Geothermal','Storage','Nuclear','EV','Hydrogen','Policy']
for s in expected:
    assert sectors.get(s, 0) >= 2, f'{s}: only {sectors.get(s,0)} facilities'
print('\nPASS: all sectors represented')
"
```

### 5.4 Facility Data Completeness
```bash
curl -s http://localhost:8788/api/geo/all | python3 -c "
import json, sys
d = json.load(sys.stdin)
required_props = ['name', 'sector', 'status']
issues = []
for layer, fc in d.items():
    if layer in ('transmission', 'resource'): continue
    for f in fc.get('features', []):
        props = f.get('properties', {})
        for p in required_props:
            if not props.get(p):
                issues.append(f'{layer}/{props.get(\"name\",\"?\")}: missing {p}')
if issues:
    print(f'WARN: {len(issues)} missing properties:')
    for i in issues[:10]: print(f'  {i}')
else:
    print('PASS: All facilities have required properties')
"
```

### 5.5 Real-World Facility Verification
Spot-check 10 facilities against known data:

| Facility | Expected Location | Expected Capacity |
|----------|-------------------|-------------------|
| Bhadla Solar Park | Rajasthan, India (27.5°N, 71.9°E) | 2,245 MW |
| Three Gorges Dam | Hubei, China (30.8°N, 111.0°E) | 22,500 MW |
| Hornsea One | North Sea, UK (53.9°N, 1.9°E) | 1,218 MW |
| The Geysers | California, USA (38.8°N, 122.8°W) | 725 MW |
| Palo Verde Nuclear | Arizona, USA (33.4°N, 112.9°W) | 3,937 MW |
| Hornsdale Power Reserve | South Australia (-33.1°S, 138.0°E) | 150 MW |
| Tesla Gigafactory Nevada | Sparks, NV (39.5°N, 119.4°W) | — |
| Rotterdam H2Hub | Netherlands (51.9°N, 4.1°E) | 1,000 MW |
| Grand Coulee Dam | Washington, USA (47.9°N, 118.9°W) | 6,809 MW |
| Wayang Windu | Indonesia (-7.2°S, 107.6°E) | 227 MW |

---

## 6. YouTube Channel Authenticity

### 6.1 Global Channel RSS Feeds
```bash
# Test all 8 global channels (from youtube.js GLOBAL_CHANNELS)
CHANNELS=(
  "UC-EZ6mRgHRi7V2mQnU3xxdg:IEA"
  "UCsRswimGttupKwVWa1LNt-Q:IRENA"
  "UChNAU6hC-QOgdQu38MawCnQ:BloombergNEF"
  "UCJosEMbY3NmU-Jz52cTO2Kg:RMI"
  "UCAkVWXKsmZ3EuAaj-3yxFYA:CanaryMedia"
  "UCSUThAoiQIrb5lqUAwbaxfg:CleanTechnica"
  "UCdK2BueKxC9VxXh7e1Ne4oQ:BloombergTV"
  "UCcOIZzJgLCyMPILY7-1Vsdg:Electrek"
)
passed=0
for ch in "${CHANNELS[@]}"; do
  IFS=: read -r id name <<< "$ch"
  count=$(curl -s "https://www.youtube.com/feeds/videos.xml?channel_id=$id" | grep -c '<entry>' 2>/dev/null || echo 0)
  echo "$name ($id): $count videos"
  [[ $count -gt 0 ]] && ((passed++))
done
echo "RSS feeds with content: $passed/8"
```

**Pass criteria**: ≥ 3/8 channels return ≥ 1 video (YouTube RSS availability varies; fallback system covers gaps).

### 6.2 Sector Channel Feeds
```bash
# Spot-check one channel per sector (from youtube.js SECTOR_CHANNELS)
SECTOR_CHANNELS=(
  "UCwyMZZT9OStWV93hdSzNPfw:LONGiSolar"
  "UCjFuSrQZhWBAZsXf8lGbaSQ:GWEC"
  "UCsRswimGttupKwVWa1LNt-Q:IRENA-Hydro"
  "UCSqOWncVIrqAPH2pkPqCxTg:GeothermalRising"
  "UCl9ddWwc4ktM-JVBFglayTQ:CATL"
  "UCgD5A0pDdQemlXUbIUDDkpQ:WNA"
  "UC5WjFrtBdufl6CZojX3D8dQ:Tesla"
  "UCEeRePYoX3YIdovXHtofi8Q:HydrogenCouncil"
)
for ch in "${SECTOR_CHANNELS[@]}"; do
  IFS=: read -r id name <<< "$ch"
  count=$(curl -s "https://www.youtube.com/feeds/videos.xml?channel_id=$id" | grep -c '<entry>' 2>/dev/null || echo 0)
  echo "$name ($id): $count videos"
done
```

### 6.3 API Response Check
```bash
curl -s http://localhost:8788/api/youtube | python3 -c "
import json, sys
vids = json.load(sys.stdin)
for v in vids[:5]:
    assert 'title' in v, 'Missing title'
    assert 'url' in v, 'Missing url'
    assert 'channel' in v, 'Missing channel'
    assert v['url'].startswith('http'), f'Invalid URL: {v[\"url\"]}'
print(f'PASS: {len(vids)} videos with valid structure')
"
```

---

## 7. Scoring Algorithm

### 7.1 Recency Score Buckets
```bash
node -e "
import('./backend/scorer.js').then(m => {
  const now = new Date();
  const tests = [
    [new Date(now - 30*60000), '30min ago', 40],
    [new Date(now - 3*3600000), '3h ago', 35],
    [new Date(now - 12*3600000), '12h ago', 28],
    [new Date(now - 48*3600000), '2d ago', 18],
    [new Date(now - 120*3600000), '5d ago', 10],
    [new Date(now - 240*3600000), '10d ago', 5],
  ];
  for (const [date, label, expected] of tests) {
    const items = m.rankItems([{title:'test', source:'test', time:date.toISOString()}]);
    const score = items[0].score;
    console.log(label + ': score=' + score + ' (expected ~' + expected + ')');
  }
});
"
```

### 7.2 Source Rank Recognition
```bash
node -e "
import('./backend/scorer.js').then(m => {
  const sources = ['Reuters', 'PV Tech', 'CleanTechnica', 'Bloomberg', 'IEA', 'unknown-blog.com'];
  for (const src of sources) {
    const items = m.rankItems([{title:'test', source:src, time:new Date().toISOString()}]);
    console.log(src + ': score=' + items[0].score);
  }
});
"
```

### 7.3 Keyword Boost
```bash
node -e "
import('./backend/scorer.js').then(m => {
  const titles = [
    'Regular energy news update',
    'Record-breaking gigawatt milestone achieved',
    'New SMR approved for commercial operation',
  ];
  for (const title of titles) {
    const items = m.rankItems([{title, source:'test', time:new Date().toISOString()}]);
    console.log(items[0].score + '  ' + title.substring(0, 50));
  }
});
"
```

**Pass criteria**: Keyword-rich titles score higher than generic ones. Tier-1 sources (Reuters, IEA) score higher than unknown sources.

---

## 8. Frontend Components

### 8.1 Component Rendering
Open http://localhost:2700 and verify:

| Component | Check |
|-----------|-------|
| **Map** | CartoDB Dark tiles load, zoom controls visible |
| **Sector tabs** | 8 sector buttons + ALL button rendered |
| **News panel** | 8-panel grid visible (Latest News, Tech, Products, etc.) |
| **Ticker** | Scrolling news tape at bottom |
| **Search** | Input field in topbar responds to typing |
| **AI status** | Shows "AI:ON" (green) or "AI:OFF" (red) |
| **Layer toggles** | 10 checkboxes with labels |
| **Region filter** | Dropdown with 6 regions |
| **Country filter** | Dropdown populated based on region |
| **AI CHAT button** | Amber "AI CHAT" button in tab bar |

### 8.2 Sector Panel Content
For each sector tab, verify all 8 sub-panels have content:

| Sub-panel | Minimum Items |
|-----------|---------------|
| Latest News | ≥ 5 items with title, source, time |
| Tech News | ≥ 3 items |
| Products | ≥ 1 item with name and source |
| Community | ≥ 2 items (Reddit/GitHub links) |
| Finance | ≥ 3 tickers with price and trend |
| Startups | ≥ 1 item |
| Policy | ≥ 1 policy item (may vary by sector) |
| Media | ≥ 1 YouTube video |

### 8.3 Responsive Behavior
| Viewport | Expected |
|----------|----------|
| 1920×1080 | Full layout: map + panels side by side |
| 1366×768 | Panels may stack |
| 768×1024 | Mobile-friendly stacking |

---

## 9. Map Functionality

### 9.1 Layer Rendering
Toggle each layer on/off and verify:

| Layer | Marker Type | Color | Expected Count |
|-------|------------|-------|----------------|
| Plants | CircleMarker | by sector color | ≥ 40 |
| Storage | CircleMarker | cyan | ≥ 11 |
| Projects | CircleMarker | by sector | ≥ 12 |
| Hydrogen | CircleMarker | violet | ≥ 11 |
| EV | CircleMarker | lime | ≥ 12 |
| Nuclear | CircleMarker | red | ≥ 9 |
| Policy | CircleMarker | yellow | ≥ 10 |
| Topics | CircleMarker | white | Varies by news |
| Transmission | Polyline | orange dashed | ≥ 8 lines |
| Resource | Polygon | semi-transparent | ≥ 7 zones |

### 9.2 Popup Content
Click 5 different markers and verify popup shows:
- Facility name
- Sector badge with color
- Type/subtype
- Status
- Capacity (MW) — for applicable facilities
- Owner
- Updated date

### 9.3 Sector Filter on Map
- Click "Solar" tab → only Solar markers + related layers visible
- Click "ALL" → all markers visible
- Click "Nuclear" → only Nuclear markers visible

### 9.4 Region Filter on Map
- Select "EMEA" → map should show only EMEA-tagged facilities
- Select "NAM" → only NAM facilities
- Select "APAC" → only APAC facilities
- Select "Global" → all facilities

---

## 10. Search Functionality

### 10.1 Facility Search
```bash
curl -s "http://localhost:8788/api/search?q=tesla" | python3 -c "
import json, sys
results = json.load(sys.stdin)
assert len(results) > 0, 'No results for tesla'
for r in results[:5]:
    coords = r.get('coords', [None, None])
    print(f'{r.get(\"type\",\"?\")} | {r[\"title\"]} | lat={coords[0] if coords else \"?\"}')
print(f'\nPASS: {len(results)} results for \"tesla\"')
"
```

### 10.2 News Search
```bash
curl -s "http://localhost:8788/api/search?q=solar" | python3 -c "
import json, sys
results = json.load(sys.stdin)
types = set(r.get('type') for r in results)
print(f'Result types: {types}')
assert 'news' in types or 'facility' in types, 'No valid result types'
print(f'PASS: {len(results)} results for \"solar\"')
"
```

### 10.3 Edge Cases
```bash
# Empty query
curl -s "http://localhost:8788/api/search?q=" | python3 -c "import json,sys; print(len(json.load(sys.stdin)), 'results for empty query')"

# Very long query
curl -s "http://localhost:8788/api/search?q=$(python3 -c 'print(\"a\"*500)')" -o /dev/null -w "%{http_code}"

# Special characters
curl -s "http://localhost:8788/api/search?q=%3Cscript%3E" | python3 -c "import json,sys; print(len(json.load(sys.stdin)), 'results for XSS attempt')"
```

### 10.4 UI Search
1. Type "hornsea" → dropdown should show Hornsea One with coords
2. Click result → map flies to location
3. Type "solar" → should show both facilities and news
4. Clear search → dropdown disappears

---

## 11. AI Chat (Ollama)

### 11.1 Status Check
```bash
curl -s http://localhost:8788/api/ai/status | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(f'Available: {d[\"available\"]}')
if d['available']:
    print(f'Model: {d.get(\"model\", \"auto-detect\")}')
    print(f'Models: {d.get(\"models\", [])}')
"
```

### 11.2 Chat Streaming
```bash
curl -s -X POST http://localhost:8788/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is the largest solar farm?"}]}' | head -5
# Should return streaming JSON chunks with "response" field
```

### 11.3 Context Injection
```bash
curl -s http://localhost:8788/api/ai/digest | python3 -c "
import json, sys
d = json.load(sys.stdin)
assert 'context' in d or 'digest' in d or 'summary' in d, 'Missing context'
print('PASS: AI digest endpoint returns context')
"
```

### 11.4 Ollama Unavailable
```bash
# With Ollama stopped, verify graceful degradation
# AI:OFF indicator should show in UI
# Chat should show error message, not crash
```

---

## 12. WebSocket Real-Time Feed

### 12.1 Connection & Hello
```bash
# Using websocat (install: cargo install websocat)
timeout 5 websocat ws://localhost:8788/stream 2>/dev/null | python3 -c "
import json, sys
for line in sys.stdin:
    msg = json.loads(line)
    if msg['type'] == 'hello':
        print(f'Hello received:')
        print(f'  sectorIntel: {len(msg[\"sectorIntel\"])} sectors')
        print(f'  newsTape: {len(msg[\"newsTape\"])} items')
        print(f'  events: {len(msg.get(\"events\", []))} events')
        print('PASS: WebSocket hello received')
        break
"
```

### 12.2 Message Types
After connecting, wait for cron-triggered updates. Expected message types:
- `hello` — on connect
- `sector` — after per-sector refresh (every 5 min)
- `news` — after news tape update
- `geo` — after geo refresh

### 12.3 Auto-Reconnect
1. Start frontend at http://localhost:2700
2. Restart backend server
3. Frontend should auto-reconnect within 5 seconds
4. Data should resume updating

---

## 13. Region & Country Filtering

### 13.1 Region Dropdown
| Region | Expected Countries |
|--------|--------------------|
| Global | All countries |
| EMEA | UK, Germany, France, Netherlands, Spain, etc. (29) |
| NAM | USA, Canada (2) |
| APAC | China, India, Japan, Australia, South Korea, etc. (21) |
| LATAM | Brazil, Chile, Mexico, etc. (13) |
| MEA | Saudi Arabia, UAE, South Africa, etc. (26) |

### 13.2 Filter Application
Select each region and verify:
- Sector panels filter news by region tag
- Map markers filter by region
- Country dropdown updates with relevant countries

### 13.3 Country Filter
Select "NAM" → "USA" → verify only US-tagged content shows.

---

## 14. Docker & Deployment

### 14.1 Docker Build
```bash
cd /path/to/energyverse
docker compose build 2>&1 | tail -20
# Both services should build without errors
```

### 14.2 Docker Run
```bash
docker compose up -d
sleep 15

# Health check
curl -s http://localhost:8789/api/health | python3 -m json.tool

# Web UI accessible
curl -s -o /dev/null -w "%{http_code}" http://localhost:8081
# Expected: 200

# API proxy through nginx
curl -s http://localhost:8081/api/health | python3 -m json.tool

# WebSocket through nginx
timeout 5 websocat ws://localhost:8081/stream 2>/dev/null | head -1

docker compose down
```

### 14.3 Container Isolation
```bash
docker compose up -d
# API should NOT be accessible on port 8788 from host (only 8789 mapped)
# Web should serve on 8081

# Verify services can communicate via internal network
docker exec energyverse-web wget -qO- http://api:8788/api/health
docker compose down
```

### 14.4 Nginx Configuration
| Path | Behavior |
|------|----------|
| `/` | Serves SPA `index.html` |
| `/api/*` | Proxied to backend |
| `/stream` | WebSocket upgrade to backend |
| `/*.js`, `/*.css` | Served with 1-year cache |
| `/nonexistent` | Falls back to `index.html` |

---

## 15. Cross-Cutting Concerns

### 15.1 Error Handling
| Scenario | Expected |
|----------|----------|
| Backend down | Frontend shows cached data or loading state |
| RSS feed timeout | Sector falls back to cached/seed data |
| Yahoo Finance down | Finance panel shows "—" for price |
| Reddit rate limited | Community panel shows fewer items |
| Ollama offline | AI:OFF indicator, chat shows error |

### 15.2 Performance
```bash
# API response time
for endpoint in health dashboard "geo/all" "search?q=solar" events youtube; do
  time=$(curl -s -o /dev/null -w "%{time_total}" "http://localhost:8788/api/$endpoint")
  echo "$endpoint: ${time}s"
done
# All should respond in < 2s (cached data)
```

### 15.3 Security
| Check | Test |
|-------|------|
| XSS in search | `curl "http://localhost:8788/api/search?q=<script>alert(1)</script>"` — no HTML in response |
| SQL injection | N/A (no SQL database) |
| SSRF via chat | Chat proxies only to configured Ollama URL |
| Rate limiting | Not implemented — document as known gap |
| CORS | Check headers on API responses |

### 15.4 OFFLINE_MODE
```bash
OFFLINE_MODE=1 node backend/index.js &
sleep 3
curl -s http://localhost:8788/api/dashboard | python3 -c "
import json, sys
d = json.load(sys.stdin)
assert len(d['sectorIntel']) == 8, 'Should have 8 sectors in offline mode'
for s in d['sectorIntel']:
    assert len(s['latestNews']) >= 1, f'{s[\"slug\"]}: no offline news'
print('PASS: Offline mode provides fallback data')
"
kill %1
```

### 15.5 Cron Schedules
```bash
# After server runs for 20 minutes, check logs for:
# - Full refresh at */15 mark
# - YouTube refresh at */30 mark
# - Per-sector staggered refreshes at */5 marks
```

---

## Test Execution Summary

| Category | Tests | Priority |
|----------|-------|----------|
| API Endpoints | 14 | P0 — Critical |
| Data Source Authenticity | 12 | P0 — Critical |
| News Quality & Diversity | 10 | P0 — Critical |
| Financial Data | 6 | P1 — High |
| Geo Layers | 10 | P1 — High |
| YouTube Channels | 6 | P1 — High |
| Scoring Algorithm | 6 | P2 — Medium |
| Frontend Components | 12 | P1 — High |
| Map Functionality | 8 | P1 — High |
| Search | 8 | P1 — High |
| AI Chat | 6 | P2 — Medium |
| WebSocket | 4 | P1 — High |
| Region Filtering | 6 | P2 — Medium |
| Docker | 8 | P1 — High |
| Cross-Cutting | 10 | P2 — Medium |
| **Total** | **~126** | |

### Running All Automated Tests
```bash
# Quick smoke test (< 1 min)
bash -c '
  echo "=== Health ===" && curl -sf http://localhost:8788/api/health | python3 -m json.tool
  echo "=== Dashboard ===" && curl -sf http://localhost:8788/api/dashboard | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"{len(d['sectorIntel'])} sectors, {len(d['newsTape'])} tape, {len(d['youtube'])} yt\")"
  echo "=== Geo ===" && curl -sf http://localhost:8788/api/geo/all | python3 -c "import json,sys; d=json.load(sys.stdin); [print(f\"  {k}: {len(v['features'])}\") for k,v in d.items()]"
  echo "=== Search ===" && curl -sf "http://localhost:8788/api/search?q=solar" | python3 -c "import json,sys; print(f\"{len(json.load(sys.stdin))} results\")"
  echo "=== YouTube ===" && curl -sf http://localhost:8788/api/youtube | python3 -c "import json,sys; print(f\"{len(json.load(sys.stdin))} videos\")"
  echo "=== AI Status ===" && curl -sf http://localhost:8788/api/ai/status | python3 -m json.tool
  echo "=== DONE ==="
'
```
