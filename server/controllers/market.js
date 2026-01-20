import axios from 'axios'

const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart'
const YAHOO_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote'
const YAHOO_SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search'

// In-memory cache with TTL
const cache = new Map()
function getCache(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (entry.expires < Date.now()) {
    cache.delete(key)
    return null
  }
  return entry.data
}
function setCache(key, data, ttlMs) {
  cache.set(key, { data, expires: Date.now() + ttlMs })
}

export const getQuote = async (req, res) => {
  try {
    const symbol = (req.params.symbol || '').toUpperCase()
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' })
    const cacheKey = `quote:${symbol}`
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)
    const response = await axios.get(YAHOO_QUOTE_URL, { params: { symbols: symbol } })
    const quote = response.data?.quoteResponse?.result?.[0]
    if (!quote) return res.status(404).json({ error: 'Symbol not found' })
    const payload = {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName || quote.symbol,
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      currency: quote.currency || 'USD'
    }
    setCache(cacheKey, payload, 30_000)
    res.json(payload)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote' })
  }
}

export const getHistorical = async (req, res) => {
  try {
    const symbol = (req.params.symbol || '').toUpperCase()
    const days = Number(req.query.days || 30)
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' })
    const cacheKey = `historical:${symbol}:${days}`
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)
    const period = days <= 30 ? '1mo' : days <= 90 ? '3mo' : '1y'
    const response = await axios.get(`${YAHOO_CHART_URL}/${symbol}`, {
      params: { range: period, interval: '1d' }
    })
    const result = response.data?.chart?.result?.[0]
    if (!result) return res.json([])
    const timestamps = result.timestamp || []
    const quotes = result.indicators?.quote?.[0] || {}
    const data = timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: quotes.open?.[index] ?? null,
      high: quotes.high?.[index] ?? null,
      low: quotes.low?.[index] ?? null,
      close: quotes.close?.[index] ?? null,
      volume: quotes.volume?.[index] ?? 0
    })).filter(d => d.close != null)
    const sliced = data.slice(-days)
    setCache(cacheKey, sliced, 5 * 60_000)
    res.json(sliced)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical' })
  }
}

export const searchSymbol = async (req, res) => {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) return res.status(400).json({ error: 'Missing query' })
    const cacheKey = `search:${q.toLowerCase()}`
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)
    const response = await axios.get(YAHOO_SEARCH_URL, {
      params: {
        q,
        lang: 'en-US',
        region: 'US',
        quotesCount: 10,
        newsCount: 0
      }
    })
    const quotes = response.data?.quotes || []
    const results = quotes.map((it) => ({
      symbol: it.symbol,
      name: it.longname || it.shortname || it.symbol,
      exchange: it.exchDisp || it.exchange || '',
      type: it.quoteType || it.type || ''
    })).filter(r => r.symbol)
    setCache(cacheKey, results, 10 * 60_000)
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: 'Failed to search symbol' })
  }
}
