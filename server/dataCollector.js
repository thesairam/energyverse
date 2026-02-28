import Parser from 'rss-parser'

const parser = new Parser({ timeout: 12000 })

const sectors = [
  {
    slug: 'Solar',
    query: 'solar energy',
    youtubeQuery: 'solar energy live news',
    tickers: ['FSLR', 'ENPH', 'TAN'],
    reddit: 'solar energy utility scale',
    github: 'solar energy',
  },
  {
    slug: 'Wind',
    query: 'wind energy',
    youtubeQuery: 'offshore wind live news',
    tickers: ['VWS.CO', 'GEV', 'FAN'],
    reddit: 'wind energy offshore',
    github: 'wind energy',
  },
  {
    slug: 'Hydro',
    query: 'hydropower',
    youtubeQuery: 'hydropower live news',
    tickers: ['BEP', 'CWEN', 'RNW.TO'],
    reddit: 'hydropower pumped storage',
    github: 'hydropower optimization',
  },
  {
    slug: 'Geothermal',
    query: 'geothermal energy',
    youtubeQuery: 'geothermal energy live news',
    tickers: ['ORA', 'CLNE', 'BGRY'],
    reddit: 'geothermal energy projects',
    github: 'geothermal',
  },
  {
    slug: 'Storage',
    query: 'battery energy storage',
    youtubeQuery: 'battery storage live news',
    tickers: ['FLNC', 'TSLA', 'LIT'],
    reddit: 'battery storage market',
    github: 'battery management system',
  },
  {
    slug: 'Nuclear',
    query: 'nuclear energy smr',
    youtubeQuery: 'nuclear energy live news',
    tickers: ['CCJ', 'URA', 'BWXT'],
    reddit: 'nuclear energy smr',
    github: 'nuclear reactor simulation',
  },
]

const youtubeChannels = {
  Solar: {
    source: 'Bloomberg Live',
    url: 'https://www.youtube.com/@BloombergTV/live',
    channelId: 'UCIALMKvObZNtJ6AmdCLP7Lg',
  },
  Wind: {
    source: 'Reuters Live',
    url: 'https://www.youtube.com/@Reuters/live',
    channelId: 'UChqUTb7kYRX8-EiaN3XFrSQ',
  },
  Hydro: {
    source: 'Al Jazeera English Live',
    url: 'https://www.youtube.com/@aljazeeraenglish/live',
    channelId: 'UCNye-wNBqNL5ZzHSJj3l8Bg',
  },
  Geothermal: {
    source: 'DW News Live',
    url: 'https://www.youtube.com/@dwnews/live',
    channelId: 'UCknLrEdhRCp1aegoMqRaCZg',
  },
  Storage: {
    source: 'CNBC Live',
    url: 'https://www.youtube.com/@CNBCtelevision/live',
    channelId: 'UCrp_UI8XtuYfpiqluWLD7Lw',
  },
  Nuclear: {
    source: 'France 24 Live',
    url: 'https://www.youtube.com/@FRANCE24/live',
    channelId: 'UCQfwfsi5VrQ8yKZ-UWmAEFg',
  },
}

const rssUrl = (query) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`

const defaultItem = (title) => ({
  title,
  source: 'EnergyVerse',
  time: 'n/a',
  url: 'https://news.google.com',
})

const cleanText = (value) => (value || '').replace(/\s+/g, ' ').trim()

const toTime = (isoDate) => {
  if (!isoDate) return 'n/a'
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return 'n/a'
  return parsed.toUTCString().slice(17, 22) + ' UTC'
}

const toDomain = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return 'source'
  }
}

const makeHistory = (price, changePercent) => {
  if (!Number.isFinite(price)) return []
  const points = 8
  const drift = Number.isFinite(changePercent) ? changePercent / 100 : 0
  const series = []

  for (let i = 0; i < points; i += 1) {
    const position = (i - (points - 1) / 2) / points
    const wiggle = Math.sin(i * 1.1) * 0.004 * price
    const value = price * (1 + drift * position) + wiggle
    series.push(Number(value.toFixed(2)))
  }

  return series
}

async function fetchRss(query, limit = 3) {
  try {
    const feed = await parser.parseURL(rssUrl(query))
    return (feed.items || []).slice(0, limit).map((item) => ({
      title: cleanText(item.title),
      source: toDomain(item.link || item.guid || ''),
      time: toTime(item.pubDate),
      url: item.link || 'https://news.google.com',
    }))
  } catch {
    return []
  }
}

async function fetchReddit(query) {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=2`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'energyverse-monitor/1.0',
      },
    })
    if (!response.ok) return []
    const payload = await response.json()
    return (payload?.data?.children || []).slice(0, 2).map((item) => {
      const post = item.data
      return {
        platform: 'Reddit',
        topic: cleanText(post.title),
        activity: `${post.num_comments || 0} comments`,
        url: `https://www.reddit.com${post.permalink || ''}`,
      }
    })
  } catch {
    return []
  }
}

async function fetchGithub(query) {
  try {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(`${query} is:issue`)}&sort=updated&order=desc&per_page=2`
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    })
    if (!response.ok) return []
    const payload = await response.json()
    return (payload?.items || []).slice(0, 2).map((issue) => ({
      platform: 'GitHub',
      topic: cleanText(issue.title),
      activity: `${issue.comments || 0} comments`,
      url: issue.html_url,
    }))
  } catch {
    return []
  }
}

async function fetchFinance(tickers) {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(tickers.join(','))}`
    const response = await fetch(url)
    if (!response.ok) return []
    const payload = await response.json()
    const rows = payload?.quoteResponse?.result || []
    return rows.map((row) => ({
      metric: `${row.shortName || row.symbol} (${row.symbol})`,
      value: Number.isFinite(row.regularMarketPrice) ? `$${row.regularMarketPrice}` : 'n/a',
      move: Number.isFinite(row.regularMarketChangePercent)
        ? `${row.regularMarketChangePercent >= 0 ? '+' : ''}${row.regularMarketChangePercent.toFixed(2)}%`
        : 'n/a',
      trend:
        row.regularMarketChangePercent > 0
          ? 'up'
          : row.regularMarketChangePercent < 0
            ? 'down'
            : 'flat',
      history: makeHistory(row.regularMarketPrice, row.regularMarketChangePercent),
    }))
  } catch {
    return []
  }
}

function makeYouTubeLinks(query, slug) {
  const channel = youtubeChannels[slug] || {
    source: 'YouTube Live',
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    channelId: null,
  }

  const embedUrl = channel.channelId
    ? `https://www.youtube.com/embed/live_stream?channel=${channel.channelId}`
    : null

  return [
    {
      title: `${slug} live news stream`,
      source: channel.source,
      time: 'Live',
      url: channel.url,
      embedUrl,
    },
    {
      title: `${slug} market update live`,
      source: 'YouTube',
      time: 'Live search',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${slug} market live`)}`,
      embedUrl,
    },
  ]
}

function toProductFromNews(items) {
  return items.slice(0, 2).map((item, index) => ({
    name: `New Release ${index + 1}`,
    company: item.source,
    summary: item.title,
    status: 'Tracking',
    url: item.url,
  }))
}

function toStartupFromNews(items) {
  return items.slice(0, 2).map((item, index) => ({
    name: `Startup Signal ${index + 1}`,
    region: 'Global',
    event: item.title,
    value: item.time,
    url: item.url,
  }))
}

export async function collectSectorIntel() {
  const sectorIntel = []
  const tape = []

  for (const sector of sectors) {
    const [latestNews, techNews, startupNews, redditRows, githubRows, financeRows] = await Promise.all([
      fetchRss(`${sector.query} policy OR market`, 3),
      fetchRss(`${sector.query} technology OR product`, 3),
      fetchRss(`${sector.query} startup OR funding`, 2),
      fetchReddit(sector.reddit),
      fetchGithub(sector.github),
      fetchFinance(sector.tickers),
    ])

    const headline = latestNews[0]?.title || `${sector.slug} market activity update pending`
    const summary = techNews[0]?.title || `Collecting ${sector.slug.toLowerCase()} technology and business signals.`

    const products = toProductFromNews(techNews)
    const startups = toStartupFromNews(startupNews)

    const sectorRow = {
      slug: sector.slug,
      headline,
      summary,
      latestNews: latestNews.length ? latestNews : [defaultItem(`No latest ${sector.slug.toLowerCase()} headlines available`)],
      techNews: techNews.length ? techNews : [defaultItem(`No ${sector.slug.toLowerCase()} tech headlines available`)],
      products: products.length ? products : toProductFromNews([defaultItem(`No ${sector.slug.toLowerCase()} product stories yet`)]),
      startups: startups.length ? startups : toStartupFromNews([defaultItem(`No ${sector.slug.toLowerCase()} startup stories yet`)]),
      finance: financeRows,
      youtubeLive: makeYouTubeLinks(sector.youtubeQuery, sector.slug),
      community: [...redditRows, ...githubRows],
    }

    sectorIntel.push(sectorRow)

    for (const item of latestNews.slice(0, 2)) {
      tape.push({
        source: item.source,
        headline: item.title,
        tag: sector.slug,
        time: item.time,
      })
    }
  }

  return {
    updatedAt: new Date().toISOString(),
    sectorIntel,
    newsTape: tape,
  }
}
