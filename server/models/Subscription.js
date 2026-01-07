import mongoose from 'mongoose'

const SubscriptionSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    billing_cycle: { type: String, default: 'monthly' },
    next_billing_date: { type: String, required: true },
    category: { type: String, default: 'other' },
    status: { type: String, enum: ['active', 'cancelled', 'pending'], default: 'active' },
    website: { type: String, default: '' },
    notes: { type: String, default: '' },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

export default mongoose.model('Subscription', SubscriptionSchema)
