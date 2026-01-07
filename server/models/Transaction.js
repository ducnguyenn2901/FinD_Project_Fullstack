import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, default: '' },
    date: { type: String, required: true },
    wallet: { type: String, default: '' },
    notes: { type: String, default: '' },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

export default mongoose.model('Transaction', TransactionSchema)
