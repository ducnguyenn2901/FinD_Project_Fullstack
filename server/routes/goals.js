import { Router } from 'express'
import { randomUUID } from 'crypto'
import SavingsGoal from '../models/SavingsGoal.js'
import Wallet from '../models/Wallet.js'
import User from '../models/User.js'
import auth from '../middleware/auth.js'

const router = Router()

router.get('/', auth, async (req, res) => {
  const data = await SavingsGoal.find({ user_id: req.user_id }).sort({ created_at: -1 }).exec()
  res.json(data)
})

router.post('/', auth, async (req, res) => {
  const body = req.body || {}
  const g = await SavingsGoal.create({
    user_id: req.user_id,
    name: body.name,
    target_amount: Number(body.target_amount) || 0,
    current_amount: Number(body.current_amount) || 0,
    deadline: body.deadline || null
  })
  res.status(201).json(g)
})

router.patch('/:id', auth, async (req, res) => {
  const id = req.params.id
  const body = req.body || {}
  const g = await SavingsGoal.findOneAndUpdate(
    { _id: id, user_id: req.user_id },
    {
      $set: {
        name: body.name,
        target_amount: body.target_amount,
        current_amount: body.current_amount,
        deadline: body.deadline
      }
    },
    { new: true }
  )
  res.json(g)
})

router.delete('/:id', auth, async (req, res) => {
  const id = req.params.id
  const g = await SavingsGoal.findOneAndDelete({ _id: id, user_id: req.user_id })
  if (!g) return res.status(404).json({ error: 'Không tìm thấy mục tiêu' })
  res.status(204).end()
})

router.post('/:id/contributions', auth, async (req, res) => {
  const id = req.params.id
  const body = req.body || {}

  const amount = Number(body.amount) || 0
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Số tiền góp không hợp lệ' })
  }

  const goal = await SavingsGoal.findOne({ _id: id, user_id: req.user_id })
  if (!goal) {
    return res.status(404).json({ error: 'Không tìm thấy mục tiêu' })
  }

  goal.current_amount = (goal.current_amount || 0) + amount
  goal.contributions.push({
    amount,
    wallet_name: body.wallet_name || '',
    wallet_type: body.wallet_type || '',
    note: body.note || ''
  })

  await goal.save()

  res.status(201).json(goal)
})

router.get('/:id/contributions', auth, async (req, res) => {
  const id = req.params.id
  const goal = await SavingsGoal.findOne({ _id: id, user_id: req.user_id }).lean().exec()
  if (!goal) {
    return res.status(404).json({ error: 'Không tìm thấy mục tiêu' })
  }
  res.json(goal.contributions || [])
})

router.post('/:id/share', auth, async (req, res) => {
  const id = req.params.id
  const goal = await SavingsGoal.findOne({ _id: id, user_id: req.user_id })
  if (!goal) {
    return res.status(404).json({ error: 'Không tìm thấy mục tiêu' })
  }

  if (!goal.share_token) {
    goal.share_token = randomUUID()
  }
  goal.share_enabled = true
  await goal.save()

  let baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  // Remove trailing slash if present
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1)
  }
  const shareUrl = `${baseUrl}/contribute-goal/${goal.share_token}`

  res.json({ ok: true, shareUrl })
})

router.get('/public/:token', async (req, res) => {
  const token = req.params.token
  const goal = await SavingsGoal.findOne({
    share_token: token,
    share_enabled: true
  })

  if (!goal) {
    return res.status(404).json({ error: 'Liên kết không hợp lệ hoặc đã bị tắt' })
  }

  res.json({
    name: goal.name,
    target_amount: goal.target_amount,
    current_amount: goal.current_amount
  })
})

router.post('/public/:token/contributions', auth, async (req, res) => {
  const token = req.params.token
  const body = req.body || {}

  const amount = Number(body.amount) || 0
  const walletId = body.wallet_id

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Số tiền góp không hợp lệ' })
  }

  if (!walletId) {
    return res.status(400).json({ error: 'Vui lòng chọn ví để góp tiền' })
  }

  try {
    const [goal, wallet, user] = await Promise.all([
      SavingsGoal.findOne({
        share_token: token,
        share_enabled: true
      }),
      Wallet.findOne({ _id: walletId, user_id: req.user_id }),
      User.findOne({ user_id: req.user_id })
    ])

    if (!goal) {
      return res.status(404).json({ error: 'Liên kết không hợp lệ hoặc đã bị tắt' })
    }

    if (!wallet) {
      return res.status(404).json({ error: 'Không tìm thấy ví hoặc bạn không có quyền truy cập' })
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ error: 'Số dư ví không đủ' })
    }

    // Deduct from wallet
    wallet.balance -= amount
    await wallet.save()

    // Add to goal
    goal.current_amount = (goal.current_amount || 0) + amount
    goal.contributions.push({
      amount,
      contributor_name: user ? user.name : 'Người dùng ẩn danh',
      wallet_name: wallet.name,
      wallet_type: wallet.type,
      note: body.note || ''
    })

    await goal.save()

    res.json({ ok: true, message: 'Góp tiền thành công' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Lỗi server' })
  }
})


export default router
