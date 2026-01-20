import { Router } from 'express'
import * as marketController from '../controllers/market.js'
import auth from '../middleware/auth.js'

const router = Router()
router.use(auth)

// Simple per-IP rate limit for market routes
const rateState = new Map()
const WINDOW_MS = 60_000
const MAX_REQ = 30
router.use((req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown'
  const now = Date.now()
  const entry = rateState.get(ip) || { count: 0, resetAt: now + WINDOW_MS }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + WINDOW_MS
  }
  entry.count += 1
  rateState.set(ip, entry)
  if (entry.count > MAX_REQ) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' })
  }
  next()
})

router.get('/quote/:symbol', marketController.getQuote)
router.get('/historical/:symbol', marketController.getHistorical)
router.get('/search', marketController.searchSymbol)

export default router
