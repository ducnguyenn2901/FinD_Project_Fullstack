import { Router } from 'express'
import ChatMessage from '../models/ChatMessage.js'
import User from '../models/User.js'
import auth from '../middleware/auth.js'

const router = Router()

router.use(auth)

router.get('/messages', async (req, res) => {
  const limit = Number(req.query.limit) || 100
  const messages = await ChatMessage.find({})
    .sort({ created_at: -1 })
    .limit(limit)
    .lean()
    .exec()

  res.json(messages.reverse())
})

router.post('/messages', async (req, res) => {
  const body = req.body || {}
  const content = (body.content || '').toString().trim()

  if (!content) {
    return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống' })
  }

  const user = await User.findOne({ user_id: req.user_id }).lean().exec()

  const msg = await ChatMessage.create({
    user_id: req.user_id,
    user_name: user?.name || '',
    user_email: user?.email || '',
    content
  })

  res.status(201).json(msg)
})

export default router

