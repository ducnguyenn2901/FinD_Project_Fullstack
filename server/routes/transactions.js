import { Router } from 'express'
import Transaction from '../models/Transaction.js'
import auth from '../middleware/auth.js'

const router = Router()

router.use(auth)

router.get('/', async (req, res) => {
  const { start, end, limit } = req.query
  const q = { user_id: req.user_id }
  if (start || end) {
    const s = start || '0000-01-01'
    const e = end || '9999-12-31'
    q.date = { $gte: s, $lte: e }
  }
  const cursor = Transaction.find(q).sort({ date: -1, created_at: -1 })
  if (limit) cursor.limit(Number(limit))
  const data = await cursor.exec()
  res.json(data)
})

router.post('/', async (req, res) => {
  const body = req.body || {}
  const t = await Transaction.create({
    user_id: req.user_id,
    description: body.description || '',
    amount: Number(body.amount) || 0,
    type: body.type === 'income' ? 'income' : 'expense',
    category: body.category || '',
    date: body.date,
    wallet: body.wallet || '',
    notes: body.notes || ''
  })
  res.status(201).json(t)
})

router.delete('/:id', async (req, res) => {
  const id = req.params.id
  await Transaction.deleteOne({ _id: id, user_id: req.user_id })
  res.status(204).end()
})

router.patch('/:id', async (req, res) => {
  const id = req.params.id
  const body = req.body || {}
  const t = await Transaction.findOneAndUpdate(
    { _id: id, user_id: req.user_id },
    {
      $set: {
        description: body.description,
        amount: Number(body.amount) || 0,
        type: body.type === 'income' ? 'income' : 'expense',
        category: body.category,
        date: body.date,
        wallet: body.wallet,
        notes: body.notes || ''
      }
    },
    { new: true }
  )
  res.json(t)
})

export default router
