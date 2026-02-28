import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  type LinkItem,
  type NewsItem,
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

function App() {
  const lastUpdated = useMemo(() => new Date().toUTCString(), [])
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('offline')
  const [liveNewsTape, setLiveNewsTape] = useState<NewsItem[]>(seedNewsTape)
  const [liveSectorIntel, setLiveSectorIntel] = useState<SectorIntel[]>(seedSectorIntel)
  const [activeSector, setActiveSector] = useState<SectorIntel['slug']>('Solar')
  const [activeSubPage, setActiveSubPage] = useState<
    'overview' | 'latest' | 'tech' | 'products' | 'startups' | 'finance' | 'youtube' | 'community'
  >('overview')

  const trending = ['Solar', 'Wind', 'Hydro', 'Geothermal', 'Nuclear', 'Storage']

  useEffect(() => {
    if (!liveSectorIntel.find((sector) => sector.slug === activeSector) && liveSectorIntel.length > 0) {
      setActiveSector(liveSectorIntel[0].slug)
    }
  }, [activeSector, liveSectorIntel])

  useEffect(() => {
    setActiveSubPage('overview')
  }, [activeSector])

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
          setLiveSectorIntel(payload.sectorIntel)
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

  const selectedSector = liveSectorIntel.find((sector) => sector.slug === activeSector) || liveSectorIntel[0]
  const featuredVideo = selectedSector?.youtubeLive
    ?.map((item) => ({ item, embed: getYouTubeEmbedUrl(item) }))
    .find((entry) => entry.embed)

  return (
    <div className="dashboard-shell">
      <header className="topbar panel">
        <div>
          <p className="eyebrow">EnergyVerse Monitor</p>
          <h1>Renewables & Nuclear Intelligence Console</h1>
        </div>
        <div className="topbar-right">
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
          {liveSectorIntel.map((sector) => (
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

        {selectedSector && (
          <article key={selectedSector.slug} className="sector-panel">
            <div className="subpage-tabs" role="tablist" aria-label="Sector sub pages">
              <button
                className={`subpage-tab ${activeSubPage === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveSubPage('overview')}
                type="button"
              >
                Overview
              </button>
              <button
                className={`subpage-tab ${activeSubPage === 'latest' ? 'active' : ''}`}
                onClick={() => setActiveSubPage('latest')}
                type="button"
              >
                Latest News
              </button>
              <button
                className={`subpage-tab ${activeSubPage === 'tech' ? 'active' : ''}`}
                onClick={() => setActiveSubPage('tech')}
                type="button"
              >
                Tech News
              </button>
              <button
                className={`subpage-tab ${activeSubPage === 'products' ? 'active' : ''}`}
                onClick={() => setActiveSubPage('products')}
                type="button"
              >
                Products
              </button>
              <button
                className={`subpage-tab ${activeSubPage === 'startups' ? 'active' : ''}`}
                onClick={() => setActiveSubPage('startups')}
                type="button"
              >
                Startups
              </button>
              <button
                className={`subpage-tab ${activeSubPage === 'finance' ? 'active' : ''}`}
                onClick={() => setActiveSubPage('finance')}
                type="button"
              >
                Finance
              </button>
              <button
                className={`subpage-tab ${activeSubPage === 'youtube' ? 'active' : ''}`}
                onClick={() => setActiveSubPage('youtube')}
                type="button"
              >
                YouTube
              </button>
              <button
                className={`subpage-tab ${activeSubPage === 'community' ? 'active' : ''}`}
                onClick={() => setActiveSubPage('community')}
                type="button"
              >
                Community
              </button>
            </div>

            <div className="sector-header">
              <div>
                <p className="sector-label">{selectedSector.slug}</p>
                <h3>{selectedSector.headline}</h3>
              </div>
              <p>{selectedSector.summary}</p>
            </div>

            <div className="sector-grid">
              {(activeSubPage === 'overview' || activeSubPage === 'latest') && (
                <section className="sector-card">
                <h4>Latest News</h4>
                <ul>
                  {selectedSector.latestNews.map((item) => (
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
                </section>
              )}

              {(activeSubPage === 'overview' || activeSubPage === 'tech') && (
                <section className="sector-card">
                <h4>Tech News</h4>
                <ul>
                  {selectedSector.techNews.map((item) => (
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
                </section>
              )}

              {(activeSubPage === 'overview' || activeSubPage === 'products') && (
                <section className="sector-card">
                <h4>New Products</h4>
                <ul>
                  {selectedSector.products.map((item) => (
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
                </section>
              )}

              {(activeSubPage === 'overview' || activeSubPage === 'startups') && (
                <section className="sector-card">
                <h4>Startup Radar</h4>
                <ul>
                  {selectedSector.startups.map((item) => (
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
                </section>
              )}

              {(activeSubPage === 'overview' || activeSubPage === 'finance') && (
                <section className="sector-card">
                <h4>Finance & Stocks</h4>
                <ul>
                  {selectedSector.finance.map((item) => (
                    <li key={item.metric}>
                      <p>{item.metric}</p>
                      <strong>{item.value}</strong>
                      <span className={item.trend}>{item.move}</span>
                    </li>
                  ))}
                </ul>
                </section>
              )}

              {(activeSubPage === 'overview' || activeSubPage === 'youtube') && (
                <section className="sector-card sector-card-video">
                <h4>YouTube Live</h4>
                {featuredVideo?.embed ? (
                  <div className="video-wrap">
                    <iframe
                      src={featuredVideo.embed}
                      title={`${selectedSector.slug} live video`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <p className="video-fallback">No embeddable stream in current feed. Use links below.</p>
                )}
                <ul>
                  {selectedSector.youtubeLive.map((item) => (
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
                </section>
              )}

              {(activeSubPage === 'overview' || activeSubPage === 'community') && (
                <section className="sector-card">
                <h4>Reddit & GitHub Topics</h4>
                <ul>
                  {selectedSector.community.map((item) => (
                    <li key={`${item.platform}-${item.topic}`}>
                      <a href={item.url} target="_blank" rel="noreferrer">
                        [{item.platform}] {item.topic}
                      </a>
                      <span>{item.activity}</span>
                    </li>
                  ))}
                </ul>
                </section>
              )}
            </div>
          </article>
        )}
      </section>
    </div>
  )
}

export default App
