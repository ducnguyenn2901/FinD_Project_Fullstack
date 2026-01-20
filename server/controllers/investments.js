import Investment from '../models/Investment.js'

export const getInvestments = async (req, res) => {
  const data = await Investment.find({ user_id: req.user_id }).sort({ created_at: -1 }).exec()
  res.json(data)
}

export const createInvestment = async (req, res) => {
  const body = req.body || {}
  const inv = await Investment.create({
    user_id: req.user_id,
    symbol: body.symbol,
    name: body.name || '',
    type: body.type || 'stock',
    quantity: Number(body.quantity) || 0,
    avg_price: Number(body.avg_price) || 0,
    currency: body.currency || 'USD',
    current_price: body.current_price ?? null,
    notes: body.notes || '',
    purchase_date: body.purchase_date || null,
    status: body.status || 'active'
  })
  res.status(201).json(inv)
}

export const updateInvestment = async (req, res) => {
  const id = req.params.id
  const body = req.body || {}
  const inv = await Investment.findOneAndUpdate(
    { _id: id, user_id: req.user_id },
    {
      $set: {
        symbol: body.symbol,
        name: body.name,
        type: body.type,
        quantity: body.quantity,
        avg_price: body.avg_price,
        currency: body.currency,
        current_price: body.current_price,
        notes: body.notes,
        purchase_date: body.purchase_date,
        status: body.status
      }
    },
    { new: true }
  )
  res.json(inv)
}

export const deleteInvestment = async (req, res) => {
  const id = req.params.id
  await Investment.deleteOne({ _id: id, user_id: req.user_id })
  res.status(204).end()
}
