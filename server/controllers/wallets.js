import Wallet from '../models/Wallet.js'

export const getWallets = async (req, res) => {
  const data = await Wallet.find({ user_id: req.user_id }).sort({ created_at: -1 }).exec()
  res.json(data)
}

export const createWallet = async (req, res) => {
  const body = req.body || {}
  const w = await Wallet.create({
    user_id: req.user_id,
    name: body.name,
    type: body.type || 'bank',
    balance: Number(body.balance) || 0,
    currency: body.currency || 'VND'
  })
  res.status(201).json(w)
}

export const updateWallet = async (req, res) => {
  const id = req.params.id
  const body = req.body || {}
  const w = await Wallet.findOneAndUpdate(
    { _id: id, user_id: req.user_id },
    {
      $set: {
        name: body.name,
        type: body.type,
        balance: body.balance,
        currency: body.currency
      }
    },
    { new: true }
  )
  res.json(w)
}

export const deleteWallet = async (req, res) => {
  const id = req.params.id
  await Wallet.deleteOne({ _id: id, user_id: req.user_id })
  res.status(204).end()
}
