import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import User from '../models/User.js'

const router = Router()

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })
  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ error: 'Email already exists' })
  const hash = await bcrypt.hash(password, 10)
  const user = await User.create({
    user_id: randomUUID(),
    email: email.toLowerCase().trim(),
    password: hash,
    name: name || ''
  })
  const token = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.JWT_SECRET || '', { expiresIn: '7d' })
  res.json({ token, user: { user_id: user.user_id, email: user.email, name: user.name } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.JWT_SECRET || '', { expiresIn: '7d' })
  res.json({ token, user: { user_id: user.user_id, email: user.email, name: user.name } })
})

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Missing email' })
  
  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) return res.status(404).json({ error: 'Email not found' })

  // Generate reset token
  const token = randomUUID()
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 1) // 1 hour expiration

  user.resetToken = token
  user.resetTokenExpiry = expiry
  await user.save()

  // In a real app, send this link via email
  // For now, return it to the frontend for demonstration
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${email}`
  
  res.json({ 
    ok: true, 
    message: 'Password reset link generated',
    resetLink // For dev/demo purpose
  })
})

router.post('/reset-password', async (req, res) => {
  const { email, token, password } = req.body || {}
  
  if (!email || !token || !password) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const user = await User.findOne({ 
    email: email.toLowerCase().trim(),
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() }
  })

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' })
  }

  const hash = await bcrypt.hash(password, 10)
  user.password = hash
  user.resetToken = null
  user.resetTokenExpiry = null
  await user.save()
  
  res.json({ ok: true })
})

export default router
