import { Router } from 'express'
import SavingsGoal from '../models/SavingsGoal.js'
import auth from '../middleware/auth.js'

const router = Router()

router.use(auth)

router.get('/', async (req, res) => {
  const data = await SavingsGoal.find({ user_id: req.user_id }).sort({ created_at: -1 }).exec()
  res.json(data)
})

router.post('/', async (req, res) => {
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

router.patch('/:id', async (req, res) => {
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

export default router
