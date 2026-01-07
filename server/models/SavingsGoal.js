import mongoose from 'mongoose'

const SavingsGoalSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    target_amount: { type: Number, required: true },
    current_amount: { type: Number, default: 0 },
    deadline: { type: String, default: null },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

export default mongoose.model('SavingsGoal', SavingsGoalSchema)
