import jwt from 'jsonwebtoken'

export default function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || '')
    req.user_id = payload.user_id
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
