import mongoose from 'mongoose'

const WalletSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['bank', 'momo', 'zalopay', 'credit_card', 'cash', 'crypto', 'other'], default: 'bank' },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'VND' },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

export default mongoose.model('Wallet', WalletSchema)
