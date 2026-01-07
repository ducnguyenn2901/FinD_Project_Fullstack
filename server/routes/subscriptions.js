import { Router } from 'express'
import Subscription from '../models/Subscription.js'
import auth from '../middleware/auth.js'

const router = Router()

router.use(auth)

router.get('/', async (req, res) => {
  const data = await Subscription.find({ user_id: req.user_id }).sort({ next_billing_date: 1 }).exec()
  res.json(data)
})

router.post('/', async (req, res) => {
  const body = req.body || {}
  const s = await Subscription.create({
    user_id: req.user_id,
    name: body.name,
    amount: Number(body.amount) || 0,
    billing_cycle: body.billing_cycle || 'monthly',
    next_billing_date: body.next_billing_date,
    category: body.category || 'other',
    status: body.status || 'active',
    website: body.website || '',
    notes: body.notes || ''
  })
  res.status(201).json(s)
})

router.patch('/:id', async (req, res) => {
  const id = req.params.id
  const body = req.body || {}
  const s = await Subscription.findOneAndUpdate(
    { _id: id, user_id: req.user_id },
    {
      $set: {
        name: body.name,
        amount: body.amount,
        billing_cycle: body.billing_cycle,
        next_billing_date: body.next_billing_date,
        category: body.category,
        status: body.status,
        website: body.website,
        notes: body.notes
      }
    },
    { new: true }
  )
  res.json(s)
})

router.delete('/:id', async (req, res) => {
  const id = req.params.id
  await Subscription.deleteOne({ _id: id, user_id: req.user_id })
  res.status(204).end()
})

export default router
