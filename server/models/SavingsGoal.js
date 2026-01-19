import mongoose from 'mongoose'

const SavingsGoalSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    target_amount: { type: Number, required: true },
    current_amount: { type: Number, default: 0 },
    deadline: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
    share_token: { type: String, default: null, index: true },
    share_enabled: { type: Boolean, default: false },
    contributions: {
      type: [
        {
          amount: { type: Number, required: true },
          contributor_name: { type: String, default: '' },
          wallet_name: { type: String, default: '' },
          wallet_type: { type: String, default: '' },
          created_at: { type: Date, default: Date.now },
          note: { type: String, default: '' }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
)

export default mongoose.model('SavingsGoal', SavingsGoalSchema)
